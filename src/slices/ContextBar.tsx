import { For, Show } from "solid-js";

export interface Segment {
  readonly label: string;
  readonly kind: "system" | "tools" | "msg" | "delta" | "new" | "changed";
  readonly size: number;
}

export interface ContextRow {
  readonly title: string;
  readonly segments: readonly Segment[];
  readonly note: string;
  readonly cache: "hit" | "miss";
}

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
