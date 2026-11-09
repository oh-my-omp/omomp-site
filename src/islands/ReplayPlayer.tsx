import { createEffect, createMemo, createSignal, For, on, onCleanup, Show } from "solid-js";
import type { PlayerLabels, Step } from "../data/scenario";
import type { Lang } from "../i18n";
import HookMessage, { type HookKind } from "../slices/HookMessage";
import PanelView from "../slices/Panel";
import Transcript from "../slices/Transcript";
import Window from "../slices/Window";
import { anchorKey, beatsOf, dwell, keyOf, reveal } from "./replay-beats";
import "../styles/replay.css";

/** Pause after a step's last beat before the next step starts. */
const STEP_GAP_MS = 1400;
/** Under reduced motion a step appears whole and stays this long at least. */
const REDUCED_STEP_MS = 6000;

/**
 * Where playback is. `shown` counts the beats of `step` on screen: a jump while paused shows the whole step,
 * playing reveals them one by one, a pause keeps whatever is on screen.
 */
type Playback =
  | { readonly kind: "paused"; readonly step: number; readonly shown: number }
  | { readonly kind: "playing"; readonly step: number; readonly shown: number };

const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The demo scenario as a split screen: on the left what the person sees, on the right what reached the model.
 * Opens on step `start` (the first by default), fully shown. Play reveals each step beat by beat; when a hook fires, the hook and
 * the front element it reacts to light up together.
 */
export default function ReplayPlayer(props: {
  lang: Lang;
  steps: readonly Step[];
  labels: PlayerLabels;
  /** Number of the first step among the whole scenario, when `steps` is a slice of it. */
  firstNumber?: number;
  /** Total number of steps in the whole scenario; defaults to the length of `steps` when they are the whole scenario. */
  total?: number;
  /** Index in `steps` of the step the player opens on. */
  start?: number;
  compact?: boolean;
}) {
  const beats = createMemo(() => props.steps.map(beatsOf));
  const beatCount = (step: number) => beats()[step]!.length;
  const last = () => props.steps.length - 1;

  const opening = Math.max(0, Math.min(last(), props.start ?? 0));
  const [state, setState] = createSignal<Playback>({ kind: "paused", step: opening, shown: beatCount(opening) });
  const [hover, setHover] = createSignal<number | undefined>(undefined);

  const step = createMemo(() => props.steps[state().step]!);
  const rev = createMemo(() => reveal(step(), beats()[state().step]!, state().shown));
  /** The hook lit up with its anchor: the one being pointed at, else the one that just fired. */
  const paired = createMemo((): { hook: number; anchor: string; tone: HookKind } | undefined => {
    const h = hover();
    const timed = h === undefined ? undefined : step().hooks[h];
    if (h !== undefined && timed && rev().hooks.has(h)) return { hook: h, anchor: anchorKey(timed.anchor), tone: timed.hook.kind };
    return rev().firing;
  });
  const lit = (key: string) => paired()?.anchor === key;

  /** A slice cannot report its own length as the scenario total, so the total stays blank until the caller passes it. */
  const total = () => props.total ?? (props.firstNumber === undefined ? props.steps.length : undefined);
  const number = (i: number) => (props.firstNumber ?? 1) + i;
  const atEnd = () => state().step === last() && state().shown >= beatCount(last());

  const progress = createMemo(() => {
    const all = beats().reduce((n, b) => n + b.length, 0);
    const before = beats()
      .slice(0, state().step)
      .reduce((n, b) => n + b.length, 0);
    return all === 0 ? 0 : (before + state().shown) / all;
  });

  /** Steps grouped by seam in order, for the step bar. */
  const groups = createMemo(() => {
    const out: { seam: Step["seam"]; steps: { step: Step; i: number }[] }[] = [];
    props.steps.forEach((s, i) => {
      const tail = out[out.length - 1];
      if (tail?.seam === s.seam) tail.steps.push({ step: s, i });
      else out.push({ seam: s.seam, steps: [{ step: s, i }] });
    });
    return out;
  });

  let root: HTMLDivElement | undefined;
  let head: HTMLDivElement | undefined;

  /** Whole steps under reduced motion, otherwise one beat. */
  const firstShown = (s: number) => (reducedMotion() ? beatCount(s) : 1);

  const play = () => {
    const s = state();
    if (atEnd()) setState({ kind: "playing", step: 0, shown: firstShown(0) });
    else if (s.shown >= beatCount(s.step)) setState({ kind: "playing", step: s.step, shown: firstShown(s.step) });
    else setState({ kind: "playing", step: s.step, shown: s.shown + 1 });
    bringIntoView();
  };
  const pause = () => {
    const s = state();
    setState({ kind: "paused", step: s.step, shown: s.shown });
  };
  const go = (i: number) => {
    const target = Math.max(0, Math.min(last(), i));
    setHover(undefined);
    setState(
      state().kind === "playing"
        ? { kind: "playing", step: target, shown: firstShown(target) }
        : { kind: "paused", step: target, shown: beatCount(target) },
    );
  };

  /** One tick of playback: the next beat, else the next step, else stop on the last step. */
  const advance = () => {
    const s = state();
    if (s.kind !== "playing") return;
    if (s.shown < beatCount(s.step)) setState({ kind: "playing", step: s.step, shown: s.shown + 1 });
    else if (s.step < last()) setState({ kind: "playing", step: s.step + 1, shown: firstShown(s.step + 1) });
    else setState({ kind: "paused", step: s.step, shown: s.shown });
  };

  createEffect(() => {
    const s = state();
    if (s.kind !== "playing") return;
    const stepBeats = beats()[s.step]!;
    const done = s.shown >= stepBeats.length;
    const current = stepBeats[s.shown - 1];
    const delay = reducedMotion()
      ? Math.max(REDUCED_STEP_MS, stepBeats.reduce((n, b, i) => n + dwell(props.steps[s.step]!, b, stepBeats[i + 1]), 0))
      : (current ? dwell(props.steps[s.step]!, current, stepBeats[s.shown]) : 0) + (done ? STEP_GAP_MS : 0);
    const timer = window.setTimeout(advance, delay);
    onCleanup(() => window.clearTimeout(timer));
  });

  /** Keep the newest beat in view inside its pane; a new step starts both panes at the top. */
  createEffect(
    on(state, (s, prev) => {
      if (!root) return;
      const el = root;
      requestAnimationFrame(() => {
        const panes = [...el.querySelectorAll<HTMLElement>(".rp-scroll")];
        if (!prev || prev.step !== s.step) for (const p of panes) p.scrollTop = 0;
        if (s.kind !== "playing" || s.shown === 0) return;
        const beat = beats()[s.step]![s.shown - 1];
        if (!beat) return;
        const find = (key: string) => el.querySelector<HTMLElement>(`[data-beat-key="${key}"]`);
        if (beat.kind === "hook") {
          const timed = props.steps[s.step]!.hooks[beat.hook];
          if (timed) follow(find(anchorKey(timed.anchor)), "nearest");
          follow(find(keyOf(beat)), "start");
        } else follow(find(keyOf(beat)), "end");
      });
    }),
  );

  /**
   * Scrolls the page so the controls and both panes are on screen, when they are not already.
   * The step bar comes along when everything fits below the site header; otherwise the controls lead.
   */
  const bringIntoView = () => {
    if (!head || !root) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const top = (header?.getBoundingClientRect().bottom ?? 0) + 12;
    const h = head.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    const split = root.querySelector<HTMLElement>(".rp-split")?.getBoundingClientRect();
    const bottom = split?.bottom ?? h.bottom;
    const lead = bottom - r.top <= window.innerHeight - top ? r.top : h.top;
    if (lead >= top && bottom <= window.innerHeight) return;
    window.scrollTo({ top: window.scrollY + lead - top, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    const t = e.target instanceof HTMLElement ? e.target : null;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(state().step - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(state().step + 1);
    } else if (e.key === " " && !t?.closest("button, a, input, textarea")) {
      e.preventDefault();
      state().kind === "playing" ? pause() : play();
    }
  };

  /** One numbered tick per step; the current one fills as its beats appear. */
  const tick = ({ step: s, i }: { step: Step; i: number }) => (
    <button
      type="button"
      classList={{ on: i === state().step, past: i < state().step }}
      style={i === state().step ? { "--p": `${Math.round((state().shown / Math.max(1, beatCount(i))) * 100)}%` } : undefined}
      aria-label={`${props.labels.step} ${number(i)}: ${s.title}`}
      aria-current={i === state().step ? "step" : undefined}
      onClick={() => go(i)}
    >
      <span>{number(i)}</span>
    </button>
  );

  return (
    <div
      class="rp"
      classList={{ compact: !!props.compact, playing: state().kind === "playing" }}
      ref={root}
      onKeyDown={onKey}
    >
      <Show when={groups().length > 1}>
        <div class="rp-bar">
          <For each={groups()}>
            {(g) => (
              <div class="rp-group">
                <span class="rp-seam">{props.labels.seams[g.seam]}</span>
                <div class="rp-ticks">
                  <For each={g.steps}>{tick}</For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <div class="rp-head" ref={head}>
        <div class="rp-title">
          <span class="rp-n">
            {props.lang === "zh" ? (
              <>
                第 {number(state().step)} 步
                {total() !== undefined && <span class="rp-of">，共 {total()} 步</span>}
              </>
            ) : (
              <>
                {props.labels.step} {number(state().step)}
                {total() !== undefined && <span class="rp-of"> of {total()}</span>}
              </>
            )}
          </span>
          <h3 aria-live="polite">{step().title}</h3>
        </div>
        <Show when={props.steps.length > 1}>
          <div class="rp-right">
            <Show when={groups().length === 1}>
              <div class="rp-ticks" aria-label={props.labels.seams[groups()[0]!.seam]}>
                <For each={groups()[0]!.steps}>{tick}</For>
              </div>
            </Show>
            <div class="rp-controls">
              <button type="button" class="rp-btn" aria-label={props.labels.prev} disabled={state().step === 0} onClick={() => go(state().step - 1)}>
                ←
              </button>
              <button type="button" class="rp-btn rp-play" onClick={() => (state().kind === "playing" ? pause() : play())}>
                {state().kind === "playing" ? props.labels.pause : atEnd() ? props.labels.again : props.labels.play}
              </button>
              <button type="button" class="rp-btn" aria-label={props.labels.next} disabled={state().step === last()} onClick={() => go(state().step + 1)}>
                →
              </button>
            </div>
          </div>
        </Show>
      </div>
      <div class="rp-progress" aria-hidden="true">
        <span style={{ width: `${(progress() * 100).toFixed(2)}%` }} />
      </div>
      <p class="rp-caption">{step().caption}</p>

      <div class="rp-split">
        <section class="rp-front" aria-label={props.labels.front}>
          <span class="rp-side">{props.labels.front}</span>
          <Window class="rp-win" tabs={["shop-api"]} meta="omp">
            <div class="rp-scroll rp-panels">
              <For each={step().front}>
                {(panel, i) => (
                  <Show when={rev().panels.has(i())}>
                    {panel.kind === "transcript" ? (
                      <div class="rp-beat rp-tx" data-beat-key={`p${i()}`} classList={{ lit: lit(`p${i()}`) }} data-tone={lit(`p${i()}`) ? paired()?.tone : undefined}>
                        <For each={panel.lines.slice(0, rev().panels.get(i()) ?? 0)}>
                          {(line, j) => (
                            <div
                              class="rp-beat"
                              data-beat-key={`l${i()}.${j()}`}
                              classList={{ lit: lit(`l${i()}.${j()}`) }}
                              data-tone={lit(`l${i()}.${j()}`) ? paired()?.tone : undefined}
                            >
                              <Transcript lines={[line]} />
                            </div>
                          )}
                        </For>
                      </div>
                    ) : (
                      <div class="rp-beat" data-beat-key={`p${i()}`} classList={{ lit: lit(`p${i()}`) }} data-tone={lit(`p${i()}`) ? paired()?.tone : undefined}>
                        <PanelView lang={props.lang} panel={panel} compact={!!props.compact} />
                      </div>
                    )}
                  </Show>
                )}
              </For>
            </div>
          </Window>
        </section>
        <section class="rp-back" aria-label={props.labels.back}>
          <span class="rp-side">{props.labels.back}</span>
          <div class="rp-scroll rp-hooks">
            <Show when={step().hooks.length > 0} fallback={<p class="rp-quiet">{props.labels.quiet}</p>}>
              <For each={step().hooks}>
                {(timed, i) => (
                  <Show when={rev().hooks.has(i())}>
                    <div
                      class="rp-beat"
                      data-beat-key={`h${i()}`}
                      classList={{ lit: paired()?.hook === i() }}
                      data-tone={paired()?.hook === i() ? timed.hook.kind : undefined}
                      onMouseEnter={() => setHover(i())}
                      onMouseLeave={() => setHover(undefined)}
                      onFocusIn={() => setHover(i())}
                      onFocusOut={() => setHover(undefined)}
                      tabIndex={0}
                    >
                      <HookMessage hook={timed.hook} />
                    </div>
                  </Show>
                )}
              </For>
            </Show>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Scrolls an element's pane (not the page) so the element shows: its top for `start`, its bottom for `end`. */
function follow(el: HTMLElement | null, align: "start" | "end" | "nearest") {
  const pane = el?.closest<HTMLElement>(".rp-scroll");
  if (!el || !pane) return;
  const pr = pane.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const pad = 12;
  const toStart = er.top - pr.top - pad;
  const toEnd = er.bottom - pr.bottom + pad;
  let delta = 0;
  switch (align) {
    case "start":
      delta = toStart;
      break;
    case "end":
      // An element taller than the pane shows from its top.
      delta = er.height > pr.height - 2 * pad ? toStart : Math.max(0, toEnd);
      break;
    case "nearest":
      delta = toStart < 0 ? toStart : toEnd > 0 ? Math.min(toEnd, toStart) : 0;
      break;
  }
  if (delta !== 0) pane.scrollBy({ top: delta, behavior: reducedMotion() ? "auto" : "smooth" });
}
