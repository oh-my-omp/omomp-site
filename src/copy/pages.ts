import type { Text } from "../i18n";

export const principlesPage = {
  kicker: { en: "Principles", zh: "设计原则" },
  title: { en: "Four rules every repository follows", zh: "每个仓库都遵守的四条工程规则" },
  lede: {
    en: "Each component on this site puts one of these rules into practice. Each rule below names the problem it answers, how it is carried out, and the components that carry it.",
    zh: "站上每个组件都在落实其中一条。下面每条规则写明它针对的问题、具体做法，以及由哪些组件承担。",
  },
  seen: { en: "Components", zh: "落地组件" },
} satisfies Record<string, Text>

export const lifelinePage = {
  eyebrow: { en: "Lifeline", zh: "生命线" },
  title: { en: "Six handoffs between your words and the code", zh: "从你的一句话到代码，要转手六次" },
  lede: {
    en: "Each handoff is a seam, and intent drifts at every seam. omomp guards each one on three layers: what you see, what the agent can call, and what runs unseen.",
    zh: "每次转手都是一道接缝，意图在每道接缝都可能走样。omomp 在每道接缝设三层防护：你看得见的、代理能调用的、在后台运行的。",
  },
  layersTitle: { en: "Three layers at every seam", zh: "每道接缝的三层" },
  human: {
    en: "Panels and pages you read, click and answer, in the terminal or in Tern.",
    zh: "你在终端或 Tern 里读、点、作答的面板和页面。",
  },
  agent: {
    en: "Tools, URL schemes and agent roles the model gets on top of stock omp.",
    zh: "原生 omp 之外，模型多得的工具、URL 协议和代理角色。",
  },
  silent: {
    en: "Hooks you never see. They block a bad step or ask a judge, then step aside.",
    zh: "你看不见的钩子：拦下出错的一步，或交给判定者裁决，随即退出。",
  },
  mapTitle: { en: "Every component, by seam and layer", zh: "全部组件，按接缝与层级排布" },
  mapHint: { en: "Select a component to see what it solves.", zh: "选择任一组件，查看它解决的问题。" },
  all: { en: "All layers", zh: "全部层级" },
  open: { en: "Repository", zh: "仓库" },
  seamsTitle: { en: "The six seams", zh: "六道接缝" },
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
  title: { en: "What the hooks did in real sessions", zh: "真实会话里，钩子做了什么" },
  lede: {
    en: "Silent governance has no interface, so here are the transcripts. Every reminder, block and judgment is shown as the model received it; switch to “What you saw” to keep only your screen.",
    zh: "静默治理没有界面，所以这里直接给出会话记录。每条提醒、拦截和裁决都按模型收到的样子呈现；切到“你看到的”，就只剩你屏幕上的内容。",
  },
  note: {
    en: "Excerpts are trimmed and redacted. Nothing is reworded or invented; every line comes from a session log on the author's machine.",
    zh: "摘录经过删减和脱敏，但没有改写或编造；每一行都出自作者本机的会话记录。",
  },
} satisfies Record<string, Text>

export const productPage = {
  eyebrow: { en: "Product", zh: "产品" },
  all: { en: "All products", zh: "全部产品" },
  repo: { en: "View repository", zh: "查看仓库" },
} satisfies Record<string, Text>

export const defaultsPage = {
  eyebrow: { en: "Defaults", zh: "默认策略" },
  title: { en: "What is fixed, what you choose, and where to change it", zh: "哪些固定不变，哪些由你决定，去哪里改" },
  lede: {
    en: "Every customizable component separates its mechanism from the author's default. Keep the mechanism, replace the default, or run `/onboard-omp` to set up your own.",
    zh: "每个可定制组件都把机制和作者默认分开。机制保留，默认替换；也可以运行 `/onboard-omp`，按引导配好自己的一套。",
  },
  component: { en: "Component", zh: "组件" },
  mechanism: { en: "Mechanism", zh: "机制" },
  policy: { en: "Author's default", zh: "作者默认" },
  customize: { en: "Change it", zh: "去改" },
  start: { en: "Get started", zh: "开始使用" },
} satisfies Record<string, Text>
