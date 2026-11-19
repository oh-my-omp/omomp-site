import type { Lang } from "../i18n";
import type { Art } from "./Art";

export type PbStatus = "todo" | "running" | "done";

export type PbRunState =
  | { readonly status: "todo"; readonly launch: "launch" | "requested" }
  | { readonly status: "running" }
  | { readonly status: "done"; readonly report?: string };

interface PbBase {
  readonly id: string;
  readonly title: string;
  readonly open: boolean;
}

export interface PbDesignBlock extends PbBase {
  readonly kind: "design";
  readonly state: PbStatus;
  readonly requirement: string;
  readonly design: readonly string[];
}

export interface PbExecutionBlock extends PbBase {
  readonly kind: "execution";
  readonly state: PbRunState;
  readonly body: readonly string[];
  readonly agent?: string;
  readonly isolated?: boolean;
}

export interface PbOrchestrationBlock extends PbBase {
  readonly kind: "orchestration";
  readonly state: PbRunState;
  readonly code: readonly string[];
}

export type PbBlock = PbDesignBlock | PbExecutionBlock | PbOrchestrationBlock;

export interface PbCoordinator {
  readonly header: string;
  readonly request: string;
  readonly choose: string;
  readonly first: string;
  readonly beats: {
    readonly notice: string;
    readonly start: string;
    readonly frozen: string;
    readonly subagent: string;
    readonly file: string;
  };
  readonly running: string;
}

export interface PlaybooksStageData {
  readonly title: string;
  readonly blocks: readonly PbBlock[];
  readonly requested: string;
  readonly coordinator: PbCoordinator;
  readonly sends: string;
}

export const playbooksScene = {
  doc: "/work/rate-limit.yaml",
  file: "rate-limit.yaml",
  repo: "shop-api",
  launch: "l3",
  agent: "task:low",
  call: 'var worker = await playbook.agent({ doc: "/work/rate-limit.yaml", blocks: ["b4"] })',
  steps: ['playbook_launch { op: "launch" } → l3', "agent(prompt)", 'playbook_launch { op: "bind", launch: "l3" }'],
  data: '{"doc":"/work/rate-limit.yaml","event":"launch_requested","data":{"blocks":["b4"]}}',
} as const;

const shared = {
  en: {
    policy: "Rate-limit policy",
    searchAsk: "Mount the middleware on /search with this policy:",
    b2Report: "rate-limit.ts added; bucket math covered by token-bucket.test.ts.",
    },
  zh: {
    policy: "限流策略",
    searchAsk: "按这份策略给 /search 挂上中间件：",
    b2Report: "已添加 rate-limit.ts；令牌桶算法由 token-bucket.test.ts 覆盖。",
  },
} as const satisfies Record<Lang, Record<string, string>>;

const en: PlaybooksStageData = {
  title: "Rate limiting for shop-api",
  requested: "b4",
  sends: "launch_requested",
  blocks: [
    {
      kind: "design",
      id: "b1",
      title: shared.en.policy,
      open: true,
      state: "done",
      requirement: "Limit requests per API key with a Redis-backed token bucket; answer 429 with Retry-After when it is empty.",
      design: ["bucket(key) → { tokens, refill }", "refill: 60 tokens/min, capacity 120", "empty bucket → 429, Retry-After = wait for 1 token"],
    },
    {
      kind: "execution",
      id: "b2",
      title: "Write src/middleware/rate-limit.ts",
      open: false,
      state: { status: "done", report: shared.en.b2Report },
      body: ["Implement the token-bucket middleware from this design:", "((b1))"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b3",
      title: "Wire src/routes/orders.ts",
      open: false,
      state: { status: "running" },
      body: ["Mount the middleware on /orders with this policy:", "((b1))"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b4",
      title: "Wire src/routes/search.ts",
      open: true,
      state: { status: "todo", launch: "requested" },
      body: [shared.en.searchAsk, "((b1))", "Key the bucket on the caller's API key."],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "orchestration",
      id: "b5",
      title: "Run the suite",
      open: false,
      state: { status: "todo", launch: "launch" },
      code: ['await playbook.run({ blocks: ["b4"] });'],
    },
  ],
  coordinator: {
    header: "This is a Playbook document service notice, not a user message",
    request:
      'A person requested launching blocks ["b4"] of the Playbook. Block b4 has preset agent: "task:low" isolated: true, so playbook.agent / playbook.run use it automatically when arguments are omitted.',
    choose: "Next, choose one:",
    first: `① Non-blocking: in eval, \`${playbooksScene.call}\` returns as soon as the subagent is started and bound; …`,
    beats: {
      notice: "The click reaches the coordinator as a notice",
      start: "The coordinator starts the block from eval",
      frozen: "The Launch freezes the prompt, references expanded",
      subagent: "A subagent runs it in its own worktree",
      file: "The subagent writes its status into the file",
    },
    running: "running in an isolated worktree",
  },
};

const zh: PlaybooksStageData = {
  title: "shop-api 限流",
  requested: "b4",
  sends: "launch_requested",
  blocks: [
    {
      kind: "design",
      id: "b1",
      title: shared.zh.policy,
      open: true,
      state: "done",
      requirement: "按 API key 限流，令牌桶放在 Redis；桶空时返回 429 和 Retry-After。",
      design: ["bucket(key) → { tokens, refill }", "refill：每分钟 60 个令牌，桶容量 120", "桶空 → 429，Retry-After = 攒出一个令牌所需时间"],
    },
    {
      kind: "execution",
      id: "b2",
      title: "写 src/middleware/rate-limit.ts",
      open: false,
      state: { status: "done", report: shared.zh.b2Report },
      body: ["按这份设计实现令牌桶中间件：", "((b1))"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b3",
      title: "接 src/routes/orders.ts",
      open: false,
      state: { status: "running" },
      body: ["按这份策略给 /orders 挂上中间件：", "((b1))"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b4",
      title: "接 src/routes/search.ts",
      open: true,
      state: { status: "todo", launch: "requested" },
      body: [shared.zh.searchAsk, "((b1))", "令牌桶按调用方的 API key 划分。"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "orchestration",
      id: "b5",
      title: "跑完整测试",
      open: false,
      state: { status: "todo", launch: "launch" },
      code: ['await playbook.run({ blocks: ["b4"] });'],
    },
  ],
  coordinator: {
    header: "这是 Playbook 文档服务的通知，不是用户消息",
    request:
      '人请求启动 Playbook 的块 ["b4"]。块 b4 已预设 agent: "task:low" isolated: true，不显式传参时 playbook.agent / playbook.run 自动使用。',
    choose: "下一步二选一：",
    first: `① 不阻塞：在 eval 中 \`${playbooksScene.call}\`，启动并绑定后立即返回；…`,
    beats: {
      notice: "点击以通知的形式送到协调者",
      start: "协调者在 eval 里启动这个块",
      frozen: "Launch 冻结提示词，引用已展开",
      subagent: "子代理在自己的 worktree 里执行",
      file: "子代理把状态写回文件",
    },
    running: "在独立 worktree 中运行",
  },
};

export const playbooksStage: Record<Lang, PlaybooksStageData> = { en, zh };

export const playbooksLinks: readonly { readonly label: string; readonly href: string }[] = [
  { label: "README", href: "https://github.com/oh-my-omp/omp-playbooks#readme" },
  { label: "playbook_open", href: "https://github.com/oh-my-omp/omp-playbooks/blob/HEAD/src/extension/topics/playbook_open.execution.md" },
  { label: "playbook_launch", href: "https://github.com/oh-my-omp/omp-playbooks/blob/HEAD/src/extension/topics/playbook_launch.lifecycle.md" },
];

export const joinNotice = (lang: Lang, parts: readonly string[]): string => parts.join(lang === "en" ? " " : "");

const sectionArt = (lang: Lang): readonly [Art, Art, Art] => {
  const d = playbooksStage[lang];
  const title = (id: string) => d.blocks.find((b) => b.id === id)?.title ?? id;
  return [
    {
      kind: "code",
      title: playbooksScene.file,
      lines: [
        "  - id: b1",
        `    title: "${shared[lang].policy}"`,
        "    requirement: |2",
        "      …",
        "    design: |2",
        "      bucket(key) → { tokens, refill }",
        "      …",
        "  - id: b4",
        `    title: "${title("b4")}"`,
        "    body: |2",
        `      ${shared[lang].searchAsk}`,
        "      ((b1))",
        `    agent: "${playbooksScene.agent}"`,
        "    isolated: true",
        "    status: todo",
      ],
    },
    {
      kind: "hook",
      hook: {
        kind: "reminder",
        source: "omp-playbooks",
        at: "launch_requested",
        label: lang === "en" ? "notice" : "通知",
        body: [d.coordinator.header, joinNotice(lang, [d.coordinator.request, d.coordinator.choose, d.coordinator.first]), playbooksScene.data].join("\n"),
      },
    },
    {
      kind: "code",
      title: "rate-limit.runs/r1.yaml",
      lines: [
        `title: "${d.title}"`,
        "blocks:",
        "  - id: b2",
        `    title: "${title("b2")}"`,
        "    …",
        "    status: done",
        "    report: |2",
        `      ${shared[lang].b2Report}`,
        "  - id: b3",
        "    …",
        "    status: running",
        "run:",
        "  id: r1",
        "  …",
        "  status: running",
      ],
    },
  ];
};

export const playbooksSectionArt: Record<Lang, readonly [Art, Art, Art]> = { en: sectionArt("en"), zh: sectionArt("zh") };
