import type { Text } from "../i18n";

type PrincipleFig = "append" | "signals" | "roles" | "policy";

export const principlesPage: {
  kicker: Text;
  title: Text;
  lede: Text;
  seen: Text;
  /** Column headings over a principle's practice strip, in the figure's order. */
  practiceTitles: Readonly<Record<PrincipleFig, readonly Text[]>>;
} = {
  kicker: { en: "Principles", zh: "设计原则" },
  title: { en: "Four rules every repository follows", zh: "四条工程规则" },
  lede: {
    en: "Every plugin and config in omomp is built around four constraints: keep the prompt cache intact, correct drift from runtime signals, isolate state ownership across roles, and separate extension mechanisms from personal policy.",
    zh: "omomp 的所有插件与配置都围绕四条约束构建：保持提示前缀与缓存不变、根据运行时信号纠偏、隔离不同角色的状态所有权、将扩展机制与个人策略分离。",
  },
  seen: { en: "Components", zh: "落地组件" },
  practiceTitles: {
    append: [
      { en: "Prefix stays as built", zh: "前缀保持原样" },
      { en: "Same paths in every worktree", zh: "各工作树路径一致" },
      { en: "One tool list per session", zh: "工具列表一次写定" },
    ],
    signals: [
      { en: "Block before the call", zh: "执行前阻断" },
      { en: "Remind on the result", zh: "结果后提醒" },
      { en: "Judge before the end", zh: "结束前判定" },
    ],
    roles: [
      { en: "Stateless workers", zh: "执行者不留状态" },
      { en: "Advisors read your words", zh: "顾问读你的原话" },
      { en: "Buttons only send requests", zh: "按钮只发请求" },
    ],
    policy: [
      { en: "Scope conditions", zh: "作用域条件" },
      { en: "Runnable examples", zh: "可运行的示例" },
      { en: "Updates keep your changes", zh: "更新保留本地改动" },
    ],
  },
}

export const lifelinePage = {
  kicker: { en: "Lifeline", zh: "生命线" },
  title: { en: "Six seams between your words and the code", zh: "从一句话到代码" },
  lede: {
    en: "Intent can drift at any of the six seams. At each seam omomp works on three layers: human surfaces you see and answer, agent primitives the model calls, and silent governance hooks that run in the background.",
    zh: "意图可能在任意一道接缝走样。omomp 在每道接缝分三层介入：你直接查看与作答的人机交互面、模型调用的代理原语，以及后台运行的静默治理钩子。",
  },
  mapTitle: { en: "Every component, by seam and layer", zh: "组件按接缝与层级排布" },
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
  demoLede: {
    en: "The steps that pass through this seam. Your screen is on the left; what reached the model is on the right.",
    zh: "经过这道接缝的几步。左边是你的屏幕，右边是送到模型的内容。",
  },
  demoAll: { en: "Whole demo", zh: "完整演示" },
} satisfies Record<string, Text>

export const replayPage = {
  kicker: { en: "Replay", zh: "回放" },
  title: { en: "One task through all six seams", zh: "六道接缝走一遍" },
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
  mechanics: { en: "Mechanics", zh: "机制" },
  howLede: {
    en: "Three mechanisms, each shown by the file, message or state it produces.",
    zh: "三个机制，分别用它们产出的文件、消息或状态来说明。",
  },
  who: { en: "Who does what", zh: "谁负责什么" },
  roles: { en: "Roles", zh: "角色分工" },
  whoLede: {
    en: "What each party does, and what crosses each edge between them.",
    zh: "每一方各做什么，以及它们之间传递什么。",
  },
} satisfies Record<string, Text>

export const defaultsPage = {
  kicker: { en: "Defaults", zh: "默认策略" },
  title: {
    en: "What you can change in each component",
    zh: "哪些可以改",
  },
  lede: {
    en: "Each component splits into a mechanism that ships with the repo and defaults the author chose; the defaults are yours to change. Run `/onboard-omp` to set up your own with a guide, or edit the files directly. Updates merge three ways and keep your changes.",
    zh: "每个组件都分成随仓库发布的机制和作者选定的默认设定，默认设定归你改。运行 `/onboard-omp` 按引导配好自己的一套，或者直接改文件；更新时做三方合并，保留你的改动。",
  },
  exampleTitle: { en: "A default is a file", zh: "默认设定就是一个文件" },
  exampleLede: {
    en: "This turn check ships with omp-config. When a GPT model announces its next step and stops, it sends the agent back to work. Change the model pattern, the questions or the prompt, or delete the file.",
    zh: "这条随 omp-config 发布的回合检查规则，会在 GPT 模型只宣布下一步就停下时把代理退回继续执行。模型匹配、判定问题和提示词都能改，也可以直接删掉这个文件。",
  },
  exampleNote: {
    en: "The excerpt is the shipped file verbatim, and its prompt is written in Chinese. It reads: “You stopped, but the work you were given is not finished. Do not just announce the next step or admit a mistake: use your tools now and keep going until there is a verifiable result. …” The line your machine adds in the merge, 先跑完测试再停, means “Run the tests before you stop.”",
    zh: "摘录取自仓库原文，未作改动。其中 `question.says_remaining` 问的是：“本轮回复”是否表明助手还有未完成、未运行、未提交、未推送或未验证的工作？",
  },
  exampleDocs: { en: "How to change it", zh: "修改说明" },
  listTitle: { en: "Mechanism and default, component by component", zh: "机制与默认" },
  listLede: {
    en: "Only components that keep the two apart are listed, grouped by the seam where they act. Each row links to where its default is changed.",
    zh: "这里只列出机制和默认设定分开的组件，按起作用的接缝分组，每一行都链接到修改默认设定的说明。",
  },
  jumpLabel: { en: "Jump to a seam", zh: "跳到某道接缝" },
  indexTitle: { en: "omomp · mechanism and defaults", zh: "omomp · 机制与默认设定" },
  fixedTag: { en: "ships fixed", zh: "随仓库固定" },
  replaceTag: { en: "yours to change", zh: "可以改" },
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
