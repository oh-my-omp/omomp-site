import { createMemo, createSignal, For, Index } from "solid-js";
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
  /** What this way of installing gives you, one short line each, as HTML from `inlineCode`. */
  readonly after: readonly string[];
}

export interface RepairInstallData {
  readonly lang: Lang;
  /** One line replacing the host diagram: what omomp is and which hosts it mounts on. */
  readonly intro: string;
  /** Heading over each tab's `after` list. */
  readonly afterLabel: string;
  readonly tabs: readonly InstallTab[];
}

/**
 * The ways of installing omomp as supabase.com's product tabs: one surface under the tab row, the interface you
 * work in drawn edge to edge on the left, and on the right the commands, one note and what you get — no frames
 * inside the surface.
 */
export default function RepairInstall(props: { data: RepairInstallData }) {
  const [current, setCurrent] = createSignal(0);
  const tab = createMemo(() => props.data.tabs[current()]!);
  return (
    <div class="ri">
      <p class="ri-intro">{props.data.intro}</p>
      <div class="ri-tabs" role="tablist" aria-label={props.data.intro}>
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
      <div class="ri-surface" role="tabpanel" aria-labelledby={`ri-tab-${tab().id}`}>
        <div class="ri-view">
          <For each={tab().arts}>{(art) => <ArtView lang={props.data.lang} art={art} />}</For>
        </div>
        <div class="ri-how">
          <pre class="ri-cmds">
            <Index each={tab().commands}>
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
          <p class="ri-note">{tab().note}</p>
          <div class="ri-after">
            <span class="ri-cap">{props.data.afterLabel}</span>
            <ul>
              <For each={tab().after}>{(item) => <li innerHTML={item} />}</For>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
