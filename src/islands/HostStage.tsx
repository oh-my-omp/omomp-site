import { createMemo, createSignal, For, Show } from "solid-js";
import "../styles/host-stage.css";

export type Part = "config" | "plugins" | "products" | "omp" | "tern";

export interface HostTab {
  readonly id: string;
  readonly label: string;
  /** Parts of the picture this way of installing uses; the rest are dimmed. */
  readonly uses: readonly Part[];
  readonly lines: readonly string[];
  readonly text: string;
}

export interface HostStageData {
  readonly omomp: { readonly name: string; readonly role: string };
  readonly parts: Readonly<Record<"config" | "plugins" | "products", string>>;
  readonly hosts: Readonly<Record<"omp" | "tern", { readonly name: string; readonly role: string }>>;
  readonly links: Readonly<Record<"omp" | "tern", string>>;
  readonly tabs: readonly HostTab[];
}

/**
 * Where omomp sits on its two hosts, switched between ways of installing it: on the left the parts each way
 * uses, on the right the commands and what they do.
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
        <div class="hs-map">
          <div class="hs-box top">
            <b>{props.data.omomp.name}</b>
            <span>{props.data.omomp.role}</span>
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
        <div class="hs-how">
          <Show when={tab().lines.length > 0}>
            <pre>
              <For each={tab().lines}>{(line) => <span>{line + "\n"}</span>}</For>
            </pre>
          </Show>
          <p>{tab().text}</p>
        </div>
      </div>
    </div>
  );
}
