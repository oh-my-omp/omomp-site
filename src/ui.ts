import type { Text } from "./i18n";

/** `match` is the route prefix that marks the item active; it defaults to `route`. */
export const nav: ReadonlyArray<{ route: string; match?: string; label: Text }> = [
  { route: "/principles/", label: { en: "Principles", zh: "设计原则" } },
  { route: "/lifeline/", label: { en: "Lifeline", zh: "生命线" } },
  { route: "/replay/", label: { en: "Replay", zh: "回放" } },
  { route: "/products/playbooks/", match: "/products/", label: { en: "Products", zh: "产品" } },
  { route: "/defaults/", label: { en: "Defaults", zh: "默认策略" } },
];

export const ui = {
  siteName: { en: "oh-my-omp", zh: "oh-my-omp" },
  switchLang: { en: "中文", zh: "English" },
  github: { en: "GitHub", zh: "GitHub" },
  skip: { en: "Skip to content", zh: "跳到正文" },
  next: { en: "Next", zh: "下一页" },
  previous: { en: "Previous", zh: "上一页" },
  repo: { en: "Repository", zh: "仓库" },
  layers: {
    human: { en: "Human surface", zh: "人机交互面" },
    agent: { en: "Agent primitives", zh: "代理原语" },
    silent: { en: "Silent governance", zh: "静默治理" },
  },
} as const satisfies Record<string, unknown>;

export const org = "https://github.com/oh-my-omp";
