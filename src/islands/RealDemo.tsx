import { createMemo, createSignal, For, Show, type JSX } from "solid-js";
import type { Lang } from "../i18n";
import type { MomentId, Sent } from "../data/real-run";
import "../styles/real-demo.css";

export interface RealMoment {
  readonly id: MomentId;
  /** Position in the run, from 1; names the shot files. */
  readonly n: number;
  readonly label: string;
  /** One or two sentences on what happened, as HTML from `inlineCode`. */
  readonly caption: string;
  readonly alt: string;
  readonly sent: Sent;
}

export interface RealDemoData {
  readonly lang: Lang;
  /** Site base path without a trailing slash. */
  readonly base: string;
  readonly moments: readonly RealMoment[];
  readonly labels: Readonly<Record<"sent" | "hidden" | "shown" | "appended" | "quoted" | "result" | "gloss", string>>;
  readonly provenance: string;
}

/** The model-side half of a moment: what was appended after the prompt, or what a tool call returned. */
function SentView(props: { sent: Sent; labels: RealDemoData["labels"]; gloss: boolean }) {
  const s = props.sent;
  const quoted = s.kind === "appended" ? s.quote : s;
  let lead: JSX.Element;
  switch (s.kind) {
    case "appended":
      lead = (
        <>
          <p class="rd-sum">{props.labels.appended}</p>
          <ul class="rd-list">
            <For each={s.messages}>
              {(m) => (
                <li>
                  <span>{m.source}</span>
                  <span>{m.chars.toLocaleString("en-US")}</span>
                </li>
              )}
            </For>
          </ul>
          <p class="rd-from">
            {props.labels.quoted} <code>{s.quote.source}</code>
          </p>
        </>
      );
      break;
    case "result":
      lead = (
        <p class="rd-from">
          <code>{s.tool}</code> {props.labels.result} · {s.at}
        </p>
      );
      break;
  }
  return (
    <div class="rd-sent">
      <div class="rd-sent-head">
        <span>{props.labels.sent}</span>
        <span class="rd-tag" classList={{ "off-screen": s.kind === "appended" }}>
          {s.kind === "appended" ? props.labels.hidden : props.labels.shown}
        </span>
      </div>
      {lead}
      <pre class="rd-pre">{quoted.text}</pre>
      <Show when={props.gloss}>
        <p class="rd-gloss">
          <span>{props.labels.gloss}</span>
          {quoted.gloss}
        </p>
      </Show>
    </div>
  );
}

/**
 * One real session, three moments: on the left the screen as Tern drew it, on the right what reached the model
 * at that moment, quoted from the same session's log.
 */
export default function RealDemo(props: { data: RealDemoData }) {
  const [current, setCurrent] = createSignal(0);
  const moment = createMemo(() => props.data.moments[current()]!);
  /** Shot files are `<lang>-<n>-desktop.png` and `-mobile.png` under `public/real/`. */
  const stem = createMemo(() => `${props.data.base}/real/${props.data.lang}-${moment().n}`);
  return (
    <div class="rd">
      <div class="rd-tabs" role="tablist">
        <For each={props.data.moments}>
          {(m, i) => (
            <button type="button" role="tab" aria-selected={current() === i()} classList={{ on: current() === i() }} onClick={() => setCurrent(i())}>
              <span class="n">{m.n}</span>
              {m.label}
            </button>
          )}
        </For>
      </div>
      <div class="rd-body">
        <picture class="rd-shot">
          <source media="(max-width: 760px)" srcset={`${stem()}-mobile.png`} width="360" height="640" />
          <img src={`${stem()}-desktop.png`} alt={moment().alt} width="720" height="640" />
        </picture>
        <div class="rd-side">
          <p class="rd-cap" innerHTML={moment().caption} />
          {/* Keyed: the pane is built anew for each moment, since its shape depends on the kind of message. */}
          <Show when={moment()} keyed>
            {(m) => <SentView sent={m.sent} labels={props.data.labels} gloss={props.data.lang === "zh"} />}
          </Show>
        </div>
      </div>
      <p class="rd-prov">{props.data.provenance}</p>
    </div>
  );
}
