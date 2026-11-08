import type { Text } from "../i18n";

export type SeamId = "intent" | "prompt" | "memory" | "delegation" | "execution" | "delivery";

/** Schematic drawn inside a featured card; see components/RepoFigure.astro. */
export type Figure = "seams" | "playbooks" | "dispatch" | "remote-build";

/** A repository shown as a card on the home page. */
export interface Repo {
  readonly name: string;
  readonly kind: "runtime" | "plugin" | "product" | "tool";
  readonly line: Text;
  /** Seams the repo acts on; empty for products and tools, which have their own pages. */
  readonly seams: readonly SeamId[];
  /** Product page route, for products only. */
  readonly page?: string;
  readonly figure?: Figure;
}

export const repoUrl = (name: string) => `https://github.com/oh-my-omp/${name}`;

export const repos: readonly Repo[] = [
  {
    name: "omp-config",
    kind: "runtime",
    seams: ["intent", "prompt", "memory", "delegation", "execution", "delivery"],
    figure: "seams",
    line: {
      en: "The governance layer. Prompt cleanup, dispatch gates, judges and guards, wired into one runtime.",
      zh: "治理层。提示词整理、派发闸门、回合判定与执行防护，接成一套运行时。",
    },
  },
  {
    name: "omp-ask-more",
    kind: "plugin",
    seams: ["intent"],
    line: {
      en: "Every decision the agent hands you fills the screen: what exists, what is at stake, what each option costs.",
      zh: "代理交给你的每个决定都占满一屏：现状、取舍、每个选项的代价。",
    },
  },
  {
    name: "omp-todo-more",
    kind: "plugin",
    seams: ["memory"],
    line: {
      en: "A plan the agent has to keep: a goal, phases, a time budget per item, a commit when one closes.",
      zh: "代理必须守住的计划：有目标、分阶段，每项带时间预算，完成一项即提交。",
    },
  },
  {
    name: "omp-unified-exec",
    kind: "plugin",
    seams: ["execution"],
    line: {
      en: "Long-lived terminals the agent drives. Open one in Tern to watch, or type into it.",
      zh: "代理驱动的长驻终端。在 Tern 里打开，可以旁观，也可以直接输入。",
    },
  },
  {
    name: "omp-sessions",
    kind: "plugin",
    seams: ["delivery"],
    line: {
      en: "Every past session on the machine, readable as files and queryable in SQL.",
      zh: "本机所有历史会话，能当文件读，也能用 SQL 查。",
    },
  },
  {
    name: "omp-peers",
    kind: "plugin",
    seams: ["delivery"],
    line: {
      en: "Sessions in separate omp processes find each other, ask side questions, and trade messages.",
      zh: "分属不同 omp 进程的会话互相发现、旁路提问、互发消息。",
    },
  },
  {
    name: "omp-thinking-translator",
    kind: "plugin",
    seams: ["delivery"],
    line: {
      en: "The model's thinking, translated for you on screen. The model never sees the translation.",
      zh: "把模型的思考译成你的语言显示出来，模型本身看不到译文。",
    },
  },
  {
    name: "omp-playbooks",
    kind: "product",
    seams: [],
    page: "/products/playbooks/",
    figure: "playbooks",
    line: {
      en: "Write the design together with the agent, then launch it block by block.",
      zh: "和代理一起写设计，再一块一块启动执行。",
    },
  },
  {
    name: "omp-dispatch",
    kind: "product",
    seams: [],
    page: "/products/dispatch/",
    figure: "dispatch",
    line: {
      en: "Deliver a GitHub issue tree. A fresh session per ticket, a fresh judge per verdict.",
      zh: "交付一整棵 GitHub issue 树。每张工单由新会话完成，每次裁决由新会话做出。",
    },
  },
  {
    name: "omp-remote-build",
    kind: "product",
    seams: [],
    page: "/products/remote-build/",
    figure: "remote-build",
    line: {
      en: "Edit on your laptop. Build and test in a remote container, one per worktree.",
      zh: "在本机编辑，到远端容器里构建和测试，每个 worktree 一个容器。",
    },
  },
  {
    name: "omp-codex-image-gen",
    kind: "tool",
    seams: [],
    line: {
      en: "Generate and edit images through the Codex login omp already holds.",
      zh: "复用 omp 已有的 Codex 登录来生成和编辑图片。",
    },
  },
];
