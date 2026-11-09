import { For, Show } from "solid-js";

/** A span of a model request, in prefix order. `delta` is an appended `<system-reminder>`, `new` the tokens of this turn. */
export interface Segment {
  readonly label: string;
  readonly kind: "system" | "tools" | "msg" | "delta" | "new" | "changed";
  /** Relative width. */
  readonly size: number;
}

export interface ContextRow {
  readonly title: string;
  readonly segments: readonly Segment[];
  /** The note under the bar, e.g. which part the provider served from cache. */
  readonly note: string;
  readonly cache: "hit" | "miss";
}

/** A request drawn as a row of spans, to show what changes between turns and what the prompt cache keeps. */
export default function ContextBar(props: { rows: readonly ContextRow[] }) {
  return (
    <div class="sl-ctx">
      <For each={props.rows}>
        {(row) => (
          <div class="sl-ctx-row">
            <span class="sl-ctx-title">{row.title}</span>
            <div class="sl-ctx-bar">
              <For each={row.segments}>
                {(s) => (
                  <span class={`k-${s.kind}`} style={{ "flex-grow": s.size }}>
                    {s.label}
                  </span>
                )}
              </For>
            </div>
            <Show when={row.note}>
              <span class={`sl-ctx-note c-${row.cache}`}>{row.note}</span>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
