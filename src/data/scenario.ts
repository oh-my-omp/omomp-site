import type { Lang } from "../i18n";
import type { Hook } from "../slices/HookMessage";
import type { Panel } from "../slices/Panel";

export type SeamId = "intent" | "prompt" | "memory" | "delegation" | "execution" | "delivery";

/** The front element a hook reacts to: a whole panel, or one line of a transcript panel. Indexes are positions in `Step.front` and its `lines`. */
export type Anchor =
  | { readonly kind: "panel"; readonly panel: number }
  | { readonly kind: "line"; readonly panel: number; readonly line: number };

/** A hook and the moment it fires: right after its anchor appears on the front. The player highlights the anchor and the hook together. */
export interface TimedHook {
  readonly anchor: Anchor;
  readonly hook: Hook;
}

/**
 * One step of the demo scenario: what the person sees on screen, and what reached the model without showing there.
 * Playback reveals the front beat by beat (each transcript line, each other panel), and each hook right after its anchor.
 * The scenario is simulated; every hook body follows the source template of the extension that sends it.
 */
export interface Step {
  readonly seam: SeamId;
  readonly title: string;
  readonly caption: string;
  readonly front: readonly Panel[];
  readonly hooks: readonly TimedHook[];
}

const onPanel = (panel: number, hook: Hook): TimedHook => ({ anchor: { kind: "panel", panel }, hook });

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

const workers = ["OrdersRoute", "SearchRoute", "WebhooksRoute"] as const;

const ruleBody = {
  en: "Payment-provider callbacks are verified by signature, not by API key. Never put key-based limits in front of them.",
  zh: "支付服务商的回调靠签名校验，不靠 API key。不要在它们前面加按 key 计数的限流。",
} as const;

/** Model-facing templates written in one language only; the other page shows them verbatim with a translation. */
const turnJudgePrompt =
  "你停下了，但交代的工作还没做完。不要只宣布下一步或认错：现在就用工具继续做，直到有可验证的结果。确实被阻塞时，先做完所有能做的部分，再说明试过什么、缺的具体前置条件是什么。";

function todoReminder(lang: Lang): string {
  const i = items[lang];
  const g = goal[lang];
  const item = (it: { title: string; explanation: string; estimate: number }) =>
    `  - ${it.title}\n    ${it.explanation}\n    Estimate: ${it.estimate} min`;
  return [
    "<system-reminder>",
    "You stopped with 4 incomplete todo item(s):",
    `- ${i.phases.routes}`,
    item(i.orders),
    item(i.search),
    item(i.webhooks),
    `- ${i.phases.verify}`,
    item(i.verify),
    "",
    "Goal:",
    `  Objective: ${g.objective}`,
    `  Measure: ${g.measure}`,
    `  Done when: ${g.doneWhen}`,
    "",
    "Please continue working on these tasks or mark them complete if finished.",
    "(Reminder 1/3)",
    "</system-reminder>",
  ].join("\n");
}

function askRejection(lang: Lang): string {
  const sentence =
    lang === "en"
      ? "Per #212, should RL keep the shared cluster or go in-proc like v1?"
      : "按 #212 的结论，RL 继续用共享集群，还是像 v1 那样放进程内？";
  return [
    "ask rejected:",
    `- question "storage" is hard to understand for a reader who sees only this dialog and has never seen your session or this project; rewrite every item below so each sentence says who does what, each abbreviation is spelled out, and each name, number or earlier decision is said in plain words:`,
    `  - ${JSON.stringify(sentence)}: it uses a word, abbreviation, name or number the dialog never explains`,
    "  - `RL`: neither common knowledge nor explained in the dialog",
    "  - `#212`: neither common knowledge nor explained in the dialog",
  ].join("\n");
}

function userGoalInject(lang: Lang): string {
  return [
    '<user-prompt-inject name="user-goal">',
    "These are the human user's own requests to the root session, verbatim and in order, oldest first. Your advisee is an agent working for this user; it did not write them, and what it tells you is its interpretation of them.",
    "",
    `<user_prompt index="0">${userRequest[lang]}</user_prompt>`,
    "",
    "The user also decides through the `ask` tool: these are the user's answers there, oldest first, one `question → answer` line per answered question. They are as much the user's own decisions as the requests above.",
    "",
    `<ask_answer index="0">${askQuestion[lang]} → ${askAnswer[lang]}</ask_answer>`,
    "",
    "Judge your advisee against these requests and answers, not against its own restatement of them:",
    "…",
    "</user-prompt-inject>",
  ].join("\n");
}

const isolationNudge = [
  `Not dispatched — a reminder, not a rule. This call would leave write-capable agents sharing this working directory without isolation: ${workers.map((w) => `\`${w}\``).join(", ")}. Agents sharing a checkout can overwrite each other's work.`,
  "Re-dispatch the writers with `isolated: true`. For an item that only researches, set `isolated: false` to keep it shared.",
  "Each prompt is reminded once: re-dispatching these same prompts unchanged runs them as written.",
].join("\n");

const deleteGuard =
  "delete-guard: deletion commands are disabled; this call did not run. Deletion command: `rm -rf node_modules/.vite/vitest` (`rm` deletes files). To delete files, call the `delete` tool with literal paths and leave `mode` unset; the default moves them to the system trash.";

const ptyRefusal = "pty 路由：这次 `bash` 调用没有执行：`tail` 不会自己结束，或在等外部条件（open-ended，规则 `tailFollow`）。\nxd://exec_command";

function pathRules(lang: Lang): string {
  return [
    "<path-scoped-rules>",
    "Rules whose `paths` match a file this call touched (src/routes/webhooks.ts). Follow them whenever you work with files they match.",
    '<path-scoped-rule path="/home/dev/shop-api/.omp/rules/webhooks.md" paths="src/routes/**">',
    ruleBody[lang],
    "</path-scoped-rule>",
    "</path-scoped-rules>",
  ].join("\n");
}

const completionJudge = {
  reason: {
    en: "webhooks.test.ts still fails on “signed callbacks skip the limiter” (expected 200, got 429), and the test was not run again after the change.",
    zh: "webhooks.test.ts 里的 “signed callbacks skip the limiter” 仍然失败（期望 200，实际 429），改完之后也没有重新跑这个测试。",
  },
  body: (reason: string) =>
    `完成度鉴定：对照最初的任务和你最近的 tool call，这次任务还没有真正完成，yield 被退回。\n${reason}\n补完缺失的部分并实际验证后再 yield。之后不会再因完成度退回。`,
};

const testScreen = [
  { text: " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms" },
  { text: " ✓ src/routes/orders.test.ts (4 tests) 18ms" },
  { text: " ✓ src/routes/search.test.ts (5 tests) 22ms" },
  { text: " ✗ src/routes/webhooks.test.ts > signed callbacks skip the limiter" },
  { text: "   AssertionError: expected 429 to be 200" },
  { text: "" },
  { text: " Tests  1 failed | 15 passed (16)" },
  { text: " Waiting for file changes..." },
  { text: "p", by: "you" },
  { text: " ? Input filename pattern › webhooks", by: "you" },
] as const;

const redisScreen = [
  { text: '1731161420.118 [0 127.0.0.1:52144] "EVALSHA" "9f2c41d0" "1" "rl:key_live_7Q" "100" "1.67"' },
  { text: '1731161420.164 [0 127.0.0.1:52144] "EVALSHA" "9f2c41d0" "1" "rl:key_live_7Q" "100" "1.67"' },
  { text: '1731161421.009 [0 127.0.0.1:52151] "EVALSHA" "9f2c41d0" "1" "rl:key_test_k2" "100" "1.67"' },
] as const;

/** Steps as currently written, before each hook names its anchor; `steps` anchors every hook to the step's last panel. */
type DraftStep = Omit<Step, "hooks"> & { readonly hooks: readonly Hook[] };

function steps(lang: Lang): readonly Step[] {
  return draftSteps(lang).map((s) => ({ ...s, hooks: s.hooks.map((h) => onPanel(s.front.length - 1, h)) }));
}

function draftSteps(lang: Lang): readonly DraftStep[] {
  const en = lang === "en";
  const i = items[lang];
  const label = en
    ? { sentBack: "sent back", refused: "refused", appended: "appended", judged: "judged" }
    : { sentBack: "退回", refused: "拦下", appended: "追加", judged: "裁决" };
  const gloss = (text: string) => ({ label: en ? "Translation" : "译文", text });
  const todo = (status: { bucket: "active" | "done"; tests: "pending" | "done" }) => ({
    ...goal[lang],
    phases: [
      {
        name: i.phases.middleware,
        items: [
          {
            ...i.bucket,
            status: status.bucket,
            commit: status.bucket === "done" ? { sha: "a41c9e2", message: "feat: Redis token-bucket rate limiter" } : undefined,
          },
          { ...i.tests, status: status.tests },
        ],
      },
      {
        name: i.phases.routes,
        items: [
          { ...i.orders, status: "pending" as const },
          { ...i.search, status: "pending" as const },
          { ...i.webhooks, status: "pending" as const },
        ],
      },
      { name: i.phases.verify, items: [{ ...i.verify, status: "pending" as const }] },
    ],
  });

  return [
    {
      seam: "intent",
      title: en ? "The request" : "提出需求",
      caption: en
        ? "You describe the task. The agent needs one decision from you before it writes code, so it drafts a question. The readability check reads the draft as someone who has never seen this project would, finds two unexplained names, and sends it back. The draft never reaches your screen."
        : "你交代了任务。动手写代码前有件事需要你拍板，代理起草了一个问题。可读性检查假设读者从没接触过这个项目，读下来发现两个没解释的名称，把草稿退回重写。这份草稿不会出现在你的屏幕上。",
      front: [
        {
          kind: "transcript",
          lines: [
            { kind: "user", text: userRequest[lang] },
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
      hooks: [
        {
          kind: "block",
          source: "omp-ask-more · readability",
          at: en ? "ask result" : "ask 返回",
          label: label.sentBack,
          body: askRejection(lang),
          gloss: en
            ? undefined
            : gloss(
                "退回 ask：问题 “storage” 对只看得到这个对话框、从没见过你的会话和这个项目的读者来说很难看懂。逐条改写下面各项，让每句话都说清谁做什么，缩写写全，名称、编号和之前的决定都用平白的话说出来：这句话用了对话框里从没解释过的词、缩写、名称或编号；`RL` 和 `#212` 既不是常识，对话框里也没有解释。",
              ),
        },
      ],
    },
    {
      seam: "intent",
      title: en ? "Your decision" : "你来决定",
      caption: en
        ? "The rewritten question passes and opens as its own page: where things stand, what is being decided, what happens after, and a tradeoff for each option, with the code it rests on. You pick the token bucket in shared Redis."
        : "改写后的问题通过检查，单独成页：现状、要决定什么、决定之后会怎样，每个选项都写明取舍，并附上依据的代码。你选了共用 Redis 里的令牌桶。",
      front: [
        {
          kind: "ask",
          data: {
            header: en ? "Counter storage" : "计数器存放位置",
            question: askQuestion[lang],
            where: en
              ? "shop-api runs as four instances behind one load balancer. Each instance has its own memory, and all four already share one Redis server for login sessions."
              : "shop-api 在一个负载均衡后面跑四个实例。每个实例有自己的内存，四个实例已经共用一台 Redis 存登录会话。",
            what: en
              ? "Whether the request counters live in that shared Redis or in each instance's memory, and how a key's allowance refills."
              : "请求计数放在这台共用的 Redis 里，还是放在各实例自己的内存里；以及每个 key 的额度怎样恢复。",
            how: en
              ? "The middleware in src/middleware/rate-limit.ts is written for your choice, then the orders, search and webhooks routes switch over to it."
              : "src/middleware/rate-limit.ts 里的中间件按你的选择来写，之后 orders、search、webhooks 三个路由改用它。",
            options: [
              {
                label: askAnswer[lang],
                description: en ? "One bucket per API key, refilled continuously" : "每个 API key 一个桶，持续补充",
                tradeoff: en
                  ? "Exact across all four instances and smooth at minute boundaries; every request makes one Redis call."
                  : "四个实例算的是同一笔账，分钟交界处也平滑；每个请求多一次 Redis 调用。",
                holdsWhen: en
                  ? "Redis stays reachable, as it already must for login sessions."
                  : "Redis 保持可用；登录会话本来就依赖它。",
                cost: en ? "One Lua script and one Redis call per request." : "一段 Lua 脚本，每个请求一次 Redis 调用。",
                recommended: true,
              },
              {
                label: en ? "Shared Redis, fixed window" : "共用的 Redis，固定窗口",
                description: en ? "One counter per key per minute" : "每个 key 每分钟一个计数器",
                tradeoff: en
                  ? "Simplest to write and to read; a client can send twice the limit across a minute boundary."
                  : "最好写也最好懂；客户端可以在分钟交界前后各打满一次，拿到两倍额度。",
              },
              {
                label: en ? "Memory in each instance" : "各实例自己的内存",
                description: en ? "No Redis call" : "不访问 Redis",
                tradeoff: en
                  ? "No added latency; each instance counts alone, so the real limit is four times the configured one."
                  : "不增加延迟；每个实例各算各的，实际额度是配置值的四倍。",
              },
            ],
            cursor: 0,
            answered: 0,
            evidence: [
              {
                path: "src/server.ts",
                start: 12,
                lines: [
                  "const redis = createClient({ url: process.env.REDIS_URL });",
                  "await redis.connect();",
                  "app.use(session({ store: new RedisStore({ client: redis }) }));",
                ],
              },
            ],
          },
        },
      ],
      hooks: [],
    },
    {
      seam: "prompt",
      title: en ? "Rules arrive with the file" : "规则随文件送达",
      caption: en
        ? "The agent opens the webhooks route. A repository rule that applies to src/routes/ arrives right after the read, appended at the end of the context. The system prompt and the tool list stay byte for byte the same, so the provider still serves everything before the new rule from its prompt cache."
        : "代理打开 webhooks 路由。适用于 src/routes/ 的仓库规则在读完文件后立即送达，追加在上下文末尾。system prompt 和工具列表一个字节都没变，新规则之前的内容，服务商照样从提示缓存里读取。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "read",
              args: "src/routes/webhooks.ts",
              status: "ok",
              result: 'router.post("/webhooks/payments", verifySignature, handlePayment);',
            },
            {
              kind: "say",
              text: en
                ? "Payment callbacks are signed by the provider, so the limiter will skip them once the signature verifies."
                : "支付回调由服务商签名，签名校验通过后限流器就跳过它们。",
            },
          ],
        },
        {
          kind: "context",
          rows: [
            {
              title: en ? "Request 4" : "第 4 次请求",
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
              title: en ? "Request 5" : "第 5 次请求",
              segments: [
                { label: "system", kind: "system", size: 3 },
                { label: "tools", kind: "tools", size: 2 },
                { label: en ? "messages" : "消息", kind: "msg", size: 5 },
                { label: en ? "rule" : "规则", kind: "delta", size: 1 },
                { label: en ? "new" : "新增", kind: "new", size: 1 },
              ],
              note: en ? "same prefix, served from cache" : "前缀不变，命中缓存",
              cache: "hit",
            },
          ],
        },
      ],
      hooks: [
        {
          kind: "reminder",
          source: "omp-config/repo-rules",
          at: en ? "after read" : "read 之后",
          label: label.appended,
          body: pathRules(lang),
          gloss: en
            ? undefined
            : gloss("这次调用碰到的文件（src/routes/webhooks.ts）匹配了这些规则的 `paths`。处理匹配的文件时都要遵守。"),
        },
      ],
    },
    {
      seam: "memory",
      title: en ? "The plan" : "计划",
      caption: en
        ? "The agent writes its plan into the todo list: a goal with how it will be measured, phases, and an estimate for each item. You see the same list in the panel and can edit the goal or any explanation."
        : "代理把计划写进待办：目标及其衡量方式、分阶段的条目和每一项的估时。面板里显示的是同一份清单，目标和每条说明你都可以改。",
      front: [{ kind: "todo", data: todo({ bucket: "active", tests: "pending" }) }],
      hooks: [],
    },
    {
      seam: "memory",
      title: en ? "Stopping early" : "提前停下",
      caption: en
        ? "Once the middleware tests pass, the agent reports progress and stops. Four items are still open, so the turn does not end: the reminder lists them with the goal, and the agent carries on. On your screen it is a one-line card."
        : "中间件的测试通过后，代理汇报完进度就停下了。还有四项没做完，回合不会就此结束：提醒把这四项连同目标一起列出来，代理接着做。你的屏幕上只多出一行卡片。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "say",
              text: en ? "The middleware is in and its tests pass." : "中间件写好了，测试也通过了。",
            },
            {
              kind: "card",
              tone: "warn",
              head: en ? "4 incomplete todos - reminder 1/3" : "4 个待办未完成 - 提醒 1/3",
            },
            {
              kind: "say",
              text: en ? "Moving on to the orders, search and webhooks routes." : "接着改 orders、search 和 webhooks 三个路由。",
            },
          ],
        },
        { kind: "todo", data: todo({ bucket: "done", tests: "done" }) },
      ],
      hooks: [
        {
          kind: "reminder",
          source: "omp-todo-more",
          at: en ? "turn end" : "回合结束",
          label: label.appended,
          body: todoReminder(lang),
          gloss: en
            ? undefined
            : gloss("你停下时还有 4 个待办没完成（见上）。请继续做这些任务；已经做完的，把它们标记为完成。（提醒 1/3）"),
        },
      ],
    },
    {
      seam: "delegation",
      title: en ? "Three writers, one checkout" : "三个执行者共用一个工作区",
      caption: en
        ? "The agent hands each route to its own worker. All three would edit files in the same checkout, so the call is held back once with a reminder to give each writer an isolated worktree. Nothing was dispatched yet."
        : "代理把三个路由分别交给三个执行者。三个都要改文件，却共用同一个工作区，所以这次派发被拦下一次，提醒给每个改文件的执行者单独开一个 worktree。这时还没有派出任何执行者。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "say",
              text: en ? "The three routes do not depend on each other; each goes to a worker." : "三个路由互不依赖，各交给一个执行者。",
            },
            {
              kind: "call",
              tool: "task",
              args: `${workers.join(", ")} · task:low`,
              status: "blocked",
              result: "Not dispatched — a reminder, not a rule.",
            },
          ],
        },
      ],
      hooks: [
        {
          kind: "block",
          source: "isolation-nudge",
          at: en ? "task call" : "task 调用前",
          label: label.refused,
          body: isolationNudge,
          gloss: en
            ? undefined
            : gloss(
                "没有派发——这是提醒，不是规定。这次调用会让几个能写文件的代理不加隔离地共用这个工作目录。共用一个检出的代理会互相覆盖改动。给写文件的项加上 `isolated: true` 重新派发；只做调研的项设 `isolated: false` 保持共用。每个 prompt 只提醒一次：原样重新派发就照原样执行。",
              ),
        },
      ],
    },
    {
      seam: "delegation",
      title: en ? "Workers and an advisor" : "执行者与顾问",
      caption: en
        ? "Re-dispatched with isolated worktrees, the three workers run side by side. The agent also asks an advisor whether skipping the limiter for signed webhooks is safe. Before every model call the advisor receives your own request and your answer to the question, word for word, so it judges against what you said rather than the agent's summary."
        : "改用独立 worktree 重新派发后，三个执行者同时开工。代理还请顾问判断签名 webhook 跳过限流是否安全。顾问每次调用模型前都会收到你的原话和你对那个问题的回答，所以它依据你的原话判断，不靠代理转述。",
      front: [
        {
          kind: "agents",
          rows: [
            ...workers.map((name) => ({
              name,
              agent: "task:low",
              where: `wt/${name.replace("Route", "").toLowerCase()}-route`,
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
      hooks: [
        {
          kind: "reminder",
          source: "user-prompt-inject",
          at: en ? "each advisor model call" : "顾问每次调用模型",
          label: label.appended,
          body: userGoalInject(lang),
          gloss: en
            ? undefined
            : gloss(
                "以下是人类用户给根会话的原话，逐字、按先后排列。你辅导的是替这个用户干活的代理；这些话不是它写的，它对你说的是它自己的理解。用户也通过 `ask` 工具做决定，以下是用户在那里的回答。拿这些原话和回答去衡量代理，不要拿它自己的复述去衡量。",
              ),
        },
      ],
    },
    {
      seam: "execution",
      title: en ? "A command that never ends" : "不会结束的命令",
      caption: en
        ? "To watch the limiter hit Redis, the agent tries to follow the Redis log with bash. That command never exits on its own and would hold the turn until it timed out, so it is refused before it runs, with a pointer to exec_command."
        : "为了确认限流器确实在访问 Redis，代理想用 bash 持续跟踪 Redis 日志。这条命令不会自己退出，会把回合一直占到超时，所以执行前就被拒绝，并提示改用 exec_command。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "bash",
              args: "tail -f /usr/local/var/log/redis.log",
              status: "blocked",
              result: "pty 路由：这次 `bash` 调用没有执行",
            },
            {
              kind: "say",
              text: en
                ? "tail -f never exits, so the bash call was refused. I'll start the Redis monitor with exec_command instead."
                : "tail -f 不会自己退出，所以这次 bash 调用被拒绝了。我改用 exec_command 启动 Redis 监视。",
            },
          ],
        },
      ],
      hooks: [
        {
          kind: "block",
          source: "tool-policy-nag",
          at: en ? "bash call" : "bash 调用前",
          label: label.refused,
          body: ptyRefusal,
          gloss: en
            ? gloss(
                "pty routing: this `bash` call did not run: `tail` does not end on its own, or waits on an outside condition (open-ended, rule `tailFollow`).",
              )
            : undefined,
        },
      ],
    },
    {
      seam: "execution",
      title: en ? "Shared terminals" : "共用终端",
      caption: en
        ? "The agent starts the test watcher and a Redis monitor with exec_command. Both appear in the Terminals view; you can open either one and type into it. Here you narrow the watcher to the webhooks tests while the agent reads the same screen."
        : "代理用 exec_command 启动了测试监视和 Redis 监视，两个会话都出现在终端视图里，你可以打开任意一个直接输入。这里你把测试监视的范围收窄到 webhooks 的测试，代理看到的也是同一块屏幕。",
      front: [
        {
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
                elapsed: "4m 12s",
                cwd: "~/code/shop-api",
                size: "120×32",
                screen: testScreen,
              },
              {
                id: 2,
                title: "redis-cli monitor",
                command: "redis-cli monitor",
                state: "running",
                elapsed: "3m 58s",
                cwd: "~/code/shop-api",
                size: "120×32",
                screen: redisScreen,
              },
            ],
          },
        },
      ],
      hooks: [],
    },
    {
      seam: "execution",
      title: en ? "Deleting with a record" : "删除进回收站",
      caption: en
        ? "To clear a stale test cache the agent reaches for rm -rf. The shell deletion is refused; the agent calls the delete tool instead, which moves the folder to the system trash and names exactly what moved where."
        : "为了清掉过期的测试缓存，代理顺手写了 rm -rf。shell 删除被拒绝后，代理改用 delete 工具：文件夹移进系统回收站，结果里写明了移动了什么、移到了哪里。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "bash",
              args: "rm -rf node_modules/.vite/vitest",
              status: "blocked",
              result: "delete-guard: deletion commands are disabled; this call did not run.",
            },
            {
              kind: "call",
              tool: "delete",
              args: "node_modules/.vite/vitest",
              status: "ok",
              result: "delete (trash): all 1 done\nok     node_modules/.vite/vitest: moved to /Users/dev/.Trash/vitest",
            },
          ],
        },
      ],
      hooks: [
        {
          kind: "block",
          source: "delete-guard",
          at: en ? "bash call" : "bash 调用前",
          label: label.refused,
          body: deleteGuard,
          gloss: en
            ? undefined
            : gloss(
                "删除命令已禁用，这次调用没有执行。删除命令：`rm -rf node_modules/.vite/vitest`（`rm` 会删除文件）。要删文件，用 `delete` 工具并写明路径，`mode` 不填，默认移进系统回收站。",
              ),
        },
      ],
    },
    {
      seam: "delivery",
      title: en ? "A worker says it is done" : "执行者报告完成",
      caption: en
        ? "WebhooksRoute reports success without running the test that was failing. The completion judge compares the report with the worker's latest tool calls and returns the yield once; the worker fixes the signature check and runs the test before reporting again."
        : "WebhooksRoute 报告完成，但没有重跑之前失败的测试。完成度判定把报告和它最近的工具调用对照后，把这次 yield 退回一次；执行者修好签名校验、跑过测试，才再次汇报。",
      front: [
        {
          kind: "agents",
          rows: workers.map((name) => ({
            name,
            agent: "task:low",
            where: `wt/${name.replace("Route", "").toLowerCase()}-route`,
            state: name === "WebhooksRoute" ? ("returned" as const) : ("done" as const),
            stateText: name === "WebhooksRoute" ? (en ? "yield returned" : "yield 被退回") : en ? "done" : "完成",
          })),
        },
      ],
      hooks: [
        {
          kind: "judge",
          source: "task-completion-judge",
          at: "yield",
          label: label.judged,
          body: completionJudge.body(completionJudge.reason.zh),
          gloss: en
            ? gloss(
                `Completion check: compared with the original task and your latest tool calls, this task is not actually finished, so the yield is returned. ${completionJudge.reason.en} Finish the missing part and verify it for real before yielding. The yield will not be returned for completeness again.`,
              )
            : undefined,
        },
      ],
    },
    {
      seam: "delivery",
      title: en ? "Announcing instead of doing" : "只说不做",
      caption: en
        ? "Back in the main session, the agent writes that the routes are switched and that it will run the suite and commit next, then stops. A judge reads the reply as work still missing, announced as a plan, and sends the agent back to do it. This shipped rule watches GPT models."
        : "回到主会话，代理写下“路由都改好了，接下来跑测试并提交”，然后就停了。判定模型认为这条回复把没做完的事写成了计划，让代理回去接着做。omp-config 自带的这条规则只针对 GPT 模型。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "say",
              text: en
                ? "All three routes now use the shared limiter, and signed webhooks skip it. Next I'll run the full suite and commit."
                : "三个路由都换成了共用的限流器，签名 webhook 会跳过它。接下来我会跑完整测试并提交。",
            },
            { kind: "user", by: "turn-judge", text: turnJudgePrompt },
          ],
        },
      ],
      hooks: [
        {
          kind: "judge",
          source: "turn-judge",
          at: en ? "turn end" : "回合结束",
          label: label.judged,
          body: turnJudgePrompt,
          gloss: en
            ? gloss(
                "You stopped, but the work you were given is not finished. Do not just announce the next step or admit a mistake: use your tools now and keep going until there is a verifiable result. If you really are blocked, first finish everything you can, then say what you tried and which specific prerequisite is missing.",
              )
            : undefined,
        },
      ],
    },
    {
      seam: "delivery",
      title: en ? "Done, with evidence" : "完成并附上证据",
      caption: en
        ? "The agent runs the suite, commits, and reports with the test output as evidence. For a person who reads Chinese, each line of the model's English thinking appears translated beneath the original as it streams."
        : "代理跑完测试、提交，并附上测试输出作为证据。模型用英文思考时，每一行思考都会在原文下方实时出现中文译文。",
      front: [
        {
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
              "汇报 429 的行为时，用测试名称作证据。",
            ],
          },
        },
        {
          kind: "transcript",
          lines: [
            { kind: "call", tool: "exec_command", args: "pnpm test", status: "ok", result: " Tests  16 passed (16)" },
            {
              kind: "call",
              tool: "bash",
              args: 'git commit -m "feat: route rate limits through the shared limiter"',
              status: "ok",
              result: "[main 7d03b1f] feat: route rate limits through the shared limiter",
            },
            {
              kind: "say",
              text: en
                ? "Done. Keys past their allowance get 429 with Retry-After (rate-limit.test.ts › returns 429 with Retry-After); signed payment callbacks are never limited (webhooks.test.ts › signed callbacks skip the limiter). Two commits on main: a41c9e2 and 7d03b1f."
                : "完成。超出额度的 key 收到 429 和 Retry-After（rate-limit.test.ts › returns 429 with Retry-After）；签名的支付回调从不限流（webhooks.test.ts › signed callbacks skip the limiter）。main 上两个提交：a41c9e2 和 7d03b1f。",
            },
          ],
        },
      ],
      hooks: [],
    },
  ];
}

export const scenario: Record<Lang, readonly Step[]> = { en: steps("en"), zh: steps("zh") };

/** Labels the replay player needs; island props must be plain data. */
export interface PlayerLabels {
  readonly play: string;
  readonly pause: string;
  readonly again: string;
  readonly prev: string;
  readonly next: string;
  readonly step: string;
  readonly front: string;
  readonly back: string;
  readonly quiet: string;
  readonly seams: Readonly<Record<SeamId, string>>;
}

export const playerLabels: Record<Lang, PlayerLabels> = {
  en: {
    play: "Play",
    pause: "Pause",
    again: "Play again",
    prev: "Previous step",
    next: "Next step",
    step: "Step",
    front: "On your screen",
    back: "Sent to the model",
    quiet: "Nothing was added for the model in this step.",
    seams: {
      intent: "Intent",
      prompt: "Prompt",
      memory: "Memory",
      delegation: "Delegation",
      execution: "Execution",
      delivery: "Delivery",
    },
  },
  zh: {
    play: "播放",
    pause: "暂停",
    again: "重新播放",
    prev: "上一步",
    next: "下一步",
    step: "步骤",
    front: "你看到的界面",
    back: "发给模型的消息",
    quiet: "这一步没有给模型追加任何内容。",
    seams: {
      intent: "意图",
      prompt: "提示词",
      memory: "记忆",
      delegation: "派发",
      execution: "执行",
      delivery: "交付",
    },
  },
};
