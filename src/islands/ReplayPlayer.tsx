import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from "solid-js";
import type { PlayerLabels, Step } from "../data/scenario";
import type { Lang } from "../i18n";
import HookMessage, { type HookKind } from "../slices/HookMessage";
import PanelView from "../slices/Panel";
import Transcript from "../slices/Transcript";
import Window from "../slices/Window";
import { anchorKey, beatsOf, dwell, keyOf, reveal, type Beat, type Reveal } from "./replay-beats";
import "../styles/replay.css";

/** Pause after a step's last beat before the next step starts. */
const STEP_GAP_MS = 1400;
/** Under reduced motion a step appears whole and stays this long at least. */
const REDUCED_STEP_MS = 6000;

/**
 * Where playback is. `shown` counts the beats of `step` on screen: a jump while paused shows the whole step,
 * playing reveals them one by one, a pause keeps whatever is on screen. `ended` is the whole last step after
 * playback ran through it; Play starts over from the first step only from there.
 */
type Playback =
  | { readonly kind: "paused"; readonly step: number; readonly shown: number }
  | { readonly kind: "playing"; readonly step: number; readonly shown: number }
  | { readonly kind: "ended"; readonly step: number; readonly shown: number };

/**
 * `split`: the natural height of the panes with every beat of the current step shown, measured from a hidden copy.
 * `room`: the height left for them when the controls sit just below the site header, so controls, caption and panes
 * share one screen.
 */
interface Fit {
  readonly split: number;
  readonly room: number;
}

/** The split never gets less room than this, however short the viewport; the panes scroll instead. */
const MIN_ROOM = 360;

const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The demo scenario as a split screen: what the person sees, and what reached the model.
 * Opens on step `start` (the first by default), fully shown. Play reveals each step beat by beat; when a hook fires, the hook and
 * the front element it reacts to light up together. The split is as tall as the current step needs with every beat shown,
 * up to a height that fits the viewport, so a step never jumps while it plays and a short step leaves no empty pane.
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
  const [fit, setFit] = createSignal<Fit | undefined>(undefined);

  const step = createMemo(() => props.steps[state().step]!);
  const rev = createMemo(() => reveal(step(), beats()[state().step]!, state().shown));
  const whole = createMemo(() => reveal(step(), beats()[state().step]!, beatCount(state().step)));
  /**
   * The hook lit up with its anchor: while playing, the one that just fired; otherwise the one being pointed at, else
   * the one that fired last. Playback ignores the pointer: after Play scrolls the page, a resting cursor lands on the
   * back pane and would otherwise hold one hook lit over every later one.
   */
  const paired = createMemo((): { hook: number; anchor: string; tone: HookKind } | undefined => {
    if (state().kind === "playing") return rev().firing;
    const h = hover();
    const timed = h === undefined ? undefined : step().hooks[h];
    if (h !== undefined && timed && rev().hooks.has(h)) return { hook: h, anchor: anchorKey(timed.anchor), tone: timed.hook.kind };
    return rev().firing;
  });
  /** Tone of the element with this beat key while it is lit: a hook (`h<i>`) or the front element it reacts to. */
  const toneOf = (key: string): HookKind | undefined => {
    const p = paired();
    return p && (key === p.anchor || key === `h${p.hook}`) ? p.tone : undefined;
  };

  /** A slice cannot report its own length as the scenario total, so the total stays blank until the caller passes it. */
  const total = () => props.total ?? (props.firstNumber === undefined ? props.steps.length : undefined);
  const number = (i: number) => (props.firstNumber ?? 1) + i;

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

  let head: HTMLDivElement | undefined;
  let split: HTMLDivElement | undefined;
  let measure: HTMLDivElement | undefined;
  let caption: HTMLParagraphElement | undefined;

  /** Whole steps under reduced motion, otherwise one beat. */
  const firstShown = (s: number) => (reducedMotion() ? beatCount(s) : 1);

  const play = () => {
    const s = state();
    switch (s.kind) {
      case "ended":
        setState({ kind: "playing", step: 0, shown: firstShown(0) });
        break;
      case "paused":
        setState(
          s.shown >= beatCount(s.step)
            ? { kind: "playing", step: s.step, shown: firstShown(s.step) }
            : { kind: "playing", step: s.step, shown: s.shown + 1 },
        );
        break;
      case "playing":
        return;
    }
    bringIntoView();
  };
  const pause = () => {
    const s = state();
    setState({ kind: "paused", step: s.step, shown: s.shown });
  };
  const toggle = () => (state().kind === "playing" ? pause() : play());
  const go = (i: number) => {
    const target = Math.max(0, Math.min(last(), i));
    setHover(undefined);
    setState(
      state().kind === "playing"
        ? { kind: "playing", step: target, shown: firstShown(target) }
        : { kind: "paused", step: target, shown: beatCount(target) },
    );
  };

  /** One tick of playback: the next beat, else the next step, else end on the last step. */
  const advance = () => {
    const s = state();
    if (s.kind !== "playing") return;
    if (s.shown < beatCount(s.step)) setState({ kind: "playing", step: s.step, shown: s.shown + 1 });
    else if (s.step < last()) setState({ kind: "playing", step: s.step + 1, shown: firstShown(s.step + 1) });
    else setState({ kind: "ended", step: s.step, shown: s.shown });
  };

  createEffect(() => {
    const s = state();
    if (s.kind !== "playing") return;
    const stepBeats = beats()[s.step]!;
    const done = s.shown >= stepBeats.length;
    const current = stepBeats[s.shown - 1];
    /** What a beat put on screen, read back from the live split, which already shows it when this effect runs. */
    const el = (b: Beat) => split?.querySelector<HTMLElement>(`[data-beat-key="${keyOf(b)}"]`) ?? null;
    const text = (b: Beat) => el(b)?.textContent ?? "";
    if (reducedMotion()) {
      const delay = Math.max(REDUCED_STEP_MS, stepBeats.reduce((n, b, i) => n + dwell(b, stepBeats[i + 1], text(b)), 0));
      const timer = window.setTimeout(advance, delay);
      onCleanup(() => window.clearTimeout(timer));
      return;
    }
    const stay = current ? dwell(current, stepBeats[s.shown], text(current)) : 0;
    const timer = window.setTimeout(advance, stay + (done ? STEP_GAP_MS : 0));
    const stopGlide = current ? glide(el(current), stay) : undefined;
    onCleanup(() => {
      window.clearTimeout(timer);
      stopGlide?.();
    });
  });

  /** Keep the newest beat in view inside its pane; a new step starts both panes at the top. */
  createEffect(
    on(state, (s, prev) => {
      if (!split) return;
      const el = split;
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
   * The hidden copy holds the current step with every beat shown; its size is the size the split needs. The room left
   * under the controls changes with the viewport and with the head and caption of each step.
   */
  onMount(() => {
    const el = measure;
    const h = head;
    const s = split;
    if (!el || !h || !s) return;
    const read = () => {
      const above = s.getBoundingClientRect().top - h.getBoundingClientRect().top;
      setFit({ split: el.offsetHeight, room: Math.max(MIN_ROOM, window.innerHeight - headerBottom() - above) });
    };
    const ro = new ResizeObserver(read);
    for (const watched of [el, h, caption]) if (watched) ro.observe(watched);
    window.addEventListener("resize", read);
    onCleanup(() => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    });
  });
  const splitStyle = () => {
    const f = fit();
    return f ? { "--rp-fit": `${f.split}px`, "--rp-room": `${f.room}px` } : undefined;
  };

  /**
   * Scrolls the page so the controls sit just below the site header. The split's height is capped at the room left
   * under them (`Fit.room`), so from there every step of the playback, however tall, stays on screen.
   */
  const bringIntoView = () => {
    if (!head) return;
    const offset = head.getBoundingClientRect().top - headerBottom();
    if (Math.abs(offset) < 2) return;
    window.scrollTo({ top: window.scrollY + offset, behavior: reducedMotion() ? "auto" : "smooth" });
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
      toggle();
    }
  };

  /** One numbered tick per step; the current one is filled. */
  const tick = ({ step: s, i }: { step: Step; i: number }) => (
    <button
      type="button"
      classList={{ on: i === state().step, past: i < state().step }}
      aria-label={`${props.labels.step} ${number(i)}: ${s.title}`}
      aria-current={i === state().step ? "step" : undefined}
      onClick={() => go(i)}
    >
      <span>{number(i)}</span>
    </button>
  );

  const playLabel = () => {
    switch (state().kind) {
      case "playing":
        return props.labels.pause;
      case "ended":
        return props.labels.again;
      case "paused":
        return props.labels.play;
    }
  };

  return (
    <div
      class="rp"
      classList={{ compact: !!props.compact, playing: state().kind === "playing" }}
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
              <button type="button" class="rp-btn rp-play" onClick={toggle}>
                {playLabel()}
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
      <p class="rp-caption" ref={caption}>
        {step().caption}
      </p>

      <div class="rp-split" ref={split} style={splitStyle()}>
        <Panes step={step()} rev={rev()} labels={props.labels} lang={props.lang} compact={!!props.compact} tone={toneOf} onHover={setHover} keyed />
      </div>
      <div class="rp-measure" aria-hidden="true" inert>
        <div class="rp-split" ref={measure}>
          <Panes step={step()} rev={whole()} labels={props.labels} lang={props.lang} compact={!!props.compact} tone={() => undefined} keyed={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * The two panes of one step as far as `rev` reveals it. `keyed` marks each beat with its `data-beat-key` and makes hooks
 * focusable, for the live split that playback scrolls and lights; the hidden measuring copy leaves both out.
 */
function Panes(props: {
  step: Step;
  rev: Reveal;
  labels: PlayerLabels;
  lang: Lang;
  compact: boolean;
  tone: (key: string) => HookKind | undefined;
  onHover?: (hook: number | undefined) => void;
  keyed: boolean;
}) {
  const key = (k: string) => (props.keyed ? k : undefined);
  return (
    <>
      <section class="rp-front" aria-label={props.labels.front}>
        <span class="rp-side">{props.labels.front}</span>
        <Window class="rp-win" tabs={["shop-api"]} meta="omp">
          <div class="rp-scroll rp-panels">
            <For each={props.step.front}>
              {(panel, i) => (
                <Show when={props.rev.panels.has(i())}>
                  {panel.kind === "transcript" ? (
                    <div class="rp-beat rp-tx" data-beat-key={key(`p${i()}`)} classList={{ lit: !!props.tone(`p${i()}`) }} data-tone={props.tone(`p${i()}`)}>
                      <For each={panel.lines.slice(0, props.rev.panels.get(i()) ?? 0)}>
                        {(line, j) => (
                          <div
                            class="rp-beat"
                            data-beat-key={key(`l${i()}.${j()}`)}
                            classList={{ lit: !!props.tone(`l${i()}.${j()}`) }}
                            data-tone={props.tone(`l${i()}.${j()}`)}
                          >
                            <Transcript lines={[line]} />
                          </div>
                        )}
                      </For>
                    </div>
                  ) : (
                    <div class="rp-beat" data-beat-key={key(`p${i()}`)} classList={{ lit: !!props.tone(`p${i()}`) }} data-tone={props.tone(`p${i()}`)}>
                      <PanelView lang={props.lang} panel={panel} compact={props.compact} />
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
          <Show when={props.step.hooks.length > 0} fallback={<p class="rp-quiet">{props.labels.quiet}</p>}>
            <For each={props.step.hooks}>
              {(timed, i) => (
                <Show when={props.rev.hooks.has(i())}>
                  <div
                    class="rp-beat"
                    data-beat-key={key(`h${i()}`)}
                    classList={{ lit: !!props.tone(`h${i()}`) }}
                    data-tone={props.tone(`h${i()}`)}
                    onMouseEnter={() => props.onHover?.(i())}
                    onMouseLeave={() => props.onHover?.(undefined)}
                    onFocusIn={() => props.onHover?.(i())}
                    onFocusOut={() => props.onHover?.(undefined)}
                    tabIndex={props.keyed ? 0 : undefined}
                  >
                    <HookMessage hook={timed.hook} />
                  </div>
                </Show>
              )}
            </For>
          </Show>
        </div>
      </section>
    </>
  );
}

/** How long a beat taller than its pane holds still before gliding, and how long its end shows before the next beat. */
const GLIDE_HOLD_MS = 1500;
const GLIDE_TAIL_MS = 1200;

/**
 * Scrolls a beat that is taller than its pane down through the pane while it is the newest one, so its end has shown
 * by the time the next beat appears. Stops as soon as someone else scrolls the pane. Returns the cancel function.
 */
function glide(el: HTMLElement | null, stay: number): () => void {
  const pane = el?.closest<HTMLElement>(".rp-scroll");
  const run = stay - GLIDE_HOLD_MS - GLIDE_TAIL_MS;
  if (!el || !pane || run <= 0) return () => {};
  let raf = 0;
  const hold = window.setTimeout(() => {
    const below = el.getBoundingClientRect().bottom - pane.getBoundingClientRect().bottom + 12;
    if (below <= 0) return;
    const from = pane.scrollTop;
    let last = from;
    let t0: number | undefined;
    const frame = (t: number) => {
      if (Math.abs(pane.scrollTop - last) > 2) return;
      t0 ??= t;
      const k = Math.min(1, (t - t0) / run);
      pane.scrollTop = from + below * k;
      last = pane.scrollTop;
      if (k < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }, GLIDE_HOLD_MS);
  return () => {
    window.clearTimeout(hold);
    window.cancelAnimationFrame(raf);
  };
}

/** Where content may start below the sticky site header, with a small margin. */
function headerBottom(): number {
  return (document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().bottom ?? 0) + 12;
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
