import { For } from "solid-js";

export interface AgentRow {
  readonly name: string;
  readonly agent: string;
  readonly where: string;
  readonly state: "running" | "done" | "returned" | "blocked";
  readonly stateText: string;
}

export default function Agents(props: { rows: readonly AgentRow[] }) {
  return (
    <ul class="sl-agents">
      <For each={props.rows}>
        {(r) => (
          <li class={`a-${r.state}`}>
            <span class="dot" />
            <b>{r.name}</b>
            <code>{r.agent}</code>
            <span class="w">{r.where}</span>
            <span class="s">{r.stateText}</span>
          </li>
        )}
      </For>
    </ul>
  );
}
