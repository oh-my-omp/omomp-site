import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import Window from "./Window";
import { remoteBuildScene as s, remoteBuildStage } from "./remote-build-stage-data";
import "../styles/stage-remote-build.css";

/**
 * omp-remote-build as three linked zones inside one frame: this machine's checkouts with
 * the edits agents are making in each worktree → the one-way Mutagen replica per
 * environment carrying those files out → the environment's Komodo container on the build
 * host, where the agent's container tools run the build and the tests. Each zone keeps
 * its caption at the bottom, and the connector on each divider shows the direction.
 */
export default function RemoteBuildStage(props: { lang: Lang }) {
  const copy = () => remoteBuildStage[props.lang].copy;
  const ui = () => remoteBuildStage[props.lang].ui;
  return (
    <div class="st-rb">
      <section class="st-rb-zone">
        <h3 class="st-rb-title">{copy().zones[0]}</h3>
        <div class="st-rb-body">
          <Window meta="~/work">
            <div class="st-rb-roots">
              <For each={s.roots}>
                {(root) => (
                  <div class="st-rb-root" classList={{ "st-rb-live": root.container === s.container }}>
                    <div class="st-rb-root-head">
                      <span class="st-rb-path">{root.path}</span>
                      <span class="st-rb-role">{root.role[props.lang]}</span>
                    </div>
                    <Show when={root.container} fallback={<div class="st-rb-env">{copy().clean}</div>}>
                      <div class="st-rb-env">
                        <code>{root.container}</code>
                      </div>
                    </Show>
                    <Show when={root.changes.length > 0}>
                      <ul class="st-rb-changes">
                        <For each={root.changes}>
                          {(c) => (
                            <li>
                              <b class={`st-rb-m-${c.mark}`}>{c.mark}</b>
                              {c.path}
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </div>
                )}
              </For>
            </div>
            <div class="st-rb-note">
              {s.envNote}
              <Show when={copy().gloss}>
                {(g) => (
                  <span class="st-rb-gloss">
                    <span>{g().label}</span>
                    {g().envNote}
                  </span>
                )}
              </Show>
            </div>
          </Window>
        </div>
        <p class="st-rb-cap">{copy().captions[0]}</p>
      </section>

      <section class="st-rb-zone">
        <h3 class="st-rb-title">{copy().zones[1]}</h3>
        <div class="st-rb-body">
          <Window meta="mutagen sync">
            <For each={s.sessions}>
              {(session) => (
                <div class="st-rb-sess" classList={{ "st-rb-live": session.name === s.container }}>
                  <div class="st-rb-sess-head">
                    <code>{session.name}</code>
                    <span class="st-rb-mode">one-way-replica</span>
                  </div>
                  <div class="st-rb-eps">
                    <span class="st-rb-ep-k">alpha</span>
                    <code>{session.alpha}</code>
                    <span class="st-rb-ep-k">beta</span>
                    <code>{session.beta}</code>
                  </div>
                  <Show when={session.staged.length > 0}>
                    <ul class="st-rb-stream">
                      <For each={session.staged}>
                        {(c) => (
                          <li>
                            <span class="st-rb-dot" aria-hidden="true" />
                            {c.path}
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
                  <div class="st-rb-status">{session.status}</div>
                </div>
              )}
            </For>
            <div class="st-rb-flush">
              <code>$ {s.syncFlush}</code>
              <span>{copy().flushNote}</span>
            </div>
            <div class="st-rb-ign">
              <For each={s.ignored}>{(i) => <code>{i}</code>}</For>
              <span>{copy().ignored}</span>
            </div>
          </Window>
        </div>
        <p class="st-rb-cap">{copy().captions[1]}</p>
      </section>

      <section class="st-rb-zone">
        <h3 class="st-rb-title">{copy().zones[2]}</h3>
        <div class="st-rb-body">
          <p class="sl-tx-card t-info st-rb-ready">{ui().notify}</p>
          <Window meta={ui().ptyTitle}>
            <div class="st-rb-call">
              <div class="sl-tx-sig">
                <b>container_exec</b>
                <span class="a">{`input: ${s.execArgs}`}</span>
              </div>
            </div>
            <pre class="sl-pre st-rb-result">
              <For each={s.screen}>{(line) => <span class={line.by ? `by-${line.by}` : undefined}>{line.text + "\n"}</span>}</For>
            </pre>
          </Window>
        </div>
        <p class="st-rb-cap">{copy().captions[2]}</p>
      </section>
    </div>
  );
}
