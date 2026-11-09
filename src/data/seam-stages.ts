import type { Lang } from "../i18n";
import type { ContextRow } from "../slices/ContextBar";
import type { Hook } from "../slices/HookMessage";
import type { Panel } from "../slices/Panel";
import type { TLine } from "../slices/Transcript";
import { labels } from "../slices/labels";
import { askPanel, componentArt, todoStopReminder, type ComponentId } from "./component-art";
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
  /** A reading aid under a plugin's text when its language is not the page's. */
  readonly gloss?: { readonly label: string; readonly text: string };
}

/** A run of terminal text and the colour role the plugin paints it with. */
export interface TermSpan {
  readonly text: string;
  readonly tone?: "heading" | "strong" | "accent" | "muted" | "dim" | "success";
}
export type TermLine = readonly TermSpan[];

/** A full-screen page a plugin draws in the terminal: framed, titled, with its status and key-hint rows. */
export interface TermPage {
  readonly title: string;
  /** The body is scrolled to its end; the page's scrollbar thumb sits at the bottom of its track. */
  readonly scrolled: boolean;
  readonly lines: readonly TermLine[];
  readonly status?: string;
  readonly hint: string;
}

/** One part of a model request in order, named by what puts it there and when it arrives. */
export interface RequestPart {
  readonly kind: "system" | "tools" | "msg" | "delta" | "new";
  readonly label: string;
  readonly note: string;
}

/**
 * The primary stage under a layer's heading on a seam page: that layer's mechanism at work.
 * `screen` is what the person sees; `terminal` is a plugin's full-screen page in the terminal;
 * `exchange` puts what the person sees beside what reached the model; `files` shows the files or tool
 * texts the mechanism reads; `context` compares what the prompt cache keeps, then lays one request out
 * part by part.
 */
export type SeamStage =
  | { readonly kind: "screen"; readonly frame: Frame; readonly panels: readonly Panel[] }
  | { readonly kind: "terminal"; readonly frame: Frame; readonly page: TermPage }
  | { readonly kind: "exchange"; readonly frame: Frame; readonly panels: readonly Panel[]; readonly hooks: readonly Hook[] }
  | { readonly kind: "files"; readonly files: readonly StageFile[] }
  | { readonly kind: "context"; readonly rows: readonly ContextRow[]; readonly partsTitle: string; readonly parts: readonly RequestPart[] };

const session: Frame = { tabs: ["shop-api"], meta: "omp" };

const hookOf = (id: ComponentId, lang: Lang): Hook => {
  const art = componentArt[id][lang];
  if (art.kind !== "hook") throw new Error(`component \`${id}\` art is ${art.kind}, the stage needs its hook`);
  return art.hook;
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

/** The count the todo stop reminder names, so the card on screen matches the reminder the model receives. */
const openTodos = (lang: Lang): number => {
  const body = todoStopReminder(lang).body;
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

/**
 * omp-ask-more's full-screen page as the terminal draws it (omp-ask-more src/component.ts `render`, `#questionLines`,
 * `#staticText`, `#hints`), scrolled down past the question and brief: the cursor on the second option with its
 * tradeoff, the evidence the agent attached, and the countdown line of the shipped timeout policy
 * (src/timeout.ts `idleNotice`, package.json defaults 1800 s idle and 1200 s to return).
 */
const askTerminal = (lang: Lang): TermPage => {
  const en = lang === "en";
  const ask = askPanel(lang).data;
  const l = labels[lang].ask;
  const cursor = 1;
  const blank: TermLine = [];
  const option = (o: (typeof ask.options)[number], i: number): TermLine => [
    i === cursor ? { text: "› ", tone: "accent" } : { text: "  " },
    { text: "○ ", tone: "muted" },
    i === cursor ? { text: o.label, tone: "accent" } : { text: o.label },
    ...("recommended" in o && o.recommended ? [{ text: en ? " (recommended)" : "（推荐）", tone: "success" as const }] : []),
    { text: `  ${o.description}`, tone: "muted" },
  ];
  const picked = ask.options[cursor]!;
  const evidence = [
    "export const redis = createClient({ url: process.env.REDIS_URL });",
    "await redis.connect();",
    "",
    'export const sessionStore = new RedisStore({ client: redis, prefix: "sess:" });',
  ];
  return {
    title: ask.header,
    scrolled: true,
    lines: [
      ...ask.options.map(option),
      [{ text: "  " }, { text: "○ ", tone: "muted" }, { text: l.other }],
      blank,
      [{ text: `${l.tradeoff}  `, tone: "muted" }, { text: picked.tradeoff }],
      blank,
      [{ text: l.evidence, tone: "heading" }],
      [{ text: "src/session/store.ts:3-6", tone: "muted" }],
      [{ text: en ? "Login sessions already go through this Redis client." : "登录会话已经走这个 Redis 客户端。", tone: "muted" }],
      ...evidence.map((code, i): TermLine => [{ text: `${String(3 + i).padStart(4)}  `, tone: "dim" }, { text: code }]),
    ],
    status: en
      ? "No input for 30 min: you get notified, and 20 min later the model decides"
      : "无操作 30 分钟 后通知你，再过 20 分钟 交给模型决定",
    hint: en
      ? "↑↓ choose · enter answer · o other · pgup/pgdn scroll · ctrl+o code · esc cancel all"
      : "↑↓ 选择 · enter 作答 · o 其他 · pgup/pgdn 滚动 · ctrl+o 代码 · esc 全部取消",
  };
};

/**
 * One request of the demo session, part by part, with what put each part there (omp-config
 * agent/extensions/_shared/context-delta.ts delivery points; system-prompt-replace loads from extensions-last;
 * repo-rules sends `<path-scoped-rules>` with the result of the call that touched a matching file).
 */
const requestParts = {
  en: [
    { kind: "system", label: "system · SYSTEM_TEMPLATE.md", note: "Rendered once when the session starts" },
    { kind: "tools", label: "tools", note: "Tool definitions, fixed for the session" },
    { kind: "msg", label: "user", note: "Your request" },
    { kind: "delta", label: '<system-reminder source="omp-config/append-system-model">', note: "Added at agent start: a fragment matched the model and mode" },
    { kind: "delta", label: '<system-reminder source="omp-config/system-prompt-replace">', note: "Added at agent start, last of the extensions" },
    { kind: "msg", label: "read src/routes/webhooks.ts", note: "The agent's call and its result" },
    { kind: "delta", label: "<path-scoped-rules>", note: "Added with that result: the file matches a rule's paths" },
    { kind: "new", label: "new", note: "The only part the provider has not seen" },
  ],
  zh: [
    { kind: "system", label: "system · SYSTEM_TEMPLATE.md", note: "会话开始时渲染一次" },
    { kind: "tools", label: "tools", note: "工具定义，整个会话不变" },
    { kind: "msg", label: "user", note: "你的请求" },
    { kind: "delta", label: '<system-reminder source="omp-config/append-system-model">', note: "代理启动时追加：有片段匹配当前模型和模式" },
    { kind: "delta", label: '<system-reminder source="omp-config/system-prompt-replace">', note: "代理启动时追加，在所有扩展里最后加载" },
    { kind: "msg", label: "read src/routes/webhooks.ts", note: "代理的调用和返回结果" },
    { kind: "delta", label: "<path-scoped-rules>", note: "随这次结果追加：文件匹配了规则的 paths" },
    { kind: "new", label: "new", note: "服务商唯一没见过的部分" },
  ],
} as const satisfies Record<Lang, readonly RequestPart[]>;

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

/** Session titles in the shop-api scenario; a session is titled in the language its person writes. */
const sessionTitles = {
  en: { current: "Rate limiting for the public API", login: "Login sessions moved to Redis", orders: "Pagination for the orders route", docs: "Docs sweep" },
  zh: { current: "给公开 API 加限流", login: "登录会话改存 Redis", orders: "orders 路由分页", docs: "文档整理" },
} as const;

/** One session query from a Python eval cell (omp-sessions `session_query`, action `sql`), with the rows it returned. */
export const sessionQuery = (lang: Lang): Panel => {
  const t = sessionTitles[lang];
  return {
    kind: "sql",
    data: {
      language: "py",
      code: [
        '(await tool.session_query({"action": "sql", "query": """',
        "  SELECT title, assistant_turns FROM src.sessions",
        "  WHERE cwd LIKE '%shop-api%'",
        '  ORDER BY modified DESC LIMIT 3"""})).details',
      ],
      columns: ["title", "assistant_turns"],
      rows: [
        [t.current, 38],
        [t.login, 24],
        [t.orders, 17],
      ],
    },
  };
};

/** omp-peers' peer_list result (src/tools.ts): live omp processes and their main sessions. */
const peerList = (lang: Lang): TLine => {
  const t = sessionTitles[lang];
  return {
    kind: "call",
    tool: "peer_list",
    args: "",
    status: "ok",
    result: [
      "2 omp process(es) reachable through omp-peers, 2 main session(s):",
      "- pid 68412 (this process)",
      `  - b8d2c4f9 "${t.current}" — ~/code/shop-api — busy (you)`,
      "- pid 59307",
      `  - 9c1e77a2 "${t.docs}" — ~/code/handbook — idle`,
    ].join("\n"),
  };
};

/** delete-guard's non-literal refusal (guard.ts `reasonFor`, rule `nonLiteral`; posix.ts command-name detail). */
const nonLiteralCommand = "$RM -rf coverage";
const nonLiteralRefusal = `delete-guard: this call did not run. Non-literal command: \`${nonLiteralCommand}\` (the command name \`$RM\` comes from an expansion). Commands must be literal: no command name from a variable or substitution, no non-literal nested shell or eval script, no script fed to a shell through stdin; write the command out. To delete files, call the \`delete\` tool with literal paths and leave \`mode\` unset; the default moves them to the system trash.`;

/** tool-policy-nag's pty routing refusal for a command that never ends on its own (rule `tailFollow`). */
const ptyRefusal = "pty 路由：这次 `bash` 调用没有执行：`tail` 不会自己结束，或在等外部条件（open-ended，规则 `tailFollow`）。\nxd://exec_command";

/** task-completion-judge's return when the work is done but the worker's todo is not (index.ts:816-825, items per index.ts:730-734). */
const todoReturn = (lang: Lang): string => {
  const item = lang === "en" ? "Routes: Switch the search route — Same change as orders, with a higher limit" : "路由: 改 search 路由 — 改法同 orders，额度更高";
  return `完成度鉴定：这次任务已经完成，但你的 todo 里还有未完成的项，yield 被退回：\n- ${item}\n先维护 todo，让它反映真实进度，再调用 yield。`;
};

/** turn-judge's notification when a rule holds (index.ts `describeVerdict`): every question's probability, two decimals. */
const turnJudgeVerdict = (lang: Lang): { head: string; text: string } => {
  const parts = "says_remaining 0.94 · announces_future 0.88 · admits_mistake 0.03 · asks_user 0.02 · user_forbids_work 0.01 · external_blocker 0.02";
  return lang === "en"
    ? { head: "turn-judge gpt-talk-only: when.unfinished_with_plan", text: `(${parts})` }
    : { head: "turn-judge gpt-talk-only：when.unfinished_with_plan", text: `（${parts}）` };
};

export function seamStage(seam: SeamId, layer: Layer, lang: Lang): SeamStage {
  const en = lang === "en";
  switch (seam) {
    case "intent":
      switch (layer) {
        case "human":
          return { kind: "terminal", frame: session, page: askTerminal(lang) };
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
          return {
            kind: "files",
            files: en
              ? [taskTopics, isolationTopic]
              : [
                  {
                    ...taskTopics,
                    gloss: {
                      label: "译文",
                      text: "……Topics——调用前只读这次需要的那一篇：`tool://task/batch`，按模板派发多项或分波次派发之前；`tool://task/follow-up`，给已有的代理追加工作、发消息或读回结果之前；`tool://task/isolation`，设置 `isolated: true` 之前，或隔离项启动、合并失败之后；`tool://task/judge`，读一批短文本（标题、行、发现、摘要）只为对每条回答同一个固定问题或归类之前；`tool://task/limits`，规划大范围并发、嵌套委派或长时间运行的子代理之前。",
                    },
                  },
                  {
                    ...isolationTopic,
                    gloss: {
                      label: "译文",
                      text: "# 隔离执行：`isolated: true` 让这一项有自己的检出；不写或写 `false`，就在你的检出里运行。每一项各自设置。给隔离的子代理传仓库内的相对路径，并告诉它们你的检出里已经有哪些未提交的改动：它们从这份检出的快照起步。保持存活（idle/parked）的隔离代理保留自己的工作区，释放时记下最终的补丁或分支状态。",
                    },
                  },
                ],
          };
        case "silent":
          return {
            kind: "context",
            rows: prefixRows[lang],
            partsTitle: en ? "One request in this session, in order" : "这个会话里的一次请求，按先后排开",
            parts: requestParts[lang],
          };
      }
    case "memory":
      switch (layer) {
        case "human":
          return { kind: "screen", frame: { tabs: [en ? "Todo" : "待办"], meta: "Tern" }, panels: [panelOf("todo-panel", lang)] };
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  {
                    kind: "call",
                    tool: "todo",
                    args: en
                      ? 'DONE "Switch the orders route" "src/routes/orders.ts" "feat: orders route on the shared limiter"'
                      : 'DONE "改 orders 路由" "src/routes/orders.ts" "feat: orders 路由接入共用限流器"',
                    status: "ok",
                    // omp-todo-more src/tool.ts:632-637 and the summary of src/tool.ts:399-465, English only.
                    result: `Committed 9f31b20 "${en ? "feat: orders route on the shared limiter" : "feat: orders 路由接入共用限流器"}" (src/routes/orders.ts) in /home/dev/shop-api.\nOverall: 3/6 done, 3 open.`,
                    ...(en ? {} : { gloss: { label: "译文", text: "已提交 9f31b20（src/routes/orders.ts），仓库 /home/dev/shop-api。总计完成 3/6，还剩 3 项。" } }),
                  },
                  {
                    kind: "say",
                    text: en
                      ? "WebhooksRoute has already read the signature code, so I'll fork it instead of briefing a new worker."
                      : "WebhooksRoute 已经读过签名校验的代码，直接从它分出子代理，不用重写一份派工单。",
                  },
                  { kind: "call", tool: "fork_task", args: "from: WebhooksRoute · WebhooksFix", status: "running" },
                ],
              },
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
            hooks: [todoStopReminder(lang)],
          };
      }
    case "delegation":
      switch (layer) {
        case "human":
          // omp-config agent/extensions/subagent-usage/index.ts: `on` (249-255) starts calibrateInBackground (202-216),
          // whose notices are 203-207 and 170-180; `status` (285-287) prints showStatus (220-243).
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  { kind: "user", text: "/subagent-usage on" },
                  {
                    kind: "card",
                    tone: "info",
                    head: en
                      ? "subagent-usage: calibrating from this machine's sessions and usage history in the background…"
                      : "subagent-usage：正在后台用本机会话与用量历史校准…",
                  },
                  {
                    kind: "card",
                    tone: "info",
                    head: en
                      ? "subagent-usage: calibrated from 186 transcripts (186 read this time); 3 quota limits priced, 1 still pending."
                      : "subagent-usage：已用 186 个会话文件完成校准（本次读取 186 个）；3 个额度窗口可换算，1 个暂缺数据。",
                  },
                  { kind: "user", text: "/subagent-usage status" },
                  { kind: "card", tone: "info", head: fileOf("subagent-usage-cmd", lang).lines.join("\n") },
                ],
              },
            ],
          };
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  {
                    kind: "say",
                    text: en
                      ? "One route per worker, each in its own worktree. Steady reviews the webhook exemption without writing anything."
                      : "三个执行者各改一个路由、各用一个工作树；Steady 只读审查 webhook 免限流的做法。",
                  },
                ],
              },
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
            ],
          };
        case "silent":
          // The dispatch as the person watches it: two refused calls, then the one that runs. The refusal texts are the cells below.
          return {
            kind: "screen",
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
                  {
                    kind: "say",
                    text: en ? "All three write files, so each gets its own worktree." : "三个都要改文件，各给一个独立的工作树。",
                  },
                  {
                    kind: "call",
                    tool: "task",
                    args: `${workers.join(", ")} · task:low · isolated: true`,
                    status: "ok",
                    result: [`Spawned ${workers.length} background agents using task:low.`, ...workers.map((w) => `- \`${w}\` (job \`${w}\`)`)].join("\n"),
                  },
                ],
              },
            ],
          };
      }
    case "execution":
      switch (layer) {
        case "human": {
          // The view the grid cell shows, opened full-pane on the other session: the person's keys go to that terminal.
          const view = panelOf("terminals-hud", lang);
          if (view.kind !== "terminals") throw new Error("terminals-hud art is not the Terminals view");
          return {
            kind: "screen",
            frame: { tabs: [labels[lang].exec.terminals], meta: "Tern" },
            panels: [{ kind: "terminals", data: { ...view.data, mode: "page", selected: 2 } }],
          };
        }
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "transcript",
                lines: [
                  { kind: "call", tool: "write_stdin", args: '1, "a"', status: "ok" },
                  {
                    kind: "call",
                    tool: "delete",
                    args: "coverage",
                    status: "ok",
                    result: "delete (trash): all 1 done\nok     coverage: moved to /Users/dev/.Trash/coverage",
                  },
                  {
                    kind: "call",
                    tool: "wt",
                    args: 'branch: "wt/webhooks-route"',
                    status: "ok",
                    result:
                      "Queued: a new worktree on branch `wt/webhooks-route` is created once this turn ends. End your turn now without further tool calls; the outcome arrives as the next message.",
                    ...(en
                      ? {}
                      : { gloss: { label: "译文", text: "已排队：本回合结束后创建分支为 `wt/webhooks-route` 的新工作树。现在就结束本回合，不要再调用工具；结果作为下一条消息送达。" } }),
                  },
                ],
              },
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
                  { kind: "call", tool: "bash", args: nonLiteralCommand, status: "blocked" },
                  { kind: "call", tool: "bash", args: "tail -f logs/api.log", status: "blocked" },
                ],
              },
            ],
            hooks: [
              {
                kind: "block",
                source: "delete-guard",
                at: en ? "bash call" : "bash 调用前",
                label: en ? "refused" : "拦下",
                body: nonLiteralRefusal,
                gloss: en
                  ? undefined
                  : {
                      label: "译文",
                      text: `这次调用没有执行。命令不是字面写出的：\`${nonLiteralCommand}\`（命令名 \`$RM\` 来自变量展开）。命令必须原样写出：命令名不能来自变量或替换，嵌套的 shell 或 eval 脚本也要原样写出，不能经标准输入把脚本交给 shell。要删文件，用 \`delete\` 工具并写明路径，\`mode\` 不填，默认移进系统回收站。`,
                    },
              },
              {
                kind: "block",
                source: "tool-policy-nag",
                at: en ? "bash call" : "bash 调用前",
                label: en ? "refused" : "拦下",
                body: ptyRefusal,
                gloss: en
                  ? {
                      label: "Translation",
                      text: "pty routing: this `bash` call did not run: `tail` does not end on its own, or waits on an outside condition (open-ended, rule `tailFollow`).",
                    }
                  : undefined,
              },
            ],
          };
      }
    case "delivery":
      switch (layer) {
        case "human":
          // An earlier thinking block than the grid cell's, caught while its last line is still being translated.
          return {
            kind: "screen",
            frame: session,
            panels: [
              {
                kind: "thinking",
                data: {
                  block: 2,
                  thinking: [
                    "WebhooksRoute's yield came back: the signed-callback test still fails.",
                    "In src/routes/webhooks.ts the limiter runs before the signature check.",
                    "Move verifySignature ahead of rateLimit, then rerun webhooks.test.ts.",
                  ],
                  translated: ["WebhooksRoute 的 yield 被退回了：签名回调那个测试还是失败。", "src/routes/webhooks.ts 里，限流在签名校验之前执行。"],
                },
              },
            ],
          };
        case "agent":
          return {
            kind: "screen",
            frame: session,
            panels: [sessionQuery(lang), { kind: "transcript", lines: [peerList(lang)] }],
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
                  state: name === "SearchRoute" ? ("returned" as const) : ("done" as const),
                  stateText: name === "SearchRoute" ? (en ? "yield returned" : "yield 被退回") : en ? "done" : "完成",
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
                  { kind: "card", tone: "info", ...turnJudgeVerdict(lang) },
                ],
              },
            ],
            hooks: [
              {
                kind: "judge",
                source: "task-completion-judge",
                at: "yield",
                label: en ? "judged" : "裁决",
                body: todoReturn(lang),
                gloss: en
                  ? {
                      label: "Translation",
                      text: "Completion check: the task is done, but your todo still has unfinished items, so the yield is returned: - Routes: Switch the search route — Same change as orders, with a higher limit. Bring the todo up to date so it shows real progress, then call yield.",
                    }
                  : undefined,
              },
            ],
          };
      }
  }
}
