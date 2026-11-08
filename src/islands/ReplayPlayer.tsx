import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";

export type Actor = "user" | "assistant" | "tool" | "hook" | "subagent";
export type Kind = "message" | "tool_call" | "tool_result" | "reminder" | "block";

export interface ReplayEvent {
  readonly actor: Actor;
  readonly kind: Kind;
  readonly tool?: string;
  readonly text: string;
  /** Annotation shown beside this event, already localized. */
  readonly note?: string;
}

export interface Shot {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly mechanisms: readonly string[];
  /** Session date, id prefix and model, each kept on one line. */
  readonly source: readonly string[];
  readonly events: readonly ReplayEvent[];
}

export interface Labels {
  readonly play: string;
  readonly pause: string;
  /** Shown on the play button once the chapter has played to its last event. */
  readonly replay: string;
  readonly step: string;
  readonly humanView: string;
  readonly fullView: string;
  /** `{n}` is replaced with the count; island props must be plain data, so no formatter function. */
  readonly hidden: Readonly<Record<"one" | "other", string>>;
  readonly actors: Readonly<Record<Actor, string>>;
  readonly source: string;
}

/** Events a person watching the terminal never sees: hook output and reminders appended for the model. */
const silent = (e: ReplayEvent) => e.actor === "hook" || e.kind === "reminder";

const STEP_MS = 1600;

export default function ReplayPlayer(props: { shots: readonly Shot[]; labels: Labels; compact?: boolean }) {
  const [shotIndex, setShotIndex] = createSignal(0);
  const [step, setStep] = createSignal((props.shots[0]?.events.length ?? 1) - 1);
  const [playing, setPlaying] = createSignal(false);
  const [reveal, setReveal] = createSignal(true);

  const shot = createMemo(() => props.shots[shotIndex()]!);
  /** One stable object per event, so stepping keeps rendered cards and only animates the new one. */
  const indexed = createMemo(() => shot().events.map((e, i) => ({ e, i })));
  const visible = createMemo(() => indexed().filter(({ e, i }) => i <= step() && (reveal() || !silent(e))));
  const hiddenSoFar = createMemo(
    () => shot().events.slice(0, step() + 1).filter(silent).length,
  );
  const last = () => shot().events.length - 1;
  const finished = () => !playing() && step() >= last();

  createEffect(() => {
    if (!playing()) return;
    const timer = window.setInterval(() => {
      if (step() < last()) {
        setStep(step() + 1);
      } else if (shotIndex() < props.shots.length - 1) {
        setShotIndex(shotIndex() + 1);
        setStep(0);
      } else {
        setPlaying(false);
      }
    }, STEP_MS);
    onCleanup(() => window.clearInterval(timer));
  });

  const pick = (i: number) => {
    setShotIndex(i);
    setStep(props.shots[i]!.events.length - 1);
    setPlaying(false);
  };

  return (
    <div class="rp" classList={{ compact: !!props.compact }}>
      <Show when={props.shots.length > 1}>
        <ol class="rp-chapters">
          <For each={props.shots}>
            {(s, i) => (
              <li>
                <button
                  type="button"
                  classList={{ on: i() === shotIndex() }}
                  aria-current={i() === shotIndex() ? "step" : undefined}
                  onClick={() => pick(i())}
                >
                  <span class="rp-num">{String(i() + 1).padStart(2, "0")}</span>
                  <span class="rp-ch-title">{s.title}</span>
                </button>
              </li>
            )}
          </For>
        </ol>
      </Show>
      <div class="rp-stage">
        <div class="rp-head">
          <div class="rp-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div class="rp-mech">
            <For each={shot().mechanisms}>{(m) => <code>{m}</code>}</For>
          </div>
          <div class="rp-toggle" role="group">
            <button type="button" classList={{ on: !reveal() }} aria-pressed={!reveal()} onClick={() => setReveal(false)}>
              {props.labels.humanView}
            </button>
            <button type="button" classList={{ on: reveal() }} aria-pressed={reveal()} onClick={() => setReveal(true)}>
              {props.labels.fullView}
            </button>
          </div>
        </div>
        <p class="rp-caption">{shot().caption}</p>
        <div class="rp-screen" aria-live="polite">
          <For each={visible()}>
            {({ e, i }) => (
              <div class={`rp-ev a-${e.actor} k-${e.kind}`} classList={{ fresh: i === step() }}>
                <div class="rp-who">
                  <span>{props.labels.actors[e.actor]}</span>
                  <Show when={e.tool}>
                    <code>{e.tool}</code>
                  </Show>
                </div>
                <pre class="rp-text">{e.text}</pre>
                <Show when={e.note}>
                  <p class="rp-note">{e.note}</p>
                </Show>
              </div>
            )}
          </For>
          <Show when={!reveal() && hiddenSoFar() > 0}>
            <p class="rp-hidden">
              {props.labels.hidden[hiddenSoFar() === 1 ? "one" : "other"].replace("{n}", String(hiddenSoFar()))}
            </p>
          </Show>
        </div>
        <div class="rp-controls">
          <button
            type="button"
            class="rp-play"
            onClick={() => {
              if (finished()) setStep(0);
              setPlaying(!playing());
            }}
          >
            {playing() ? props.labels.pause : finished() ? props.labels.replay : props.labels.play}
          </button>
          <input
            type="range"
            min="0"
            max={last()}
            value={step()}
            aria-label={props.labels.step}
            onInput={(ev) => {
              setPlaying(false);
              setStep(Number(ev.currentTarget.value));
            }}
          />
          <span class="rp-count" aria-hidden="true">
            {step() + 1} / {last() + 1}
          </span>
        </div>
        <p class="rp-source">
          <span>{props.labels.source}</span>
          <For each={shot().source}>{(part) => <span class="rp-source-part">{part}</span>}</For>
        </p>
      </div>
    </div>
  );
}
