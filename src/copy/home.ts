import type { Text } from "../i18n";

export const home = {
  meta: {
    title: { en: "oh-my-omp — your intent survives every handoff", zh: "oh-my-omp — 你的意图，转手多少次都不走样" },
    description: {
      en: "Governance config, plugins and standalone products for the Oh My Pi (omp) coding agent. Drift is caught at each handoff between you, the model, its subagents and the terminal.",
      zh: "Oh My Pi（omp）编码代理的治理配置、插件与独立产品。你、模型、子代理与终端之间的每次转手，偏离都在当场被拦下。",
    },
  },
  hero: {
    eyebrow: { en: "For the Oh My Pi (omp) coding agent", zh: "面向 Oh My Pi（omp）编码代理" },
    title: { en: "Your intent survives every handoff", zh: "你的意图，几经转手也不走样" },
    lede: {
      en: "A request crosses prompts, plans, subagents and terminals before it becomes code. omomp catches drift at the seam where it starts.",
      zh: "一句需求要穿过提示词、计划、子代理和终端，才会变成代码。跑偏在哪道接缝露头，omomp 就在哪里拦下。",
    },
    primary: { en: "Walk the lifeline", zh: "沿生命线看" },
    secondary: { en: "Read the principles", zh: "读设计原则" },
  },
  hosts: {
    eyebrow: { en: "Where it sits", zh: "所处位置" },
    title: { en: "omomp sits on two hosts you already run", zh: "omomp 叠在你已有的两个宿主之上" },
    body: {
      en: "It replaces neither the agent nor the terminal. It adds governance, panels and workflows on top of both.",
      zh: "不替换代理，也不替换终端；只在两者之上叠加治理、面板和工作流。",
    },
    top: {
      name: "oh-my-omp (omomp)",
      role: {
        en: "Governance config, plugins and standalone products.",
        zh: "治理配置、插件和独立产品。",
      },
    } satisfies { name: string; role: Text },
    hosts: [
      {
        name: "Oh My Pi (omp)",
        role: {
          en: "Terminal coding agent. Sessions, tools, subagents, extensions and plugins.",
          zh: "终端编码代理，提供会话、工具、子代理、扩展与插件机制。",
        },
      },
      {
        name: "Tern",
        role: {
          en: "Graphical terminal. Draws the plugins' panels: todo, terminals, decisions, playbooks.",
          zh: "图形化终端，绘制插件的面板：待办、终端、决策、Playbook。",
        },
      },
    ] satisfies ReadonlyArray<{ name: string; role: Text }>,
  },
  modular: {
    eyebrow: { en: "Take what you need", zh: "按需取用" },
    title: { en: "One plugin, or the whole setup", zh: "单装一个插件，或整套接入" },
    body: {
      en: "Every plugin works on stock omp. Add omp-config and they run under its dispatch gates and turn judges. `/onboard-omp` reads your existing rules first and installs only when you ask.",
      zh: "每个插件都能在原生 omp 上独立运行；接入 omp-config 后，它们统一受派发闸门和回合判定约束。`/onboard-omp` 先读你现有的规则，经你确认才安装。",
    },
    onboard: { en: "Start with /onboard-omp", zh: "从 /onboard-omp 开始" },
  },
  blocks: {
    eyebrow: { en: "Building blocks", zh: "模块构成" },
    title: { en: "One problem per repository", zh: "一个仓库，解决一个问题" },
    runtime: { en: "Runtime", zh: "运行时" },
    plugins: { en: "Plugins", zh: "插件" },
    products: { en: "Products", zh: "独立产品" },
    productsBody: {
      en: "Workflows with their own model of the work. Each has its own page.",
      zh: "自成体系的工作流，各有独立的心智模型和专页。",
    },
    tools: { en: "Tools", zh: "工具" },
    seamLabel: { en: "Acts at", zh: "作用于" },
    readMore: { en: "Read more", zh: "详细了解" },
  },
  principles: {
    eyebrow: { en: "What makes it different", zh: "差异所在" },
    title: { en: "Four rules behind every repository", zh: "所有仓库背后的四条原则" },
    more: { en: "How each rule is enforced", zh: "看每条原则怎么落地" },
  },
  next: {
    eyebrow: { en: "Where to go", zh: "接下来" },
    title: { en: "Start from a question", zh: "从一个问题开始" },
    items: [
      {
        q: { en: "Why is it built this way?", zh: "为什么这样设计？" },
        a: { en: "Principles", zh: "设计原则" },
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
        q: { en: "What runs as its own product?", zh: "哪些是独立产品？" },
        a: { en: "Products", zh: "独立产品" },
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
