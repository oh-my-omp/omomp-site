import type { Text } from "../i18n";

type PrincipleFig = "append" | "signals" | "roles" | "policy";

export const principlesPage: {
  kicker: Text;
  title: Text;
  lede: Text;
  /** The section with the four figures: its heading and the right-hand lede. */
  figsTitle: Text;
  figsLede: Text;
  seen: Text;
  /** Accessible name of the practice switcher inside a rule's stage. */
  practices: Text;
  /** Titles of a rule's practices in the stage switcher, in the order of its `practice` list. */
  practiceTitles: Readonly<Record<PrincipleFig, readonly Text[]>>;
} = {
  kicker: { en: "Principles", zh: "设计原则" },
  title: { en: "Four rules every repository follows", zh: "四条工程规则" },
  lede: {
    en: "Every plugin and config in omomp is built around four constraints: keep the prompt cache intact, correct drift from runtime signals, give each piece of state one owner, and keep extension mechanisms apart from personal policy.",
    zh: "omomp 的所有插件与配置都围绕四条约束构建：保持提示前缀与缓存不变，根据运行时信号纠偏，每份状态只有一个所有者，扩展机制与个人策略分开。",
  },
  figsTitle: { en: "Each rule as a structure", zh: "四条规则的结构" },
  figsLede: {
    en: "Each figure draws what a rule fixes in place: which bytes stay the same, where a correction enters, who may write what, and which files are yours.",
    zh: "每张图画出一条规则固定下来的东西：哪些字节不变，纠偏从哪里进入，谁能写什么，哪些文件归你。",
  },
  seen: { en: "Components", zh: "落地组件" },
  practices: { en: "In practice", zh: "具体做法" },
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
    en: "A request passes six handoffs on its way to code, and intent can drift at each one. Every seam has its own page; the map at the bottom places each component where it acts.",
    zh: "一句需求要经过六次转手才变成代码，每一次都可能让意图走样。每道接缝各有一页，页末的组件图标出每个组件在哪里起作用。",
  },
  mapTitle: { en: "Every component, by seam and layer", zh: "组件按接缝与层级排布" },
  mapLede: {
    en: "Select a component and its sentence opens right under it, with links to its repository and its seam page.",
    zh: "选中一个组件，它的说明就在下方展开，并附上仓库和所在接缝页的链接。",
  },
  mapDemo: { en: "Watch the demo", zh: "看演示" },
  trackTitle: { en: "One rate-limit task, seam by seam", zh: "一个限流任务，逐道接缝" },
  trackText: {
    en: "Each column holds the demo steps at that seam and the messages that reached the model there without showing on your screen.",
    zh: "每一列是演示里落在这道接缝的几步，以及那里送到模型、却不出现在你屏幕上的消息。",
  },
  trackQuiet: { en: "Nothing reached the model here.", zh: "这里没有给模型追加消息。" },
  mapDefaults: { en: "Mechanism and defaults", zh: "机制与默认策略" },
  seamPage: { en: "Seam page", zh: "接缝页" },
  seamsTitle: { en: "The six seams", zh: "六道接缝" },
  seamsLede: {
    en: "In the order a task passes through them, from the request to the delivered result.",
    zh: "按一个任务经过的先后排列，从提出需求到交付结果。",
  },
} satisfies Record<string, Text>

/** One line per seam for the overview cells: what you see happen there. */
export const lifelineSeamLines = {
  intent: { en: "Your decisions open as a full page, with a tradeoff per option.", zh: "需要你拍板的事单独成页，每个选项写明取舍。" },
  prompt: { en: "Manuals and rules arrive as appended messages when needed.", zh: "工具说明和规则在调用需要时作为追加消息送达。" },
  memory: { en: "A todo panel you both see holds the plan through compaction.", zh: "计划是你和代理共用的待办面板，压缩后照样在。" },
  delegation: { en: "Each worker gets its own checkout; advisors read your own words.", zh: "执行者各用一份检出、各管一个主题，顾问读你的原话。" },
  execution: { en: "Long commands run in terminals you can watch and type into.", zh: "长命令跑在你能旁观、也能输入的终端里。" },
  delivery: { en: "A claim of done is checked before the result goes back.", zh: "说做完了，要先过检查，结果才交回去。" },
} satisfies Record<string, Text>

/** Row labels of the component map: what each layer is, in a few words. */
export const lifelineLayerNotes = {
  human: { en: "What you see and answer", zh: "你看到并作答的界面" },
  agent: { en: "What the model calls", zh: "模型调用的工具与角色" },
  silent: { en: "Hooks that run unseen", zh: "后台运行的钩子" },
} satisfies Record<string, Text>

export const seamPage = {
  seams: { en: "All seams", zh: "全部接缝" },
  components: { en: "Components in this layer", zh: "这一层的组件" },
  screen: { en: "On your screen", zh: "你看到的界面" },
  model: { en: "Sent to the model", zh: "发给模型的消息" },
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
