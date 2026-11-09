import { For } from "solid-js";

/** One launch mode of omp-config: what sits in the cached prefix, what is appended as messages, and which checks load. */
export interface ModeRow {
  /** The command that starts the mode, e.g. `omp-light`. */
  readonly command: string;
  /** Already-localized mode name. */
  readonly name: string;
  /** Spans of the request prefix, in order: system prompt, appended system file, tool list. */
  readonly prefix: readonly string[];
  /** Messages the mode's extensions append after the prefix. */
  readonly appended: readonly string[];
  readonly checks: ReadonlyArray<{ readonly name: string; readonly loaded: boolean }>;
}

export interface ModeMountData {
  readonly rows: readonly ModeRow[];
  /** Already-localized group and state words. */
  readonly labels: { readonly prefix: string; readonly appended: string; readonly loaded: string; readonly off: string };
}

/** omp (full mode) against omp-light (light mode): each keeps its own prefix fixed for the session; they differ in the appended system file, the appended messages and the loaded checks (agent/config-light.yml). */
export default function ModeMount(props: { data: ModeMountData }) {
  const l = () => props.data.labels;
  return (
    <div class="sl-mode">
      <For each={props.data.rows}>
        {(row) => (
          <div class="sl-mode-row">
            <div class="sl-mode-head">
              <code>{row.command}</code>
              <span>{row.name}</span>
            </div>
            <div class="sl-mode-bar">
              <div class="sl-mode-group g-prefix">
                <div class="sl-mode-spans">
                  <For each={row.prefix}>{(s) => <span>{s}</span>}</For>
                </div>
                <span class="sl-mode-cap">{l().prefix}</span>
              </div>
              <div class="sl-mode-group g-appended">
                <div class="sl-mode-spans">
                  <For each={row.appended}>{(s) => <span>{s}</span>}</For>
                </div>
                <span class="sl-mode-cap">{l().appended}</span>
              </div>
            </div>
            <ul class="sl-mode-checks">
              <For each={row.checks}>
                {(c) => (
                  <li classList={{ on: c.loaded }} title={c.loaded ? l().loaded : l().off}>
                    <span class="dot" />
                    <code>{c.name}</code>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
      <p class="sl-mode-key">
        <span class="on">
          <span class="dot" />
          {l().loaded}
        </span>
        <span>
          <span class="dot" />
          {l().off}
        </span>
      </p>
    </div>
  );
}
