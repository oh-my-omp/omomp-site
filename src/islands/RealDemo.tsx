import { createSignal, For, Show, type JSX } from "solid-js";
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

type LabelKey = "sent" | "hidden" | "message" | "chars" | "total" | "quoted" | "gloss" | "rule" | "enforced" | "args" | "modeUnset";

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

/** The model-side half of a moment: only what the capture beside it leaves out. */
function SentView(props: { sent: Sent; data: RealDemoData }) {
  const s = props.sent;
  const l = props.data.labels;
  let head: JSX.Element;
  let body: JSX.Element;
  switch (s.kind) {
    case "appended":
      head = (
        <>
          <span>{l.sent}</span>
          <span class="rd-tag">{l.hidden}</span>
        </>
      );
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
        </>
      );
      break;
    case "refused":
      head = <span>{l.rule}</span>;
      body = (
        <>
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
          <p class="rd-note">{l.enforced}</p>
        </>
      );
      break;
    case "trashed":
      head = (
        <>
          <span>{l.args}</span>
          <span class="rd-tag">{l.hidden}</span>
        </>
      );
      body = (
        <dl class="rd-kv">
          <dt>
            <code>paths</code>
          </dt>
          <dd>
            <code>{JSON.stringify(s.paths)}</code>
          </dd>
          <dt>
            <code>mode</code>
          </dt>
          <dd>{l.modeUnset}</dd>
        </dl>
      );
      break;
  }
  return (
    <div class="rd-sent">
      <div class="rd-sent-head">{head}</div>
      {body}
    </div>
  );
}

/** One moment: the caption, the capture, and the model's side. */
function Step(props: { moment: RealMoment; data: RealDemoData; on: boolean }) {
  const m = props.moment;
  const stem = `${props.data.base}/real/${m.n}`;
  return (
    <div class="rd-body" role="tabpanel" classList={{ on: props.on }} aria-hidden={!props.on}>
      <p class="rd-cap" innerHTML={m.caption} />
      <picture class="rd-shot">
        <source media="(max-width: 760px)" srcset={`${stem}-mobile.png`} width={m.shot.mobile[0] / 2} height={m.shot.mobile[1] / 2} />
        <img src={`${stem}-desktop.png`} alt={m.alt} width={m.shot.desktop[0] / 2} height={m.shot.desktop[1] / 2} />
      </picture>
      <SentView sent={m.sent} data={props.data} />
    </div>
  );
}

/**
 * One real session, three moments: the screen as Tern drew it beside what reached the model at that moment, quoted
 * from the same session's log. On a phone the caption comes first, then the capture, then the model's side. All
 * three steps share one grid cell and only the selected one is visible, so the stage keeps the height of the tallest
 * step and nothing below it moves when the step changes.
 */
export default function RealDemo(props: { data: RealDemoData }) {
  const [current, setCurrent] = createSignal(0);
  let stack!: HTMLDivElement;
  // On a phone the tab bar sticks under the header; a step whose top has scrolled under it is brought back into view.
  const select = (i: number) => {
    setCurrent(i);
    const margin = Number.parseFloat(getComputedStyle(stack).scrollMarginTop);
    if (stack.getBoundingClientRect().top < margin) stack.scrollIntoView({ block: "start" });
  };
  return (
    <div class="rd">
      <div class="rd-tabs" role="tablist">
        <For each={props.data.moments}>
          {(m, i) => (
            <button type="button" role="tab" aria-selected={current() === i()} classList={{ on: current() === i() }} onClick={() => select(i())}>
              <span class="n">{m.n}</span>
              {m.label}
            </button>
          )}
        </For>
      </div>
      <div class="rd-stack" ref={stack}>
        <For each={props.data.moments}>{(m, i) => <Step moment={m} data={props.data} on={current() === i()} />}</For>
      </div>
      <p class="rd-prov">{props.data.provenance}</p>
    </div>
  );
}
