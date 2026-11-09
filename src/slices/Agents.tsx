import { For } from "solid-js";

export interface AgentRow {
  /** Agent name as dispatched, e.g. `BillingCaller`. */
  readonly name: string;
  /** Agent definition, e.g. `task:mid` or `discuss:steady`. */
  readonly agent: string;
  /** Where it works: an isolated worktree branch or the shared checkout. */
  readonly where: string;
  readonly state: "running" | "done" | "returned" | "blocked";
  /** Already-localized state word. */
  readonly stateText: string;
}

/** Subagents of one dispatch, one row each, as the session's agent list shows them. */
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
