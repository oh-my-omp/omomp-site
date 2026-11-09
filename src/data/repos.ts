import type { Lang, Text } from "../i18n";
import type { Art } from "../slices/Art";
import type { ComponentId } from "./component-art";
import type { SeamId } from "./scenario";
import { remoteBuildScene as rb } from "../slices/remote-build-stage-data";

/** The remote-build card: environment init, then a test run in the worktree's container. */
const remoteBuildArt: readonly Art[] = [
  {
    kind: "lines",
    lines: [
      { kind: "call", tool: "remote_env_init", args: "", status: "ok", result: rb.report.join("\n") },
      {
        kind: "call",
        tool: "container_exec",
        args: rb.execArgs,
        status: "ok",
        result: [rb.resultHead[0], "---", ...rb.screen.slice(2, 4).map((l) => l.text), "…"].join("\n"),
      },
    ],
  },
];

/** The slice a home-page card shows: the hook pipeline, a component's own art, or slices written for the card. */
export type RepoArt =
  | { readonly from: "pipeline" }
  | { readonly from: "component"; readonly id: ComponentId }
  | { readonly from: "own"; readonly arts: Readonly<Record<Lang, readonly Art[]>> };

/** A repository shown as a card on the home page. */
export interface Repo {
  readonly name: string;
  readonly kind: "runtime" | "plugin" | "product" | "tool";
  readonly line: Text;
  /** Seams the repo acts on; empty for products and tools, which have their own pages. */
  readonly seams: readonly SeamId[];
  /** Product page route, for products only. */
  readonly page?: string;
  readonly art: RepoArt;
}

export const repoUrl = (name: string) => `https://github.com/oh-my-omp/${name}`;

export const repos: readonly Repo[] = [
  {
    name: "omp-config",
    kind: "runtime",
    seams: ["intent", "prompt", "memory", "delegation", "execution", "delivery"],
    art: { from: "pipeline" },
    line: {
      en: "The governance layer: prompt cleanup, dispatch checks, turn judges and execution guards, wired into one runtime.",
      zh: "治理层：把提示词整理、派发检查、回合判定和执行防护放进同一套运行时。",
    },
  },
  {
    name: "omp-ask-more",
    kind: "plugin",
    seams: ["intent"],
    art: { from: "component", id: "ask-more-panel" },
    line: {
      en: "When the agent needs a decision, the question opens as a full page with the context and a tradeoff for each option.",
      zh: "代理需要你做决定时，问题以整页打开，写明背景和每个选项的取舍。",
    },
  },
  {
    name: "omp-todo-more",
    kind: "plugin",
    seams: ["memory"],
    art: { from: "component", id: "todo-panel" },
    line: {
      en: "The agent keeps its plan as a goal, phases and estimated items, and commits as each item closes.",
      zh: "代理把计划写成目标、阶段和带估时的条目，每完成一项就提交。",
    },
  },
  {
    name: "omp-unified-exec",
    kind: "plugin",
    seams: ["execution"],
    art: { from: "component", id: "terminals-hud" },
    line: {
      en: "Long-running commands live in terminals the agent drives; open one in Tern to watch it or type into it.",
      zh: "长时间运行的命令放在代理驱动的终端里；在 Tern 里打开，可以旁观，也可以直接输入。",
    },
  },
  {
    name: "omp-thinking-translator",
    kind: "plugin",
    seams: ["delivery"],
    art: { from: "component", id: "thinking-translator" },
    line: {
      en: "Each line of the model's thinking appears translated under the original; the model never sees the translation.",
      zh: "模型的每一行思考下方都附上译文；译文只给人看，不发给模型。",
    },
  },
  {
    name: "omp-sessions",
    kind: "plugin",
    seams: ["delivery"],
    art: { from: "component", id: "sessions" },
    line: {
      en: "Every past session on the machine can be read as files and queried with SQL.",
      zh: "本机所有历史会话都能当文件读，也能用 SQL 查。",
    },
  },
  {
    name: "omp-peers",
    kind: "plugin",
    seams: ["delivery"],
    art: { from: "component", id: "peers" },
    line: {
      en: "Sessions in separate omp processes find each other, ask side questions and send messages.",
      zh: "分属不同 omp 进程的会话可以互相发现、旁路提问、互发消息。",
    },
  },
  {
    name: "omp-playbooks",
    kind: "product",
    seams: [],
    page: "/products/playbooks/",
    art: {
      from: "own",
      arts: {
        en: [
          {
            kind: "code",
            title: "rate-limit.yaml",
            lines: [
              "- id: b3",
              '  title: "Wire src/routes/orders.ts"',
              "  agent: task:low",
              "  isolated: true",
              "  status: running",
              "- id: b4",
              '  title: "Wire src/routes/search.ts"',
              "  agent: task:low",
              "  isolated: true",
              "  status: todo",
            ],
          },
        ],
        zh: [
          {
            kind: "code",
            title: "rate-limit.yaml",
            lines: [
              "- id: b3",
              '  title: "接 src/routes/orders.ts"',
              "  agent: task:low",
              "  isolated: true",
              "  status: running",
              "- id: b4",
              '  title: "接 src/routes/search.ts"',
              "  agent: task:low",
              "  isolated: true",
              "  status: todo",
            ],
          },
        ],
      },
    },
    line: {
      en: "Write the design together with the agent in one YAML file, then launch it block by block.",
      zh: "和代理在同一个 YAML 文件里写设计，再一块一块启动执行。",
    },
  },
  {
    name: "omp-dispatch",
    kind: "product",
    seams: [],
    page: "/products/dispatch/",
    art: {
      from: "own",
      arts: {
        en: [
          {
            kind: "code",
            title: "shop-api#48 · owner: 48",
            lines: [
              "Coding → Publishing → AwaitingChecks → Reviewing",
              "→ Merging → Verifying → Closing → Done",
              "",
              "Open PR changed to head e4f5a6b; gates restart on the new fingerprint.",
              "",
              "Reviewing · head e4f5a6b",
              "  review  pending",
              "  accept  pending",
            ],
          },
        ],
        zh: [
          {
            kind: "code",
            title: "shop-api#48 · owner: 48",
            lines: [
              "Coding → Publishing → AwaitingChecks → Reviewing",
              "→ Merging → Verifying → Closing → Done",
              "",
              "Open PR changed to head e4f5a6b; gates restart on the new fingerprint.",
              "",
              "Reviewing · head e4f5a6b",
              "  review  pending",
              "  accept  pending",
            ],
          },
        ],
      },
    },
    line: {
      en: "Hand over a GitHub issue tree; each ticket is delivered by a new session and every verdict comes from a new judge.",
      zh: "把一棵 GitHub issue 树交给它：每张工单由一个新会话交付，每次裁决由一个新的判定会话做出。",
    },
  },
  {
    name: "omp-remote-build",
    kind: "product",
    seams: [],
    page: "/products/remote-build/",
    art: {
      from: "own",
      arts: {
        en: remoteBuildArt,
        zh: remoteBuildArt,
      },
    },
    line: {
      en: "The agent edits files on your machine while builds and tests run in a remote container, one per worktree.",
      zh: "代理在本机改文件，构建和测试在远程容器里跑，每个 worktree 一个容器。",
    },
  },
  {
    name: "omp-codex-image-gen",
    kind: "tool",
    seams: [],
    art: {
      from: "own",
      arts: {
        en: [
          {
            kind: "lines",
            lines: [
              { kind: "user", text: "Draw the rate-limit flow for the README: request, token bucket in Redis, 429 with Retry-After. Landscape, save it to docs/rate-limit.png." },
              { kind: "call", tool: "codex_generate_image", args: 'size: "1536x1024" · outputPath: "docs/rate-limit.png"', status: "ok", result: "model: gpt-image-2\nsize: 1536x1024\nsavedPath: docs/rate-limit.png" },
              { kind: "user", text: "Keep the layout; label the 429 arrow \"Retry-After: 30\". Save it as docs/rate-limit-v2.png." },
              { kind: "call", tool: "codex_generate_image", args: 'referencedImagePaths: ["docs/rate-limit.png"] · outputPath: "docs/rate-limit-v2.png"', status: "ok", result: "model: gpt-image-2\nsavedPath: docs/rate-limit-v2.png" },
            ],
          },
        ],
        zh: [
          {
            kind: "lines",
            lines: [
              { kind: "user", text: "给 README 画一张限流流程图：请求、Redis 里的令牌桶、带 Retry-After 的 429。横版，存到 docs/rate-limit.png。" },
              { kind: "call", tool: "codex_generate_image", args: 'size: "1536x1024" · outputPath: "docs/rate-limit.png"', status: "ok", result: "model: gpt-image-2\nsize: 1536x1024\nsavedPath: docs/rate-limit.png" },
              { kind: "user", text: "版式不变，在 429 那条箭头上标出“Retry-After: 30”，另存为 docs/rate-limit-v2.png。" },
              { kind: "call", tool: "codex_generate_image", args: 'referencedImagePaths: ["docs/rate-limit.png"] · outputPath: "docs/rate-limit-v2.png"', status: "ok", result: "model: gpt-image-2\nsavedPath: docs/rate-limit-v2.png" },
            ],
          },
        ],
      },
    },
    line: {
      en: "Generates and edits images through the Codex login omp already holds.",
      zh: "借用 omp 已有的 Codex 登录来生成和编辑图片。",
    },
  },
];
