import { createMemo, createSignal, For } from "solid-js";
import type { Lang } from "../i18n";
import ArtView, { type Art } from "../slices/Art";
import Window from "../slices/Window";
import "../styles/host-stage.css";

export type Part = "config" | "plugins" | "products" | "omp" | "tern";

export interface HostTab {
  readonly id: string;
  readonly label: string;
  /** Parts of the picture this way of installing uses; the rest are dimmed. */
  readonly uses: readonly Part[];
  /** Title of the window the interface is drawn in. */
  readonly window: string;
  /** What you work with once this way is installed. */
  readonly arts: readonly Art[];
  readonly install: readonly string[];
  readonly start: readonly string[];
  readonly text: string;
  /** What this way of installing gives you, one short line each, as HTML from `inlineCode`. */
  readonly after: readonly string[];
}

export interface HostStageData {
  readonly lang: Lang;
  readonly omomp: { readonly name: string; readonly role: string };
  readonly parts: Readonly<Record<"config" | "plugins" | "products", string>>;
  readonly hosts: Readonly<Record<"omp" | "tern", { readonly name: string; readonly role: string }>>;
  readonly links: Readonly<Record<"omp" | "tern", string>>;
  readonly install: string;
  readonly start: string;
  /** Heading over each tab's `after` list. */
  readonly after: string;
  readonly tabs: readonly HostTab[];
}

/**
 * The ways of installing omomp as a switchable stage: on the left the interface you work in once it is set up,
 * above how omomp mounts on its two hosts; on the right the install and start commands and what you get.
 */
export default function HostStage(props: { data: HostStageData }) {
  const [current, setCurrent] = createSignal(0);
  const tab = createMemo(() => props.data.tabs[current()]!);
  const lit = (p: Part) => tab().uses.includes(p);
  return (
    <div class="hs">
      <div class="hs-tabs" role="tablist">
        <For each={props.data.tabs}>
          {(t, i) => (
            <button type="button" role="tab" aria-selected={current() === i()} classList={{ on: current() === i() }} onClick={() => setCurrent(i())}>
              {t.label}
            </button>
          )}
        </For>
      </div>
      <div class="hs-body">
        <div class="hs-left">
          <Window tabs={[tab().window]} class="hs-win">
            <div class="hs-screen">
              <For each={tab().arts}>{(art) => <ArtView lang={props.data.lang} art={art} />}</For>
            </div>
          </Window>
          <div class="hs-map">
            <div class="hs-box top">
              <b>{props.data.omomp.name}</b>
              <div class="hs-parts">
                <For each={["config", "plugins", "products"] as const}>
                  {(p) => <code classList={{ lit: lit(p) }}>{props.data.parts[p]}</code>}
                </For>
              </div>
            </div>
            <div class="hs-links">
              <span classList={{ lit: lit("omp") }}>{props.data.links.omp}</span>
              <span classList={{ lit: lit("tern") }}>{props.data.links.tern}</span>
            </div>
            <div class="hs-hosts">
              <For each={["omp", "tern"] as const}>
                {(h) => (
                  <div class="hs-box" classList={{ lit: lit(h), dim: !lit(h) }}>
                    <b>{props.data.hosts[h].name}</b>
                    <span>{props.data.hosts[h].role}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
        <div class="hs-how">
          <div class="hs-cmd">
            <span>{props.data.install}</span>
            <pre>
              <For each={tab().install}>{(line) => <span>{line + "\n"}</span>}</For>
            </pre>
          </div>
          <div class="hs-cmd">
            <span>{props.data.start}</span>
            <pre>
              <For each={tab().start}>{(line) => <span>{line + "\n"}</span>}</For>
            </pre>
          </div>
          <p>{tab().text}</p>
          <div class="hs-after">
            <span>{props.data.after}</span>
            <ul>
              <For each={tab().after}>{(item) => <li innerHTML={item} />}</For>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
