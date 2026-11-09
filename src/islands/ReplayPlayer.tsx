import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import type { PlayerLabels, Step } from "../data/scenario";
import type { Lang } from "../i18n";
import HookMessage from "../slices/HookMessage";
import PanelView from "../slices/Panel";
import Window from "../slices/Window";
import "../styles/replay.css";

const STEP_MS = 6500;

/**
 * The demo scenario as a split screen: on the left what the person sees, on the right what reached the model.
 * Opens on the first step; the step bar, arrows and play button move through the steps.
 */
export default function ReplayPlayer(props: {
  lang: Lang;
  steps: readonly Step[];
  labels: PlayerLabels;
  /** Number of the first step among the whole scenario, when `steps` is a slice of it. */
  firstNumber?: number;
  /** Total number of steps in the whole scenario; defaults to the length of `steps` when they are the whole scenario. */
  total?: number;
  compact?: boolean;
}) {
  const [index, setIndex] = createSignal(0);
  const [playing, setPlaying] = createSignal(false);
  const step = createMemo(() => props.steps[index()]!);
  const last = () => props.steps.length - 1;
  /** A slice cannot report its own length as the scenario total, so the total stays blank until the caller passes it. */
  const total = () => props.total ?? (props.firstNumber === undefined ? props.steps.length : undefined);
  const number = (i: number) => (props.firstNumber ?? 1) + i;

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

  let timer: number | undefined;
  const stop = () => {
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
    setPlaying(false);
  };
  const play = () => {
    if (index() >= last()) setIndex(0);
    setPlaying(true);
    timer = window.setInterval(() => {
      if (index() >= last()) stop();
      else setIndex(index() + 1);
    }, STEP_MS);
  };
  const go = (i: number) => {
    stop();
    setIndex(Math.max(0, Math.min(last(), i)));
  };
  onCleanup(stop);

  /** One numbered tick per step; shared by the seam bar and the inline picker of a single-seam page. */
  const tick = ({ step: s, i }: { step: Step; i: number }) => (
    <button
      type="button"
      classList={{ on: i === index(), past: i < index() }}
      aria-label={`${props.labels.step} ${number(i)}: ${s.title}`}
      aria-current={i === index() ? "step" : undefined}
      onClick={() => go(i)}
    >
      <span>{number(i)}</span>
    </button>
  );

  return (
    <div class="rp" classList={{ compact: !!props.compact }}>
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

      <div class="rp-head">
        <div class="rp-title">
          <span class="rp-n">
            {props.lang === "zh" ? (
              <>
                第 {number(index())} 步
                {total() !== undefined && <span class="rp-of">，共 {total()} 步</span>}
              </>
            ) : (
              <>
                {props.labels.step} {number(index())}
                {total() !== undefined && <span class="rp-of"> of {total()}</span>}
              </>
            )}
          </span>
          <h3>{step().title}</h3>
        </div>
        <Show when={props.steps.length > 1}>
          <div class="rp-right">
            <Show when={groups().length === 1}>
              <div class="rp-ticks" aria-label={props.labels.seams[groups()[0]!.seam]}>
                <For each={groups()[0]!.steps}>{tick}</For>
              </div>
            </Show>
            <div class="rp-controls">
              <button type="button" class="rp-btn" aria-label={props.labels.prev} disabled={index() === 0} onClick={() => go(index() - 1)}>
                ←
              </button>
              <button type="button" class="rp-btn rp-play" onClick={() => (playing() ? stop() : play())}>
                {playing() ? props.labels.pause : index() >= last() ? props.labels.again : props.labels.play}
              </button>
              <button type="button" class="rp-btn" aria-label={props.labels.next} disabled={index() === last()} onClick={() => go(index() + 1)}>
                →
              </button>
            </div>
          </div>
        </Show>
      </div>
      <p class="rp-caption">{step().caption}</p>

      <div class="rp-split">
        <section class="rp-front" aria-label={props.labels.front}>
          <span class="rp-side">{props.labels.front}</span>
          <Window tabs={["shop-api"]} meta="omp">
            <div class="rp-panels">
              <For each={step().front}>{(panel) => <PanelView lang={props.lang} panel={panel} compact={!!props.compact} />}</For>
            </div>
          </Window>
        </section>
        <section class="rp-back" aria-label={props.labels.back}>
          <span class="rp-side">{props.labels.back}</span>
          <Show when={step().hooks.length > 0} fallback={<p class="rp-quiet">{props.labels.quiet}</p>}>
            <For each={step().hooks}>{(timed) => <HookMessage hook={timed.hook} />}</For>
          </Show>
        </section>
      </div>
    </div>
  );
}
