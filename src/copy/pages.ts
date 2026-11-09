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
  kicker: { en: "Lifeline", zh: "生命线" },
  title: { en: "Six handoffs between your words and the code", zh: "从你的一句话到代码，要转手六次" },
  lede: {
    en: "Each handoff is a seam where intent can drift. At every seam omomp works on three layers: panels you see and answer, tools the agent calls, and hooks that run without showing on your screen.",
    zh: "每次转手都是一道接缝，意图可能在这里走样。omomp 在每道接缝分三层起作用：你看得见、要作答的面板，代理调用的工具，以及不在你屏幕上出现的钩子。",
  },
  mapTitle: { en: "Every component, by seam and layer", zh: "全部组件，按接缝与层级排布" },
  mapLede: {
    en: "Select a component to read what it does. Each seam's page shows its components at work and its part of the demo.",
    zh: "选中一个组件，就能读到它做什么。每道接缝的页面会展示其中组件的实际样子，以及演示里对应的几步。",
  },
  seamPage: { en: "Seam", zh: "接缝" },
  seamsTitle: { en: "The six seams", zh: "六道接缝" },
  seamsLede: {
    en: "In the order a task passes through them, from the request to the delivered result.",
    zh: "按一个任务经过的先后排列，从提出需求到交付结果。",
  },
} satisfies Record<string, Text>

export const seamPage = {
  kicker: { en: "Seam", zh: "接缝" },
  seams: { en: "All seams", zh: "全部接缝" },
  lifeline: { en: "Lifeline", zh: "生命线" },
  demoKicker: { en: "Demo", zh: "演示" },
  demoTitle: { en: "This seam in the demo", zh: "演示里的这一段" },
  demoLede: {
    en: "The steps of the rate-limit demo that pass through this seam. Your screen is on the left; what reached the model is on the right.",
    zh: "限流演示中经过这道接缝的几步。左边是你的屏幕，右边是送到模型那里的内容。",
  },
  demoAll: { en: "Whole demo", zh: "完整演示" },
  layer: { en: "Layer", zh: "层" },
} satisfies Record<string, Text>

export const replayPage = {
  kicker: { en: "Replay", zh: "回放" },
  title: { en: "One task through all six seams", zh: "一个任务走完六道接缝" },
  lede: {
    en: "A simulated session: rate limiting for a small API, then three routes moved onto it. The left side is what you would see. The right side is what reached the model without appearing on your screen, worded the way each extension actually sends it.",
    zh: "一段模拟会话：给一个小型 API 加限流，再把三个路由改用它。左边是你会看到的界面；右边是发给模型、但不出现在你屏幕上的消息，措辞与各扩展实际发送的原文一致。",
  },
} satisfies Record<string, Text>

export const productPage = {
  kicker: { en: "Product", zh: "产品" },
  all: { en: "All products", zh: "全部产品" },
  repo: { en: "Repository", zh: "仓库" },
  how: { en: "How it works", zh: "运作方式" },
  who: { en: "Who does what", zh: "谁负责什么" },
} satisfies Record<string, Text>

export const defaultsPage = {
  kicker: { en: "Defaults", zh: "默认策略" },
  title: {
    en: "The mechanism is fixed; the author's defaults are files you can replace",
    zh: "机制是固定的，作者的默认设定是可以替换的文件",
  },
  lede: {
    en: "Run `/onboard-omp` to set up your own with a guide, or edit the files directly. Updates merge three ways and keep your changes.",
    zh: "运行 `/onboard-omp` 按引导配好自己的一套，或者直接改这些文件；更新时做三方合并，保留你的改动。",
  },
  exampleTitle: { en: "A default is a file", zh: "默认设定就是一个文件" },
  exampleLede: {
    en: "This turn check ships with omp-config. When a GPT model announces its next step and stops, it sends the agent back to work. Change the model pattern, the questions or the prompt, or delete the file.",
    zh: "这条随 omp-config 发布的回合检查规则，会在 GPT 模型只宣布下一步就停下时把代理退回继续执行。模型匹配、判定问题和提示词都能改，也可以直接删掉这个文件。",
  },
  exampleNote: {
    en: "The excerpt is the shipped file verbatim. Its question is written in English because the model reads it that way.",
    zh: "摘录取自仓库原文，未作改动。其中 `question.says_remaining` 问的是：“本轮回复”是否表明助手还有未完成、未运行、未提交、未推送或未验证的工作？",
  },
  listTitle: { en: "Mechanism and default, component by component", zh: "逐个组件：机制与默认" },
  listLede: {
    en: "Only components that separate the two are listed. Each row links to where the default is changed.",
    zh: "下表仅列出机制与默认配置分离的组件，每行可直接跳转到对应默认文件的修改位置。",
  },
  component: { en: "Component", zh: "组件" },
  mechanism: { en: "Mechanism", zh: "机制" },
  policy: { en: "Author's default", zh: "作者默认" },
  customize: { en: "Change it", zh: "去改" },
  upstreamLabel: { en: "Shipped upstream", zh: "仓库新版" },
  baseLabel: { en: "Common base", zh: "共同基线" },
  machineLabel: { en: "Your machine", zh: "你的本机" },
  mergedLabel: { en: "Merged", zh: "合并结果" },
  fromUpstream: { en: "upstream", zh: "上游" },
  fromMachine: { en: "yours", zh: "你的" },
  mergeStep: { en: "Three-way merge", zh: "三方合并" },
  mergeMechanism: {
    en: "Extension mechanism: fixed, ships with the repo",
    zh: "扩展机制：固定，随仓库发布",
  },
  mergeAlt: {
    en: "Three-way merge: the model pattern from the upstream release is combined with your edited prompt.",
    zh: "三方合并：上游版本更新的模型匹配与你改过的提示词合并保留。",
  },
  start: { en: "Get started", zh: "开始使用" },
} satisfies Record<string, Text>
