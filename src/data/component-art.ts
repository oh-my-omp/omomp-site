import type { Lang } from "../i18n";
import type { Art } from "../slices/Art";
import type { Hook } from "../slices/HookMessage";

/**
 * The art for every component on the seam page: the small interface slice above its name.
 * Every model-facing body, tool name, tag, command line, label and setting is quoted verbatim
 * from the component's own source (see the seam page notes); only scenario values — paths,
 * names, numbers — are filled in. Content follows the same shop-api rate-limiting scenario as
 * scenario.ts: shared-Redis token bucket, orders/search/webhooks routes, workers
 * OrdersRoute/SearchRoute/WebhooksRoute.
 */
export type ComponentId =
  | "ask-more-panel"
  | "input-polish"
  | "ask-tool"
  | "ask-readability"
  | "omp-modes"
  | "tool-topics"
  | "system-template"
  | "system-prompt-replace"
  | "append-system-model"
  | "repo-rules"
  | "todo-panel"
  | "todo-tool"
  | "fork-task"
  | "todo-reminders"
  | "model-compaction"
  | "subagent-usage-cmd"
  | "worker-tiers"
  | "advisors"
  | "subagent-usage-tool"
  | "user-prompt-inject"
  | "isolation-nudge"
  | "task-split-check"
  | "terminals-hud"
  | "watchdog-cmd"
  | "exec-tools"
  | "delete-tool"
  | "wt"
  | "delete-guard"
  | "tool-policy-nag"
  | "watchdog-agent"
  | "thinking-translator"
  | "omomp-lang"
  | "sessions"
  | "peers"
  | "task-completion-judge"
  | "turn-judge"
  | "lang-nag";

const userRequest = {
  en: "Add rate limiting to the public API: back it with Redis, count per API key, and answer 429 with Retry-After once a key runs out. Then switch the orders, search and webhooks routes over to it.",
  zh: "给公开 API 加限流：计数放 Redis，按 API key 算，额度用完返回 429 并带上 Retry-After。然后把 orders、search、webhooks 三个路由改成走这个中间件。",
} as const;

const askQuestion = {
  en: "Where should the rate limiter keep its per-key counters?",
  zh: "限流器按 key 计数的计数器放在哪里？",
} as const;

const askAnswer = {
  en: "Shared Redis, token bucket",
  zh: "共用的 Redis，令牌桶",
} as const;

const goal = {
  en: {
    objective: "Rate-limit the public API per API key with Redis, and move the three routes onto it",
    measure: "Requests past the limit get 429 with Retry-After; signed webhook callbacks are never limited; pnpm test passes",
    doneWhen: "Middleware and the three routes are committed on main with the full test suite green",
  },
  zh: {
    objective: "用 Redis 按 API key 给公开 API 限流，三个路由都改用它",
    measure: "超限请求拿到 429 和 Retry-After；带签名的 webhook 回调永远不限流；pnpm test 通过",
    doneWhen: "中间件和三个路由已提交到 main，完整测试套件全绿",
  },
} as const;

const items = {
  en: {
    bucket: { title: "Token bucket in Redis", explanation: "One Lua script refills and takes a token atomically", estimate: 40 },
    tests: { title: "Tests for refill and 429", explanation: "Cover the refill rate, the 429 body and Retry-After", estimate: 25 },
    orders: { title: "Switch the orders route", explanation: "Replace its hand-rolled counter with the middleware", estimate: 10 },
    search: { title: "Switch the search route", explanation: "Same change as orders, with a higher limit", estimate: 10 },
    webhooks: { title: "Exempt signed webhooks", explanation: "Skip the limiter once the provider signature verifies", estimate: 20 },
    verify: { title: "Run the full suite and commit", explanation: "pnpm test, then one commit per phase", estimate: 15 },
    phases: { middleware: "Middleware", routes: "Routes", verify: "Verify" },
  },
  zh: {
    bucket: { title: "Redis 令牌桶", explanation: "一段 Lua 脚本原子地补充和取用令牌", estimate: 40 },
    tests: { title: "令牌补充与 429 测试", explanation: "覆盖补充速率、429 响应体和 Retry-After", estimate: 25 },
    orders: { title: "改 orders 路由", explanation: "用中间件替换它自己写的计数器", estimate: 10 },
    search: { title: "改 search 路由", explanation: "改法同 orders，额度更高", estimate: 10 },
    webhooks: { title: "签名 webhook 免限流", explanation: "服务商签名校验通过后跳过限流", estimate: 20 },
    verify: { title: "跑完整测试并提交", explanation: "pnpm test，每个阶段一个提交", estimate: 15 },
    phases: { middleware: "中间件", routes: "路由", verify: "验证" },
  },
} as const;

const ruleBody = {
  en: "Payment-provider callbacks are verified by signature, not by API key. Never put key-based limits in front of them.",
  zh: "支付服务商的回调靠签名校验，不靠 API key。不要在它们前面加按 key 计数的限流。",
} as const;

const turnJudgePrompt =
  "你停下了，但交代的工作还没做完。不要只宣布下一步或认错：现在就用工具继续做，直到有可验证的结果。确实被阻塞时，先做完所有能做的部分，再说明试过什么、缺的具体前置条件是什么。";

const askRejected = {
  en: [
    "ask rejected:",
    `- question "storage" is hard to understand for a reader who sees only this dialog and has never seen your session or this project; rewrite every item below so each sentence says who does what, each abbreviation is spelled out, and each name, number or earlier decision is said in plain words:`,
    `  - "Per #212, should RL keep the shared cluster or go in-proc like v1?": it uses a word, abbreviation, name or number the dialog never explains`,
    "…",
  ].join("\n"),
  zh: [
    "ask rejected:",
    `- question "storage" is hard to understand for a reader who sees only this dialog and has never seen your session or this project; rewrite every item below so each sentence says who does what, each abbreviation is spelled out, and each name, number or earlier decision is said in plain words:`,
    `  - "按 #212 的结论，RL 继续用共享集群，还是像 v1 那样放进程内？": it uses a word, abbreviation, name or number the dialog never explains`,
    "…",
  ].join("\n"),
} as const;

const userGoalInject = (lang: Lang): string =>
  [
    '<user-prompt-inject name="user-goal">',
    "These are the human user's own requests to the root session, verbatim and in order, oldest first.",
    `<user_prompt index="0">${userRequest[lang]}</user_prompt>`,
    "…",
    "</user-prompt-inject>",
  ].join("\n");

const isolationNudge = [
  "Not dispatched — a reminder, not a rule. This call would leave write-capable agents sharing this working directory without isolation: `OrdersRoute`, `SearchRoute`, `WebhooksRoute`. Agents sharing a checkout can overwrite each other's work.",
  "Re-dispatch the writers with `isolated: true`. For an item that only researches, set `isolated: false` to keep it shared.",
  "Each prompt is reminded once: re-dispatching these same prompts unchanged runs them as written.",
].join("\n");

const splitCheck =
  "你没有好好规划任务：`RoutesAll` 把多个主题塞给了一个 agent，按主题拆成多个 item 后重新派发；确认是单一主题的项可以原样重新派发，第二次直接放行。";

const pathRules = (lang: Lang): string =>
  [
    "<path-scoped-rules>",
    "Rules whose `paths` match a file this call touched (src/routes/webhooks.ts). Follow them whenever you work with files they match.",
    '<path-scoped-rule path="/home/dev/shop-api/.omp/rules/webhooks.md" paths="src/routes/**">',
    ruleBody[lang],
    "</path-scoped-rule>",
    "</path-scoped-rules>",
  ].join("\n");

/**
 * omp-todo-more src/reminders.ts:416-431: the stop reminder after the middleware phase closed, four items open.
 * Items past the first and the goal's last two lines are elided.
 */
const todoReminder = (lang: Lang): string => {
  const i = items[lang];
  return [
    "<system-reminder>",
    "You stopped with 4 incomplete todo item(s):",
    `- ${i.phases.routes}`,
    `  - ${i.orders.title}`,
    `    ${i.orders.explanation}`,
    `    Estimate: ${i.orders.estimate} min`,
    "  - …",
    "",
    "Goal:",
    `  Objective: ${goal[lang].objective}`,
    "  …",
    "",
    "Please continue working on these tasks or mark them complete if finished.",
    "(Reminder 1/3)",
    "</system-reminder>",
  ].join("\n");
};

/** The stop reminder as the model receives it at turn end; the seam page's memory stage shows it beside the card the person sees. */
export const todoStopReminder = (lang: Lang): Hook =>
  lang === "en"
    ? { kind: "reminder", source: "omp-todo-more", at: "turn end", label: "appended", body: todoReminder("en") }
    : {
        kind: "reminder",
        source: "omp-todo-more",
        at: "回合结束",
        label: "追加",
        body: todoReminder("zh"),
        gloss: {
          label: "译文",
          text: `你停下时还有 4 个待办没完成：${items.zh.phases.routes}阶段的“${items.zh.orders.title}”，${items.zh.orders.explanation}，估时 ${items.zh.orders.estimate} 分钟；其余几项这里从略。目标：${goal.zh.objective}；后两行从略。请继续做这些任务；已经做完的，标记为完成。（提醒 1/3）`,
        },
      };

/** omp-todo-more src/overtime.ts:38-45: the warning once an in-progress item runs past its estimate; the third line is elided. */
const overtimeWarning = (lang: Lang): string =>
  [
    '<system-reminder source="todo-more" kind="overtime">',
    `Todo item "${items[lang].tests.title}" has exceeded its estimated time: estimate ${items[lang].tests.estimate} min; elapsed 31.40 min of in_progress wall time.`,
    "The estimate is a forecast, not a deadline or permission to reduce scope. Do not lower the expected outcome, acceptance criteria, or quality, and do not stop because of this warning.",
    "…",
    "Keep the todo aligned with actual progress. Do not reset the list or inflate an estimate just to hide an overrun.",
    "</system-reminder>",
  ].join("\n");

/** omp-config agent/extensions/fork-task/index.ts:262-281: the notice appended to the copied transcript of a child forked `from` another agent. */
const forkNotice = [
  '<system-notice cause="fork_task">',
  "Above: the conversation of agent `WebhooksRoute`, copied as background. You continue under its system prompt and tools, but `WebhooksRoute` is not your parent: the agent that spawned you receives your result. The parent keeps the conversation with the user. A <role> block opening the assignment defines how you work on it. Deliver your result with `yield` when available, otherwise finish with your final report.",
  "- Use it only for the facts, decisions, and constraints it established.",
  "…",
  "</system-notice>",
].join("\n");

/** omp-todo-more src/ctx/inventory.ts:1551-1568: `ctx show` for a finished worker; the handoff is the worker's own report. */
const ctxShow = (handoff: string): string =>
  [
    "# Context OrdersRoute",
    "",
    "Breadcrumb: Main > OrdersRoute",
    "",
    "## Handoff",
    "",
    handoff,
    "",
    "## Tasks",
    "",
    "(none)",
    "",
    "Transcript: history://OrdersRoute",
  ].join("\n");

/** The OrdersRoute worker's report, in the language the session runs in. */
const ordersHandoff = {
  en: "Done. src/routes/orders.ts now calls the limiter from src/middleware/rate-limit.ts; orders.test.ts passes (4 tests). Changed: src/routes/orders.ts.",
  zh: "已完成。src/routes/orders.ts 改用 src/middleware/rate-limit.ts 的限流器；orders.test.ts 通过（4 个测试）。改动文件：src/routes/orders.ts。",
} as const;

const deleteGuard =
  "delete-guard: deletion commands are disabled; this call did not run. Deletion command: `rm -rf node_modules/.vite/vitest` (`rm` deletes files). To delete files, call the `delete` tool with literal paths and leave `mode` unset; the default moves them to the system trash.";

/** tool-policy-nag's intent reminder (intent.ts `intentReminder`) for a shell call judged as editing an existing file. */
const intentReminder = [
  "你这次 `bash` 调用属于「修改已有文件」，应该用 `edit`，而不是这样绕出去。",
  "",
  "这次调用：",
  "```sh",
  "sed -i 's/limit: 100/limit: 300/' src/routes/search.ts",
  "```",
].join("\n");

/** omp-unified-exec's exec_command result for a command still running when the call returns. */
const execCommandResult = [
  "[still running]",
  "session_id: 1",
  "…",
  "---",
  " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms",
  " ✗ src/routes/webhooks.test.ts > signed callbacks skip the limiter",
  "…",
];

/**
 * A watchdog that is off globally, switched on for this session (watchdog-agent runtime.ts:599-602),
 * then the line `/watchdog list` prints for it (runtime.ts:413-424).
 */
const watchdogCommand = {
  en: [
    "/watchdog on RateLimitChecks",
    'watchdog "RateLimitChecks" on for this session',
    "",
    "/watchdog list",
    "RateLimitChecks: ON · global off · session on · target main · cwd any · inject system · every 30 · scope full · chat @advisor",
    "  ~/code/shop-api/.omp/WATCHDOG-RateLimitChecks.md",
  ],
  zh: [
    "/watchdog on RateLimitChecks",
    "watchdog“RateLimitChecks”已在本会话开启",
    "",
    "/watchdog list",
    "RateLimitChecks: 开启 · 全局 关闭 · 会话 开启 · target main · cwd 不限 · inject system · 每 30 · 范围 全部 · 聊天 @advisor",
    "  ~/code/shop-api/.omp/WATCHDOG-RateLimitChecks.md",
  ],
} as const;

const subagentUsageReport =
  "subagent_usage at 2026-11-09 06:12 UTC. Per-dispatch averages from 2026-11-08 22:10; quota conversion from 2026-11-09 06:00 over the preceding 21 days.\n…\nPOOL opencode-go: shared quota, do not add these counts\n  - task:low (deepseek-v4.1-flash): about 34 dispatches. $0.0430 per dispatch (average of 6 dispatches in this project in the last 21 days). $1.46 quota left on 1 of 1 account; tightest hourly 41% left, resets in 38m.\n…";

const promptReplace =
  "<system-reminder source=\"omp-config/system-prompt-replace\">\n" +
  "OMP's system prompt keeps its original text. In this session, read it with these edits, applied in the order listed:\n" +
  "The passage\n<original>\nNo TODO tracking, no progress updates.\n</original>\ndoes not apply in this session.\n…\n" +
  "</system-reminder>";

const appendSystemModel =
  "<system-reminder source=\"omp-config/append-system-model\">\n" +
  "# Mandatory decision support\n" +
  "This section is a default: an explicit user instruction overrides only the rules and scope it names.\n" +
  "For a consequential decision, consult both `discuss:steady` and `discuss:divergent` on the actual proposal, relevant code and decision. Their positions inform the decision; they do not own it.\n" +
  "…\n" +
  "</system-reminder>";

const watchdogNote =
  '<watchdog name="RateLimitChecks" severity="concern">\n' +
  "src/middleware/rate-limit.ts:62 counts signed payment callbacks against the API-key bucket; per .omp/rules/webhooks.md they must be exempted once the signature verifies. A caller can currently be 429'd.\n" +
  "</watchdog>";

const completionJudgeBody =
  "完成度鉴定：对照最初的任务和你最近的 tool call，这次任务还没有真正完成，yield 被退回。\nwebhooks.test.ts 里的 “signed callbacks skip the limiter” 仍然失败（期望 200，实际 429），改完之后也没有重新跑这个测试。\n补完缺失的部分并实际验证后再 yield。之后不会再因完成度退回。";

/** The decision the agent asks for in the demo, as omp-ask-more's Tern sheet shows it; the intent stage draws the same question in the terminal. */
export const askPanel = (lang: Lang) =>
  ({
    kind: "ask",
    data: {
      header: lang === "en" ? "Counter storage" : "计数器存放位置",
      question: askQuestion[lang],
      where:
        lang === "en"
          ? "shop-api runs as four instances behind one load balancer, all sharing one Redis for login sessions."
          : "shop-api 在一个负载均衡后面跑四个实例，四台已经共用一台 Redis 存登录会话。",
      what:
        lang === "en"
          ? "Whether request counters live in shared Redis or per-instance memory, and how a key's allowance refills."
          : "请求计数放共用 Redis 还是各实例自己的内存，以及每个 key 的额度怎样恢复。",
      how:
        lang === "en"
          ? "src/middleware/rate-limit.ts is written for your choice; the three routes then switch over."
          : "src/middleware/rate-limit.ts 按你的选择来写，之后三个路由改用它。",
      options: [
        {
          label: askAnswer[lang],
          description: lang === "en" ? "One bucket per API key, refilled continuously" : "每个 API key 一个桶，持续补充",
          tradeoff:
            lang === "en"
              ? "Exact across all four instances and smooth at minute boundaries; every request makes one Redis call."
              : "四个实例算同一笔账，分钟交界也平滑；每个请求多一次 Redis 调用。",
          holdsWhen: lang === "en" ? "Redis stays reachable, as it already must for login sessions." : "Redis 保持可用；登录会话本来就依赖它。",
          cost: lang === "en" ? "One Lua script and one Redis call per request." : "一段 Lua 脚本，每个请求一次 Redis 调用。",
          recommended: true,
        },
        {
          label: lang === "en" ? "Shared Redis, fixed window" : "共用的 Redis，固定窗口",
          description: lang === "en" ? "One counter per key per minute" : "每个 key 每分钟一个计数器",
          tradeoff:
            lang === "en"
              ? "Simplest to write and to read; a client can send twice the limit across a minute boundary."
              : "最好写也最好懂；客户端可以在分钟交界前后各打满一次。",
        },
        {
          label: lang === "en" ? "Memory in each instance" : "各实例自己的内存",
          description: lang === "en" ? "No Redis call" : "不访问 Redis",
          tradeoff:
            lang === "en" ? "No added latency; the real limit is four times the configured one." : "不增加延迟；实际额度是配置值的四倍。",
        },
      ],
      cursor: 0,
    },
  }) as const;

const todoPanel = (lang: Lang) =>
  ({
    kind: "todo",
    data: {
      ...goal[lang],
      phases: [
        {
          name: items[lang].phases.middleware,
          items: [
            { ...items[lang].bucket, status: "done", commit: { sha: "a41c9e2", message: "feat: Redis token-bucket rate limiter" } },
            { ...items[lang].tests, status: "active" },
          ],
        },
        {
          name: items[lang].phases.routes,
          items: [
            { ...items[lang].orders, status: "pending" },
            { ...items[lang].search, status: "pending" },
            { ...items[lang].webhooks, status: "pending" },
          ],
        },
        { name: items[lang].phases.verify, items: [{ ...items[lang].verify, status: "pending" }] },
      ],
    },
  }) as const;

const terminalsPanel = (lang: Lang) =>
  ({
    kind: "terminals",
    data: {
      mode: "view",
      selected: 1,
      sessions: [
        {
          id: 1,
          title: "pnpm test --watch",
          command: "pnpm test --watch",
          state: "running",
          elapsed: lang === "en" ? "4m12s" : "4分12秒",
          cwd: "~/code/shop-api",
          size: "120×32",
          screen: [
            { text: " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms" },
            { text: " ✓ src/routes/orders.test.ts (4 tests) 18ms" },
            { text: " ✗ src/routes/webhooks.test.ts > signed callbacks skip the limiter" },
            { text: "   AssertionError: expected 429 to be 200" },
            { text: "" },
            { text: " Tests  1 failed | 15 passed (16)" },
            { text: " Waiting for file changes..." },
            { text: "p", by: "you" },
            { text: " ? Input filename pattern › webhooks", by: "you" },
          ],
        },
        {
          id: 2,
          title: "redis-cli monitor",
          command: "redis-cli monitor",
          state: "running",
          elapsed: lang === "en" ? "3m58s" : "3分58秒",
          cwd: "~/code/shop-api",
          size: "120×32",
          screen: [
            { text: '1731161420.118 [0 127.0.0.1:52144] "EVALSHA" "9f2c41d0" "1" "rl:key_live_7Q" "100" "1.67"' },
            { text: '1731161420.164 [0 127.0.0.1:52144] "EVALSHA" "9f2c41d0" "1" "rl:key_live_7Q" "100" "1.67"' },
            { text: '1731161421.009 [0 127.0.0.1:52151] "EVALSHA" "9f2c41d0" "1" "rl:key_test_k2" "100" "1.67"' },
          ],
        },
      ],
    },
}) as const;

/**
 * omp-sessions at work: an older shop-api session read through its URL (render.ts `renderTimeline`: header lines, then
 * a turn header and its events). The renderer writes English; the session's title and prompt are in the person's language.
 */
const pastTimeline = (lang: Lang) => {
  const en = lang === "en";
  return [
    "session 3f61d0b7-… · ~/code/shop-api",
    `title ${en ? "Signature check for payment webhooks" : "支付 webhook 签名校验"}`,
    "start 2026-10-21 10:12:40 +08:00 · 186 entries · 171 on the active branch (leaf #c4a)",
    "…",
    "── turn 1 · 2026-10-21 10:12:40→10:58:03 (45m23s) · 31 calls (read×12 edit×8 bash×7 todo×4)",
    "10:12:40 user #0a3",
    `  ${en ? "Verify the payment provider's signature on webhook callbacks before handling them." : "处理 webhook 回调前，先校验支付服务商的签名。"}`,
    "…",
  ];
};

const thinkingPanel = {
    kind: "thinking",
    data: {
      block: 3,
      thinking: [
        "All 16 tests pass, including the signed-webhook case.",
        "One commit per phase, so the middleware can be reverted on its own.",
        "Report the 429 behaviour with the test names as evidence.",
      ],
      translated: [
        "16 个测试全部通过，包括签名 webhook 那个用例。",
        "每个阶段一个提交，这样中间件可以单独回滚。",
        "汇报 429 的行为时，把测试名作为证据列出来。",
      ],
    },
} as const;

export const componentArt: Record<ComponentId, Record<Lang, Art>> = {
  // intent
  "ask-more-panel": {
    en: { kind: "panel", panel: askPanel("en") },
    zh: { kind: "panel", panel: askPanel("zh") },
  },
  "input-polish": {
    en: {
      kind: "code",
      title: "Polish preview",
      lines: [
        "Back the public API with Redis rate limiting, count each",
        "API key honestly, return a real 429 with Retry-After, and",
        "switch orders, search and webhooks onto it for good.",
        "Enter to send polished text · Esc to cancel and keep original",
      ],
    },
    zh: {
      kind: "code",
      title: "润色预览",
      lines: [
        "给公开 API 装上 Redis 限流：每个 API key 都老老实实计数，",
        "超了就干脆回 429 带上 Retry-After，再把 orders、search、",
        "webhooks 三个路由一次性全部切过去。",
        "Enter 发送润色稿 · Esc 取消，保留原文",
      ],
    },
  },
  "ask-tool": {
    en: {
      kind: "lines",
      lines: [
        { kind: "call", tool: "ask", args: 'storage · "Where should the rate limiter keep its per-key counters?"', status: "ok", result: `User answers:\nstorage: ${askAnswer.en}` },
      ],
    },
    zh: {
      kind: "lines",
      lines: [
        { kind: "call", tool: "ask", args: "storage · “限流器按 key 计数的计数器放在哪里？”", status: "ok", result: `User answers:\nstorage: ${askAnswer.zh}` },
      ],
    },
  },
  "ask-readability": {
    en: {
      kind: "hook",
      hook: {
        kind: "block",
        source: "omp-ask-more · readability",
        at: "ask result",
        label: "sent back",
        body: askRejected.en,
      },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "block",
        source: "omp-ask-more · readability",
        at: "ask 返回",
        label: "退回",
        body: askRejected.zh,
        gloss: {
          label: "译文",
          text: "退回 ask：问题 “storage” 对只看得到这个对话框、从没见过你的会话和这个项目的读者来说很难看懂。逐条改写下面各项，让每句话都说清谁做什么，缩写写全，名称、编号和之前的决定都用平白的话说出来：“按 #212 的结论，RL 继续用共享集群，还是像 v1 那样放进程内？”用了对话框里从没解释过的词、缩写、名称或编号；其余几条从略。",
        },
      },
    },
  },
  // prompt
  "omp-modes": {
    en: {
      kind: "code",
      title: "README.md · shell commands",
      lines: ["# full mode", "omp", "", "# light mode (config-light.yml)", "omp-light"],
    },
    zh: {
      kind: "code",
      title: "README.md · shell commands",
      lines: ["# 完整模式", "omp", "", "# 轻量模式（config-light.yml）", "omp-light"],
    },
  },
  "tool-topics": {
    en: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "read",
          args: "tool://ast_grep/patterns",
          status: "ok",
          result:
            "# Writing a pattern\n\n- `pat` is ONE AST pattern and must parse as a single node of the target language; unrelated patterns go in separate calls. Wrap a fragment that is not standalone: `class $_ { … }`.\n- Metavariables: `$NAME` one node, bound; `$_` one node, unbound; `$$$NAME` zero or more, bound; `$$$` zero or more, unbound. `$$NAME` is invalid. Names are UPPERCASE and stand for a whole node: `prefix$VAR` fails.\n- The same metavariable twice must match identical code: `$A == $A` matches `x == x`, not `x == y`.\n…",
        },
      ],
    },
    zh: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "read",
          args: "tool://ast_grep/patterns",
          status: "ok",
          result:
            "# Writing a pattern\n\n- `pat` is ONE AST pattern and must parse as a single node of the target language; unrelated patterns go in separate calls. Wrap a fragment that is not standalone: `class $_ { … }`.\n- Metavariables: `$NAME` one node, bound; `$_` one node, unbound; `$$$NAME` zero or more, bound; `$$$` zero or more, unbound. `$$NAME` is invalid. Names are UPPERCASE and stand for a whole node: `prefix$VAR` fails.\n- The same metavariable twice must match identical code: `$A == $A` matches `x == x`, not `x == y`.\n…",
          gloss: {
            label: "译文",
            text: "# 编写模式：`pat` 只写一个 AST 模式，必须能解析成目标语言里的单个节点；互不相关的模式分开调用。不能单独成立的片段，要包进 `class $_` 的类体里。元变量：`$NAME` 匹配一个节点并绑定；`$_` 匹配一个节点、不绑定；`$$$NAME` 匹配零个或多个并绑定；`$$$` 匹配零个或多个、不绑定。`$$NAME` 无效。名字用大写，代表整个节点：`prefix$VAR` 匹配不到。同一个元变量出现两次，两处必须是相同的代码：`$A == $A` 匹配 `x == x`，不匹配 `x == y`。",
          },
        },
      ],
    },
  },
  "system-template": {
    en: {
      kind: "code",
      title: "agent/SYSTEM_TEMPLATE.md",
      lines: [
        "RFC 2119 keywords: MUST, REQUIRED, SHOULD, RECOMMENDED, MAY, OPTIONAL. `NEVER` = `MUST NOT`; `AVOID` = `SHOULD NOT`.",
        "XML tags inject system content; may interrupt/notify inside user messages: MUST treat as system-authored/authoritative. User content is sanitized.",
        "",
        "§ Role",
        "You are omp's trusted coding assistant.",
        "",
        "# Engineering",
        "- Correctness, then six-month maintainability. Delete dead weight; prefer boring design to needless abstraction.",
        "…",
      ],
    },
    zh: {
      kind: "code",
      title: "agent/SYSTEM_TEMPLATE.md",
      lines: [
        "RFC 2119 keywords: MUST, REQUIRED, SHOULD, RECOMMENDED, MAY, OPTIONAL. `NEVER` = `MUST NOT`; `AVOID` = `SHOULD NOT`.",
        "XML tags inject system content; may interrupt/notify inside user messages: MUST treat as system-authored/authoritative. User content is sanitized.",
        "",
        "§ Role",
        "You are omp's trusted coding assistant.",
        "",
        "# Engineering",
        "- Correctness, then six-month maintainability. Delete dead weight; prefer boring design to needless abstraction.",
        "…",
      ],
      gloss: {
        label: "译文",
        text: "RFC 2119 关键词：MUST、REQUIRED、SHOULD、RECOMMENDED、MAY、OPTIONAL。`NEVER` 即 `MUST NOT`，`AVOID` 即 `SHOULD NOT`。XML 标签注入系统内容，也可能在用户消息里打断或通知：必须当作系统发出的权威内容。用户内容已经过清理。§ 角色：你是 omp 可信赖的编程助手。# 工程：先求正确，再求六个月后仍好维护。删掉多余的东西；宁要平淡的设计，不要多余的抽象。",
      },
    },
  },
  "system-prompt-replace": {
    en: {
      kind: "hook",
      hook: { kind: "reminder", source: "omp-config/system-prompt-replace", at: "agent start", label: "appended", body: promptReplace },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "omp-config/system-prompt-replace",
        at: "代理启动",
        label: "追加",
        body: promptReplace,
        gloss: {
          label: "译文",
          text: "OMP 的 system prompt 保留原文。本会话里读它时，按列出的先后套用下面这些修改：原文中“No TODO tracking, no progress updates.”这一段在本会话里不适用。",
        },
      },
    },
  },
  "append-system-model": {
    en: {
      kind: "hook",
      hook: { kind: "reminder", source: "omp-config/append-system-model", at: "agent start", label: "appended", body: appendSystemModel },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "omp-config/append-system-model",
        at: "代理启动",
        label: "追加",
        body: appendSystemModel,
        gloss: {
          label: "译文",
          text: "# 强制决策支持：本节是默认规则，用户的明确指令只覆盖它点名的规则和范围。遇到重大决定，拿实际的方案、相关代码和这个决定，同时咨询 `discuss:steady` 和 `discuss:divergent`。它们的意见为决定提供依据，决定权不在它们。",
        },
      },
    },
  },
  "repo-rules": {
    en: {
      kind: "hook",
      hook: { kind: "reminder", source: "omp-config/repo-rules", at: "after read", label: "appended", body: pathRules("en") },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "omp-config/repo-rules",
        at: "read 之后",
        label: "追加",
        body: pathRules("zh"),
        gloss: { label: "译文", text: "这次调用碰到的文件（src/routes/webhooks.ts）匹配了这些规则的 `paths`。处理匹配的文件时都要遵守。" },
      },
    },
  },
  // memory
  "todo-panel": {
    en: { kind: "panel", panel: todoPanel("en") },
    zh: { kind: "panel", panel: todoPanel("zh") },
  },
  "todo-tool": {
    en: {
      kind: "lines",
      lines: [{ kind: "call", tool: "ctx", args: "op: show · id: OrdersRoute", status: "ok", result: ctxShow(ordersHandoff.en) }],
    },
    zh: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "ctx",
          args: "op: show · id: OrdersRoute",
          status: "ok",
          result: ctxShow(ordersHandoff.zh),
          gloss: { label: "译文", text: "上下文 OrdersRoute。层级：Main > OrdersRoute。交接：子代理自己写的报告，原文照录。任务：无。完整记录：history://OrdersRoute。" },
        },
      ],
    },
  },
  "fork-task": {
    en: {
      kind: "hook",
      hook: { kind: "reminder", source: "fork_task", at: "child's first turn", label: "appended", body: forkNotice },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "fork_task",
        at: "子代理第一轮",
        label: "追加",
        body: forkNotice,
        gloss: {
          label: "译文",
          text: "上面是代理 `WebhooksRoute` 的对话，作为背景复制过来。你沿用它的系统提示词和工具，但它不是你的上级，派生你的代理才接收你的结果。上级继续和用户对话；任务开头的 <role> 块规定你的做法；有 `yield` 就用它交付，否则以最终报告结束。这段对话只用来提供它已确立的事实、决定和约束。",
        },
      },
    },
  },
  "todo-reminders": {
    en: {
      kind: "hook",
      hook: { kind: "reminder", source: "omp-todo-more", at: "past an estimate", label: "appended", body: overtimeWarning("en") },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "omp-todo-more",
        at: "超出估时",
        label: "追加",
        body: overtimeWarning("zh"),
        gloss: {
          label: "译文",
          text: "待办“令牌补充与 429 测试”超出了估时：估计 25 分钟，进行中已用 31.40 分钟。估时是预测，不是期限，也不是缩小范围的许可：不要降低预期结果、验收标准或质量，也不要因为这条提醒停下。……让待办与实际进度一致，不要为掩盖超时而重置清单或抬高估时。",
        },
      },
    },
  },
  "model-compaction": {
    en: {
      kind: "code",
      title: "COMPACTION-Opus.md",
      lines: ["---", "provider: ^anthropic$", "model: opus", "thresholdTokens: 150000", "---"],
    },
    zh: {
      kind: "code",
      title: "COMPACTION-Opus.md",
      lines: ["---", "provider: ^anthropic$", "model: opus", "thresholdTokens: 150000", "---"],
    },
  },
  // delegation
  "subagent-usage-cmd": {
    en: {
      kind: "code",
      title: "/subagent-usage status",
      lines: [
        "subagent-usage: enabled; per-dispatch averages 2026-11-08T22:10:00.000Z, quota 2026-11-09T06:00:00.000Z: 3 limits priced, 1 pending (~/.omp/agent/subagent-usage/calibration.json)",
      ],
    },
    zh: {
      kind: "code",
      title: "/subagent-usage status",
      lines: [
        "subagent-usage: 已开启；单次派发均值 2026-11-08T22:10:00.000Z，额度换算 2026-11-09T06:00:00.000Z：3 个窗口可换算，1 个暂缺（~/.omp/agent/subagent-usage/calibration.json）",
      ],
    },
  },
  "worker-tiers": {
    en: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "task",
          args: "OrdersRoute · task:low · isolated: true",
          status: "ok",
          result:
            "Done. src/routes/orders.ts now calls the limiter from src/middleware/rate-limit.ts; orders.test.ts passes (4 tests). Changed: src/routes/orders.ts.",
        },
        { kind: "call", tool: "task", args: "SearchRoute · task:low · isolated: true", status: "running" },
        { kind: "call", tool: "task", args: "WebhooksRoute · task:low · isolated: true", status: "running" },
      ],
    },
    zh: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "task",
          args: "OrdersRoute · task:low · isolated: true",
          status: "ok",
          result: "已完成。src/routes/orders.ts 改用 src/middleware/rate-limit.ts 的限流器；orders.test.ts 通过（4 个测试）。改动文件：src/routes/orders.ts。",
        },
        { kind: "call", tool: "task", args: "SearchRoute · task:low · isolated: true", status: "running" },
        { kind: "call", tool: "task", args: "WebhooksRoute · task:low · isolated: true", status: "running" },
      ],
    },
  },
  advisors: {
    en: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "task",
          args: 'Steady · discuss:steady · "is skipping the limiter for signed webhooks safe?"',
          status: "ok",
          result:
            "Safe only if verification happens before the bucket: the provider signature must be checked on the raw body before the limiter runs, and an unverifiable signature should count against the key, not pass for free.",
        },
      ],
    },
    zh: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "task",
          args: "Steady · discuss:steady · “签名 webhook 跳过限流安全吗？”",
          status: "ok",
          result:
            "前提成立才安全：服务商签名必须在进入计数桶之前、对原始请求体完成校验；校验不过的签名应该按 API key 计满额度，而不是免费放行。",
        },
      ],
    },
  },
  "subagent-usage-tool": {
    en: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "subagent_usage",
          args: "",
          status: "ok",
          result: subagentUsageReport,
        },
      ],
    },
    zh: {
      kind: "lines",
      lines: [
        {
          kind: "call",
          tool: "subagent_usage",
          args: "",
          status: "ok",
          result: subagentUsageReport,
          gloss: {
            label: "译文",
            text: "subagent_usage 报告，生成于 2026-11-09 06:12 UTC。单次派发均值从 2026-11-08 22:10 起算；额度换算取 2026-11-09 06:00 之前 21 天。opencode-go 池：额度共用，各档次数不要相加。task:low（deepseek-v4.1-flash）：约可再派 34 次，每次 $0.0430（本项目近 21 天 6 次派发的均值）；剩余额度 $1.46（1 个账号中有 1 个可用），最紧的小时窗口剩 41%，38 分钟后重置。",
          },
        },
      ],
    },
  },
  "user-prompt-inject": {
    en: {
      kind: "hook",
      hook: { kind: "reminder", source: "user-prompt-inject", at: "each advisor model call", label: "appended", body: userGoalInject("en") },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "user-prompt-inject",
        at: "顾问每次调用模型",
        label: "追加",
        body: userGoalInject("zh"),
        gloss: {
          label: "译文",
          text: "以下是人类用户给根会话的原话，逐字照录，按先后排列，最早的在前。",
        },
      },
    },
  },
  "isolation-nudge": {
    en: {
      kind: "hook",
      hook: { kind: "block", source: "isolation-nudge", at: "task call", label: "refused", body: isolationNudge },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "block",
        source: "isolation-nudge",
        at: "task 调用前",
        label: "拦下",
        body: isolationNudge,
        gloss: {
          label: "译文",
          text: "没有派发——这是提醒，不是规定。这次调用会让几个能写文件的代理不加隔离地共用这个工作目录：`OrdersRoute`、`SearchRoute`、`WebhooksRoute`。共用同一个检出的代理可能互相覆盖对方的改动。给写文件的代理加上 `isolated: true` 重新派发；只做调研的项设 `isolated: false`，保持共用。每段提示词只提醒一次：原样重新派发同样的提示词，就照写的执行。",
        },
      },
    },
  },
  "task-split-check": {
    en: {
      kind: "hook",
      hook: {
        kind: "block",
        source: "task-split-check",
        at: "task call",
        label: "refused",
        body: splitCheck,
        gloss: {
          label: "Translation",
          text: "You did not plan the work well: `RoutesAll` crams several topics into one agent; split it into one item per topic and dispatch again. An item confirmed to be a single topic may be re-sent unchanged — it passes on the second attempt.",
        },
      },
    },
    zh: {
      kind: "hook",
      hook: { kind: "block", source: "task-split-check", at: "task 调用前", label: "拦下", body: splitCheck },
    },
  },
  // execution
  "terminals-hud": {
    en: { kind: "panel", panel: terminalsPanel("en") },
    zh: { kind: "panel", panel: terminalsPanel("zh") },
  },
  "watchdog-cmd": {
    en: { kind: "code", title: "/watchdog", lines: watchdogCommand.en },
    zh: { kind: "code", title: "/watchdog", lines: watchdogCommand.zh },
  },
  "exec-tools": {
    en: { kind: "code", title: "exec_command", lines: ['cmd: "pnpm test --watch"', 'title: "pnpm test --watch"', "", ...execCommandResult] },
    zh: { kind: "code", title: "exec_command", lines: ['cmd: "pnpm test --watch"', 'title: "pnpm test --watch"', "", ...execCommandResult] },
  },
  /** A path the delete tool refuses before touching anything (delete-guard index.ts:242, targets.ts validateOne). */
  "delete-tool": {
    en: {
      kind: "code",
      title: "delete",
      lines: [
        'paths: ["~/code/shop-api/coverage"]',
        "",
        "delete: nothing was deleted; refused:",
        '- "~/code/shop-api/coverage": paths are literal: `~` is not expanded; give the full path',
      ],
    },
    zh: {
      kind: "code",
      title: "delete",
      lines: [
        'paths: ["~/code/shop-api/coverage"]',
        "",
        "delete: nothing was deleted; refused:",
        '- "~/code/shop-api/coverage": paths are literal: `~` is not expanded; give the full path',
      ],
      gloss: { label: "译文", text: "delete：什么都没删；被拒绝：\"~/code/shop-api/coverage\"：路径按字面处理，`~` 不会展开，请写完整路径。" },
    },
  },
  /** harness_restart's queued result, then the message the restarted session opens with (harness-restart index.ts:209,167). */
  wt: {
    en: {
      kind: "code",
      title: "harness_restart",
      lines: [
        "Queued: the omp harness restarts once this turn ends. End your turn now without further tool calls; after the restart the session opens with a restart-completed message.",
        "",
        "Harness restart completed (2026-11-09T06:31:07.412Z). No reason was recorded. Continue what you were doing.",
      ],
    },
    zh: {
      kind: "code",
      title: "harness_restart",
      lines: [
        "Queued: the omp harness restarts once this turn ends. End your turn now without further tool calls; after the restart the session opens with a restart-completed message.",
        "",
        "Harness restart completed (2026-11-09T06:31:07.412Z). No reason was recorded. Continue what you were doing.",
      ],
      gloss: {
        label: "译文",
        text: "已排队：本回合结束后重启 omp 宿主。现在就结束本回合，不要再调用工具；重启之后，会话以一条重启完成的消息开头。宿主已重启完成（2026-11-09T06:31:07.412Z）。没有记录原因。继续你刚才在做的事。",
      },
    },
  },
  "delete-guard": {
    en: {
      kind: "hook",
      hook: { kind: "block", source: "delete-guard", at: "bash call", label: "refused", body: deleteGuard },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "block",
        source: "delete-guard",
        at: "bash 调用前",
        label: "拦下",
        body: deleteGuard,
        gloss: {
          label: "译文",
          text: "删除命令已禁用，这次调用没有执行：`rm -rf node_modules/.vite/vitest`（`rm` 会删除文件）。要删文件，用 `delete` 工具并写明路径，`mode` 不填，默认移进系统回收站。",
        },
      },
    },
  },
  "tool-policy-nag": {
    en: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "tool-policy-nag",
        at: "bash result",
        label: "appended",
        body: intentReminder,
        gloss: {
          label: "Translation",
          text: "Your `bash` call belongs to “edit an existing file”. Use `edit` for it instead of working around it. This call: `sed -i 's/limit: 100/limit: 300/' src/routes/search.ts`",
        },
      },
    },
    zh: {
      kind: "hook",
      hook: { kind: "reminder", source: "tool-policy-nag", at: "bash 返回后", label: "追加", body: intentReminder },
    },
  },
  "watchdog-agent": {
    en: {
      kind: "hook",
      hook: { kind: "judge", source: "watchdog-agent", at: "every 30 actions", label: "reviewed", body: watchdogNote },
    },
    zh: {
      kind: "hook",
      hook: {
        kind: "judge",
        source: "watchdog-agent",
        at: "每 30 个动作",
        label: "复审",
        body: watchdogNote,
        gloss: {
          label: "译文",
          text: "src/middleware/rate-limit.ts:62 把签了名的支付回调也计进了 API key 的额度桶；按 .omp/rules/webhooks.md，签名校验通过后它们必须免限流。现在调用方可能收到 429。",
        },
      },
    },
  },
  // delivery
  "thinking-translator": {
    en: { kind: "panel", panel: thinkingPanel },
    zh: { kind: "panel", panel: thinkingPanel },
  },
  "omomp-lang": {
    en: {
      kind: "code",
      title: "/settings → Plugins → omp-config",
      lines: [
        '"omomp-lang.language": {',
        '  "type": "enum",',
        '  "values": ["en", "zh"],',
        '  "default": "zh",',
        '  "description": "Language of person-facing text; exported as OMOMP_LANG at the next OMP start unless the launch environment sets it"',
        "}",
      ],
    },
    zh: {
      kind: "code",
      title: "/settings → Plugins → omp-config",
      lines: [
        '"omomp-lang.language": {',
        '  "type": "enum",',
        '  "values": ["en", "zh"],',
        '  "default": "zh",',
        '  "description": "Language of person-facing text; exported as OMOMP_LANG at the next OMP start unless the launch environment sets it"',
        "}",
      ],
    },
  },
  sessions: {
    en: { kind: "code", title: "read session://3f61d0b7/timeline", lines: pastTimeline("en") },
    zh: { kind: "code", title: "read session://3f61d0b7/timeline", lines: pastTimeline("zh") },
  },
  /** A side question to the docs session found by peer_list; the answer opens with omp-peers' own English line. */
  peers: {
    en: {
      kind: "code",
      title: "peer_ask",
      lines: [
        'to: "9c1e77a2"',
        'question: "Does the handbook document the 429 response yet?"',
        "",
        "Answer from session 9c1e77a2 (pid 59307):",
        "",
        "Yes: handbook/api/errors.md lists 429 with Retry-After in seconds. It does not mention that signed webhooks are exempt.",
      ],
    },
    zh: {
      kind: "code",
      title: "peer_ask",
      lines: [
        'to: "9c1e77a2"',
        'question: "手册里写了 429 响应吗？"',
        "",
        "Answer from session 9c1e77a2 (pid 59307):",
        "",
        "写了：handbook/api/errors.md 列出了 429 和以秒计的 Retry-After，但没提签名 webhook 免限流。",
      ],
    },
  },
  "task-completion-judge": {
    en: {
      kind: "hook",
      hook: {
        kind: "judge",
        source: "task-completion-judge",
        at: "yield",
        label: "judged",
        body: completionJudgeBody,
        gloss: {
          label: "Translation",
          text: "Completion check: compared with the original task and your latest tool calls, this task is not actually finished, so the yield is returned. webhooks.test.ts still fails on “signed callbacks skip the limiter” (expected 200, got 429), and the test was not run again after the change. Finish the missing part and verify it for real before yielding. The yield will not be returned for completeness again.",
        },
      },
    },
    zh: {
      kind: "hook",
      hook: { kind: "judge", source: "task-completion-judge", at: "yield", label: "裁决", body: completionJudgeBody },
    },
  },
  "turn-judge": {
    en: {
      kind: "hook",
      hook: {
        kind: "judge",
        source: "turn-judge",
        at: "turn end",
        label: "judged",
        body: turnJudgePrompt,
        gloss: {
          label: "Translation",
          text: "You stopped, but the work you were given is not finished. Do not just announce the next step or admit a mistake: use your tools now and keep going until there is a verifiable result. If you are blocked, finish everything you can first, then say what you tried and which prerequisite is missing.",
        },
      },
    },
    zh: {
      kind: "hook",
      hook: { kind: "judge", source: "turn-judge", at: "回合结束", label: "裁决", body: turnJudgePrompt },
    },
  },
  "lang-nag": {
    en: {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "lang-nag",
        at: "next user message",
        label: "prepended",
        body: "说中文\n\n提交一下",
        gloss: {
          label: "Translation",
          text: "The reminder \"说中文\" (say it in Chinese) is prepended to the user's next message, whose text \"提交一下\" means \"submit it\".",
        },
      },
    },
    zh: {
      kind: "hook",
      hook: { kind: "reminder", source: "lang-nag", at: "下一条用户消息", label: "前置", body: "说中文\n\n提交一下" },
    },
  },
};
