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
    /** Two lines; the second is set in the accent colour. */
    title: [
      { en: "Governance and panels", zh: "给 omp 编码代理" },
      { en: "for the omp agent", zh: "加上治理与面板" },
    ],
    lede: {
      en: "omomp runs on the Oh My Pi (omp) coding agent and the Tern terminal: omp-config checks each handoff, plugins add tools and panels, and products run whole workflows.",
      zh: "omomp 运行在 Oh My Pi（omp）编码代理和 Tern 终端之上：omp-config 在每次交接处做检查，插件补上工具和面板，独立产品承担完整的工作流。",
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
    pipeline: {
      kinds: {
        reminder: { en: "appends", zh: "追加" },
        block: { en: "refuses", zh: "拦下" },
        judge: { en: "judges", zh: "裁决" },
      },
      legend: {
        reminder: { en: "a `<system-reminder>` added after the prompt", zh: "在提示词之后追加一条 `<system-reminder>`" },
        block: { en: "the call is blocked and the reason returned", zh: "调用被拦下，原因返回给模型" },
        judge: { en: "a judge sends the turn or the handoff back", zh: "判定者把这一轮或这次交付退回" },
      },
    },
    exec: {
      you: { en: "your keys", zh: "你的按键" },
      agent: { en: "agent's write_stdin", zh: "代理的 write_stdin" },
    },
  },
  bridge: {
    lead: { en: "Use one plugin or the whole set.", zh: "单装一个插件，或整套接入。" },
    rest: {
      en: "Each plugin works on stock omp; omp-config adds the shared checks, and Tern draws the panels.",
      zh: "每个插件都能在原生 omp 上单独使用；omp-config 加上共用的检查，Tern 负责绘制面板。",
    },
  },
  hosts: {
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
    install: { en: "Install", zh: "安装" },
    start: { en: "Start", zh: "启动" },
    tabs: [
      {
        id: "plugin",
        label: { en: "One plugin", zh: "单装插件" },
        uses: ["plugins", "omp"],
        window: { en: "omp · terminal", zh: "omp · 终端" },
        install: ["omp install https://github.com/oh-my-omp/omp-sessions"],
        start: ["omp"],
        text: {
          en: "Every plugin works on stock omp without omp-config, in the terminal you already use. omp-sessions adds a URL scheme and a SQL tool, and has no settings.",
          zh: "每个插件都能在原生 omp 上运行，不需要 omp-config，就在你现在用的终端里。omp-sessions 加上一个 URL 协议和一个 SQL 工具，没有需要填写的设置。",
        },
        after: [
          { en: "`read` and `grep` open other sessions through `session://` paths", zh: "`read` 和 `grep` 通过 `session://` 路径打开其他会话" },
          { en: "Eval cells query the same history with SQL through `session_query`", zh: "eval 单元格通过 `session_query` 用 SQL 查询同一份历史" },
        ],
      },
      {
        id: "config",
        label: { en: "Full governance with omp-config", zh: "接入 omp-config 完整治理" },
        uses: ["config", "plugins", "omp"],
        window: { en: "omp · full mode", zh: "omp · 完整模式" },
        install: ["git clone https://github.com/oh-my-omp/omp-config.git", "cd omp-config", "omp", "/onboard-omp"],
        start: ["omp          # full mode", "omp-light    # light mode"],
        text: {
          en: "/onboard-omp first walks through your existing rules and skills without changing anything, and installs only when you ask. After that every plugin runs under the shared checks.",
          zh: "/onboard-omp 先只读地梳理你现有的规则和技能，不做任何改动，你明确要求后才安装。之后所有插件都在共用的检查之下运行。",
        },
        after: [
          { en: "Dispatch checks before subagents start", zh: "子代理启动前的派发检查" },
          { en: "Turn and completion judges before the agent stops", zh: "代理停下前的回合判定与完成度判定" },
          { en: "Guards on deletion and long-running shell commands", zh: "对删除和长时间 shell 命令的拦截" },
        ],
      },
      {
        id: "tern",
        label: { en: "With the Tern terminal", zh: "搭配 Tern 图形终端" },
        uses: ["config", "plugins", "products", "omp", "tern"],
        window: { en: "Tern · omp", zh: "Tern · omp" },
        install: ["omp install https://github.com/oh-my-omp/omp-todo-more"],
        start: ["tern -e omp"],
        text: {
          en: "Run omp in a Tern tab and the plugins draw their panels there. omp-todo-more installs its Tern stylesheet itself once it finds Tern on the machine.",
          zh: "在 Tern 的标签页里运行 omp，插件就在其中绘制面板。omp-todo-more 发现本机装有 Tern 时，会自己装好它的 Tern 样式。",
        },
        after: [
          { en: "The todo panel beside the conversation", zh: "对话旁边的待办面板" },
          { en: "Terminals that you and the agent type into", zh: "你和代理都能输入的终端" },
          { en: "Decision sheets and Playbook cards", zh: "决策页和 Playbook 卡片" },
        ],
      },
    ],
  },
  principles: {
    title: { en: "Four rules behind every repository", zh: "四条工程规则" },
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
