import type { Lang } from "../i18n";
import type { Art } from "../slices/Art";
import type { ContextRow } from "../slices/ContextBar";
import type { Hook } from "../slices/HookMessage";
import { componentArt } from "./component-art";

/**
 * What the principles page shows beside each practice of a rule: the interface or message that carries it out.
 * Every model-facing body is quoted from the source that sends it (paths in the comments); only scenario values —
 * paths, names, hashes — follow the shop-api rate-limiting demo.
 */
export type PrincipleId = "append" | "signals" | "roles" | "policy";

/** The footer of a tracked execution block in the Tern Playbook pane (omp-playbooks src/service/ui.ts:624-640). */
export interface PlaybookFoot {
  readonly block: string;
  readonly title: string;
  readonly subagentLabel: string;
  readonly subagent: string;
  readonly isolatedLabel: string;
  readonly isolated: string;
  /** The Launch button after a click, before the coordinator creates the Launch. */
  readonly button: string;
}

export type PaneSlice =
  | { readonly kind: "art"; readonly art: Art }
  | { readonly kind: "context"; readonly rows: readonly ContextRow[] }
  | { readonly kind: "playbook-foot"; readonly foot: PlaybookFoot };

/** One pane per practice, in the order of the rule's `practice` list. */
export type Panes = readonly [readonly PaneSlice[], readonly PaneSlice[], readonly PaneSlice[]];

const art = (a: Art): PaneSlice => ({ kind: "art", art: a });
const hook = (h: Hook): PaneSlice => art({ kind: "hook", hook: h });
const component = (id: keyof typeof componentArt, lang: Lang): PaneSlice => art(componentArt[id][lang]);

const envelope = (source: string, body: string): string => `<system-reminder source="${source}">\n${body}\n</system-reminder>`;

/** omp-config agent/extensions/repo-rules/index.ts:87-94: the repository's AGENTS.md, delivered in place of the system prompt's copy. */
const contextFiles = envelope(
  "omp-config/repo-rules",
  [
    "MUST follow these context files for all tasks. Paths are relative to the repository root (`~/` is the home directory). They are already in context: NEVER `grep`/`glob` for `AGENTS.md`, `CLAUDE.md` or similar agent/context files.",
    '<context-file path="AGENTS.md">',
    "# shop-api",
    "- Package manager: pnpm. Run `pnpm test` before every commit.",
    "- Rate limits live in src/middleware/rate-limit.ts; routes call it and never count requests themselves.",
    "</context-file>",
  ].join("\n"),
);

/** omp-remote-build src/index.ts:410-427 inside the delta envelope of src/tool-delta.ts, after the session moved out of the project. */
const toolsDelta = envelope(
  "omp-remote-build/tools",
  "These remote-build tools are listed but unavailable: container_exec, container_write_stdin, container_list_sessions, container_kill_session, remote_env_init. Reason: the current directory /home/dev/notes is not inside a project whose worktree root has a valid .omp/remote-build.json. Calls to them are refused until the session is in a remote-build project again.",
);

/** omp-config agent/extensions/tool-policy-nag/intent.ts:166-174 with the `edit` option of INTENT-policy.md. */
const sedCommand = "sed -i 's/countRequests(req)/rateLimit(req)/' src/routes/search.ts";
const intentReminder = ["你这次 `bash` 调用属于「修改已有文件」，应该用 `edit`，而不是这样绕出去。", "", "这次调用：", "```sh", sedCommand, "```"].join("\n");

/** omp-playbooks src/extension/index.ts:308-338: the notice the coordinator session receives after a Launch click. */
const launchCall = '{ doc: "/work/rate-limit.yaml", blocks: ["b4"] }';
const launchData = '{"doc":"/work/rate-limit.yaml","event":"launch_requested","data":{"blocks":["b4"]}}';
const launchNotice: Record<Lang, string> = {
  en: [
    "This is a Playbook document service notice, not a user message",
    `A person requested launching blocks ["b4"] of the Playbook. Block b4 has preset agent: "task:low" isolated: true, so playbook.agent / playbook.run use it automatically when arguments are omitted. Next, choose one: ① Non-blocking: in eval, \`var worker = await playbook.agent(${launchCall})\` returns as soon as the subagent is started and bound; …`,
    launchData,
  ].join("\n"),
  zh: [
    "这是 Playbook 文档服务的通知，不是用户消息",
    `人请求启动 Playbook 的块 ["b4"]。块 b4 已预设 agent: "task:low" isolated: true，不显式传参时 playbook.agent / playbook.run 自动使用。下一步二选一：① 不阻塞：在 eval 中 \`var worker = await playbook.agent(${launchCall})\`，启动并绑定后立即返回；…`,
    launchData,
  ].join("\n"),
};

/** omp-config agent/extensions/append-system-model/APPEND-SYSTEM-decision-support.md:1-8, verbatim. */
const decisionSupport = [
  "---",
  "target: main",
  "mode: full",
  "exclude.model: ^claude-opus-5-5$",
  "---",
  "# Mandatory decision support",
  "",
  "This section is a default: an explicit user instruction overrides only the rules and scope it names.",
  "…",
];

/** Example policy files that ship in omp-config's agent directory. */
const shippedDefaults = [
  "extensions-last/system-prompt-replace/REPLACE-SYSTEM-default.yml",
  "extensions/append-system-model/APPEND-SYSTEM-decision-support.md",
  "extensions/turn-judge/TURN-JUDGE-gpt-talk-only.md",
  "agents/discuss-steady.md",
  "agents/discuss-divergent.md",
  "agents/mentor-default.md",
  "agents/task-low.md",
  "agents/task-mid.md",
];

/** omp-config agent/extensions/omp-config-autoupdate/index.ts:199-224, 316-355: the report after an update that kept a conflicting local edit. */
const updateReport: Record<Lang, readonly string[]> = {
  en: [
    "# omp-config update",
    "",
    "- **Agent dir:** `/home/dev/.omp/agent`",
    "- **Result:** updated",
    "- **Commit:** `3c1d9e0` → `8a42f7b` (`8a42f7b5d0c6e19f2b7a3c4d5e6f708192a3b4c5`)",
    "- **Restart needed:** no",
    "",
    "## Written (1)",
    "- `/home/dev/.omp/agent/extensions-last/system-prompt-replace/REPLACE-SYSTEM-default.yml`",
    "",
    "## Conflicts — local copy kept (1)",
    "- `extensions/turn-judge/TURN-JUDGE-gpt-talk-only.md@5be0c2a91f3d` — `both-changed`",
    "",
    "Run `/omp-config-autoupdate adapt` to adapt them.",
  ],
  zh: [
    "# omp-config 更新",
    "",
    "- **Agent 目录:** `/home/dev/.omp/agent`",
    "- **结果:** 已更新",
    "- **提交:** `3c1d9e0` → `8a42f7b` (`8a42f7b5d0c6e19f2b7a3c4d5e6f708192a3b4c5`)",
    "- **需要重启:** 否",
    "",
    "## 已写入 (1)",
    "- `/home/dev/.omp/agent/extensions-last/system-prompt-replace/REPLACE-SYSTEM-default.yml`",
    "",
    "## 冲突 — 已保留本机内容 (1)",
    "- `extensions/turn-judge/TURN-JUDGE-gpt-talk-only.md@5be0c2a91f3d` — `both-changed`",
    "",
    "运行 `/omp-config-autoupdate adapt` 适配这些冲突。",
  ],
};

export function principlePanes(id: PrincipleId, lang: Lang): Panes {
  const en = lang === "en";
  const appended = en ? "appended" : "追加";
  switch (id) {
    case "append":
      return [
        [
          {
            kind: "context",
            rows: [
              {
                title: en ? "Request 7" : "第 7 次请求",
                segments: [
                  { label: "system", kind: "system", size: 3 },
                  { label: "tools", kind: "tools", size: 2 },
                  { label: en ? "messages" : "消息", kind: "msg", size: 4 },
                  { label: en ? "new" : "新增", kind: "new", size: 1 },
                ],
                note: en ? "prefix cached" : "前缀已缓存",
                cache: "hit",
              },
              {
                title: en ? "Request 8" : "第 8 次请求",
                segments: [
                  { label: "system", kind: "system", size: 3 },
                  { label: "tools", kind: "tools", size: 2 },
                  { label: en ? "messages" : "消息", kind: "msg", size: 5 },
                  { label: en ? "reminder" : "提醒", kind: "delta", size: 2 },
                  { label: en ? "new" : "新增", kind: "new", size: 1 },
                ],
                note: en ? "the edit is appended; same prefix, served from cache" : "改动追加在末尾；前缀不变，命中缓存",
                cache: "hit",
              },
            ],
          },
          component("system-prompt-replace", lang),
        ],
        [
          hook({
            kind: "reminder",
            source: "omp-config/repo-rules",
            at: en ? "agent start" : "代理启动",
            label: appended,
            body: contextFiles,
            gloss: en
              ? undefined
              : {
                  label: "译文",
                  text: "所有任务都必须遵守这些上下文文件。路径相对仓库根（`~/` 指主目录）。它们已在上下文中：不要再用 `grep`/`glob` 去找 AGENTS.md、CLAUDE.md 之类的文件。文件内容：包管理用 pnpm，每次提交前跑 `pnpm test`；限流写在 src/middleware/rate-limit.ts，路由只调用它，自己不计数。",
                },
          }),
        ],
        [
          {
            kind: "context",
            rows: [
              {
                title: en ? "After /wt to ~/notes" : "/wt 切到 ~/notes 之后",
                segments: [
                  { label: "system", kind: "system", size: 3 },
                  { label: "tools", kind: "tools", size: 2 },
                  { label: en ? "messages" : "消息", kind: "msg", size: 4 },
                  { label: en ? "tools delta" : "工具差分", kind: "delta", size: 2 },
                  { label: en ? "new" : "新增", kind: "new", size: 1 },
                ],
                note: en ? "tool list unchanged; served from cache" : "工具列表不变，命中缓存",
                cache: "hit",
              },
            ],
          },
          hook({
            kind: "reminder",
            source: "omp-remote-build/tools",
            at: en ? "tool result" : "工具结果后",
            label: appended,
            body: toolsDelta,
            gloss: en
              ? undefined
              : {
                  label: "译文",
                  text: "这些 remote-build 工具仍在列表里，但现在不可用。原因：当前目录 /home/dev/notes 不在任何 worktree 根目录带有效 .omp/remote-build.json 的项目里。回到 remote-build 项目之前，调用它们都会被拒绝。",
                },
          }),
        ],
      ];
    case "signals":
      return [
        [component("delete-guard", lang)],
        [
          art({ kind: "lines", lines: [{ kind: "call", tool: "bash", args: sedCommand, status: "ok" }] }),
          hook({
            kind: "reminder",
            source: "tool-policy-nag",
            at: en ? "bash result" : "bash 结果后",
            label: appended,
            body: intentReminder,
            gloss: en
              ? { label: "Translation", text: `Your \`bash\` call belongs to “edit an existing file”. Use \`edit\` for it instead of working around it. This call: \`${sedCommand}\`` }
              : undefined,
          }),
        ],
        [component("task-completion-judge", lang), component("turn-judge", lang)],
      ];
    case "roles":
      return [
        [component("worker-tiers", lang)],
        [component("user-prompt-inject", lang), component("advisors", lang)],
        [
          {
            kind: "playbook-foot",
            foot: {
              block: "b4",
              title: en ? "Switch the search route" : "改 search 路由",
              subagentLabel: en ? "SUBAGENT" : "子代理",
              subagent: "task:low",
              isolatedLabel: en ? "ISOLATED WORKTREE" : "独立 WORKTREE",
              isolated: en ? "Yes" : "是",
              button: en ? "Launch requested" : "已请求启动",
            },
          },
          hook({ kind: "reminder", source: "omp-playbooks", at: en ? "after the click" : "点击之后", label: appended, body: launchNotice[lang] }),
        ],
      ];
    case "policy":
      return [
        [
          art({
            kind: "code",
            title: "APPEND-SYSTEM-decision-support.md",
            lines: decisionSupport,
            ...(en ? {} : { gloss: { label: "译文", text: "# 强制决策支持：本节是默认规则，用户的明确指令只覆盖它点名的规则和范围。" } }),
          }),
          component("append-system-model", lang),
        ],
        [art({ kind: "code", title: en ? "omp-config · agent/" : "omp-config · agent/ 目录", lines: shippedDefaults })],
        [art({ kind: "code", title: "/omp-config-autoupdate run", lines: updateReport[lang] })],
      ];
  }
}
