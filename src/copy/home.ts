import type { Text } from "../i18n";

export const home = {
  meta: {
    title: { en: "oh-my-omp — governance, panels and workflows for omp", zh: "oh-my-omp — omp 的治理、面板与工作流" },
    description: {
      en: "Governance config, plugins and standalone products for the Oh My Pi (omp) coding agent, with a check, a tool or a panel at each handoff between you, the model, its subagents and the terminal.",
      zh: "Oh My Pi（omp）编码代理的治理配置、插件与独立产品：在你、模型、子代理与终端之间的每次转手处，加上检查、工具或面板。",
    },
  },
  hero: {
    kicker: { en: "Extensions for the Oh My Pi (omp) coding agent", zh: "Oh My Pi（omp）编码代理的扩展" },
    title: { en: "Governance, panels and workflows", zh: "治理、面板与工作流" },
    lede: {
      en: "A request passes through prompts, plans, subagents and terminals before it becomes code. omomp adds a check, a tool or a panel at each of those handoffs, so a misread instruction is caught where it starts.",
      zh: "一条需求要经过提示词、计划、子代理和终端才会变成代码。omomp 在每次交接处加上检查、工具或面板，哪一步理解偏了，就在哪一步拦下。",
    },
    primary: { en: "See the demo", zh: "查看演示" },
    secondary: { en: "Walk the lifeline", zh: "浏览生命线" },
  },
  blocks: {
    label: { en: "Repositories", zh: "仓库" },
    kinds: {
      runtime: { en: "Runtime", zh: "运行时" },
      plugin: { en: "Plugin", zh: "插件" },
      product: { en: "Product", zh: "产品" },
      tool: { en: "Tool", zh: "工具" },
    },
    allSeams: { en: "All seams", zh: "六道接缝" },
  },
  hosts: {
    title: { en: "Runs on omp and Tern; install as much as you need", zh: "运行在 omp 和 Tern 上，按需安装" },
    lede: {
      en: "omomp replaces neither the agent nor the terminal. Each plugin works on stock omp by itself; omp-config adds the shared checks on top.",
      zh: "omomp 不替换代理，也不替换终端。每个插件都能在原生 omp 上单独使用；omp-config 在此之上加一层共用的检查。",
    },
    omomp: {
      name: { en: "oh-my-omp (omomp)", zh: "oh-my-omp（omomp）" },
      role: { en: "Configuration, plugins and products layered on both hosts.", zh: "运行在两个宿主之上的配置、插件和产品。" },
    },
    parts: {
      config: { en: "omp-config", zh: "omp-config" },
      plugins: { en: "plugins", zh: "插件" },
      products: { en: "products", zh: "产品" },
    },
    links: {
      omp: { en: "loaded as extensions and plugins", zh: "作为扩展和插件加载" },
      tern: { en: "panels drawn in Tern", zh: "在 Tern 里绘制面板" },
    },
    after: { en: "What you get", zh: "装好之后" },
    hosts: {
      omp: {
        name: { en: "Oh My Pi (omp)", zh: "Oh My Pi（omp）" },
        role: {
          en: "Terminal coding agent: sessions, tools, subagents, extensions and plugins.",
          zh: "终端编码代理：会话、工具、子代理、扩展与插件机制。",
        },
      },
      tern: {
        name: { en: "Tern", zh: "Tern" },
        role: {
          en: "Graphical terminal that draws the plugins' panels: todo, terminals, decisions, playbooks.",
          zh: "图形化终端，绘制插件的面板：待办、终端、决策、Playbook。",
        },
      },
    },
    tabs: [
      {
        id: "plugin",
        label: { en: "One plugin", zh: "单个插件" },
        uses: ["plugins", "omp"],
        lines: ["omp install https://github.com/oh-my-omp/omp-sessions"],
        text: {
          en: "Every plugin works on stock omp without omp-config, in the terminal you already use.",
          zh: "每个插件都能在原生 omp 上运行，不需要 omp-config，就在你现在用的终端里。",
        },
        after: [
          { en: "`read` and `grep` open other sessions through `session://` paths", zh: "`read` 和 `grep` 通过 `session://` 路径打开其他会话" },
          { en: "Eval cells query the same history with SQL through `session_query`", zh: "eval 单元格通过 `session_query` 用 SQL 查询同一份历史" },
          { en: "No settings to fill in", zh: "没有需要填写的设置" },
        ],
      },
      {
        id: "config",
        label: { en: "With omp-config", zh: "接入 omp-config" },
        uses: ["config", "plugins", "omp"],
        lines: ["git clone https://github.com/oh-my-omp/omp-config.git", "cd omp-config && omp", "/onboard-omp"],
        text: {
          en: "The agent first walks through your existing rules and skills without changing anything, and installs only when you ask. The plugins then run under the shared dispatch checks and turn judges.",
          zh: "代理先只读地梳理你现有的规则和技能，不做任何改动，你明确要求后才安装。之后各插件统一受共用的派发检查和回合判定约束。",
        },
        after: [
          { en: "Dispatch checks before subagents start", zh: "子代理启动前的派发检查" },
          { en: "Turn and completion judges before the agent stops", zh: "代理停下前的回合判定与完成度判定" },
          { en: "Guards on deletion and long-running shell commands", zh: "对删除和长时间 shell 命令的拦截" },
          { en: "Defaults kept as files you can edit", zh: "默认策略保存为可以直接修改的文件" },
        ],
      },
      {
        id: "tern",
        label: { en: "In Tern", zh: "搭配 Tern" },
        uses: ["config", "plugins", "products", "omp", "tern"],
        lines: [],
        text: {
          en: "In Tern, ⇧⌘A opens an agent block that runs omp. The plugins draw their panels there: the todo panel, the Terminals view and decision sheets. omp-playbooks shows its blocks as cards in a Tern pane.",
          zh: "在 Tern 里按 ⇧⌘A 打开一个运行 omp 的代理块，插件就在其中绘制面板：待办面板、终端视图和决策页。omp-playbooks 在 Tern 面板里把各个块显示成卡片。",
        },
        after: [
          { en: "The todo panel beside the conversation", zh: "对话旁边的待办面板" },
          { en: "Terminals that you and the agent type into", zh: "你和代理都能输入的终端" },
          { en: "Decision sheets for the agent's questions", zh: "代理提问时的决策页" },
          { en: "Playbook blocks as cards in a pane", zh: "以卡片形式排在面板里的 Playbook 块" },
        ],
      },
    ],
  },
  principles: {
    title: { en: "Four rules behind every repository", zh: "所有仓库遵循的四条规则" },
    lede: {
      en: "They decide what each component may change, where its messages go, and what you can replace.",
      zh: "这四条规则决定每个组件能改什么、消息发到哪里，以及哪些部分由你替换。",
    },
    more: { en: "How each rule is carried out", zh: "查看每条规则如何落地" },
  },
  next: {
    title: { en: "Start from a question", zh: "从一个问题开始" },
    items: [
      {
        q: { en: "What happens to one request?", zh: "一个需求会经历什么？" },
        a: { en: "Replay", zh: "回放" },
        route: "/replay/",
      },
      {
        q: { en: "Where can intent drift?", zh: "意图会在哪里走样？" },
        a: { en: "Lifeline", zh: "生命线" },
        route: "/lifeline/",
      },
      {
        q: { en: "Why is it built this way?", zh: "为什么这样设计？" },
        a: { en: "Principles", zh: "设计原则" },
        route: "/principles/",
      },
      {
        q: { en: "What runs as its own product?", zh: "哪些是独立产品？" },
        a: { en: "Products", zh: "产品" },
        route: "/products/playbooks/",
      },
      {
        q: { en: "What can I change?", zh: "哪些可以改？" },
        a: { en: "Defaults", zh: "默认策略" },
        route: "/defaults/",
      },
      {
        q: { en: "Where is the code?", zh: "代码在哪里？" },
        a: { en: "GitHub", zh: "GitHub" },
        route: "https://github.com/oh-my-omp",
      },
    ] satisfies ReadonlyArray<{ q: Text; a: Text; route: string }>,
  },
} as const;
