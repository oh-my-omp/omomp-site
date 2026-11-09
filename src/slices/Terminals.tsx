import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";

export type TermState = "running" | "exit0" | "failed";

/** A screen line; `by` marks input typed by the person or written by the agent, for the reader of the demo. */
export interface ScreenLine {
  readonly text: string;
  readonly by?: "you" | "agent";
}

export interface TermSession {
  readonly id: number;
  readonly title: string;
  readonly command: string;
  readonly state: TermState;
  readonly elapsed: string;
  readonly cwd: string;
  readonly size: string;
  readonly screen: readonly ScreenLine[];
}

export interface TerminalsData {
  readonly sessions: readonly TermSession[];
  readonly selected: number;
  /** `view`: the Terminals list with detail; `page`: the selected session full-pane, where keys go to the PTY. */
  readonly mode: "view" | "page";
}

const glyph: Record<TermState, string> = { running: "●", exit0: "✓", failed: "✕" };

/** omp-unified-exec's Tern Terminals view and full-pane terminal page (fork-features/tern-terminal-hud.ts). */
export default function Terminals(props: { lang: Lang; data: TerminalsData; compact?: boolean }) {
  const l = () => labels[props.lang].exec;
  const sel = () => props.data.sessions.find((s) => s.id === props.data.selected) ?? props.data.sessions[0]!;
  const stateLabel = (s: TermState) => (s === "running" ? l().running : s === "exit0" ? l().exit0 : l().failed);
  const screen = () => (
    <pre class="sl-term-screen">
      <For each={sel().screen}>{(line) => <span class={line.by ? `by-${line.by}` : undefined}>{line.text + "\n"}</span>}</For>
    </pre>
  );
  return (
    <div class="sl-term" classList={{ compact: !!props.compact }}>
      <Show
        when={props.data.mode === "view"}
        fallback={
          <>
            <div class="sl-term-head">
              <span class="dim">{l().terminals} · </span>#{sel().id} {sel().title}
              <span class={`st-${sel().state}`}>{"  "}{sel().state === "running" ? l().runningWord : stateLabel(sel().state)}</span>
            </div>
            {screen()}
            <div class="sl-term-bar">
              <span class="dim">{l().keysGo}</span>
              <span class="sl-btn danger">{l().kill}</span>
              <span class="sl-btn">
                {l().back} <kbd>esc</kbd>
              </span>
            </div>
          </>
        }
      >
        <div class="sl-term-head">{l().terminals}</div>
        <div class="sl-term-split">
          <ul class="sl-term-list">
            <For each={props.data.sessions}>
              {(s) => (
                <li classList={{ on: s.id === sel().id }} class={`st-${s.state}`}>
                  <span class="g">{glyph[s.state]}</span>
                  <span class="t">{s.title}</span>
                  <span class="e">{s.elapsed}</span>
                </li>
              )}
            </For>
          </ul>
          <div class="sl-term-detail">
            <div class="sl-term-status">
              <span class={`st-${sel().state}`}>
                {glyph[sel().state]} {stateLabel(sel().state)}
              </span>
              <span class="dim">{sel().elapsed}</span>
              <span class="dim mono-s">exec · #{sel().id}</span>
              <Show when={!props.compact}>
                <span class="sl-btn">
                  {l().open} <kbd>enter</kbd>
                </span>
              </Show>
            </div>
            <code class="sl-term-cmd">{sel().command}</code>
            <Show when={!props.compact}>
              <dl class="sl-term-kv">
                <dt>{l().directory}</dt>
                <dd>{sel().cwd}</dd>
                <dt>{l().size}</dt>
                <dd>{sel().size}</dd>
              </dl>
            </Show>
            <span class="dim">{l().output}</span>
            {screen()}
          </div>
        </div>
        <div class="sl-term-bar">
          <span class="dim">
            {l().footer(props.data.sessions.filter((s) => s.state === "running").length, props.data.sessions.length)}
          </span>
          <span class="sl-btn">
            {l().close} <kbd>esc</kbd>
          </span>
        </div>
      </Show>
    </div>
  );
}
