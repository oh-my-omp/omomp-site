import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";
import Window from "./Window";
import { playbooksStage, type PbBlock, type PbStatus } from "./playbooks-stage-data";
import "../styles/stage-playbooks.css";

/**
 * omp-playbooks: one Playbook file in two views, side by side in a Tern window.
 * Left, the YAML itself — the only document the pane renders. Right, the TSP
 * document pane (`tsp.open(SURFACE, "Playbooks")`) drawing each block as a card:
 * design card without a toolbar, tracked task cards with SUBAGENT /
 * ISOLATED WORKTREE / Launch-Stop, the dock with the coordinator and progress.
 * Runs never appear here; the pane is the Playbook, not its launches.
 */

/** Default SUBAGENT value, verbatim from src/service/ui.ts:811 (labels.ts has no `default` key). */
const defaultAgent = { en: "Default", zh: "默认" } as const;

const seq = (n: number) => String(n + 1).padStart(2, "0");

const stateOf = (b: PbBlock): PbStatus => (typeof b.state === "string" ? b.state : b.state.status);

const launchOf = (b: PbBlock): "launch" | "requested" | "stop" | null =>
  b.kind === "design" ? null : b.state.status === "running" ? "stop" : b.state.status === "done" ? "launch" : b.state.launch;

type Seg = { t: string; c?: string };
interface YamlRow {
  readonly segs: readonly Seg[];
  /** Accent margin bar: the line the coordinator wrote back (status → running). */
  readonly mark?: boolean;
}

/** Serializes blocks like src/service/store.ts: quoted titles, |2 block scalars, field order id → title → content → agent/isolated → status/report. */
function yamlRows(title: string, blocks: readonly PbBlock[]): YamlRow[] {
  const rows: YamlRow[] = [];
  const line = (...segs: Seg[]) => rows.push({ segs });
  const key = (s: string): Seg => ({ t: s, c: "k" });
  const str = (s: string): Seg => ({ t: s, c: "s" });
  const scalar = (name: string, value: string | boolean | number) => line(key(`${name}: `), { t: String(value), c: "v" });
  const blockScalar = (name: string, body: readonly string[]) => {
    line(key(`${name}: |2`));
    for (const l of body) line({ t: `      ${l}`, c: "s" });
  };
  line(key("title: "), str(`"${title}"`));
  line(key("blocks:"));
  for (const b of blocks) {
    line({ t: "- ", c: "k" }, key("id: "), { t: b.id, c: "v" });
    line(key("  title: "), str(`"${b.title}"`));
    if (b.kind === "design") {
      scalar("  requirement", `"${b.requirement}"`);
      blockScalar("  design", b.design);
    } else if (b.kind === "execution") {
      blockScalar("  body", b.body);
      if (b.agent) scalar("  agent", `"${b.agent}"`);
      if (b.isolated !== undefined) scalar("  isolated", b.isolated);
    } else {
      blockScalar("  body", ["```js", ...b.code, "```"]);
    }
    const status = stateOf(b);
    const row: YamlRow = { segs: [key("  status: "), { t: status, c: "v" }], mark: status === "running" };
    rows.push(row);
    if (typeof b.state !== "string" && b.state.status === "done" && b.state.report) blockScalar("  report", [b.state.report]);
  }
  return rows;
}

function StatusIcon(props: { status: PbStatus }) {
  return <span class={`st-pb-ic st-pb-ic-${props.status}`} aria-hidden="true" />;
}

function CardBody(props: { block: PbBlock; lang: Lang }) {
  const l = () => labels[props.lang].playbooks;
  const b = props.block;
  if (b.kind === "design") {
    return (
      <>
        <p class="st-pb-req">{b.requirement}</p>
        <div class="st-pb-design">
          <For each={b.design}>{(l2) => <span>{l2}</span>}</For>
        </div>
        <p class="st-pb-chg">
          <i>// </i>
          {l().changeRequest}
        </p>
      </>
    );
  }
  if (b.kind === "orchestration") {
    return (
      <pre class="st-pb-body mono">
        <i>```js</i>
        {"\n"}
        {b.code.join("\n")}
        {"\n"}
        <i>```</i>
      </pre>
    );
  }
  return (
    <pre class="st-pb-body mono">
      <For each={b.body}>
        {(l2, i) => (
          <>
            {i() > 0 ? "\n" : ""}
            {l2}
          </>
        )}
      </For>
    </pre>
  );
}

function CardFoot(props: { block: PbBlock; lang: Lang }) {
  const l = () => labels[props.lang].playbooks;
  const launch = () => launchOf(props.block);
  const agent = () => (props.block.kind === "execution" && props.block.agent) || defaultAgent[props.lang];
  const isolated = () => (props.block.kind === "execution" && props.block.isolated) ?? false;
  return (
    <div class="st-pb-foot">
      <span class="st-pb-cell">
        <em>{l().subagent}</em>
        <span>
          {agent()} <i class="st-pb-chev">⌄</i>
        </span>
      </span>
      <span class="st-pb-cell">
        <em>{l().isolated}</em>
        <span>{isolated() ? l().yes : l().no}</span>
      </span>
      <span
        class="sl-btn st-pb-btn"
        classList={{ "st-pb-off": launch() === "requested", danger: launch() === "stop" }}
      >
        {launch() === "stop" ? l().stop : launch() === "requested" ? l().launchRequested : l().launch}
      </span>
    </div>
  );
}

export default function PlaybooksStage(props: { lang: Lang }) {
  const d = () => playbooksStage[props.lang];
  const l = () => labels[props.lang].playbooks;
  const rows = () => yamlRows(d().title, d().blocks);

  return (
    <div class="st-pb">
      <Window class="st-pb-win" tabs={[d().file, "Playbooks"]} active={1} meta={d().repo}>
        <div class="st-pb-split">
          <section class="st-pb-file" aria-label={d().file}>
            <For each={rows()}>
              {(r) => (
                <div class="st-pb-yl" classList={{ mark: r.mark }}>
                  {r.segs.map((s) => (
                    <span class={s.c ? `st-pb-y-${s.c}` : undefined}>{s.t}</span>
                  ))}
                </div>
              )}
            </For>
          </section>
          <section class="st-pb-pane">
            <div class="st-pb-doc">
              <span class="st-pb-hash">##</span> {d().title}
            </div>
            <For each={d().blocks}>
              {(b, i) => (
                <article class="st-pb-card" classList={{ "st-pb-run": stateOf(b) === "running" }}>
                  <header class="st-pb-head">
                    <span class="st-pb-idx">{seq(i())}</span>
                    <StatusIcon status={stateOf(b)} />
                    <span class="st-pb-title">{b.title}</span>
                    <span class="st-pb-dots">⋯</span>
                    <span class="st-pb-chev">⌄</span>
                  </header>
                  <CardBody block={b} lang={props.lang} />
                  <Show when={typeof b.state !== "string" && b.state.status === "done" && b.state.report}>
                    <div class="st-pb-report">
                      <span class="st-pb-chev">⌄</span> {l().report}
                    </div>
                  </Show>
                  <Show when={b.kind !== "design"}>
                    <CardFoot block={b} lang={props.lang} />
                  </Show>
                </article>
              )}
            </For>
            <footer class="st-pb-dock">
              <span class="st-pb-co">
                <i class="st-pb-dot" />
                {l().online}
              </span>
              <span class="st-pb-prog">{l().done(d().dock.done, d().dock.total)}</span>
            </footer>
          </section>
        </div>
      </Window>
      <div class="st-pb-notes">
        <span>
          <i class="st-pb-mark" />
          {d().writebackNote}
        </span>
        <span>{d().promptNote}</span>
      </div>
    </div>
  );
}
