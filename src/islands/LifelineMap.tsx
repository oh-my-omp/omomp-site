import { createMemo, createSignal, For, Show } from "solid-js";

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
  readonly hint: string;
}

const LAYERS: readonly Layer[] = ["human", "agent", "silent"];

export default function LifelineMap(props: {
  seams: readonly MapSeam[];
  components: readonly MapComponent[];
  labels: MapLabels;
}) {
  const [layer, setLayer] = createSignal<Layer | "all">("all");
  const [focus, setFocus] = createSignal<MapComponent | undefined>(undefined);
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

      <div class="lm-tabs" role="tablist">
        <For each={props.seams}>
          {(s) => (
            <button type="button" role="tab" aria-selected={seam() === s.id} classList={{ on: seam() === s.id }} onClick={() => setSeam(s.id)}>
              {s.order}
            </button>
          )}
        </For>
      </div>

      <div class="lm-grid" style={{ "--cols": props.seams.length }}>
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
                          {c.name}
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
        <Show when={focus()} fallback={<p class="lm-hint">{props.labels.hint}</p>}>
          {(c) => (
            <>
              <span class={`layer-${c().layer} lm-detail-layer`}>
                <span class="layer-dot" />
                {props.labels.layers[c().layer]}
              </span>
              <code class="lm-detail-name">{c().name}</code>
              <p>{c().solves}</p>
              <a href={c().repo}>{props.labels.open} →</a>
            </>
          )}
        </Show>
      </div>
    </div>
  );
}
