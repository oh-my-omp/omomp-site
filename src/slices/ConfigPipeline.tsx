import { For } from "solid-js";
import type { Lang } from "../i18n";
import type { HookKind } from "./HookMessage";

type SeamId = "intent" | "prompt" | "memory" | "delegation" | "execution" | "delivery";

interface Stop {
  /** Where in a turn the hook acts. */
  readonly at: Readonly<Record<Lang, string>>;
  readonly kind: HookKind;
  readonly sources: readonly string[];
}

const seamNames: Readonly<Record<SeamId, Readonly<Record<Lang, string>>>> = {
  intent: { en: "Intent", zh: "意图" },
  prompt: { en: "Prompt", zh: "提示词" },
  memory: { en: "Memory", zh: "记忆" },
  delegation: { en: "Delegation", zh: "派发" },
  execution: { en: "Execution", zh: "执行" },
  delivery: { en: "Delivery", zh: "交付" },
};

/** omp-config's silent hooks and the extensions they belong to, in the order a task meets them. */
const stops: ReadonlyArray<readonly [SeamId, readonly Stop[]]> = [
  ["intent", [{ at: { en: "ask result", zh: "ask 返回" }, kind: "block", sources: ["ask readability"] }]],
  [
    "prompt",
    [
      {
        at: { en: "turn start · tool result", zh: "回合开始 · 工具结果" },
        kind: "reminder",
        sources: ["repo-rules", "tool-topics", "system-prompt-replace", "append-system-model"],
      },
    ],
  ],
  ["memory", [{ at: { en: "turn end", zh: "回合结束" }, kind: "reminder", sources: ["todo reminders"] }]],
  [
    "delegation",
    [
      { at: { en: "task call", zh: "task 调用前" }, kind: "block", sources: ["isolation-nudge", "task-split-check"] },
      { at: { en: "advisor model call", zh: "顾问调用模型" }, kind: "reminder", sources: ["user-prompt-inject"] },
    ],
  ],
  [
    "execution",
    [
      { at: { en: "bash · eval call", zh: "bash · eval 调用前" }, kind: "block", sources: ["delete-guard", "tool-policy-nag"] },
      { at: { en: "tool result", zh: "工具结果" }, kind: "reminder", sources: ["tool-policy-nag"] },
    ],
  ],
  [
    "delivery",
    [
      { at: { en: "subagent yield", zh: "子代理 yield" }, kind: "judge", sources: ["task-completion-judge"] },
      { at: { en: "turn end", zh: "回合结束" }, kind: "judge", sources: ["turn-judge", "lang-nag"] },
    ],
  ],
];

const kindLabel: Readonly<Record<HookKind, Readonly<Record<Lang, string>>>> = {
  reminder: { en: "appends", zh: "追加" },
  block: { en: "refuses", zh: "拦下" },
  judge: { en: "judges", zh: "裁决" },
};

/** The six seams as one pipeline, with each point where an omp-config hook appends, refuses or judges. */
export default function ConfigPipeline(props: { lang: Lang }) {
  return (
    <ol class="sl-pipe">
      <For each={stops}>
        {([seam, list], i) => (
          <li>
            <div class="sl-pipe-seam">
              <span class="n">{String(i() + 1).padStart(2, "0")}</span>
              {seamNames[seam][props.lang]}
            </div>
            <For each={list}>
              {(s) => (
                <div class={`sl-pipe-stop k-${s.kind}`}>
                  <span class="sl-pipe-kind">{kindLabel[s.kind][props.lang]}</span>
                  <span class="sl-pipe-at">{s.at[props.lang]}</span>
                  <code>{s.sources.join(" · ")}</code>
                </div>
              )}
            </For>
          </li>
        )}
      </For>
    </ol>
  );
}
