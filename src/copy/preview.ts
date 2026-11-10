import type { Text } from "../i18n";

/** Copy shared by the two candidate home pages, so they differ in how they show the product, not in what they say first. */
export const preview = {
  hero: {
    /** Two lines; the second is set in the accent colour. */
    title: [
      { en: "Keep the agent on course", zh: "让编码代理按你说的做" },
      { en: "Correct drift as it happens", zh: "偏离时当场纠正" },
    ],
    lede: {
      en: "omomp runs on the Oh My Pi (omp) coding agent and the Tern terminal: omp-config checks each handoff, plugins add tools and panels, and products run whole workflows.",
      zh: "omomp 运行在 Oh My Pi（omp）编码代理和 Tern 终端之上：omp-config 在每次交接处做检查，插件补上工具和面板，独立产品承担完整的工作流。",
    },
    primary: { en: "See the demo", zh: "查看演示" },
    secondary: { en: "Walk the lifeline", zh: "浏览生命线" },
  },
} as const satisfies { hero: { title: readonly [Text, Text]; lede: Text; primary: Text; secondary: Text } };

/** Repository names that have a card on the repaired home page. */
export type RepairCard =
  | "omp-config"
  | "omp-ask-more"
  | "omp-todo-more"
  | "omp-unified-exec"
  | "omp-sessions"
  | "omp-peers"
  | "omp-thinking-translator"
  | "omp-playbooks"
  | "omp-dispatch"
  | "omp-remote-build"
  | "omp-codex-image-gen";

/** One line per card; `**…**` marks the few words that carry it. */
export const repairLines: Readonly<Record<RepairCard, Text>> = {
  "omp-config": {
    en: "The governance runtime: **checks, guards and judges** at every seam of a task.",
    zh: "治理运行时：在任务的**每道接缝**上检查、拦截和判定。",
  },
  "omp-ask-more": {
    en: "A decision the agent needs **opens as a full page**, a tradeoff per option.",
    zh: "代理要你拍板时，**问题整页打开**，每个选项写明取舍。",
  },
  "omp-todo-more": {
    en: "The plan as goal, phases and estimates; **each finished item is committed**.",
    zh: "计划写成目标、阶段和估时，**做完一项提交一次**。",
  },
  "omp-unified-exec": {
    en: "Long commands run in terminals **you and the agent both type into**.",
    zh: "长命令跑在终端里，**你和代理都能输入**。",
  },
  "omp-sessions": {
    en: "**Read any past session by URL**, or query them all with SQL.",
    zh: "**按 URL 读任意历史会话**，或用 SQL 跨会话查询。",
  },
  "omp-peers": {
    en: "Find sessions in other omp processes, **ask a side question** or message them.",
    zh: "找到其他 omp 进程里的会话，**旁路提问**或发消息。",
  },
  "omp-thinking-translator": {
    en: "Each thinking line gets a translation **the model never sees**.",
    zh: "思考逐行附上译文，**译文不发给模型**。",
  },
  "omp-playbooks": {
    en: "Write the design with the agent in one YAML, then **launch it block by block**.",
    zh: "和代理在一个 YAML 里写设计，**逐块启动执行**。",
  },
  "omp-dispatch": {
    en: "Hand over an issue tree: **a fresh session delivers, a fresh judge rules**.",
    zh: "交出一棵 issue 树：**新会话交付，新判定者裁决**。",
  },
  "omp-remote-build": {
    en: "Edit on your machine; **build and test in a remote container**.",
    zh: "在本机改代码，**在远程容器里构建测试**。",
  },
  "omp-codex-image-gen": {
    en: "**Generate and edit images** through the Codex login omp already has.",
    zh: "借用 omp 已有的 Codex 登录**生成和编辑图片**。",
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
    options: [
      { en: "Shared Redis, token bucket", zh: "共用 Redis，令牌桶" },
      { en: "Shared Redis, fixed window", zh: "共用 Redis，固定窗口" },
      { en: "Memory in each instance", zh: "各实例自己的内存" },
    ],
  },
  todo: {
    items: [
      { en: "Redis token bucket", zh: "Redis 令牌桶" },
      { en: "Refill rate and 429 tests", zh: "补充速率与 429 测试" },
      { en: "Switch the orders route", zh: "改 orders 路由" },
      { en: "Switch the search route", zh: "改 search 路由" },
    ],
  },
} as const;
