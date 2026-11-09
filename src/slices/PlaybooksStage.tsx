import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";
import Window from "./Window";
import { playbooksScene, playbooksStage, type PbBlock, type PbDesignBlock, type PbStatus } from "./playbooks-stage-data";
import "../styles/stage-playbooks.css";

/**
 * omp-playbooks: one Launch request from click to file.
 * Left, the Tern Playbooks pane (src/service/ui.ts card anatomy): a design block,
 * execution blocks whose bodies reach it through `((b1))`, and the block whose
 * Launch button was just clicked. Right, the coordinator session handling that
 * click: the service notice it receives, the eval call that starts the block,
 * the prompt the Launch froze with the reference expanded, the subagent, and
 * the status line the subagent writes back into the YAML. The connector column
 * carries the two crossings: the request out of the pane, the status back into it.
 */

/** Default SUBAGENT value, verbatim from src/service/ui.ts:811 (labels.ts has no `default` key). */
const defaultAgent = { en: "Default", zh: "默认" } as const;

const seq = (n: number) => String(n + 1).padStart(2, "0");

const stateOf = (b: PbBlock): PbStatus => (typeof b.state === "string" ? b.state : b.state.status);

const launchOf = (b: PbBlock): "launch" | "requested" | "stop" | null =>
  b.kind === "design" ? null : b.state.status === "running" ? "stop" : b.state.status === "done" ? "launch" : b.state.launch;

const REF = /^\(\((b\d+)\)\)$/;

/** Text a design reference compiles to (selectDesign in src/service/references.ts:363). */
const designText = (b: PbDesignBlock): string =>
  [...(b.requirement.trim() ? [`<requirement>\n${b.requirement}\n</requirement>`] : []), `<design>\n${b.design.join("\n")}\n</design>`].join("\n\n");

function StatusIcon(props: { status: PbStatus }) {
  return <span class={`st-pb-ic st-pb-ic-${props.status}`} aria-hidden="true" />;
}

function CardBody(props: { block: PbBlock; blocks: readonly PbBlock[]; lang: Lang }) {
  const l = () => labels[props.lang].playbooks;
  const b = props.block;
  if (b.kind === "design") {
    return (
      <>
        <p class="st-pb-req">{b.requirement}</p>
        <div class="st-pb-design">
          <For each={b.design}>{(line) => <span>{line}</span>}</For>
        </div>
        <p class="st-pb-chg">{l().changeRequest}</p>
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
    <div class="st-pb-body">
      <For each={b.body}>
        {(line) => {
          const id = REF.exec(line)?.[1];
          const target = id ? props.blocks.find((x) => x.id === id) : undefined;
          return target ? (
            <span class="st-pb-ref">{target.title}</span>
          ) : (
            <span class="st-pb-line">{line}</span>
          );
        }}
      </For>
    </div>
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
      <span class="sl-btn st-pb-btn" classList={{ "st-pb-off": launch() === "requested", danger: launch() === "stop" }}>
        {launch() === "stop" ? l().stop : launch() === "requested" ? l().launchRequested : l().launch}
      </span>
    </div>
  );
}

function Pane(props: { lang: Lang }) {
  const d = () => playbooksStage[props.lang];
  const l = () => labels[props.lang].playbooks;
  const tracked = () => d().blocks.filter((b) => b.kind !== "design");
  return (
    <Window class="st-pb-win" tabs={["Playbooks"]} meta={playbooksScene.file}>
      <div class="st-pb-pane">
        <div class="st-pb-doc">
          <span class="st-pb-hash">##</span> {d().title}
        </div>
        <For each={d().blocks}>
          {(b, i) => (
            <article
              class="st-pb-card"
              classList={{ "st-pb-run": stateOf(b) === "running", "st-pb-asked": b.id === d().requested }}
            >
              <header class="st-pb-head">
                <span class="st-pb-idx">{seq(i())}</span>
                <StatusIcon status={stateOf(b)} />
                <span class="st-pb-title">{b.title}</span>
                <span class="st-pb-dots">⋯</span>
                <span class="st-pb-chev">{b.open ? "⌃" : "⌄"}</span>
              </header>
              <Show when={b.open}>
                <CardBody block={b} blocks={d().blocks} lang={props.lang} />
                <Show when={b.kind !== "design"}>
                  <CardFoot block={b} lang={props.lang} />
                </Show>
              </Show>
            </article>
          )}
        </For>
        <footer class="st-pb-dock">
          <span class="st-pb-co">
            <i class="st-pb-dot" />
            {l().online}
          </span>
          <span class="st-pb-prog">
            {l().done(tracked().filter((b) => stateOf(b) === "done").length, tracked().length)}
          </span>
        </footer>
      </div>
    </Window>
  );
}

function Coordinator(props: { lang: Lang }) {
  const d = () => playbooksStage[props.lang];
  const c = () => d().coordinator;
  const asked = () => d().blocks.find((b) => b.id === d().requested);
  /** The frozen Launch prompt: the requested body with each `((bN))` line replaced by what it compiles to. */
  const frozen = () => {
    const b = asked();
    if (!b || b.kind !== "execution") return "";
    return b.body
      .map((line) => {
        const id = REF.exec(line)?.[1];
        const target = id ? d().blocks.find((x) => x.id === id) : undefined;
        return target?.kind === "design" ? designText(target) : line;
      })
      .join("\n");
  };
  return (
    <Window class="st-pb-win st-pb-co-win" tabs={["omp"]} meta={playbooksScene.repo}>
      <div class="st-pb-flow">
        <section class="st-pb-beat st-pb-in">
          <h4>{c().beats.notice}</h4>
          <div class="st-pb-notice mono">
            <span class="st-pb-nh">{c().header}</span>
            <span>{c().request}</span>
            <span class="st-pb-data">{playbooksScene.data}</span>
          </div>
        </section>
        <section class="st-pb-beat">
          <h4>{c().beats.start}</h4>
          <div class="st-pb-eval mono">
            <span class="st-pb-cmd">{playbooksScene.call}</span>
            <For each={playbooksScene.steps}>{(s) => <span class="st-pb-step">{s}</span>}</For>
          </div>
        </section>
        <section class="st-pb-beat">
          <h4>{c().beats.frozen}</h4>
          <div class="st-pb-frozen">
            <div class="st-pb-fz-bar mono">
              <span>Launch {playbooksScene.launch}</span>
              <span>{d().requested}</span>
            </div>
            <pre class="mono">{frozen()}</pre>
          </div>
        </section>
        <section class="st-pb-beat">
          <h4>{c().beats.subagent}</h4>
          <div class="st-pb-sub">
            <StatusIcon status="running" />
            <span class="mono">{playbooksScene.agent}</span>
            <span class="st-pb-sub-note">{c().running}</span>
          </div>
        </section>
        <section class="st-pb-beat st-pb-out">
          <h4>{c().beats.file}</h4>
          <div class="st-pb-yaml mono">
            <span>- id: {d().requested}</span>
            <span class="st-pb-y-dim">  …</span>
            <span class="st-pb-y-mark">  status: running</span>
          </div>
        </section>
      </div>
    </Window>
  );
}

export default function PlaybooksStage(props: { lang: Lang }) {
  const d = () => playbooksStage[props.lang];
  return (
    <div class="st-pb">
      <Pane lang={props.lang} />
      <div class="st-pb-link" aria-hidden="true">
        <span class="st-pb-arrow st-pb-arrow-out">
          <em class="mono">{d().sends}</em>
        </span>
        <span class="st-pb-arrow st-pb-arrow-back">
          <em class="mono">status</em>
        </span>
      </div>
      <Coordinator lang={props.lang} />
    </div>
  );
}
