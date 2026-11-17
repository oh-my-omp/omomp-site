import type { HookKind } from "../slices/HookMessage";
import type { Anchor, Step } from "../data/scenario";

/**
 * One unit of playback inside a step. The front is revealed a transcript line or a whole panel at a time;
 * a hook beat follows the beat of its anchor.
 */
export type Beat =
  | { readonly kind: "line"; readonly panel: number; readonly line: number }
  | { readonly kind: "panel"; readonly panel: number }
  | { readonly kind: "hook"; readonly hook: number };

const sameAnchor = (a: Anchor, panel: number, line: number | undefined): boolean => {
  switch (a.kind) {
    case "panel":
      return a.panel === panel && line === undefined;
    case "line":
      return a.panel === panel && a.line === line;
  }
};

/**
 * Beats of a step in playback order. A hook anchored to a transcript panel as a whole fires after its last line.
 * Throws when a hook's anchor names no element of the step, so a broken scenario fails the build.
 */
export function beatsOf(step: Step): readonly Beat[] {
  const out: Beat[] = [];
  const placed = new Set<number>();
  const hooksAt = (panel: number, line: number | undefined) =>
    step.hooks.forEach((h, i) => {
      if (!placed.has(i) && sameAnchor(h.anchor, panel, line)) {
        placed.add(i);
        out.push({ kind: "hook", hook: i });
      }
    });
  step.front.forEach((p, panel) => {
    if (p.kind === "transcript") {
      p.lines.forEach((_, line) => {
        out.push({ kind: "line", panel, line });
        hooksAt(panel, line);
      });
    } else {
      out.push({ kind: "panel", panel });
    }
    hooksAt(panel, undefined);
  });
  step.hooks.forEach((h, i) => {
    if (!placed.has(i)) throw new Error(`step "${step.title}": hook ${h.hook.source} anchors to a missing front element ${JSON.stringify(h.anchor)}`);
  });
  return out;
}

/** Milliseconds per Latin character at a skimming pace; a CJK character counts as 2.5 of them. */
const MS_PER_CHAR = 30;
const CJK = /[\u3000-\u9fff\uff00-\uffef]/;
/** Shortest and longest time a beat stays the newest one; past the cap a reader pauses to finish it. */
const MIN_DWELL = { line: 1200, panel: 2000, hook: 2500 } as const;
const MAX_DWELL = 12000;

/**
 * How long a beat stays the newest one before the next appears, in milliseconds, from `text`: what the beat put on
 * screen, as rendered (a hook's translation included).
 */
export function dwell(beat: Beat, next: Beat | undefined, text: string): number {
  // A hook reacts to the element just revealed, so it lands right after it; reading time comes after the hook.
  if (beat.kind !== "hook" && next?.kind === "hook") return 600;
  let units = 0;
  for (const ch of text.replace(/\s+/g, " ").trim()) units += CJK.test(ch) ? 2.5 : 1;
  return Math.min(MAX_DWELL, Math.max(MIN_DWELL[beat.kind], 900 + Math.round(units * MS_PER_CHAR)));
}

/** The element a beat reveals, as a key the rendered DOM carries in `data-beat-key`. */
export function keyOf(beat: Beat): string {
  switch (beat.kind) {
    case "line":
      return `l${beat.panel}.${beat.line}`;
    case "panel":
      return `p${beat.panel}`;
    case "hook":
      return `h${beat.hook}`;
  }
}

/** Key of the front element a hook reacts to; a panel anchor on a transcript points at the whole transcript. */
export function anchorKey(anchor: Anchor): string {
  switch (anchor.kind) {
    case "panel":
      return `p${anchor.panel}`;
    case "line":
      return `l${anchor.panel}.${anchor.line}`;
  }
}

/** What the front and back panes show after the first `shown` beats of a step. */
export interface Reveal {
  /** Panels visible so far; for a transcript, how many of its lines. */
  readonly panels: ReadonlyMap<number, number>;
  readonly hooks: ReadonlySet<number>;
  /** Hook paired with its anchor right now: the newest beat when it is a hook beat. */
  readonly firing: { readonly hook: number; readonly anchor: string; readonly tone: HookKind } | undefined;
}

export function reveal(step: Step, beats: readonly Beat[], shown: number): Reveal {
  const panels = new Map<number, number>();
  const hooks = new Set<number>();
  for (const b of beats.slice(0, shown)) {
    switch (b.kind) {
      case "line":
        panels.set(b.panel, b.line + 1);
        break;
      case "panel":
        panels.set(b.panel, 0);
        break;
      case "hook":
        hooks.add(b.hook);
        break;
    }
  }
  const last = beats[shown - 1];
  const timed = last?.kind === "hook" ? step.hooks[last.hook] : undefined;
  const firing =
    last?.kind === "hook" && timed ? { hook: last.hook, anchor: anchorKey(timed.anchor), tone: timed.hook.kind } : undefined;
  return { panels, hooks, firing };
}
