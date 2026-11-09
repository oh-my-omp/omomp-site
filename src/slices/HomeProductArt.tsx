import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";
import { dispatchScene, dispatchStage, type DispatchIssue } from "./dispatch-stage-data";
import "../styles/home-slices.css";

/** Which product a large home card draws; each is a compressed view of that product's page stage. */
export type ProductArtId = "playbooks" | "dispatch" | "remote-build";

type PbState = "done" | "running" | "todo";

interface PbCard {
  readonly id: string;
  readonly title: string;
  readonly state: PbState;
  readonly agent: string | null;
  readonly isolated: boolean;
  readonly button: "stop" | "requested" | "launch";
}

const pbCards: Readonly<Record<Lang, readonly PbCard[]>> = {
  en: [
    { id: "b3", title: "Wire src/routes/orders.ts", state: "running", agent: "task:low", isolated: true, button: "stop" },
    { id: "b4", title: "Wire src/routes/search.ts", state: "todo", agent: null, isolated: false, button: "requested" },
    { id: "b5", title: "Wire src/routes/webhooks.ts", state: "todo", agent: null, isolated: false, button: "launch" },
  ],
  zh: [
    { id: "b3", title: "接 src/routes/orders.ts", state: "running", agent: "task:low", isolated: true, button: "stop" },
    { id: "b4", title: "接 src/routes/search.ts", state: "todo", agent: null, isolated: false, button: "requested" },
    { id: "b5", title: "接 src/routes/webhooks.ts", state: "todo", agent: null, isolated: false, button: "launch" },
  ],
};

/** The YAML the cards are drawn from, serialized as the plugin's store writes it; `mark` is the coordinator's write-back. */
const pbYaml = (lang: Lang): readonly { readonly text: string; readonly mark?: boolean }[] => {
  const [b3, b4, b5] = pbCards[lang];
  return [
    { text: `- id: ${b3!.id}` },
    { text: `  title: "${b3!.title}"` },
    { text: "  agent: task:low" },
    { text: "  isolated: true" },
    { text: "  status: running", mark: true },
    { text: `- id: ${b4!.id}` },
    { text: `  title: "${b4!.title}"` },
    { text: "  status: todo" },
    { text: `- id: ${b5!.id}` },
    { text: `  title: "${b5!.title}"` },
    { text: "  status: todo" },
  ];
};

function Playbooks(props: { lang: Lang }) {
  const l = () => labels[props.lang].playbooks;
  return (
    <div class="hp hp-pb">
      <div class="hp-file">
        <div class="hp-file-head">rate-limit.yaml</div>
        <pre>
          <For each={pbYaml(props.lang)}>{(row) => <span classList={{ mark: !!row.mark }}>{row.text + "\n"}</span>}</For>
        </pre>
      </div>
      <div class="hp-pane">
        <div class="hp-pane-head">Playbooks</div>
        <For each={pbCards[props.lang]}>
          {(c) => (
            <article class="hp-card" classList={{ run: c.state === "running" }}>
              <header>
                <i class={`hp-ic hp-ic-${c.state}`} aria-hidden="true" />
                <span>{c.title}</span>
              </header>
              <div class="hp-card-foot">
                <span>
                  <em>{l().subagent}</em>
                  {c.agent ?? (props.lang === "zh" ? "默认" : "Default")}
                </span>
                <span>
                  <em>{l().isolated}</em>
                  {c.isolated ? l().yes : l().no}
                </span>
                <span class="sl-btn" classList={{ danger: c.button === "stop", off: c.button === "requested" }}>
                  {c.button === "stop" ? l().stop : c.button === "requested" ? l().launchRequested : l().launch}
                </span>
              </div>
            </article>
          )}
        </For>
        <footer class="hp-dock">
          <span>
            <i class="hp-online" />
            {l().online}
          </span>
          <span>{l().done(2, 6)}</span>
        </footer>
      </div>
    </div>
  );
}

/**
 * The product page's stage compressed: the issue tree, the default ticket machine with ticket #48 in Reviewing,
 * and the drift that restarts its gates on a new head.
 */
function Dispatch(props: { lang: Lang }) {
  const d = () => dispatchStage[props.lang];
  const ticketOf = (i: DispatchIssue) => (i.ticket.kind === "state" ? i.ticket.name : null);
  return (
    <div class="hp hp-dp">
      <div class="hp-tree">
        <div class="hp-issue root">
          <span class="n">#{d().umbrella.n}</span>
          <span>{d().umbrella.title}</span>
        </div>
        <For each={d().children}>
          {(c) => (
            <div class="hp-issue" classList={{ live: ticketOf(c) !== null }}>
              <span class="n">#{c.n}</span>
              <span>{c.title}</span>
              <em>{ticketOf(c) ?? d().waiting}</em>
            </div>
          )}
        </For>
      </div>
      <ol class="hp-rail" aria-label={d().ticket}>
        <For each={d().states}>
          {(s) => (
            <li class={`m-${s.mark}`}>
              <i />
              <span>{s.name}</span>
              <Show when={s.meta}>{(meta) => <code>{meta()}</code>}</Show>
            </li>
          )}
        </For>
      </ol>
      <div class="hp-gate">
        <div class="hp-gate-head">{d().driftCaption}</div>
        <div class="hp-gate-row old">
          {d().oldFingerprintLabel} <code>{dispatchScene.oldSha}</code>
        </div>
        <div class="hp-gate-row old">
          <span>{d().voided}</span>
        </div>
        <div class="hp-gate-row">
          {d().newFingerprintLabel} <code>{dispatchScene.newSha}</code>
        </div>
        <For each={dispatchScene.newVerdicts}>
          {(v) => (
            <div class="hp-gate-row">
              {v.role} <em>{v.status}</em>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

const rbCopy: Readonly<Record<Lang, { readonly here: string; readonly sync: string; readonly host: string; readonly main: string; readonly none: string }>> = {
  en: { here: "This machine", sync: "one-way-replica", host: "builder", main: "main checkout", none: "worktrees only" },
  zh: { here: "本机", sync: "one-way-replica", host: "builder", main: "主检出", none: "只给 worktree" },
};

const rbRows: readonly { readonly path: string; readonly role: string; readonly container: string | null; readonly live: boolean }[] = [
  { path: "~/work/shop-api/", role: "main", container: null, live: false },
  { path: "~/work/worktrees/rate-limit/", role: "agent · rate-limit", container: "rb-rate-limit-a3f9c1b7e2", live: true },
  { path: "~/work/worktrees/coverage/", role: "agent · coverage", container: "rb-coverage-7e04d2f6c1", live: false },
];

function RemoteBuild(props: { lang: Lang }) {
  const c = () => rbCopy[props.lang];
  return (
    <div class="hp hp-rb">
      <div class="hp-rb-head">
        <span>{c().here}</span>
        <span>mutagen · {c().sync}</span>
        <span>{c().host}</span>
      </div>
      <For each={rbRows}>
        {(r) => (
          <div class="hp-rb-row" classList={{ live: r.live, none: r.container === null }}>
            <div class="hp-rb-wt">
              <code>
                <For each={r.path.split(/(?<=\/)/)}>{(seg) => <span class="seg">{seg}</span>}</For>
              </code>
              <span>{r.role === "main" ? c().main : r.role}</span>
            </div>
            <div class="hp-rb-flow" aria-hidden="true">
              <i />
            </div>
            <div class="hp-rb-ct">{r.container ? <code>{r.container}</code> : <span>{c().none}</span>}</div>
          </div>
        )}
      </For>
      <pre class="hp-rb-term">
        <span class="by-agent">{"/workspace # pnpm test\n"}</span>
        <span>{" ✓ src/middleware/rate-limit.test.ts (6 tests)\n"}</span>
        <span>{" ✓ src/routes/webhooks.test.ts (3 tests)\n"}</span>
        <span>{"      Tests  18 passed (18)\n"}</span>
        <span class="by-agent">{"/workspace # "}</span>
      </pre>
    </div>
  );
}

export default function HomeProductArt(props: { lang: Lang; id: ProductArtId }) {
  switch (props.id) {
    case "playbooks":
      return <Playbooks lang={props.lang} />;
    case "dispatch":
      return <Dispatch lang={props.lang} />;
    case "remote-build":
      return <RemoteBuild lang={props.lang} />;
  }
}
