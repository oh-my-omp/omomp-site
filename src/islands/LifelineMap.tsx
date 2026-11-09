import { createMemo, createSignal, For, Show } from "solid-js";
import "../styles/lifeline-map.css";

export type Layer = "human" | "agent" | "silent";

export interface MapSeam {
  readonly id: string;
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
  /** A few words under each row label saying what the layer is. */
  readonly layerNotes: Readonly<Record<Layer, string>>;
  readonly repo: string;
  readonly seamPage: string;
}

const LAYERS: readonly Layer[] = ["human", "agent", "silent"];
/** Columns the opened sentence spans, starting under the selected component. */
const DETAIL_SPAN = 3;

/**
 * Every component on a grid of seams (columns) by layers (rows). Selecting a component opens its sentence
 * right under the row it sits in, starting below the selected component's column (or ending there near the right edge).
 * On narrow screens one seam shows at a time.
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
  /** Grid columns of the opened sentence: the first grid column holds the row labels. */
  const detailColumns = createMemo(() => {
    const span = Math.min(DETAIL_SPAN, props.seams.length);
    const start = Math.min(column(), props.seams.length - span) + 2;
    return `${start} / span ${span}`;
  });
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
              {s.name}
            </button>
          )}
        </For>
      </div>

      <div class="lm-grid">
        <div class="lm-corner" />
        <For each={props.seams}>
          {(s) => (
            <a class="lm-head" classList={{ off: narrowSeam() !== s.id, on: focus().seam === s.id }} href={s.href}>
              {s.name}
            </a>
          )}
        </For>

        <For each={LAYERS}>
          {(layer) => (
            <>
              <div class={`lm-row layer-${layer}`}>
                <span class="layer-dot" />
                <span class="lm-row-text">
                  <span class="lm-row-name">{props.labels.layers[layer]}</span>
                  <span class="lm-row-note">{props.labels.layerNotes[layer]}</span>
                </span>
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
                  <div class={`lm-box layer-${layer}`} style={{ "grid-column": detailColumns() }}>
                    <div class="lm-text">
                      <code>{focus().name}</code>
                      <p>{focus().line}</p>
                    </div>
                    <div class="lm-links">
                      <a href={focus().repo}>{props.labels.repo} ↗</a>
                      <a href={props.seams[column()]!.href}>
                        {props.labels.seamPage} · {props.seams[column()]!.name} →
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
