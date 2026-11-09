import { createMemo, createSignal, For, Show } from "solid-js";
import "../styles/lifeline-map.css";

export type Layer = "human" | "agent" | "silent";

export interface MapSeam {
  readonly id: string;
  readonly order: number;
  /** Short seam name for the column head, e.g. "Intent". */
  readonly name: string;
  readonly href: string;
}

export interface MapComponent {
  readonly id: string;
  readonly name: string;
  readonly seam: string;
  readonly layer: Layer;
  /** One sentence: when it acts, what it does, what results. */
  readonly line: string;
  readonly repo: string;
}

export interface MapLabels {
  readonly layers: Readonly<Record<Layer, string>>;
  readonly repo: string;
  readonly seamPage: string;
}

const LAYERS: readonly Layer[] = ["human", "agent", "silent"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Every component on a grid of seams (columns) by layers (rows). Selecting a component opens its sentence
 * right under the row it sits in, below its column. On narrow screens one seam shows at a time.
 */
export default function LifelineMap(props: {
  seams: readonly MapSeam[];
  components: readonly MapComponent[];
  labels: MapLabels;
}) {
  const [focusId, setFocusId] = createSignal(
    LAYERS.flatMap((l) => props.components.filter((c) => c.seam === props.seams[0]!.id && c.layer === l))[0]!.id,
  );
  const focus = createMemo(() => props.components.find((c) => c.id === focusId())!);
  const [narrowSeam, setNarrowSeam] = createSignal(props.seams[0]!.id);
  const column = createMemo(() => props.seams.findIndex((s) => s.id === focus().seam));
  const pick = (c: MapComponent) => {
    setFocusId(c.id);
    setNarrowSeam(c.seam);
  };

  return (
    <div class="lm" style={{ "--n": props.seams.length }}>
      <div class="lm-tabs" role="tablist">
        <For each={props.seams}>
          {(s) => (
            <button type="button" role="tab" aria-selected={narrowSeam() === s.id} classList={{ on: narrowSeam() === s.id }} onClick={() => setNarrowSeam(s.id)}>
              <span class="lm-n">{pad(s.order)}</span>
              {s.name}
            </button>
          )}
        </For>
      </div>

      <div class="lm-grid">
        <div class="lm-corner" />
        <For each={props.seams}>
          {(s) => (
            <a class="lm-head" classList={{ off: narrowSeam() !== s.id }} href={s.href}>
              <span class="lm-n">{pad(s.order)}</span>
              {s.name}
            </a>
          )}
        </For>

        <For each={LAYERS}>
          {(layer) => (
            <>
              <div class={`lm-row layer-${layer}`}>
                <span class="layer-dot" />
                {props.labels.layers[layer]}
              </div>
              <For each={props.seams}>
                {(s) => (
                  <div class={`lm-cell layer-${layer}`} classList={{ off: narrowSeam() !== s.id }}>
                    <For each={props.components.filter((c) => c.seam === s.id && c.layer === layer)}>
                      {(c) => (
                        <button type="button" class="lm-chip" classList={{ on: focusId() === c.id }} aria-pressed={focusId() === c.id} onClick={() => pick(c)}>
                          {c.name}
                        </button>
                      )}
                    </For>
                  </div>
                )}
              </For>
              <Show when={focus().layer === layer}>
                <div class="lm-detail">
                  <div class={`lm-box layer-${layer}`} style={{ "grid-column": `${2 + Math.min(column(), props.seams.length - 3)} / span 3` }}>
                    <code>{focus().name}</code>
                    <p>{focus().line}</p>
                    <div class="lm-links">
                      <a href={focus().repo}>{props.labels.repo} ↗</a>
                      <a href={props.seams[column()]!.href}>
                        {props.labels.seamPage} {pad(props.seams[column()]!.order)} →
                      </a>
                    </div>
                  </div>
                </div>
              </Show>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
