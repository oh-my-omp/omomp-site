import { createMemo, createSignal, For, Show, type JSX } from "solid-js";
import type { Lang } from "../i18n";
import type { MomentId, Sent, ShotSize } from "../data/real-run";
import "../styles/real-demo.css";

export interface RealMoment {
  readonly id: MomentId;
  /** Position in the run, from 1; names the capture files. */
  readonly n: number;
  readonly label: string;
  /** One or two sentences on what happened, as HTML from `inlineCode`. */
  readonly caption: string;
  readonly alt: string;
  readonly sent: Sent;
  readonly shot: ShotSize;
}

type LabelKey =
  | "sent"
  | "hidden"
  | "shown"
  | "message"
  | "chars"
  | "total"
  | "quoted"
  | "gloss"
  | "tool"
  | "refusedBy"
  | "ran"
  | "no"
  | "movedTo"
  | "restorable"
  | "yes";

export interface RealDemoData {
  readonly lang: Lang;
  /** Site base path without a trailing slash. */
  readonly base: string;
  readonly moments: readonly RealMoment[];
  readonly labels: Readonly<Record<LabelKey, string>>;
  /** HTML from `inlineCode`, so the code spans in the translation render as code. */
  readonly gloss: string;
  readonly provenance: string;
}

const count = (n: number) => n.toLocaleString("en-US");

/** The model-side half of a moment: what was appended after the prompt, or what a tool call returned. */
function SentView(props: { sent: Sent; data: RealDemoData }) {
  const s = props.sent;
  const l = props.data.labels;
  let body: JSX.Element;
  switch (s.kind) {
    case "appended":
      body = (
        <>
          <table class="rd-table">
            <thead>
              <tr>
                <th>{l.message}</th>
                <th>{l.chars}</th>
              </tr>
            </thead>
            <tbody>
              <For each={s.messages}>
                {(m) => (
                  <tr>
                    <td>{m.source}</td>
                    <td>{count(m.chars)}</td>
                  </tr>
                )}
              </For>
            </tbody>
            <tfoot>
              <tr>
                <td>{l.total}</td>
                <td>{count(s.messages.reduce((sum, m) => sum + m.chars, 0))}</td>
              </tr>
            </tfoot>
          </table>
          <p class="rd-from">
            {l.quoted} <code>{s.quote.source}</code>
          </p>
          <pre class="rd-pre">{s.quote.text}</pre>
          <Show when={props.data.lang === "zh"}>
            <p class="rd-gloss">
              <span>{l.gloss}</span>
              <span innerHTML={props.data.gloss} />
            </p>
          </Show>
        </>
      );
      break;
    case "refused":
      body = (
        <dl class="rd-kv">
          <dt>{l.tool}</dt>
          <dd>
            <code>{s.tool}</code> · {s.at}
          </dd>
          <dt>{l.refusedBy}</dt>
          <dd>
            <code>{s.guard}</code>
          </dd>
          <dt>{l.ran}</dt>
          <dd>{l.no}</dd>
        </dl>
      );
      break;
    case "trashed":
      body = (
        <dl class="rd-kv">
          <dt>{l.tool}</dt>
          <dd>
            <code>{s.tool}</code> · {s.at}
          </dd>
          <dt>{l.movedTo}</dt>
          <dd>
            <code>{s.to}</code>
          </dd>
          <dt>{l.restorable}</dt>
          <dd>{l.yes}</dd>
        </dl>
      );
      break;
  }
  return (
    <div class="rd-sent">
      <div class="rd-sent-head">
        <span>{l.sent}</span>
        <span class="rd-tag" classList={{ "off-screen": s.kind === "appended" }}>
          {s.kind === "appended" ? l.hidden : l.shown}
        </span>
      </div>
      {body}
    </div>
  );
}

/**
 * One real session, three moments: the screen as Tern drew it beside what reached the model at that moment, quoted
 * from the same session's log. On a phone the caption comes first, then the capture, then the model's side.
 */
export default function RealDemo(props: { data: RealDemoData }) {
  const [current, setCurrent] = createSignal(0);
  const moment = createMemo(() => props.data.moments[current()]!);
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
        <p class="rd-cap" innerHTML={moment().caption} />
        <picture class="rd-shot">
          <source
            media="(max-width: 760px)"
            srcset={`${stem()}-mobile.png`}
            width={moment().shot.mobile[0] / 2}
            height={moment().shot.mobile[1] / 2}
          />
          <img
            src={`${stem()}-desktop.png`}
            alt={moment().alt}
            width={moment().shot.desktop[0] / 2}
            height={moment().shot.desktop[1] / 2}
          />
        </picture>
        {/* Keyed: the pane is built anew for each moment, since its shape depends on the kind of message. */}
        <Show when={moment()} keyed>
          {(m) => <SentView sent={m.sent} data={props.data} />}
        </Show>
      </div>
      <p class="rd-prov">{props.data.provenance}</p>
    </div>
  );
}
