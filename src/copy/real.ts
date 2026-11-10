import type { Text } from "../i18n";
import type { MomentId } from "../data/real-run";

/** One way to install: what it sets up, and the lines to type, in a shell (`$`) or inside omp (`>`). */
export interface InstallWay {
  readonly title: Text;
  readonly note: Text;
  readonly lines: readonly { readonly at: "shell" | "omp"; readonly text: string; readonly comment?: Text }[];
}

/** Copy for the candidate home page that shows a real session instead of drawn interface art. */
export const real = {
  hero: {
    primary: { en: "Install", zh: "安装" },
    secondary: { en: "Watch the full replay", zh: "看完整回放" },
  },
  demo: {
    /** Two lines; on a wide screen the second starts its own line. */
    title: [
      { en: "You typed one sentence.", zh: "你只输入了一句话，" },
      { en: "This is what the model received.", zh: "模型收到的是这些" },
    ],
    lede: {
      en: "One real session, recorded in Tern. Each step shows the screen as Tern drew it and the text that reached the model at that moment.",
      zh: "一次真实会话，在 Tern 里录制。每一步给出 Tern 画出的屏幕，和同一时刻发给模型的文字。",
    },
    moments: {
      ask: {
        label: { en: "You ask", zh: "你说一句话" },
        caption: {
          en: "You type one sentence. Before the model reads it, omp-config appends four messages: the rules this session is held to. None of them appears on your screen.",
          zh: "你输入一句话。模型读到它之前，omp-config 在后面追加四条消息，写的是这次会话要守的规则；屏幕上一条都不显示。",
        },
        alt: { en: "Tern showing the prompt sent to omp and the agent listing the project", zh: "Tern 里发给 omp 的那句话，以及代理列出的项目文件" },
      },
      refused: {
        label: { en: "rm is refused", zh: "rm 被拦下" },
        caption: {
          en: "The agent reaches for `rm -rf`. delete-guard refuses the call before it runs and tells the model which tool to use.",
          zh: "代理选了 `rm -rf`。delete-guard 在命令运行前拦下这次调用，并告诉模型该用哪个工具。",
        },
        alt: { en: "Tern showing the refused rm -rf call", zh: "Tern 里被拦下的 rm -rf 调用" },
      },
      trash: {
        label: { en: "Into the trash", zh: "进了回收站" },
        caption: {
          en: "The agent switches to the `delete` tool. The directory goes to the system trash, where you can restore it, and the agent reports it in one line.",
          zh: "代理改用 `delete` 工具。目录进了系统回收站，可以恢复；代理用一句话报告了结果。",
        },
        alt: { en: "Tern showing the delete tool moving build to the trash", zh: "Tern 里 delete 工具把 build 移进回收站" },
      },
    } satisfies Record<MomentId, { label: Text; caption: Text; alt: Text }>,
    sent: { en: "Sent to the model", zh: "发给模型的文字" },
    hidden: { en: "not on screen", zh: "屏幕上不显示" },
    shown: { en: "also on screen", zh: "屏幕上也有" },
    message: { en: "Message", zh: "消息" },
    chars: { en: "Characters", zh: "字符数" },
    total: { en: "Total", zh: "合计" },
    quoted: { en: "One sentence from", zh: "其中一句，出自" },
    gloss: { en: "Translation", zh: "译文" },
    tool: { en: "Tool", zh: "工具" },
    refusedBy: { en: "Refused by", zh: "拦截者" },
    ran: { en: "Ran", zh: "是否执行" },
    no: { en: "no", zh: "否" },
    movedTo: { en: "Moved to", zh: "移到" },
    restorable: { en: "Restorable", zh: "可以恢复" },
    yes: { en: "yes", zh: "是" },
    provenance: {
      en: "Recorded {date} with omp {omp} in Tern. The screens are Tern's own rendering; nothing is redrawn.",
      zh: "{date} 录制，omp {omp}，Tern。画面是 Tern 的原始渲染，没有重画。",
    },
  },
  products: {
    title: { en: "Three products, each running one whole workflow", zh: "三个产品，各管一条完整工作流" },
    lede: {
      en: "Plugins change one session. Each product takes a whole job: a design, an issue tree, a build.",
      zh: "插件改的是一次会话；产品接的是一整件事：一份设计、一棵 issue 树、一次构建。",
    },
    lines: {
      "omp-playbooks": {
        en: "Write the design with the agent in one YAML file, then launch it block by block.",
        zh: "和代理在一个 YAML 里写设计，再逐块启动执行。",
      },
      "omp-dispatch": {
        en: "Hand over an issue tree: a fresh session delivers each issue, and another fresh session judges it.",
        zh: "交出一棵 issue 树：每个 issue 由一个新会话交付，再由另一个新会话验收。",
      },
      "omp-remote-build": {
        en: "Edit on your machine; build and test in a remote container per worktree.",
        zh: "在本机改代码，在每个 worktree 对应的远程容器里构建和测试。",
      },
    } as Readonly<Record<string, Text>>,
    plugins: { en: "Plugins, each usable on its own", zh: "插件，每个都能单独使用" },
  },
  install: {
    title: { en: "Install one plugin, or the whole set", zh: "单装一个插件，或整套接入" },
    lede: {
      en: "Each plugin works on stock omp; omp-config adds the shared checks, and Tern draws the panels.",
      zh: "每个插件都能在原生 omp 上单独使用；omp-config 加上共用的检查，Tern 负责绘制面板。",
    },
    copy: { en: "Copy", zh: "复制" },
    copied: { en: "Copied", zh: "已复制" },
    ways: [
      {
        title: { en: "One plugin", zh: "单装插件" },
        note: {
          en: "omp-sessions on its own: no omp-config, no settings to fill in, and the terminal you already use.",
          zh: "单独装上 omp-sessions：不需要 omp-config，也没有要填的配置项，照旧用你现在的终端。",
        },
        lines: [
          { at: "shell", text: "omp install https://github.com/oh-my-omp/omp-sessions" },
          { at: "shell", text: "omp" },
        ],
      },
      {
        title: { en: "The whole set, with omp-config", zh: "整套接入 omp-config" },
        note: {
          en: "/onboard-omp first walks through your existing rules and skills without changing anything, and installs only when you ask.",
          zh: "/onboard-omp 先只读地梳理你现有的规则和技能，不做任何改动，你明确要求后才安装。",
        },
        lines: [
          { at: "shell", text: "git clone https://github.com/oh-my-omp/omp-config.git" },
          { at: "shell", text: "cd omp-config" },
          { at: "shell", text: "omp" },
          { at: "omp", text: "/onboard-omp" },
          { at: "shell", text: "omp-light", comment: { en: "light mode: skips the governance extensions", zh: "轻量模式：跳过治理扩展" } },
        ],
      },
      {
        title: { en: "Panels in Tern", zh: "在 Tern 里显示面板" },
        note: {
          en: "Run omp in a Tern tab and the plugins draw their panels there. omp-todo-more installs its Tern stylesheet itself once it finds Tern.",
          zh: "在 Tern 的标签页里运行 omp，插件就在其中绘制面板。omp-todo-more 发现本机装有 Tern 时，会自己装好它的 Tern 样式。",
        },
        lines: [
          { at: "shell", text: "omp install https://github.com/oh-my-omp/omp-todo-more" },
          { at: "shell", text: "tern -e omp" },
        ],
      },
    ] satisfies readonly InstallWay[],
  },
} as const;
