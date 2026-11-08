import type { Text } from "../i18n";

export const home = {
  meta: {
    title: { en: "oh-my-omp — keep the agent on what you asked", zh: "oh-my-omp — 让代理始终做你要的事" },
    description: {
      en: "A governed runtime and plugins for the Oh My Pi coding agent. Each handoff between you, the model, its subagents and the shell is watched for drift.",
      zh: "Oh My Pi 编码代理的治理配置与插件。你、模型、子代理、终端之间的每一次转手，都有机制盯着有没有走样。",
    },
  },
  hero: {
    eyebrow: { en: "For the Oh My Pi coding agent", zh: "为 Oh My Pi 编码代理而作" },
    title: { en: "What you asked for survives every handoff.", zh: "你要的东西，转手多少次都不走样。" },
    lede: {
      en: "A request passes through prompts, plans, subagents and shells before it becomes code. oh-my-omp guards each of those handoffs, so drift is caught where it starts.",
      zh: "一句需求要经过提示词、计划、子代理和终端才变成代码。oh-my-omp 守住其中每一次转手，在偏离出现的地方就把它拦下。",
    },
    primary: { en: "Walk the lifeline", zh: "沿生命线看" },
    secondary: { en: "Read the principles", zh: "读思维内核" },
  },
  hosts: {
    eyebrow: { en: "Where it sits", zh: "所处位置" },
    title: { en: "Two hosts below. omomp on top.", zh: "下面两个宿主，上面是 omomp。" },
    body: {
      en: "omomp does not replace the agent. It configures and extends the two programs you already run.",
      zh: "omomp 不替换代理，只配置和扩展你已经在用的两个程序。",
    },
    rows: [
      {
        name: "oh-my-omp",
        role: {
          en: "Governance config, plugins and standalone products.",
          zh: "治理配置、插件和独立产品。",
        },
      },
      {
        name: "Tern",
        role: {
          en: "Graphical terminal. Hosts the panels plugins draw: todo, terminals, decisions, playbooks.",
          zh: "图形化终端，承载插件绘制的面板：待办、终端、决策、Playbook。",
        },
      },
      {
        name: "Oh My Pi",
        role: {
          en: "Terminal coding agent. Sessions, tools, subagents, extensions.",
          zh: "终端编码代理，提供会话、工具、子代理与扩展机制。",
        },
      },
    ] satisfies ReadonlyArray<{ name: string; role: Text }>,
  },
  modular: {
    eyebrow: { en: "Take what you need", zh: "按需取用" },
    title: { en: "Install one plugin, or the whole runtime.", zh: "装一个插件，或者装整套。" },
    body: {
      en: "Each plugin works on a plain omp install. omp-config ties them into one governed runtime, and the onboarding command adapts it to the rules you already have.",
      zh: "每个插件装在原生 omp 上就能完整工作。omp-config 把它们接成一个受治理的运行时，引导命令会按你已有的规则做适配。",
    },
    onboard: { en: "Start with /onboard-omp", zh: "从 /onboard-omp 开始" },
  },
  blocks: {
    eyebrow: { en: "Building blocks", zh: "积木" },
    title: { en: "One problem per repository.", zh: "一个仓库，解决一个问题。" },
    runtime: { en: "Runtime", zh: "运行时" },
    plugins: { en: "Plugins", zh: "插件" },
    products: { en: "Products", zh: "独立产品" },
    productsBody: {
      en: "Workflows with their own model of the work. Each has its own page.",
      zh: "自成体系的工作流，各有自己的心智模型，各占一页。",
    },
    tools: { en: "Tools", zh: "小工具" },
    seamLabel: { en: "Acts at", zh: "作用于" },
    readMore: { en: "Read more", zh: "详细了解" },
  },
  principles: {
    eyebrow: { en: "What makes it different", zh: "差异所在" },
    title: { en: "Four rules behind every repository.", zh: "所有仓库背后的四条规矩。" },
    more: { en: "How each rule is enforced", zh: "看每条规矩怎么落地" },
  },
  next: {
    eyebrow: { en: "Where to go", zh: "接下来" },
    title: { en: "Pick a question.", zh: "选一个问题。" },
    items: [
      {
        q: { en: "Why is it built this way?", zh: "为什么这样设计？" },
        a: { en: "Principles", zh: "思维内核" },
        route: "/principles/",
      },
      {
        q: { en: "What happens to one request?", zh: "一个需求会经历什么？" },
        a: { en: "The lifeline", zh: "生命线" },
        route: "/lifeline/",
      },
      {
        q: { en: "What does it catch in practice?", zh: "实际能拦下什么？" },
        a: { en: "Replay", zh: "回放" },
        route: "/replay/",
      },
      {
        q: { en: "What are the products?", zh: "独立产品是什么？" },
        a: { en: "Playbooks", zh: "Playbooks" },
        route: "/products/playbooks/",
      },
      {
        q: { en: "What can I change?", zh: "哪些可以改？" },
        a: { en: "Defaults", zh: "默认策略" },
        route: "/defaults/",
      },
    ] satisfies ReadonlyArray<{ q: Text; a: Text; route: string }>,
  },
} as const;
