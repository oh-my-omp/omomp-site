import type { Lang } from "../i18n";
import type { Hook } from "../slices/HookMessage";
import type { Panel } from "../slices/Panel";
import type { ScreenLine } from "../slices/Terminals";

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

const onLine = (panel: number, line: number, hook: Hook): TimedHook => ({ anchor: { kind: "line", panel, line }, hook });

const userRequest = {
  en: "Add rate limiting to the public API: back it with Redis, count per API key, and answer 429 with Retry-After once a key runs out. Then switch the orders, search and webhooks routes over to it.",
  zh: "给公开 API 加限流：计数放 Redis，按 API key 算，额度用完返回 429 并带上 Retry-After。然后把 orders、search、webhooks 三个路由改成走这个中间件。",
} as const;

/** The part of the request the advisor quotes; it must stay a verbatim substring of `userRequest`. */
const retryAfterAsk = {
  en: "answer 429 with Retry-After once a key runs out",
  zh: "额度用完返回 429 并带上 Retry-After",
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
    phase: "Middleware",
    bucket: { title: "Token bucket in Redis", explanation: "One Lua script refills and takes a token atomically", estimate: 40 },
    tests: { title: "Tests for refill and 429", explanation: "Cover the refill rate, the 429 body and Retry-After", estimate: 25 },
  },
  zh: {
    phase: "中间件",
    bucket: { title: "Redis 令牌桶", explanation: "一段 Lua 脚本原子地补充和取用令牌", estimate: 40 },
    tests: { title: "令牌补充与 429 测试", explanation: "覆盖补充速率、429 响应体和 Retry-After", estimate: 25 },
  },
} as const;

const middlewareCommit = { sha: "a41c9e2", message: "feat: Redis token-bucket rate limiter" } as const;

const workers = ["OrdersRoute", "SearchRoute", "WebhooksRoute"] as const;

/** Model-facing templates written in one language only; the other page shows them verbatim with a translation. */
const turnJudgePrompt =
  "你停下了，但交代的工作还没做完。不要只宣布下一步或认错：现在就用工具继续做，直到有可验证的结果。确实被阻塞时，先做完所有能做的部分，再说明试过什么、缺的具体前置条件是什么。";

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

/** omp-config tool-topics: the delta appended when the session starts, cut to the task tool's isolation topic. */
const toolTopics = [
  '<system-reminder source="omp-config/tool-topics">',
  "Descriptions of OMP's own tools from omp-config. Each <tool> element names one tool; its parameters stay as the system prompt declares them. With description=\"replaced\", the element's text replaces that tool's description in the system prompt. With description=\"kept\", the system prompt's description stands and the element's Topics list is appended to it. A Topics list names call instructions kept out of the prompt, read on demand.",
  "",
  '<tool name="task" description="replaced">',
  "…",
  "Topics — read the one a call needs before making it:",
  "…",
  "- `tool://task/isolation` — before setting `isolated: true`, or after an isolated item failed to start or merge",
  "…",
  "</tool>",
  "…",
  "</system-reminder>",
].join("\n");

/** The opening of omp-config's TOPIC-task-isolation.md, as `read tool://task/isolation` returns it. */
const isolationTopic = [
  "# Isolated workers",
  "",
  "- `isolated: true` gives the item its own checkout; omitted or `false` runs in yours. Each item sets it independently.",
  "…",
].join("\n");

function stopReminder(lang: Lang): string {
  const i = items[lang];
  const g = goal[lang];
  return [
    "<system-reminder>",
    "You stopped with 1 incomplete todo item(s):",
    `- ${i.phase}`,
    `  - ${i.tests.title}`,
    `    ${i.tests.explanation}`,
    `    Estimate: ${i.tests.estimate} min`,
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

const splitCheck = (labels: string) =>
  `你没有好好规划任务：${labels} 把多个主题塞给了一个 agent，按主题拆成多个 item 后重新派发；确认是单一主题的项可以原样重新派发，第二次直接放行。`;

const isolationNudge = [
  `Not dispatched — a reminder, not a rule. This call would leave write-capable agents sharing this working directory without isolation: ${workers.map((w) => `\`${w}\``).join(", ")}. Agents sharing a checkout can overwrite each other's work.`,
  "Re-dispatch the writers with `isolated: true`. For an item that only researches, set `isolated: false` to keep it shared.",
  "Each prompt is reminded once: re-dispatching these same prompts unchanged runs them as written.",
].join("\n");

/** omp-config user-prompt-inject, PROMPT-INJECT-user-goal.md, rendered for this session. */
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
    "- The user's goal, explicit constraints, and stated decisions (in a request or an ask answer) outrank the advisee's framing. When the advisee's plan, scope, or conclusion drifts from them — a narrower problem, an easier substitute, a dropped requirement, an added one the user never asked for, a decision the user already made being reopened — name the gap and quote the request or answer it contradicts.",
    "- Later requests and answers refine or override earlier ones; the latest one says what the user wants now.",
    "- A `task:*` advisee may own only one slice of this work, bounded by its parent. Check the slice against the requests that bear on it; a slice that covers less than the whole request is not drift, but one that contradicts a request is.",
    "- Do not take over the user's role: do not invent requirements beyond these requests, and when a request is ambiguous, say so and name the question the advisee should put to the user with `ask` instead of choosing for it.",
    "- Agreeing with the advisee is a finding only when you checked its proposal against these requests.",
    "</user-prompt-inject>",
  ].join("\n");
}

const rmtreeLine = 'shutil.rmtree("node_modules/.vite/vitest")';

const deleteGuard = `delete-guard: deletion commands are disabled; this call did not run. Deletion command: \`${rmtreeLine}\` (\`rmtree\` deletes files). To delete files, call the \`delete\` tool with literal paths and leave \`mode\` unset; the default moves them to the system trash.`;

const perlEdit =
  "perl -pi -e 's/Math\\.round\\(wait\\)/Math.ceil(wait)/' src/middleware/rate-limit.ts && perl -pi -e 's/toBe\\(1\\)/toBe(2)/' src/middleware/rate-limit.test.ts";

/** tool-policy-nag's intent reminder (intent.ts `intentReminder`) for a shell call judged as editing an existing file. */
const intentReminder = ["你这次 `bash` 调用属于「修改已有文件」，应该用 `edit`，而不是这样绕出去。", "", "这次调用：", "```sh", perlEdit, "```"].join("\n");

const completionJudge = {
  reason: {
    en: "webhooks.test.ts still fails on “signed callbacks skip the limiter” (expected 200, got 429), and the test was not run again after the change.",
    zh: "webhooks.test.ts 里的 “signed callbacks skip the limiter” 仍然失败（期望 200，实际 429），改完之后也没有重新跑这个测试。",
  },
  body: (reason: string) =>
    `完成度鉴定：对照最初的任务和你最近的 tool call，这次任务还没有真正完成，yield 被退回。\n${reason}\n补完缺失的部分并实际验证后再 yield。之后不会再因完成度退回。`,
};

const testScreen: readonly ScreenLine[] = [
  { text: " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms" },
  { text: " ✓ src/routes/orders.test.ts (4 tests) 18ms" },
  { text: " ✓ src/routes/search.test.ts (5 tests) 22ms" },
  { text: "" },
  { text: " Waiting for file changes..." },
];

/** A redis-cli prompt the agent and the person type into; `by` marks whose input each command line was. */
const redisScreen: readonly ScreenLine[] = [
  { text: "127.0.0.1:6379> KEYS rl:*", by: "agent" },
  { text: '1) "rl:key_live_7Q"' },
  { text: '2) "rl:key_test_k2"' },
  { text: "127.0.0.1:6379> HGETALL rl:key_live_7Q", by: "you" },
  { text: '1) "tokens"' },
  { text: '2) "97"' },
  { text: '3) "ts"' },
  { text: '4) "1731161420118"' },
  { text: "127.0.0.1:6379> " },
];

const sqlCode = [
  'const from = { sids: ["019a"] };',
  "const { details } = await tool.session_query({ action: \"sql\", from, query: `",
  "  SELECT e.tool, count(*) calls, count(*) FILTER (WHERE e.status = 'error') errors",
  "  FROM src.events e JOIN src.files f USING (sid, agent)",
  "  WHERE e.kind = 'call' GROUP BY e.tool ORDER BY calls DESC` });",
  "return details.rows;",
];

const sqlRows: ReadonlyArray<readonly [string, number, number]> = [
  ["read", 41, 0],
  ["edit", 23, 0],
  ["bash", 12, 0],
  ["todo", 9, 0],
  ["task", 4, 2],
  ["yield", 4, 1],
  ["exec_command", 3, 0],
  ["ask", 2, 1],
  ["eval", 2, 1],
  ["write_stdin", 2, 0],
  ["delete", 1, 0],
];

function steps(lang: Lang): readonly Step[] {
  const en = lang === "en";
  const i = items[lang];
  const label = en
    ? { sentBack: "sent back", refused: "refused", appended: "appended", judged: "judged" }
    : { sentBack: "退回", refused: "拦下", appended: "追加", judged: "裁决" };
  const gloss = (text: string) => ({ label: en ? "Translation" : "译文", text });
  const plan = (tests: "pending" | "done") => ({
    ...goal[lang],
    phases: [
      {
        name: i.phase,
        items: [
          { ...i.bucket, status: tests === "done" ? ("done" as const) : ("active" as const) },
          { ...i.tests, status: tests, commit: tests === "done" ? middlewareCommit : undefined },
        ],
      },
    ],
  });
  const worktree = (name: string) => `wt/${name.replace("Route", "").toLowerCase()}-route`;

  return [
    {
      seam: "intent",
      title: en ? "The request" : "提出需求",
      caption: en
        ? "You describe the task. Before writing code the agent needs one decision from you, so it drafts a question. The readability check finds two names the dialog never explains and sends the draft back, before it reaches your screen."
        : "你交代了任务。动手写代码前有件事需要你拍板，代理起草了一个问题。可读性检查发现两个对话框里没解释的名称，在草稿出现在你屏幕上之前就把它退回重写。",
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
        onLine(0, 2, {
          kind: "block",
          source: "omp-ask-more · readability",
          at: en ? "ask result" : "ask 返回",
          label: label.sentBack,
          body: askRejection(lang),
          gloss: en
            ? undefined
            : gloss(
                "退回 ask：问题 “storage” 对只看得到这个对话框、从没见过你的会话和这个项目的读者来说很难看懂。逐条改写下面各项，让每句话都说清谁做什么，缩写写全，名称、编号和之前的决定都用平白的话说出来：“按 #212 的结论，RL 继续用共享集群，还是像 v1 那样放进程内？”用了对话框里从没解释过的词、缩写、名称或编号；`RL` 和 `#212` 既不是常识，对话框里也没有解释。",
              ),
        }),
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
      title: en ? "Full and light modes" : "完整与轻量模式",
      caption: en
        ? "omp starts the agent in full mode; omp-light starts it without the governance checks. Either way the system prompt, the appended system file and the tool list stay fixed for the whole session, so the provider can cache them. What the checks add later arrives as messages after that prefix."
        : "omp 以完整模式启动代理，omp-light 启动时不加载治理检查。无论哪种模式，system prompt、追加的系统文件和工具列表在整个会话里都不变，服务商可以缓存这段前缀。检查后来补充的内容，都以消息形式追加在前缀之后。",
      front: [
        {
          kind: "modes",
          data: {
            labels: en
              ? { prefix: "fixed prefix, cached", appended: "appended as messages", loaded: "loaded", off: "not loaded" }
              : { prefix: "固定前缀，可缓存", appended: "以消息追加", loaded: "加载", off: "不加载" },
            rows: [
              {
                command: "omp",
                name: en ? "full mode" : "完整模式",
                prefix: ["system prompt", "APPEND_SYSTEM.md", "tools"],
                appended: en ? ["tool topics", "decision support", "repo rules"] : ["工具 topic", "决策支持", "仓库规则"],
                checks: modeChecks(true),
              },
              {
                command: "omp-light",
                name: en ? "light mode" : "轻量模式",
                prefix: ["system prompt", "tools"],
                appended: en ? ["tool topics", "repo rules"] : ["工具 topic", "仓库规则"],
                checks: modeChecks(false),
              },
            ],
          },
        },
      ],
      hooks: [],
    },
    {
      seam: "prompt",
      title: en ? "Reading a topic on demand" : "按需读取说明",
      caption: en
        ? "The task tool's description stays short and ends with a list of topics, appended as a message when the session starts. Before dispatching parallel writers, the agent reads the isolation topic, which comes back as an ordinary tool result. The system prompt and the tool list are unchanged, so the cached prefix still serves."
        : "task 工具的说明保持简短，末尾列出可以按需读取的 topic，这份列表在会话开始时以消息形式追加。准备并行派发写文件的执行者之前，代理读取了 isolation 这个 topic，内容作为普通的工具结果返回。system prompt 和工具列表都没变，缓存的前缀照样可用。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "say",
              text: en
                ? "The three routes can change in parallel. Before dispatching writers, I'll read how isolated workers behave here."
                : "三个路由可以并行改。派发写文件的执行者之前，先看看隔离执行在这里怎么运作。",
            },
            {
              kind: "call",
              tool: "read",
              args: "tool://task/isolation",
              status: "ok",
              result: isolationTopic,
              ...(en ? {} : { gloss: gloss("# 隔离执行：`isolated: true` 让这一项有自己的检出；不写或写 `false`，就在你的检出里运行。每一项各自设置。……") }),
            },
          ],
        },
        {
          kind: "context",
          rows: [
            {
              title: en ? "Request 1" : "第 1 次请求",
              segments: [
                { label: "system", kind: "system", size: 3 },
                { label: "tools", kind: "tools", size: 2 },
                { label: en ? "topics" : "topic 列表", kind: "delta", size: 1 },
                { label: en ? "request" : "需求", kind: "new", size: 1 },
              ],
              note: en ? "first request, prefix written to cache" : "首次请求，前缀写入缓存",
              cache: "miss",
            },
            {
              title: en ? "Request 9" : "第 9 次请求",
              segments: [
                { label: "system", kind: "system", size: 3 },
                { label: "tools", kind: "tools", size: 2 },
                { label: en ? "topics" : "topic 列表", kind: "delta", size: 1 },
                { label: en ? "messages" : "消息", kind: "msg", size: 3 },
                { label: "isolation", kind: "new", size: 2 },
              ],
              note: en ? "same prefix, served from cache" : "前缀不变，命中缓存",
              cache: "hit",
            },
          ],
        },
      ],
      hooks: [
        onLine(0, 1, {
          kind: "reminder",
          source: "omp-config/tool-topics",
          at: en ? "session start" : "会话开始",
          label: label.appended,
          body: toolTopics,
          gloss: en
            ? undefined
            : gloss(
                "omp-config 提供的 OMP 自带工具说明。每个 <tool> 元素对应一个工具，参数仍以 system prompt 的声明为准。description=\"replaced\" 时，元素正文替换 system prompt 里该工具的说明；description=\"kept\" 时保留原说明，只在后面追加元素的 Topics 列表。Topics 列表列出没放进 prompt、需要时再读的调用说明。task 工具：……Topics——调用前只读这次需要的那一篇：……`tool://task/isolation`，设置 `isolated: true` 之前，或隔离项启动、合并失败之后。……",
              ),
        }),
      ],
    },
    {
      seam: "memory",
      title: en ? "The plan" : "计划",
      caption: en
        ? "The agent writes the middleware phase into the todo list: the goal, how it will be measured, and an estimate for each item. The routes get their own phase once the middleware is committed. You see the same list in the panel and can edit the goal or any explanation."
        : "代理先把中间件阶段写进待办：目标、衡量方式，以及每一项的估时。中间件提交之后，三个路由再单独成一个阶段。面板里显示的是同一份清单，目标和每条说明你都可以改。",
      front: [{ kind: "todo", data: plan("pending") }],
      hooks: [],
    },
    {
      seam: "memory",
      title: en ? "One item left" : "剩一项时停下",
      caption: en
        ? "With the bucket written, the agent reports and stops while the tests item is still open. The stop reminder lists that item with the goal; the agent goes back, writes the tests and marks the item done. That same call commits the work."
        : "令牌桶写完后，代理汇报一句就停了，测试那一项还没做。停止提醒把这一项连同目标列出来，代理回去写完测试，把它标记为完成。标记完成的同一次调用就提交了代码。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "say",
              text: en ? "The token bucket is in: one Lua script refills and takes a token." : "令牌桶写好了：一段 Lua 脚本负责补充和取用令牌。",
            },
            { kind: "card", tone: "warn", head: en ? "1 incomplete todo - reminder 1/3" : "1 个待办未完成 - 提醒 1/3" },
            {
              kind: "call",
              tool: "bash",
              args: "pnpm vitest run src/middleware",
              status: "ok",
              result: " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms",
            },
            {
              kind: "call",
              tool: "todo",
              args: `DONE "${i.tests.title}" "${middlewareCommit.message}"`,
              status: "ok",
              result: `Committed ${middlewareCommit.sha} "${middlewareCommit.message}" (all changes) in ~/code/shop-api.`,
            },
          ],
        },
        { kind: "todo", data: plan("done") },
      ],
      hooks: [
        onLine(0, 1, {
          kind: "reminder",
          source: "omp-todo-more",
          at: en ? "turn end" : "回合结束",
          label: label.appended,
          body: stopReminder(lang),
          gloss: en
            ? undefined
            : gloss(
                `你停下时还有 1 个待办没完成：${items.zh.phase}阶段的“${items.zh.tests.title}”，${items.zh.tests.explanation}，估时 ${items.zh.tests.estimate} 分钟。目标：${goal.zh.objective}；衡量方式：${goal.zh.measure}；完成条件：${goal.zh.doneWhen}。请继续做这些任务；已经做完的，标记为完成。（提醒 1/3）`,
              ),
        }),
      ],
    },
    {
      seam: "delegation",
      title: en ? "One item, two topics" : "一项塞了两个主题",
      caption: en
        ? "The agent dispatches the routes, but one item carries both the orders and the search change. The split check has a judge model read each item, finds more than one topic in that one, and refuses the call. Nothing was dispatched."
        : "代理派发路由任务，但其中一项同时包含 orders 和 search 两处改动。拆分检查让判定模型逐项阅读，发现这一项涉及不止一个主题，拦下了整个调用，什么都没有派出去。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "say",
              text: en ? "The routes don't depend on each other, so workers can change them." : "几个路由互不依赖，交给执行者去改。",
            },
            {
              kind: "call",
              tool: "task",
              args: "OrdersAndSearch, WebhooksRoute · task:low",
              status: "blocked",
              result: "你没有好好规划任务：`OrdersAndSearch` 把多个主题塞给了一个 agent",
            },
          ],
        },
      ],
      hooks: [
        onLine(0, 1, {
          kind: "block",
          source: "task-split-check",
          at: en ? "task call" : "task 调用前",
          label: label.refused,
          body: splitCheck("`OrdersAndSearch`"),
          gloss: en
            ? gloss(
                "You did not plan the tasks properly: `OrdersAndSearch` hands several topics to one agent. Split it into one item per topic and dispatch again; an item you confirm covers a single topic can be dispatched again unchanged, and passes the second time.",
              )
            : undefined,
        }),
      ],
    },
    {
      seam: "delegation",
      title: en ? "Writers share one checkout" : "执行者共用工作区",
      caption: en
        ? "Split by route, the call now has three writers, all in the same checkout. It is held back once with a reminder to give each writer an isolated worktree. Nothing was dispatched yet."
        : "按路由拆开后，这次调用有三个写文件的执行者，却都在同一个工作区里。调用被拦下一次，提醒给每个执行者单独开一个 worktree。这时还没有派出任何执行者。",
      front: [
        {
          kind: "transcript",
          lines: [
            { kind: "say", text: en ? "Split by route: one worker per route." : "按路由拆开，一个路由一个执行者。" },
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
        onLine(0, 1, {
          kind: "block",
          source: "isolation-nudge",
          at: en ? "task call" : "task 调用前",
          label: label.refused,
          body: isolationNudge,
          gloss: en
            ? undefined
            : gloss(
                `没有派发——这是提醒，不是规定。这次调用会让几个能写文件的代理不加隔离地共用这个工作目录：${workers.map((w) => `\`${w}\``).join("、")}。共用同一个检出的代理可能互相覆盖对方的改动。给写文件的代理加上 \`isolated: true\` 重新派发；只做调研的项设 \`isolated: false\`，保持共用。每段提示词只提醒一次：原样重新派发同样的提示词，就照写的执行。`,
              ),
        }),
      ],
    },
    {
      seam: "delegation",
      title: en ? "Workers and an advisor" : "执行者与顾问",
      caption: en
        ? "Before re-dispatching, the agent asks an advisor to check the briefs. Before each of its model calls the advisor receives your request and your answer word for word, so it can quote you: the briefs dropped Retry-After. The agent adds it and dispatches the three workers into their own worktrees."
        : "重新派发之前，代理请顾问检查派发说明。顾问每次调用模型前都会收到你的原话和你在提问里的回答，所以能直接引用你：派发说明漏了 Retry-After。代理补上后，把三个执行者分别派进各自的 worktree。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "task",
              args: "Steady · discuss:steady",
              status: "ok",
              result: en
                ? `The user asked to "${retryAfterAsk.en}". All three briefs say only "return 429", which drops Retry-After. Add it to each brief's acceptance check.`
                : `用户的原话是“${retryAfterAsk.zh}”。三份派发说明都只写了“返回 429”，漏掉了 Retry-After。把它加进每份说明的验收条件。`,
            },
            { kind: "call", tool: "task", args: `${workers.join(", ")} · task:low · isolated: true`, status: "ok" },
          ],
        },
        {
          kind: "agents",
          rows: [
            ...workers.map((name) => ({
              name,
              agent: "task:low",
              where: worktree(name),
              state: "running" as const,
              stateText: en ? "running" : "运行中",
            })),
            {
              name: "Steady",
              agent: "discuss:steady",
              where: en ? "shared · read-only" : "共用 · 只读",
              state: "done" as const,
              stateText: en ? "replied" : "已回复",
            },
          ],
        },
      ],
      hooks: [
        onLine(0, 0, {
          kind: "reminder",
          source: "user-prompt-inject",
          at: en ? "each advisor model call" : "顾问每次调用模型",
          label: label.appended,
          body: userGoalInject(lang),
          gloss: en
            ? undefined
            : gloss(
                "以下是人类用户给根会话的原话，逐字照录，按先后排列，最早的在前。你辅导的是替这个用户干活的代理；这些话不是它写的，它对你说的是它对这些话的理解。用户也通过 `ask` 工具做决定：以下是用户在那里的回答，最早的在前，每个答过的问题一行 `问题 → 回答`。它们和上面的原话一样，都是用户自己的决定。拿这些原话和回答去衡量你辅导的代理，不要拿它自己的复述去衡量：用户的目标、明确的约束和已表明的决定（在原话或 ask 回答里）优先于代理的说法。代理的计划、范围或结论偏离它们时（问题缩小、换成更容易的替代、丢掉一项要求、加了用户没要的要求、重开用户已经做过的决定），指出差距，并引用它违背的那句原话或回答。后来的原话和回答修正或取代先前的，最新的那条说明用户现在要什么。`task:*` 代理可能只负责其中一块，范围由它的上级划定；按与这一块有关的原话核对它，覆盖不及整条原话不算偏离，与原话矛盾才算。不要替用户做主：不要在这些原话之外编造要求；原话有歧义时直接说明，并指出代理应该用 `ask` 问用户的问题，而不是替它选。只有对照这些原话核对过代理的方案，同意它才算结论。",
              ),
        }),
      ],
    },
    {
      seam: "execution",
      title: en ? "One terminal, two typists" : "共用一个终端",
      caption: en
        ? "The agent keeps a redis-cli session open with exec_command and types into it with write_stdin. You open the same session full-pane in the Terminals view, where your keys go to the same terminal. On the screen, the agent's input is purple and yours is blue."
        : "代理用 exec_command 开着一个 redis-cli 会话，用 write_stdin 往里输入。你在终端视图里把同一个会话全屏打开，按键也发到这个终端。屏幕上紫色是代理的输入，蓝色是你的输入。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "write_stdin",
              args: '2, "KEYS rl:*\\n"',
              status: "ok",
              result: '1) "rl:key_live_7Q"\n2) "rl:key_test_k2"',
            },
          ],
        },
        {
          kind: "terminals",
          data: {
            mode: "page",
            selected: 2,
            sessions: [
              {
                id: 1,
                title: "pnpm test --watch",
                command: "pnpm test --watch",
                state: "running",
                elapsed: "6m 40s",
                cwd: "~/code/shop-api",
                size: "120×32",
                screen: testScreen,
              },
              {
                id: 2,
                title: "redis-cli",
                command: "redis-cli",
                state: "running",
                elapsed: "2m 05s",
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
      title: en ? "Deleting to the trash" : "删除进回收站",
      caption: en
        ? "To clear a stale test cache, the agent calls shutil.rmtree in a Python cell. Deletion is refused there too, before the cell runs. The agent calls the delete tool instead, which moves the folder to the system trash and says where it went."
        : "为了清掉过期的测试缓存，代理在 Python 单元里调用 shutil.rmtree。eval 里的删除同样在执行前就被拒绝。代理改用 delete 工具，文件夹移进系统回收站，结果里写明移到了哪里。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "eval",
              args: `py · import shutil; ${rmtreeLine}`,
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
        onLine(0, 0, {
          kind: "block",
          source: "delete-guard",
          at: en ? "eval call" : "eval 调用前",
          label: label.refused,
          body: deleteGuard,
          gloss: en
            ? undefined
            : gloss(
                `删除命令已禁用，这次调用没有执行。删除命令：\`${rmtreeLine}\`（\`rmtree\` 会删除文件）。要删文件，用 \`delete\` 工具并写明路径，\`mode\` 不填，默认移进系统回收站。`,
              ),
        }),
      ],
    },
    {
      seam: "execution",
      title: en ? "Editing through the shell" : "命令行里改文件",
      caption: en
        ? "The agent changes how Retry-After is rounded with a chain of perl -pi commands. The command runs, but a judge model reads it as an in-place file edit, and a reminder to use edit arrives with the result. The agent makes its next change with edit."
        : "代理用一串 perl -pi 命令修改 Retry-After 的取整方式。命令照常执行，但判定模型认出这是在原地改文件，提醒随结果一起送达：该用 edit。代理接下来的改动就用了 edit。",
      front: [
        {
          kind: "transcript",
          lines: [
            { kind: "call", tool: "bash", args: perlEdit, status: "ok" },
            { kind: "call", tool: "edit", args: "src/middleware/rate-limit.ts", status: "ok" },
          ],
        },
      ],
      hooks: [
        onLine(0, 0, {
          kind: "reminder",
          source: "tool-policy-nag",
          at: en ? "bash result" : "bash 返回后",
          label: label.appended,
          body: intentReminder,
          gloss: en
            ? gloss(`Your \`bash\` call belongs to “edit an existing file”. Use \`edit\` for it instead of working around it. This call: \`${perlEdit}\``)
            : undefined,
        }),
      ],
    },
    {
      seam: "delivery",
      title: en ? "A worker reports done" : "执行者报告完成",
      caption: en
        ? "WebhooksRoute reports success without running the test that was failing. The completion judge compares the report with the worker's latest tool calls and returns the yield once. The worker fixes the signature check and runs the test before reporting again."
        : "WebhooksRoute 报告完成，却没有重跑之前失败的测试。完成度鉴定对照这份报告和它最近的工具调用，退回了这次 yield。执行者修好签名校验、跑过测试，才再次汇报。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "call",
              tool: "yield",
              args: en
                ? "WebhooksRoute · Signed callbacks skip the limiter; the route uses the shared middleware."
                : "WebhooksRoute · 签名回调跳过限流，路由已改用共用中间件。",
              status: "blocked",
              result: "完成度鉴定：对照最初的任务和你最近的 tool call，这次任务还没有真正完成，yield 被退回。",
            },
          ],
        },
        {
          kind: "agents",
          rows: workers.map((name) => ({
            name,
            agent: "task:low",
            where: worktree(name),
            state: name === "WebhooksRoute" ? ("returned" as const) : ("done" as const),
            stateText: name === "WebhooksRoute" ? (en ? "yield returned" : "yield 被退回") : en ? "done" : "完成",
          })),
        },
      ],
      hooks: [
        onLine(0, 0, {
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
        }),
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
        onLine(0, 0, {
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
        }),
      ],
    },
    {
      seam: "delivery",
      title: en ? "Done, with evidence" : "完成并附上证据",
      caption: en
        ? "The agent runs the suite, commits, and reports with the test output as evidence."
        : "代理跑完测试、提交，并附上测试输出作为证据。",
      front: [
        {
          kind: "transcript",
          lines: [
            { kind: "call", tool: "exec_command", args: "pnpm test", status: "ok", result: " Tests  16 passed (16)" },
            {
              kind: "call",
              tool: "bash",
              args: 'git commit -am "fix: round Retry-After up to whole seconds"',
              status: "ok",
              result: "[main 7d03b1f] fix: round Retry-After up to whole seconds",
            },
            {
              kind: "say",
              text: en
                ? "Done. Keys past their allowance get 429 with Retry-After (rate-limit.test.ts › returns 429 with Retry-After); signed payment callbacks are never limited (webhooks.test.ts › signed callbacks skip the limiter). On main: the middleware in a41c9e2, each route in its worker's commit, and the rounding fix in 7d03b1f."
                : "完成。超出额度的 key 收到 429 和 Retry-After（rate-limit.test.ts › returns 429 with Retry-After）；签名的支付回调从不限流（webhooks.test.ts › signed callbacks skip the limiter）。main 上：中间件在 a41c9e2，每个路由在各自执行者的提交里，取整修复在 7d03b1f。",
            },
          ],
        },
      ],
      hooks: [],
    },
    {
      seam: "delivery",
      title: en ? "Searching past sessions" : "检索历史会话",
      caption: en
        ? "Later you ask how this session's tool calls went. The agent queries the session files with SQL through omp-sessions, which reads them in place with DuckDB, and gets one row per tool."
        : "之后你问这个会话里各工具调用得怎么样。代理通过 omp-sessions 用 SQL 查询会话文件，DuckDB 直接读取这些文件，每个工具得到一行。",
      front: [
        {
          kind: "transcript",
          lines: [
            {
              kind: "user",
              text: en
                ? "How did the tool calls in this session go? Count the errors per tool."
                : "这个会话里的工具调用情况怎么样？按工具统计一下出错次数。",
            },
          ],
        },
        { kind: "sql", data: { language: "js", code: sqlCode, columns: ["tool", "calls", "errors"], rows: sqlRows } },
      ],
      hooks: [],
    },
  ];
}

/** Extensions omp-light turns off (agent/config-light.yml), plus the host's bash interceptor it disables. */
function modeChecks(full: boolean): ReadonlyArray<{ name: string; loaded: boolean }> {
  return [
    "fork-task",
    "isolation-nudge",
    "lang-nag",
    "task-completion-judge",
    "task-split-check",
    "tool-policy-nag",
    "turn-judge",
    "user-prompt-inject",
    "watchdog-agent",
    "bashInterceptor",
  ].map((name) => ({ name, loaded: full }));
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
