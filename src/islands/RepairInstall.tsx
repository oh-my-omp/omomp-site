import { createSignal, For, Index } from "solid-js";
import type { Lang } from "../i18n";
import ArtView, { type Art } from "../slices/Art";
import "../styles/repair-install.css";

/** A command line: shell by default, `> ` when it is typed inside omp itself. */
export type CommandLine = { readonly in?: "sh" | "omp"; readonly text: string };

export interface InstallTab {
  readonly id: string;
  readonly label: string;
  /** What you work with once this way is installed. */
  readonly arts: readonly Art[];
  /** Install then start, rendered as one block; an empty `text` is a blank line between the two. */
  readonly commands: readonly CommandLine[];
  readonly note: string;
}

export interface RepairInstallData {
  readonly lang: Lang;
  /** Accessible name of the tab row: the stage heading's first line. */
  readonly label: string;
  readonly tabs: readonly InstallTab[];
}

/**
 * The ways of installing as supabase.com's product tabs: one framed surface under the tab row, a window bar on top,
 * the interface you work in on the left and the commands with one note on the right. All panels share one grid cell
 * and only the selected one is visible, so the frame keeps the height of the tallest panel and nothing below it
 * moves when the tab changes.
 */
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
