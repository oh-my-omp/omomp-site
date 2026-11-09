import type { Lang } from "../i18n";
import type { Art } from "./Art";

/**
 * Content for the omp-playbooks stage: one Playbook YAML shown next to the
 * Tern document pane that renders it. Field shapes and labels mirror
 * src/service/store.ts serialization and src/service/ui.ts card anatomy
 * in the omp-playbooks repo. The YAML column is serialized from these same
 * blocks, so the two views of the file cannot disagree.
 */
/** Block progress; the status icon and YAML `status:` value derive from it. */
export type PbStatus = "todo" | "running" | "done";

/**
 * Execution/orchestration blocks also carry the launch-button state. `requested`
 * is a pending flag the pane shows while the coordinator has not created the
 * Launch yet; it never reaches the YAML, whose status stays `todo`.
 */
export type PbRunState =
  | { readonly status: "todo"; readonly launch: "launch" | "requested" }
  | { readonly status: "running" }
  | { readonly status: "done"; readonly report?: string };

interface PbBase {
  readonly id: string;
  readonly title: string;
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
  /** Shown in the SUBAGENT column; absent renders the pane's Default/默认. */
  readonly agent?: string;
  readonly isolated?: boolean;
}

export interface PbOrchestrationBlock extends PbBase {
  readonly kind: "orchestration";
  readonly state: PbRunState;
  /** Lines inside the single js code fence that makes a block an orchestration block. */
  readonly code: readonly string[];
}


export type PbBlock = PbDesignBlock | PbExecutionBlock | PbOrchestrationBlock;

export interface PlaybooksStageData {
  /** File pane tab and its YAML contents derive from `blocks`. */
  readonly file: string;
  /** Repo shown in the Playbooks pane meta. */
  readonly repo: string;
  /** Playbook `title` value, rendered after the `##` doc hash. */
  readonly title: string;
  readonly blocks: readonly PbBlock[];
  /** Statuses the dock counts over tracked blocks. */
  readonly dock: { readonly done: number; readonly total: number };
  /**
   * Site annotation (not a UI label): the accent-marked line is where the
   * coordinator wrote the running status back into this file.
   */
  readonly writebackNote: string;
  /** Site annotation: launched blocks are compiled into a subagent prompt. */
  readonly promptNote: string;
}

const en: PlaybooksStageData = {
  file: "rate-limit.yaml",
  repo: "shop-api",
  title: "Rate limiting for shop-api",
  blocks: [
    {
      kind: "design",
      id: "b1",
      title: "Rate-limit policy",
      state: "done",
      requirement:
        "Add middleware that limits requests per API key: Redis-backed token bucket, 429 with Retry-After when the bucket is empty.",
      design: [
        "bucket(key) → { tokens, refill }",
        "refill: 60 tokens/min, capacity 120",
        "empty bucket → 429, Retry-After = wait for 1 token",
      ],
    },
    {
      kind: "execution",
      id: "b2",
      title: "Write src/middleware/rate-limit.ts",
      state: { status: "done", report: "rate-limit.ts added; bucket math covered by token-bucket.test.ts." },
      body: [
        "Implement the token-bucket middleware from the design.",
        "Reuse the repo's redis client; export a factory that takes the bucket config.",
      ],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b3",
      title: "Wire src/routes/orders.ts",
      state: { status: "running" },
      body: ["Mount the middleware on /orders and pass the per-plan bucket config."],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b4",
      title: "Wire src/routes/search.ts",
      state: { status: "todo", launch: "requested" },
      body: ["Mount the middleware on /search; key the bucket on the caller's API key."],
    },
    {
      kind: "execution",
      id: "b5",
      title: "Wire src/routes/webhooks.ts",
      state: { status: "todo", launch: "launch" },
      body: ["Mount the middleware on /webhooks; keep the raw-body parser ahead of it."],
    },
    {
      kind: "orchestration",
      id: "b6",
      title: "Verify and launch callers",
      state: { status: "todo", launch: "launch" },
      code: ["await launch(\"b4\");", "await launch(\"b5\");", "await shell(\"pnpm test\");"],
    },
  ],
  dock: { done: 2, total: 6 },
  writebackNote: "the coordinator wrote todo → running back into this file",
  promptNote: "launched blocks are compiled into a subagent prompt",
};

const zh: PlaybooksStageData = {
  file: "rate-limit.yaml",
  repo: "shop-api",
  title: "shop-api 限流",
  blocks: [
    {
      kind: "design",
      id: "b1",
      title: "限流策略",
      state: "done",
      requirement: "给每个 API key 做限流中间件：基于 Redis 的令牌桶，桶空时返回 429 和 Retry-After。",
      design: [
        "bucket(key) → { tokens, refill }",
        "refill：每分钟 60 个令牌，桶容量 120",
        "桶空 → 429，Retry-After = 攒出一个令牌所需时间",
      ],
    },
    {
      kind: "execution",
      id: "b2",
      title: "写 src/middleware/rate-limit.ts",
      state: { status: "done", report: "已添加 rate-limit.ts；令牌桶算法由 token-bucket.test.ts 覆盖。" },
      body: ["按设计实现令牌桶中间件。", "复用仓库已有的 redis client；导出一个接收桶配置的工厂函数。"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b3",
      title: "接 src/routes/orders.ts",
      state: { status: "running" },
      body: ["在 /orders 上挂中间件，按套餐传入桶配置。"],
      agent: "task:low",
      isolated: true,
    },
    {
      kind: "execution",
      id: "b4",
      title: "接 src/routes/search.ts",
      state: { status: "todo", launch: "requested" },
      body: ["在 /search 上挂中间件；桶按调用方 API key 划分。"],
    },
    {
      kind: "execution",
      id: "b5",
      title: "接 src/routes/webhooks.ts",
      state: { status: "todo", launch: "launch" },
      body: ["在 /webhooks 上挂中间件；raw-body parser 保持在它之前。"],
    },
    {
      kind: "orchestration",
      id: "b6",
      title: "启动调用方并验证",
      state: { status: "todo", launch: "launch" },
      code: ["await launch(\"b4\");", "await launch(\"b5\");", "await shell(\"pnpm test\");"],
    },
  ],
  dock: { done: 2, total: 6 },
  writebackNote: "协调者把 todo → running 写回了这个文件",
  promptNote: "启动的块会被编译成 subagent 的提示词",
};

export const playbooksStage: Record<Lang, PlaybooksStageData> = { en, zh };

/**
 * The slice above each cell of the page's How it works grid, in cell order:
 * a design block reached by `((b1))`, the launch request notice the pane sends
 * the coordinator, and the status and report a subagent wrote into a run file.
 * The reference syntax, notice header, notice JSON and YAML field order are
 * verbatim from the extension; the paths and titles come from the scenario.
 */
const sectionArt: readonly [Art, Art, Art] = [
  {
    kind: "code",
    title: "rate-limit.yaml",
    lines: [
      "- id: b1",
      "  design: |2",
      "      bucket(key) → { tokens, refill }",
      "- id: b2",
      "  body: |2",
      "      Implement the bucket from ((b1)).",
    ],
  },
  {
    kind: "code",
    title: "notice",
    lines: [
      "This is a Playbook document service notice, not a user message",
      '{"doc":"/work/shop-api/rate-limit.yaml",',
      ' "event":"launch_requested",',
      ' "data":{"blocks":["b3"]}}',
    ],
  },
  {
    kind: "code",
    title: "rate-limit.runs/r1.yaml",
    lines: [
      "- id: b2",
      "  status: done",
      "  report: |2",
      "      rate-limit.ts added; bucket math covered by token-bucket.test.ts.",
    ],
  },
];

export const playbooksSectionArt: Record<Lang, readonly [Art, Art, Art]> = { en: sectionArt, zh: sectionArt };
