import { For } from "solid-js";

export interface ModeRow {
  readonly command: string;
  readonly name: string;
  readonly prefix: readonly string[];
  readonly appended: readonly string[];
  readonly checks: ReadonlyArray<{ readonly name: string; readonly loaded: boolean }>;
}

export interface ModeMountData {
  readonly rows: readonly ModeRow[];
  readonly labels: { readonly prefix: string; readonly appended: string; readonly loaded: string; readonly off: string };
}

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
