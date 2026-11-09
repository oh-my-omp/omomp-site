import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import Window from "./Window";
import { remoteBuildScene as s, remoteBuildStage } from "./remote-build-stage-data";
import "../styles/stage-remote-build.css";

/**
 * omp-remote-build as three linked zones: this machine's checkouts and worktree
 * environments → the one-way Mutagen replica → the Komodo container on the build
 * host where the agent's container tools run commands.
 */
export default function RemoteBuildStage(props: { lang: Lang }) {
  const copy = () => remoteBuildStage[props.lang].copy;
  const ui = () => remoteBuildStage[props.lang].ui;
  return (
    <div class="st-rb">
      {/* 1 · This machine */}
      <section class="st-rb-zone">
        <h3 class="st-rb-title">{copy().zones[0]}</h3>
        <Window meta="~/work">
          <div class="st-rb-roots">
            <For each={s.roots}>
              {(root) => (
                <div class="st-rb-root">
                  <div class="st-rb-root-head">
                    <span class="st-rb-path">{root.path}</span>
                    <span class="st-rb-role">{root.role[props.lang]}</span>
                  </div>
                  <Show when={root.env}>
                    <div class="st-rb-env">
                      <code>{root.env}</code> → <code>{root.container}</code>
                    </div>
                  </Show>
                  <Show when={root.tree}>
                    {(tree) => (
                      <ul class="st-rb-tree">
                        <For each={tree()}>
                          {(e) => (
                            <li class={e.kind} style={{ "padding-left": `${10 + e.depth * 14}px` }}>
                              {e.text}
                            </li>
                          )}
                        </For>
                      </ul>
                    )}
                  </Show>
                </div>
              )}
            </For>
          </div>
          <div class="st-rb-note">{s.envNote}</div>
        </Window>
        <p class="sl-tx-card t-info st-rb-ready">{ui().notify}</p>
        <p class="st-rb-cap">{copy().captions[0]}</p>
      </section>

      {/* 2 · One-way sync */}
      <section class="st-rb-zone">
        <h3 class="st-rb-title">{copy().zones[1]}</h3>
        <Window meta="mutagen sync">
          <pre class="sl-pre">{s.syncCreate.join("\n")}</pre>
          <div class="st-rb-eps">
            <div class="st-rb-ep">
              <span class="st-rb-ep-k">alpha</span>
              <code>{s.endpoints.alpha}</code>
            </div>
            <div class="st-rb-flow">
              <span class="st-rb-flow-arrow">↓</span> one-way-replica
            </div>
            <div class="st-rb-ep">
              <span class="st-rb-ep-k">beta</span>
              <code>{s.endpoints.beta}</code>
            </div>
          </div>
          <div class="st-rb-flush">
            <code>{s.syncFlush}</code>
            <span>{copy().flushNote}</span>
          </div>
        </Window>
        <p class="st-rb-cap">{copy().captions[1]}</p>
      </section>

      {/* 3 · Remote build host */}
      <section class="st-rb-zone">
        <h3 class="st-rb-title">{copy().zones[2]}</h3>
        <Window meta={ui().ptyTitle}>
          <ul class="st-rb-tools">
            <For each={ui().tools}>
              {(tool) => (
                <li>
                  <code>{tool.name}</code>
                  <span>{tool.label}</span>
                </li>
              )}
            </For>
          </ul>
          <pre class="sl-pre st-rb-report">{s.report.join("\n")}</pre>
          <div class="st-rb-call">
            <div class="sl-tx-sig">
              <b>container_exec</b>
              <span class="a">{`input: ${s.execArgs}`}</span>
              <span class="m">{ui().tools[1]!.label}</span>
            </div>
          </div>
          <pre class="sl-pre st-rb-result">
            {s.resultHead.join("\n") + "\n---\n"}
            <For each={s.screen}>{(line) => <span class={line.by ? `by-${line.by}` : undefined}>{line.text + "\n"}</span>}</For>
          </pre>
        </Window>
        <p class="st-rb-cap">{copy().captions[2]}</p>
      </section>
    </div>
  );
}
