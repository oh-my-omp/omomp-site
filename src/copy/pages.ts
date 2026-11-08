import type { Text } from "../i18n";

export const principlesPage = {
  eyebrow: { en: "Principles", zh: "思维内核" },
  title: { en: "Four rules. Every repository follows them.", zh: "四条规矩，每个仓库都照着做。" },
  lede: {
    en: "Each component on this site is one of these rules made concrete. Read them first and the rest reads as consequence.",
    zh: "站上的每个组件，都是其中一条规矩的落地。先读这四条，其余部分就是推论。",
  },
  problem: { en: "The problem", zh: "问题" },
  practice: { en: "In practice", zh: "做法" },
} satisfies Record<string, Text>

export const lifelinePage = {
  eyebrow: { en: "Lifeline", zh: "生命线" },
  title: { en: "Six handoffs between your words and the code.", zh: "从你的一句话到代码，要转手六次。" },
  lede: {
    en: "Intent drifts at each handoff. omomp places a guard at every one, on three layers: what you see, what the agent can call, and what runs unseen.",
    zh: "每次转手，意图都可能走样。omomp 在每一处都设了防线，分三层：你看得见的、代理能调用的、在后台默默运行的。",
  },
  layersTitle: { en: "Three layers at every seam", zh: "每个接缝的三层" },
  human: {
    en: "Panels and pages you read, click and answer, in the terminal or in Tern.",
    zh: "你在终端或 Tern 里读、点、作答的面板和页面。",
  },
  agent: {
    en: "Tools, URL schemes and agent roles the model gets on top of stock omp.",
    zh: "模型在原生 omp 之外多出的工具、URL 协议和代理角色。",
  },
  silent: {
    en: "Hooks you never see. They block a bad step or ask a judge, then step aside.",
    zh: "你看不见的钩子：拦下错误的一步，或请判定者裁决，然后退场。",
  },
  mapTitle: { en: "Every component, by seam and layer", zh: "全部组件，按接缝与层排布" },
  mapHint: { en: "Point at a component to see what it solves.", zh: "指向一个组件，看它解决什么问题。" },
  all: { en: "All layers", zh: "全部" },
  open: { en: "Repository", zh: "仓库" },
  seamsTitle: { en: "The seams", zh: "六个接缝" },
} satisfies Record<string, Text>

export const seamPage = {
  eyebrow: { en: "Seam", zh: "接缝" },
  drift: { en: "Where it drifts", zh: "在哪里走样" },
  replay: { en: "Seen in a real session", zh: "真实会话里的样子" },
  replayMore: { en: "Full replay", zh: "完整回放" },
  toReplay: { en: "Replay", zh: "回放" },
} satisfies Record<string, Text>

export const replayPage = {
  eyebrow: { en: "Replay", zh: "回放" },
  title: { en: "What the hooks did, in sessions that really ran.", zh: "钩子做了什么，取自真实跑过的会话。" },
  lede: {
    en: "Silent governance has no interface, so here are the transcripts. Switch to what you saw on screen, then to everything the model saw.",
    zh: "静默治理没有界面，所以这里给出会话记录。先看你在屏幕上看到的，再切换到模型看到的全部。",
  },
  note: {
    en: "Excerpts are trimmed and redacted. Nothing is reworded or invented; every line comes from a session log on the author's machine.",
    zh: "摘录经过删减和脱敏，但没有改写或编造；每一行都出自作者本机的会话记录。",
  },
} satisfies Record<string, Text>

export const productPage = {
  eyebrow: { en: "Product", zh: "独立产品" },
  others: { en: "Other products", zh: "其他产品" },
  repo: { en: "Read the repository", zh: "去仓库看" },
} satisfies Record<string, Text>

export const defaultsPage = {
  eyebrow: { en: "Defaults", zh: "默认策略" },
  title: { en: "What is fixed, what is a choice, and where to change it.", zh: "哪些是固定的，哪些是选择，去哪里改。" },
  lede: {
    en: "Every customizable component ships a mechanism and one author's settings for it. Keep the mechanism; replace the settings. Or let /onboard-omp walk you through it.",
    zh: "每个可定制的组件都带一套机制，外加一位作者的设定。机制留着，设定换掉；也可以让 /onboard-omp 带你走一遍。",
  },
  component: { en: "Component", zh: "组件" },
  mechanism: { en: "Mechanism", zh: "机制" },
  policy: { en: "Author's default", zh: "作者默认" },
  customize: { en: "Change it", zh: "去改" },
} satisfies Record<string, Text>
