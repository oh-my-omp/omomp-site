import type { Lang, Text } from "../i18n";
import type { Art } from "../slices/Art";
import type { ComponentId } from "./component-art";
import type { SeamId } from "./scenario";
import type { ProductArtId } from "../slices/HomeProductArt";

/**
 * The slice a home-page card shows: omp-config's pipeline, a component's own art, a compressed product stage,
 * the terminal card, or slices written for the card.
 */
export type RepoArt =
  | { readonly from: "pipeline" }
  | { readonly from: "component"; readonly id: ComponentId }
  | { readonly from: "product"; readonly id: ProductArtId }
  | { readonly from: "exec" }
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
      en: "The governance runtime: checks, guards and judges at every seam of a task.",
      zh: "治理运行时：在任务的每道接缝上做检查、拦截和判定。",
    },
  },
  {
    name: "omp-ask-more",
    kind: "plugin",
    seams: ["intent"],
    art: { from: "component", id: "ask-more-panel" },
    line: {
      en: "A decision the agent needs opens as a full page, with a tradeoff per option.",
      zh: "代理要你拍板时，问题整页打开，每个选项写明取舍。",
    },
  },
  {
    name: "omp-todo-more",
    kind: "plugin",
    seams: ["memory"],
    art: { from: "component", id: "todo-panel" },
    line: {
      en: "The plan as goal, phases and estimates; each finished item is committed.",
      zh: "计划写成目标、阶段和估时，每完成一项就提交。",
    },
  },
  {
    name: "omp-unified-exec",
    kind: "plugin",
    seams: ["execution"],
    art: { from: "exec" },
    line: {
      en: "Long commands run in terminals you can open in Tern, watch or type into.",
      zh: "长时间命令跑在终端里，可在 Tern 中打开旁观或直接输入。",
    },
  },
  {
    name: "omp-playbooks",
    kind: "product",
    seams: [],
    page: "/products/playbooks/",
    art: { from: "product", id: "playbooks" },
    line: {
      en: "Write the design with the agent in one YAML file, then launch it block by block.",
      zh: "和代理在一个 YAML 里写设计，再逐块启动执行。",
    },
  },
  {
    name: "omp-thinking-translator",
    kind: "plugin",
    seams: ["delivery"],
    art: { from: "component", id: "thinking-translator" },
    line: {
      en: "Each thinking line is translated under the original; the model never sees it.",
      zh: "思考逐行附上译文，译文只给人看，不发给模型。",
    },
  },
  {
    name: "omp-sessions",
    kind: "plugin",
    seams: ["delivery"],
    art: { from: "component", id: "sessions" },
    line: {
      en: "Read any past session by URL, or query them all with SQL.",
      zh: "按 URL 读任意历史会话，也能用 SQL 一起查。",
    },
  },
  {
    name: "omp-dispatch",
    kind: "product",
    seams: [],
    page: "/products/dispatch/",
    art: { from: "product", id: "dispatch" },
    line: {
      en: "Hand over an issue tree: a fresh session delivers each ticket, a fresh judge rules on it.",
      zh: "交出一棵 issue 树：每张工单由新会话交付，由新判定者裁决。",
    },
  },
  {
    name: "omp-remote-build",
    kind: "product",
    seams: [],
    page: "/products/remote-build/",
    art: { from: "product", id: "remote-build" },
    line: {
      en: "Edit on your machine; build and test in a remote container per worktree.",
      zh: "在本机改代码，在每个 worktree 对应的远程容器里构建测试。",
    },
  },
  {
    name: "omp-peers",
    kind: "plugin",
    seams: ["delivery"],
    art: { from: "component", id: "peers" },
    line: {
      en: "Sessions in other omp processes can be found, asked a side question or messaged.",
      zh: "找到其他 omp 进程里的会话，旁路提问或发消息。",
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
      en: "Generate and edit images through the Codex login omp already has.",
      zh: "借用 omp 已有的 Codex 登录生成和编辑图片。",
    },
  },
];
