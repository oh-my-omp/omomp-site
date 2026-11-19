import { createSignal, For, Index } from "solid-js";
import type { Lang } from "../i18n";
import ArtView, { type Art } from "../slices/Art";
import "../styles/repair-install.css";

export type CommandLine = { readonly in?: "sh" | "omp"; readonly text: string };

export interface InstallTab {
  readonly id: string;
  readonly label: string;
  readonly arts: readonly Art[];
  readonly commands: readonly CommandLine[];
  readonly note: string;
}

export interface RepairInstallData {
  readonly lang: Lang;
  readonly label: string;
  readonly tabs: readonly InstallTab[];
}

export default function RepairInstall(props: { data: RepairInstallData }) {
  const [current, setCurrent] = createSignal(0);
  return (
    <div class="ri">
      <div class="ri-tabs" role="tablist" aria-label={props.data.label}>
        <For each={props.data.tabs}>
          {(t, i) => (
            <button
              type="button"
              role="tab"
              id={`ri-tab-${t.id}`}
              aria-selected={current() === i()}
              classList={{ on: current() === i() }}
              onClick={() => setCurrent(i())}
            >
              {t.label}
            </button>
          )}
        </For>
      </div>
      <div class="ri-frame">
        <div class="ri-bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div class="ri-stack">
          <For each={props.data.tabs}>
            {(tab, i) => (
              <div
                class="ri-surface"
                role="tabpanel"
                aria-labelledby={`ri-tab-${tab.id}`}
                aria-hidden={current() !== i()}
                classList={{ on: current() === i() }}
              >
                <div class="ri-view">
                  <For each={tab.arts}>{(art) => <ArtView lang={props.data.lang} art={art} />}</For>
                </div>
                <div class="ri-how">
                  <pre class="ri-cmds">
                    <Index each={tab.commands}>
                      {(line) => (
                        <span class={`ri-line i-${line().in ?? "sh"}`}>
                          <span class="ri-ps" aria-hidden="true">
                            {line().text === "" ? " " : line().in === "omp" ? ">" : "$"}
                          </span>
                          <span>{line().text + "\n"}</span>
                        </span>
                      )}
                    </Index>
                  </pre>
                  <p class="ri-note">{tab.note}</p>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
