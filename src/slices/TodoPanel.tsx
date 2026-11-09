import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";

/** omp-todo-more's checklist states (src/native.ts `checklistStatus`). */
export type TodoStatus = "pending" | "active" | "done" | "dropped" | "blocked";

export interface TodoItem {
  readonly title: string;
  readonly status: TodoStatus;
  readonly estimate: number;
  readonly explanation?: string;
  readonly commit?: { readonly sha: string; readonly message: string };
}

export interface TodoData {
  readonly objective: string;
  readonly measure: string;
  readonly doneWhen: string;
  readonly phases: ReadonlyArray<{ readonly name: string; readonly items: readonly TodoItem[] }>;
}

const closed = (s: TodoStatus) => s === "done" || s === "dropped";

/** The Tern HUD replacement: the progress pill and its open popover with goal and checklist (src/native.ts). */
export default function TodoPanel(props: { lang: Lang; data: TodoData; compact?: boolean }) {
  const l = () => labels[props.lang].todo;
  const items = () => props.data.phases.flatMap((p) => p.items);
  const pill = () => {
    const all = items();
    const label =
      all.find((i) => i.status === "active")?.title ??
      all.find((i) => i.status === "pending")?.title ??
      l().allDone;
    return `${label} ${all.filter((i) => closed(i.status)).length}/${all.length}`;
  };
  return (
    <div class="sl-todo" classList={{ compact: !!props.compact }}>
      <div class="sl-todo-pop">
        <Show when={!props.compact}>
          <dl class="sl-todo-goal">
            <dt>{l().objective}</dt>
            <dd>{props.data.objective}</dd>
            <dt>{l().measure}</dt>
            <dd>{props.data.measure}</dd>
            <dt>{l().doneWhen}</dt>
            <dd>{props.data.doneWhen}</dd>
          </dl>
        </Show>
        <For each={props.data.phases}>
          {(phase) => (
            <div class="sl-todo-phase">
              <div class="sl-todo-ph">
                <span>{phase.name}</span>
                <span>
                  {phase.items.filter((i) => closed(i.status)).length}/{phase.items.length}
                </span>
              </div>
              <ul>
                <For each={phase.items}>
                  {(item) => (
                    <li class={`s-${item.status}`}>
                      <span class="sl-todo-ring" />
                      <div>
                        <span class="sl-todo-t">{item.title}</span>
                        <span class="sl-todo-note">
                          {l().estimate(item.estimate)}
                          <Show when={item.commit}>
                            {(c) => (
                              <>
                                {" · "}
                                {l().commit}: <code>{c().sha}</code> "{c().message}"
                              </>
                            )}
                          </Show>
                        </span>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
        <Show when={!props.compact}>
          <span class="sl-btn">{l().edit}</span>
        </Show>
      </div>
      <div class="sl-todo-pill">
        <span class="sl-todo-ring" />
        {pill()}
      </div>
    </div>
  );
}
