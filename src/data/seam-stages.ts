import type { Lang } from "../i18n";
import type { ContextRow } from "../slices/ContextBar";
import type { Hook } from "../slices/HookMessage";
import type { Panel } from "../slices/Panel";
import type { TLine } from "../slices/Transcript";
import { labels } from "../slices/labels";
import { componentArt, type ComponentId } from "./component-art";
import type { SeamId } from "./scenario";

export type Layer = "human" | "agent" | "silent";

const seamIds = ["intent", "prompt", "memory", "delegation", "execution", "delivery"] as const satisfies readonly SeamId[];

/** Narrows a seams collection entry id to a seam the stages know. */
export function parseSeamId(id: string): SeamId {
  const found = seamIds.find((s) => s === id);
  if (!found) throw new Error(`seam \`${id}\` has no stages in seam-stages.ts`);
  return found;
}

/** The window chrome a screen is drawn in: the session tab in the terminal, or a Tern view. */
interface Frame {
  readonly tabs: readonly string[];
  readonly meta: string;
}

/** A file or tool text shown as it is written. */
export interface StageFile {
  readonly title: string;
  readonly lines: readonly string[];
}

/**
 * The primary stage under a layer's heading on a seam page: that layer's mechanism at work.
 * `screen` is what the person sees; `exchange` puts what the person sees beside what reached the model;
 * `files` shows the files or tool texts the mechanism reads; `context` draws the request the model receives.
 */
export type SeamStage =
  | { readonly kind: "screen"; readonly frame: Frame; readonly panels: readonly Panel[] }
  | { readonly kind: "exchange"; readonly frame: Frame; readonly panels: readonly Panel[]; readonly hooks: readonly Hook[] }
  | { readonly kind: "files"; readonly files: readonly StageFile[] }
  | { readonly kind: "context"; readonly rows: readonly ContextRow[]; readonly hooks: readonly Hook[] };

const session: Frame = { tabs: ["shop-api"], meta: "omp" };

const hookOf = (id: ComponentId, lang: Lang): Hook => {
  const art = componentArt[id][lang];
  if (art.kind !== "hook") throw new Error(`component \`${id}\` art is ${art.kind}, the stage needs its hook`);
  return art.hook;
};
const linesOf = (id: ComponentId, lang: Lang): readonly TLine[] => {
  const art = componentArt[id][lang];
  if (art.kind !== "lines") throw new Error(`component \`${id}\` art is ${art.kind}, the stage needs its transcript lines`);
  return art.lines;
};
const panelOf = (id: ComponentId, lang: Lang): Panel => {
  const art = componentArt[id][lang];
  if (art.kind !== "panel") throw new Error(`component \`${id}\` art is ${art.kind}, the stage needs its panel`);
  return art.panel;
};
const fileOf = (id: ComponentId, lang: Lang): StageFile => {
  const art = componentArt[id][lang];
  if (art.kind !== "code") throw new Error(`component \`${id}\` art is ${art.kind}, the stage needs its file`);
  return { title: art.title, lines: art.lines };
};
/** The todo tool takes one document per call, opened and closed by fixed marker lines. */
const todoDocumentOf = (id: ComponentId, lang: Lang): StageFile => {
  const line = linesOf(id, lang)[0];
  if (line?.kind !== "call" || line.tool !== "todo") throw new Error(`component \`${id}\` art is not a todo call`);
  return { title: "todo", lines: ["*** Begin Todo", line.args, "*** End Todo"] };
};
const resultOf = (id: ComponentId, lang: Lang): StageFile => {
  const line = linesOf(id, lang)[0];
  if (line?.kind !== "call" || !line.result) throw new Error(`component \`${id}\` art has no call result`);
  return { title: line.tool, lines: line.result.split("\n") };
};

/** The count the todo stop reminder names, so the card on screen matches the reminder the model receives. */
const openTodos = (lang: Lang): number => {
  const body = hookOf("todo-reminders", lang).body;
  const m = /You stopped with (\d+) incomplete/.exec(body);
  if (!m) throw new Error("todo reminder art no longer names its open item count");
  return Number(m[1]);
};

const askCall = {
  en: [
    "{",
    '  "questions": [{',
    '    "id": "storage",',
    '    "question": "Where should the rate limiter keep its per-key counters?",',
    '    "brief": {',
    '      "where": "shop-api runs four instances behind one load balancer; they already share a Redis for login sessions.",',
    '      "what": "Keep request counts in the shared Redis or in each instance\'s memory, and how a key\'s allowance refills.",',
    '      "how": "The middleware in src/middleware/rate-limit.ts is written for the chosen option; three routes move onto it."',
    "    },",
    '    "options": [',
    '      { "label": "Shared Redis, token bucket", "tradeoff": "One bucket per key, refilled continuously; one Redis call per request" },',
    '      { "label": "Shared Redis, fixed window", "tradeoff": "One counter per key per minute; bursts at the window edges" },',
    '      { "label": "Each instance\'s memory", "tradeoff": "No Redis call; each instance counts alone, so a key gets four times its limit" }',
    "    ],",
    '    "recommended": 0',
    "  }]",
    "}",
  ],
  zh: [
    "{",
    '  "questions": [{',
    '    "id": "storage",',
    '    "question": "限流器按 key 计数的计数器放在哪里？",',
    '    "brief": {',
    '      "where": "shop-api 在一个负载均衡后面跑四个实例，四个实例已经共用一台 Redis 存登录会话。",',
    '      "what": "请求计数放在共用的 Redis 里还是各实例自己的内存里，以及每个 key 的额度怎样恢复。",',
    '      "how": "src/middleware/rate-limit.ts 里的中间件按选定的方案来写，之后三个路由改用它。"',
    "    },",
    '    "options": [',
    '      { "label": "共用的 Redis，令牌桶", "tradeoff": "每个 key 一个桶，持续补充；每个请求访问一次 Redis" },',
    '      { "label": "共用的 Redis，固定窗口", "tradeoff": "每个 key 每分钟一个计数器；窗口交界处会出现突发" },',
    '      { "label": "各实例自己的内存", "tradeoff": "不访问 Redis；各实例各算各的，一个 key 实际拿到四倍额度" }',
    "    ],",
    '    "recommended": 0',
    "  }]",
    "}",
  ],
} as const;

const askAnswer = { en: "Shared Redis, token bucket", zh: "共用的 Redis，令牌桶" } as const;

/** agent/config.yml and agent/config-light.yml in omp-config, excerpted verbatim; `…` marks skipped lines. */
const fullConfig: StageFile = {
  title: "omp · agent/config.yml",
  lines: [
    "extensions:",
    "  - ~/.omp/agent/extensions-last/system-prompt-replace/index.ts",
    "disabledProviders:",
    "  - vscode",
    "  - agents-md",
    "  - claude-md",
    "…",
    "task:",
    "  eager: preferred",
    "…",
    "bashInterceptor:",
    "  enabled: true",
  ],
};
const lightConfig: StageFile = {
  title: "omp-light · agent/config-light.yml",
  lines: [
    "extensions:",
    "  - ~/.omp/agent/extensions-last/system-prompt-replace/index.ts",
    "disabledExtensions:",
    "  - extension-module:fork-task",
    "  - extension-module:isolation-nudge",
    "  - extension-module:lang-nag",
    "  - extension-module:task-completion-judge",
    "  - extension-module:task-split-check",
    "  - extension-module:tool-policy-nag",
    "  - extension-module:turn-judge",
    "  - extension-module:user-prompt-inject",
    "  - extension-module:watchdog-agent",
    "task:",
    '  eager: "default"',
    "bashInterceptor:",
    "  enabled: false",
  ],
};

/** The tail of the `task` tool description as tool-topics delivers it, and the topic the agent reads before an isolated dispatch. */
const taskTopics: StageFile = {
  title: "task · description",
  lines: [
    "…",
    "Topics — read the one a call needs before making it:",
    "- `tool://task/batch` — before dispatching many items built from a template, or in waves",
    "- `tool://task/follow-up` — before giving more work to, messaging, or reading back an agent that already exists",
    "- `tool://task/isolation` — before setting `isolated: true`, or after an isolated item failed to start or merge",
    "- `tool://task/judge` — before reading many short texts (titles, rows, findings, summaries) only to answer a fixed question about each, or to sort them into classes",
    "- `tool://task/limits` — before planning a large fan-out, nested delegation, or a long-running child",
  ],
};
const isolationTopic: StageFile = {
  title: "read tool://task/isolation",
  lines: [
    "# Isolated workers",
    "",
    "- `isolated: true` gives the item its own checkout; omitted or `false` runs in yours. Each item sets it independently.",
    "- Give isolated children repository-relative paths, and tell them which uncommitted changes in your checkout already exist: they start from a snapshot of it.",
    "- An isolated agent kept alive (idle/parked) keeps its workspace; its final patch/branch state is captured when it is released.",
  ],
};

const prefixRows = {
  en: [
    {
      title: "A hook rewrites the system prompt",
      segments: [
        { label: "system ✎", kind: "changed", size: 3 },
        { label: "tools", kind: "tools", size: 2 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "new", kind: "new", size: 1 },
      ],
      note: "The prefix changed: the cache misses and the whole request is billed again.",
      cache: "miss",
    },
    {
      title: "omp-config appends a message",
      segments: [
        { label: "system", kind: "system", size: 3 },
        { label: "tools", kind: "tools", size: 2 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "<system-reminder>", kind: "delta", size: 2.2 },
        { label: "new", kind: "new", size: 1 },
      ],
      note: "The prefix is unchanged: everything before the appended message comes from cache.",
      cache: "hit",
    },
  ],
  zh: [
    {
      title: "钩子改写系统提示词",
      segments: [
        { label: "system ✎", kind: "changed", size: 3 },
        { label: "tools", kind: "tools", size: 2 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "new", kind: "new", size: 1 },
      ],
      note: "前缀变了：缓存未命中，整个请求重新计费。",
      cache: "miss",
    },
    {
      title: "omp-config 追加一条消息",
      segments: [
        { label: "system", kind: "system", size: 3 },
        { label: "tools", kind: "tools", size: 2 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "msg", kind: "msg", size: 1.4 },
        { label: "<system-reminder>", kind: "delta", size: 2.2 },
        { label: "new", kind: "new", size: 1 },
      ],
      note: "前缀没变：追加消息之前的部分全部从缓存读取。",
      cache: "hit",
    },
  ],
} as const satisfies Record<Lang, readonly ContextRow[]>;

const workers = ["OrdersRoute", "SearchRoute", "WebhooksRoute"] as const;
const branch = (name: string) => `wt/${name.replace("Route", "").toLowerCase()}-route`;

/** One saved session query, run from an eval cell; the text is the `details` JSON eval prints. */
const sessionQuery = (lang: Lang): TLine => {
  const titles =
    lang === "en"
      ? ["Rate limiting for the public API", "Login sessions moved to Redis", "Pagination for the orders route"]
      : ["给公开 API 加限流", "登录会话改存 Redis", "orders 路由分页"];
  const rows = [
    { title: titles[0], modified: "2026-11-09T06:41:12Z", assistant_turns: 38 },
    { title: titles[1], modified: "2026-11-02T15:07:55Z", assistant_turns: 24 },
    { title: titles[2], modified: "2026-10-28T09:30:18Z", assistant_turns: 17 },
  ];
  return {
    kind: "call",
    tool: "eval",
    args: `py · (await tool.session_query({"action": "sql", "query": "SELECT title, modified, assistant_turns FROM src.sessions WHERE cwd LIKE '%shop-api%' ORDER BY modified DESC LIMIT 3"})).details`,
    status: "ok",
    result: [
      '{"kind": "rows",',
      ' "columns": ["title", "modified", "assistant_turns"],',
      ' "rows": [',
      ...rows.map((r, i) => `   ${JSON.stringify(r)}${i < rows.length - 1 ? "," : ""}`),
      " ],",
      ' "truncated": false}',
    ].join("\n"),
  };
};

export function seamStage(seam: SeamId, layer: Layer, lang: Lang): SeamStage {
  const en = lang === "en";
  switch (seam) {
    case "intent":
      switch (layer) {
        case "human":
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  {
                    kind: "user",
                    text: en
                      ? "Add rate limiting to the public API, backed by Redis and counted per API key."
                      : "给公开 API 加限流，计数放 Redis，按 API key 算。",
                  },
                  {
                    kind: "say",
                    text: en
                      ? "Before I write the middleware I need you to decide where the counters live."
                      : "写中间件之前，需要你定一下计数器放在哪里。",
                  },
                ],
              },
              panelOf("ask-more-panel", lang),
            ],
          };
        case "agent":
          return {
            kind: "files",
            files: [
              { title: "ask", lines: askCall[lang] },
              { title: en ? "ask · result" : "ask · 返回", lines: ["User answers:", `storage: ${askAnswer[lang]}`] },
            ],
          };
        case "silent":
          return {
            kind: "exchange",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  {
                    kind: "say",
                    text: en
                      ? "Before I write the middleware I need you to decide where the counters live."
                      : "写中间件之前，需要你定一下计数器放在哪里。",
                  },
                  { kind: "call", tool: "ask", args: "storage", status: "error", result: "ask rejected" },
                ],
              },
            ],
            hooks: [hookOf("ask-readability", lang)],
          };
      }
    case "prompt":
      switch (layer) {
        case "human":
          return { kind: "files", files: [fullConfig, lightConfig] };
        case "agent":
          return { kind: "files", files: [taskTopics, isolationTopic] };
        case "silent":
          return { kind: "context", rows: prefixRows[lang], hooks: [hookOf("system-prompt-replace", lang)] };
      }
    case "memory":
      switch (layer) {
        case "human":
          return { kind: "screen", frame: { tabs: [en ? "Todo" : "待办"], meta: "Tern" }, panels: [panelOf("todo-panel", lang)] };
        case "agent":
          return {
            kind: "files",
            files: [
              todoDocumentOf("todo-tool", lang),
              { title: en ? "todo · result" : "todo · 返回", lines: resultOf("todo-tool", lang).lines },
            ],
          };
        case "silent":
          return {
            kind: "exchange",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  {
                    kind: "say",
                    text: en
                      ? "The middleware is in and its tests pass. Next I'll switch the routes over."
                      : "中间件写好了，测试也通过了。接下来改那几个路由。",
                  },
                  { kind: "card", tone: "warn", head: labels[lang].todo.reminder(openTodos(lang), 1, 3) },
                ],
              },
            ],
            hooks: [hookOf("todo-reminders", lang)],
          };
      }
    case "delegation":
      switch (layer) {
        case "human":
          return { kind: "files", files: [fileOf("subagent-usage-cmd", lang), resultOf("subagent-usage-tool", lang)] };
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "agents",
                rows: [
                  ...workers.map((name) => ({
                    name,
                    agent: "task:low",
                    where: branch(name),
                    state: "running" as const,
                    stateText: en ? "running" : "运行中",
                  })),
                  {
                    name: "Steady",
                    agent: "discuss:steady",
                    where: en ? "shared · read-only" : "共用 · 只读",
                    state: "running" as const,
                    stateText: en ? "reviewing" : "审阅中",
                  },
                ],
              },
              { kind: "transcript", lines: linesOf("advisors", lang) },
            ],
          };
        case "silent":
          return {
            kind: "exchange",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  { kind: "call", tool: "task", args: "RoutesAll · task:low", status: "blocked" },
                  {
                    kind: "say",
                    text: en ? "One topic per worker: the three routes go out separately." : "一个执行者只做一个主题，三个路由分开派发。",
                  },
                  { kind: "call", tool: "task", args: `${workers.join(", ")} · task:low`, status: "blocked" },
                ],
              },
            ],
            hooks: [hookOf("task-split-check", lang), hookOf("isolation-nudge", lang)],
          };
      }
    case "execution":
      switch (layer) {
        case "human":
          return {
            kind: "screen",
            frame: { tabs: [labels[lang].exec.terminals], meta: "Tern" },
            panels: [panelOf("terminals-hud", lang)],
          };
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [{ kind: "transcript", lines: [...linesOf("exec-tools", lang), ...linesOf("delete-tool", lang), ...linesOf("wt", lang)] }],
          };
        case "silent":
          return {
            kind: "exchange",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  { kind: "call", tool: "bash", args: "rm -rf node_modules/.vite/vitest", status: "blocked" },
                  ...linesOf("delete-tool", lang),
                  { kind: "call", tool: "bash", args: "tail -f /usr/local/var/log/redis.log", status: "blocked" },
                ],
              },
            ],
            hooks: [hookOf("delete-guard", lang), hookOf("tool-policy-nag", lang)],
          };
      }
    case "delivery":
      switch (layer) {
        case "human":
          return { kind: "screen", frame: session, panels: [panelOf("thinking-translator", lang)] };
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [{ kind: "transcript", lines: [sessionQuery(lang), ...linesOf("peers", lang)] }],
          };
        case "silent":
          return {
            kind: "exchange",
            frame: session,
            panels: [
              {
                kind: "agents",
                rows: workers.map((name) => ({
                  name,
                  agent: "task:low",
                  where: branch(name),
                  state: name === "WebhooksRoute" ? ("returned" as const) : ("done" as const),
                  stateText: name === "WebhooksRoute" ? (en ? "yield returned" : "yield 被退回") : en ? "done" : "完成",
                })),
              },
              {
                kind: "transcript",
                lines: [
                  {
                    kind: "say",
                    text: en
                      ? "All three routes now use the shared limiter. Next I'll run the full suite and commit."
                      : "三个路由都换成了共用的限流器。接下来我会跑完整测试并提交。",
                  },
                ],
              },
            ],
            hooks: [hookOf("task-completion-judge", lang), hookOf("turn-judge", lang)],
          };
      }
  }
}
