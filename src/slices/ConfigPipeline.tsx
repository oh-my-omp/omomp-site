import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import type { HookKind } from "./HookMessage";
import "../styles/home-slices.css";

export type Layer = "human" | "agent" | "silent";

/** One omp-config component placed on the lifeline; `hook` is how a silent hook acts on the model, null when it is not a hook. */
export interface PipeItem {
  readonly name: string;
  readonly layer: Layer;
  readonly hook: HookKind | null;
}

export interface PipeSeam {
  readonly name: string;
  readonly items: readonly PipeItem[];
}

export interface PipeLabels {
  readonly layers: Readonly<Record<Layer, string>>;
  readonly kinds: Readonly<Record<HookKind, string>>;
  /** One line per hook kind under the pipeline: what reaches the model. */
  readonly legend: Readonly<Record<HookKind, string>>;
}

const layers: readonly Layer[] = ["human", "agent", "silent"];
const kinds: readonly HookKind[] = ["reminder", "block", "judge"];

/**
 * omp-config along the six seams: a rail through the seams, and under each seam what omp-config puts on the
 * human surface, among the agent's primitives and in silent governance; silent hooks are marked by how they
 * reach the model (an appended `<system-reminder>`, a refused call, a verdict).
 */
export default function ConfigPipeline(props: { seams: readonly PipeSeam[]; labels: PipeLabels; lang: Lang }) {
  return (
    <div class="cp" lang={props.lang}>
      <div class="cp-grid">
        <For each={props.seams}>
          {(s) => (
            <section class="cp-seam">
              <h4 class="cp-head">
                <i class="cp-node" />
                {s.name}
              </h4>
              <For each={layers}>
                {(l) => (
                  <ul class={`cp-lane layer-${l}`} aria-label={props.labels.layers[l]}>
                    <For each={s.items.filter((it) => it.layer === l)}>
                      {(it) => (
                        <li class={it.hook ? `k-${it.hook}` : undefined}>
                          <Show when={it.hook}>{(k) => <b>{props.labels.kinds[k()]}</b>}</Show>
                          <code>{it.name}</code>
                        </li>
                      )}
                    </For>
                  </ul>
                )}
              </For>
            </section>
          )}
        </For>
      </div>
      <ul class="cp-legend">
        <For each={layers}>{(l) => <li class={`cp-key layer-${l}`}>{props.labels.layers[l]}</li>}</For>
        <For each={kinds}>
          {(k) => (
            <li class={`k-${k}`}>
              <b>{props.labels.kinds[k]}</b>
              <span innerHTML={props.labels.legend[k]} />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
