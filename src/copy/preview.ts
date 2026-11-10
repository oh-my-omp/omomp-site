import type { Text } from "../i18n";

/** Copy shared by the two candidate home pages, so they differ in how they show the product, not in what they say first. */
export const preview = {
  hero: {
    /** Two lines; the second is set in the accent colour. */
    title: [
      { en: "Your rules, enforced", zh: "规则不只写给代理看" },
      { en: "Wrong calls refused", zh: "错的调用当场拦下" },
    ],
    /** Two sentences; on a wide screen the second starts its own line. */
    lede: [
      {
        en: "Plugins for the Oh My Pi (omp) coding agent and the Tern terminal.",
        zh: "给 Oh My Pi（omp）编码代理和 Tern 终端用的插件。",
      },
      {
        en: "omp-config checks every step of a task; omp-playbooks, omp-dispatch and omp-remote-build each run a whole workflow.",
        zh: "omp-config 检查任务的每一步；omp-playbooks、omp-dispatch、omp-remote-build 各自跑完一整条工作流。",
      },
    ],
    primary: { en: "See the demo", zh: "查看演示" },
    secondary: { en: "Walk the lifeline", zh: "浏览生命线" },
  },
  /** One sentence after the card grid, leading into the install stage; `**…**` is set bright, the rest grey. */
  bridge: {
    en: "**Use one plugin or the whole set.** Each runs on stock omp; omp-config adds the shared checks.",
    zh: "**单装一个也行，整套接入也行。**插件直接装在原版 omp 上，omp-config 补上共用检查。",
  },
} as const satisfies {
  hero: { title: readonly [Text, Text]; lede: readonly [Text, Text]; primary: Text; secondary: Text };
  bridge: Text;
};

/** The repaired page's own buttons in the first screen. */
export const repairHero = {
  primary: { en: "Install", zh: "安装" },
  secondary: { en: "GitHub", zh: "GitHub" },
} as const;

/** The install stage under the bridge: a two-tone heading, then one tab per way of installing. */
export const installStage = {
  /** Two lines; the second is set grey. */
  title: [
    { en: "See it in a session", zh: "在会话里看它干活" },
    { en: "alone, with omp-config, or inside Tern", zh: "单装、整套，或放进 Tern" },
  ],
  /** Comments on `omp` and `omp-light` in the second tab's commands; commands themselves are not localized. */
  fullComment: { en: "full mode", zh: "完整模式" },
  lightComment: {
    en: "light mode: skips the governance extensions",
    zh: "轻量模式：跳过治理扩展",
  },
  /** The stage's tab labels, short enough to fit one row on a phone; commands and notes come from `home.hosts.tabs`. */
  tabs: {
    plugin: { en: "One plugin", zh: "单个插件" },
    config: { en: "Full set", zh: "整套" },
    tern: { en: "Tern panels", zh: "Tern 面板" },
  },
} as const;

/** The four rules on the repaired page: its own heading, and the one summary it words differently from the rule page. */
export const repairFigs = {
  title: { en: "Four rules every component follows", zh: "每个组件都遵守的四条规则" },
  lede: {
    en: "They set what a component may change and which parts you can replace.",
    zh: "它们规定组件能改什么、哪些部分可以换成你的。",
  },
  summary: {
    roles: {
      en: "Workers hold no state; advisors see your own prompts, not a summary.",
      zh: "执行者不留状态；顾问直接看到你的原话，不是转述。",
    },
  } as Readonly<Record<string, Text>>,
} as const;

/** The page's close, as supabase.com ends: the hero's first line again, then one action, install one plugin. */
export const repairClose = {
  command: "omp install https://github.com/oh-my-omp/omp-sessions",
  copy: { en: "Copy", zh: "复制" },
  copied: { en: "Copied", zh: "已复制" },
  all: { en: "All plugins", zh: "全部插件" },
} as const;

/** Repository names that have a card on the repaired home page: two rows of four, omp-config taking two columns. */
export type RepairCard =
  | "omp-config"
  | "omp-ask-more"
  | "omp-todo-more"
  | "omp-sessions"
  | "omp-playbooks"
  | "omp-dispatch"
  | "omp-remote-build";

/** Repository names listed in one hairline row under the cards, name and one line each. */
export type RepairListed = "omp-unified-exec" | "omp-peers" | "omp-codex-image-gen";

/** One line per card, twelve English words at most; `**…**` marks the few words that carry it. */
export const repairLines: Readonly<Record<RepairCard, Text>> = {
  "omp-config": {
    en: "**Adds rules to the prompt, blocks unsafe calls**, checks results before stopping.",
    zh: "往提示里补规则，**拦下危险调用**，代理停下前再检查结果。",
  },
  "omp-ask-more": {
    en: "**Decisions open full-page**, with the tradeoff written on each option.",
    zh: "代理要你拍板时，**问题整页打开**，每个选项写明取舍。",
  },
  "omp-todo-more": {
    en: "Goal, phases and estimates; **each finished item is committed**.",
    zh: "目标、阶段和估时写清楚，**做完一项提交一次**。",
  },
  "omp-sessions": {
    en: "**Open any past session by URL**, or query them all in SQL.",
    zh: "**按 URL 打开任意历史会话**，或用 SQL 跨会话查询。",
  },
  "omp-playbooks": {
    en: "Design in one YAML file, then **launch it block by block**.",
    zh: "在一个 YAML 里写设计，再**逐块启动执行**。",
  },
  "omp-dispatch": {
    en: "Hand over an issue tree; **fresh sessions deliver and judge each issue**.",
    zh: "交出一棵 issue 树，**每个 issue 由新会话交付、再由新会话验收**。",
  },
  "omp-remote-build": {
    en: "Edit locally; **build and test in a remote container**.",
    zh: "在本机改代码，**在远程容器里构建和测试**。",
  },
};

/** One line per listed plugin. */
export const repairListLines: Readonly<Record<RepairListed, Text>> = {
  "omp-unified-exec": {
    en: "Long commands run in a terminal you and the agent both type into.",
    zh: "长命令跑在终端里，你和代理都能输入。",
  },
  "omp-peers": {
    en: "Ask a session in another omp process a question without interrupting it.",
    zh: "找到其他 omp 进程里的会话，向它提问，不打断它手上的对话。",
  },
  "omp-codex-image-gen": {
    en: "Generate and edit images through the Codex login omp already has.",
    zh: "复用 omp 已有的 Codex 登录，生成和编辑图片。",
  },
};

/** The few words inside each card's picture. */
export const repairArt = {
  config: {
    appends: { en: "appends", zh: "追加" },
    blocks: { en: "blocks", zh: "拦下" },
    judges: { en: "judges", zh: "裁决" },
  },
  ask: {
    recommended: { en: "Recommended", zh: "推荐" },
    /** Each option with the tradeoff written on it. */
    options: [
      { label: { en: "Token bucket", zh: "令牌桶" }, tradeoff: { en: "Allows bursts · more state", zh: "允许突发 · 需存更多状态" } },
      { label: { en: "Fixed window", zh: "固定窗口" }, tradeoff: { en: "Simple · spikes at window edges", zh: "简单 · 窗口边界有尖峰" } },
      { label: { en: "Per-instance memory", zh: "各实例内存" }, tradeoff: { en: "No Redis · limits drift apart", zh: "不用 Redis · 各实例限额不一致" } },
    ],
  },
  todo: {
    /** Two items done and committed, one in progress, two still to do. */
    items: [
      { en: "Token bucket", zh: "令牌桶" },
      { en: "429 tests", zh: "429 测试" },
      { en: "orders route", zh: "orders 路由" },
      { en: "search route", zh: "search 路由" },
      { en: "webhooks route", zh: "webhooks 路由" },
    ],
  },
  playbook: {
    running: { en: "running", zh: "执行中" },
    titles: [
      { en: "Rate limiter", zh: "限流器" },
      { en: "429 tests", zh: "429 测试" },
      { en: "Orders route", zh: "orders 路由" },
    ],
  },
  dispatch: {
    steps: [
      { en: "Delivered", zh: "已交付" },
      { en: "Judging", zh: "验收中" },
      { en: "Merged", zh: "已合并" },
    ],
  },
  remote: {
    local: { en: "your machine", zh: "本机" },
    host: { en: "build host", zh: "构建主机" },
  },
} as const;
