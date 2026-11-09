import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";

export interface AskOption {
  readonly label: string;
  readonly description?: string;
  readonly tradeoff?: string;
  readonly holdsWhen?: string;
  readonly cost?: string;
  readonly recommended?: boolean;
}

export interface AskEvidence {
  readonly path: string;
  readonly start: number;
  readonly lines: readonly string[];
}

export interface AskData {
  /** Sheet title: the question's `header`. */
  readonly header: string;
  readonly question: string;
  readonly where: string;
  readonly what: string;
  readonly how: string;
  readonly options: readonly AskOption[];
  /** Option under the cursor; its tradeoff card is shown. */
  readonly cursor: number;
  /** Option the person picked, once answered. */
  readonly answered?: number;
  readonly evidence?: readonly AskEvidence[];
  /** Countdown line left of the action bar, as `countdownStatus()` words it. */
  readonly countdown?: string;
}

/** omp-ask-more's full-screen question, as the Tern modal sheet lays it out (src/nodes.ts `sheetLayout`). */
export default function AskPanel(props: { lang: Lang; data: AskData; compact?: boolean }) {
  const l = () => labels[props.lang].ask;
  return (
    <div class="sl-ask" classList={{ compact: !!props.compact }}>
      <div class="sl-ask-head">
        <span class="sl-ask-mark">?</span>
        <span>{props.data.header}</span>
      </div>
      <div class="sl-ask-body">
        <p class="sl-ask-q">{props.data.question}</p>
        <div class="sl-ask-brief">
          <div>
            <b>{l().where}</b>
            <p>{props.data.where}</p>
          </div>
          <div>
            <b>{l().what}</b>
            <p>{props.data.what}</p>
          </div>
          <Show when={!props.compact}>
            <div>
              <b>{l().how}</b>
              <p>{props.data.how}</p>
            </div>
          </Show>
        </div>
        <ul class="sl-ask-opts">
          <For each={props.data.options}>
            {(o, i) => (
              <li classList={{ cur: i() === props.data.cursor, picked: i() === props.data.answered }}>
                <span class="sl-ask-label">{o.label}</span>
                <Show when={o.description && !props.compact}>
                  <span class="sl-ask-detail">{o.description}</span>
                </Show>
                <Show when={o.recommended}>
                  <span class="sl-ask-rec">{l().recommended}</span>
                </Show>
              </li>
            )}
          </For>
          <li class="other">
            <span class="sl-ask-label">{l().other}</span>
          </li>
        </ul>
        <Show when={props.data.options[props.data.cursor]}>
          {(o) => (
            <div class="sl-ask-trade">
              <div class="sl-ask-trade-head">{o().label}</div>
              <Show when={o().tradeoff}>
                <p>
                  <span>{l().tradeoff}</span>
                  {o().tradeoff}
                </p>
              </Show>
              <Show when={o().holdsWhen && !props.compact}>
                <p>
                  <span>{l().holdsWhen}</span>
                  {o().holdsWhen}
                </p>
              </Show>
              <Show when={o().cost && !props.compact}>
                <p>
                  <span>{l().cost}</span>
                  {o().cost}
                </p>
              </Show>
            </div>
          )}
        </Show>
        <div class="sl-ask-bar">
          <span class="sl-ask-count">{props.data.countdown ?? ""}</span>
          <span class="sl-btn">
            {l().cancelAll} <kbd>esc</kbd>
          </span>
          <span class="sl-btn primary">
            {l().submit} <kbd>enter</kbd>
          </span>
        </div>
        <Show when={!props.compact && props.data.evidence?.length}>
          <div class="sl-ask-ev">
            <b>{l().evidence}</b>
            <For each={props.data.evidence}>
              {(e) => (
                <div class="sl-ask-file">
                  <div class="sl-ask-file-head">
                    {e.path}:{e.start}-{e.start + e.lines.length - 1}
                  </div>
                  <pre>
                    <For each={e.lines}>
                      {(line, i) => (
                        <span>
                          <i>{String(e.start + i()).padStart(4, " ")}</i>
                          {"  "}
                          {line}
                          {"\n"}
                        </span>
                      )}
                    </For>
                  </pre>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
