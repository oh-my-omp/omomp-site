import type { Text } from "../i18n";

/** Copy shared by the two candidate home pages, so they differ in how they show the product, not in what they say first. */
export const preview = {
  hero: {
    /** Two lines; the second is set in the accent colour. */
    title: [
      { en: "Keep agents on task", zh: "让编码代理按你说的做" },
      { en: "Fix drift mid-run", zh: "偏离时当场纠正" },
    ],
    /** Two sentences; on a wide screen the second starts its own line. */
    lede: [
      {
        en: "oh-my-omp runs on the Oh My Pi (omp) coding agent and the Tern terminal.",
        zh: "oh-my-omp 建在 Oh My Pi（omp）编码代理和 Tern 终端之上。",
      },
      {
        en: "omp-config checks every seam of a task, plugins add tools and panels, products run whole workflows.",
        zh: "omp-config 在任务的每道接缝做检查，插件补工具和面板，产品跑完整条工作流。",
      },
    ],
    primary: { en: "See the demo", zh: "查看演示" },
    secondary: { en: "Walk the lifeline", zh: "浏览生命线" },
  },
} as const satisfies { hero: { title: readonly [Text, Text]; lede: readonly [Text, Text]; primary: Text; secondary: Text } };

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
    en: "At every seam of a task it **appends to the prompt, blocks a call, judges the delivery**.",
    zh: "在任务的每道接缝上**追加提示、拦下操作、裁决交付**。",
  },
  "omp-ask-more": {
    en: "When the agent needs your call, **the question opens full-page**, with the tradeoff written on each option.",
    zh: "代理要你拍板时，**问题整页打开**，每个选项写明取舍。",
  },
  "omp-todo-more": {
    en: "The plan states goal, phases and estimates; **each finished item gets its own commit**.",
    zh: "计划写成目标、阶段和估时，**做完一项提交一次**。",
  },
  "omp-unified-exec": {
    en: "Long commands run in a terminal that **you and the agent both type into**.",
    zh: "长命令跑在终端里，**你和代理都能输入**。",
  },
  "omp-sessions": {
    en: "**Any past session opens by URL**, and SQL queries run across all of them.",
    zh: "**按 URL 打开任意历史会话**，或用 SQL 跨会话查询。",
  },
  "omp-peers": {
    en: "A session in another omp process can be found and **asked a side question**.",
    zh: "找到其他 omp 进程里的会话，**向它旁路提问**。",
  },
  "omp-thinking-translator": {
    en: "Each thinking line gets a translation that **the model never sees**.",
    zh: "思考逐行附上译文，**译文不发给模型**。",
  },
  "omp-playbooks": {
    en: "You and the agent write the design in one YAML file, then **launch it block by block**.",
    zh: "和代理在一个 YAML 里写设计，再**逐块启动执行**。",
  },
  "omp-dispatch": {
    en: "Hand over an issue tree: **a fresh session delivers each ticket and a fresh judge rules on it**.",
    zh: "交出一棵 issue 树，**新会话交付，新判定者裁决**。",
  },
  "omp-remote-build": {
    en: "Code is edited on your machine and **built and tested in a remote container**.",
    zh: "在本机改代码，**在远程容器里构建测试**。",
  },
  "omp-codex-image-gen": {
    en: "**Images are generated and edited** through the Codex login omp already has.",
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
      { en: "Token bucket", zh: "令牌桶" },
      { en: "Fixed window", zh: "固定窗口" },
      { en: "Per-instance memory", zh: "各实例内存" },
    ],
  },
  todo: {
    items: [
      { en: "Token bucket", zh: "令牌桶" },
      { en: "429 tests", zh: "429 测试" },
      { en: "orders route", zh: "orders 路由" },
      { en: "search route", zh: "search 路由" },
    ],
  },
  exec: {
    you: { en: "you", zh: "你" },
    agent: { en: "agent", zh: "代理" },
  },
  remote: {
    local: { en: "your machine", zh: "本机" },
    host: { en: "build host", zh: "构建主机" },
  },
} as const;
