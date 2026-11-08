import { createMemo, createSignal, For } from "solid-js";

export type Layer = "human" | "agent" | "silent";

export interface MapSeam {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly href: string;
}

export interface MapComponent {
  readonly name: string;
  readonly seam: string;
  readonly layer: Layer;
  readonly solves: string;
  readonly repo: string;
}

export interface MapLabels {
  readonly layers: Readonly<Record<Layer, string>>;
  readonly all: string;
  readonly open: string;
  /** Word before the seam number in the detail panel's link to the seam page. */
  readonly seam: string;
  readonly hint: string;
}

const LAYERS: readonly Layer[] = ["human", "agent", "silent"];

export default function LifelineMap(props: {
  seams: readonly MapSeam[];
  components: readonly MapComponent[];
  labels: MapLabels;
}) {
  const [layer, setLayer] = createSignal<Layer | "all">("all");
  // The first chip of the first seam, in layer order, so the detail panel starts filled.
  const first = LAYERS.flatMap((l) => props.components.filter((c) => c.seam === props.seams[0]!.id && c.layer === l))[0]!;
  const [focus, setFocus] = createSignal<MapComponent>(first);
  const focusSeam = createMemo(() => props.seams.find((s) => s.id === focus().seam)!);
  const [seam, setSeam] = createSignal(props.seams[0]!.id);

  const cells = createMemo(() => {
    const map = new Map<string, MapComponent[]>();
    for (const c of props.components) {
      const key = `${c.seam}:${c.layer}`;
      map.set(key, [...(map.get(key) ?? []), c]);
    }
    return map;
  });

  return (
    <div class="lm">
      <div class="lm-filter" role="group">
        <button type="button" classList={{ on: layer() === "all" }} aria-pressed={layer() === "all"} onClick={() => setLayer("all")}>
          {props.labels.all}
        </button>
        <For each={LAYERS}>
          {(l) => (
            <button
              type="button"
              class={`layer-${l}`}
              classList={{ on: layer() === l }}
              aria-pressed={layer() === l}
              onClick={() => setLayer(layer() === l ? "all" : l)}
            >
              <span class="layer-dot" />
              {props.labels.layers[l]}
            </button>
          )}
        </For>
      </div>
      <p class="lm-hint">{props.labels.hint}</p>

      <div class="lm-tabs" role="tablist">
        <For each={props.seams}>
          {(s) => (
            <button type="button" role="tab" aria-selected={seam() === s.id} classList={{ on: seam() === s.id }} onClick={() => setSeam(s.id)}>
              {String(s.order).padStart(2, "0")}
            </button>
          )}
        </For>
      </div>

      <div class="lm-grid" style={{ "--cols": props.seams.length }}>
        <div class="lm-rowlabels" aria-hidden="true">
          <span />
          <For each={LAYERS}>
            {(l) => (
              <span class={`lm-rowlabel layer-${l}`} classList={{ dim: layer() !== "all" && layer() !== l }}>
                <span class="lm-rowlabel-text">
                  <span class="layer-dot" />
                  {props.labels.layers[l]}
                </span>
              </span>
            )}
          </For>
        </div>
        <For each={props.seams}>
          {(s) => (
            <section class="lm-col" classList={{ current: seam() === s.id }}>
              <a class="lm-seam" href={s.href}>
                <span class="lm-order">{String(s.order).padStart(2, "0")}</span>
                <span class="lm-name">{s.name}</span>
              </a>
              <For each={LAYERS}>
                {(l) => (
                  <div class={`lm-cell layer-${l}`} classList={{ dim: layer() !== "all" && layer() !== l }}>
                    <span class="lm-cell-label">{props.labels.layers[l]}</span>
                    <For each={cells().get(`${s.id}:${l}`) ?? []}>
                      {(c) => (
                        <button
                          type="button"
                          class="lm-chip"
                          classList={{ on: focus() === c }}
                          onMouseEnter={() => setFocus(c)}
                          onFocus={() => setFocus(c)}
                          onClick={() => setFocus(c)}
                        >
                          <For each={c.name.split(" · ")}>
                            {(part, i) => {
                              const more = i() < c.name.split(" · ").length - 1;
                              return (
                                <>
                                  <span class="lm-chip-part">
                                    {part}
                                    {more && <span class="lm-chip-sep"> ·</span>}
                                  </span>
                                  {more && " "}
                                </>
                              );
                            }}
                          </For>
                        </button>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </section>
          )}
        </For>
      </div>

      <div class="lm-detail" aria-live="polite">
        <span class={`layer-${focus().layer} lm-detail-layer`}>
          <span class="layer-dot" />
          {props.labels.layers[focus().layer]}
        </span>
        <code class="lm-detail-name">{focus().name}</code>
        <p>{focus().solves}</p>
        <span class="lm-detail-links">
          <a href={focusSeam().href}>
            {props.labels.seam} {String(focusSeam().order).padStart(2, "0")} · {focusSeam().name} →
          </a>
          <a href={focus().repo}>{props.labels.open} →</a>
        </span>
      </div>
    </div>
  );
}
