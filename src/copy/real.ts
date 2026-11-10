import type { Text } from "../i18n";
import type { MomentId } from "../data/real-run";

/** Copy for the candidate home page that shows a real session instead of drawn interface art. */
export const real = {
  demo: {
    title: { en: "What you see, and what the model is sent", zh: "你看到的，和模型收到的" },
    lede: {
      en: "One real session in Tern, one sentence typed. On the left is the screen as Tern drew it; on the right is the text that reached the model at that moment.",
      zh: "Tern 里的一次真实会话，只输入了一句话。左边是 Tern 画出的屏幕，右边是同一时刻发给模型的文字。",
    },
    more: { en: "All sixteen steps of the replay", zh: "回放里的全部十六步" },
    moments: {
      ask: {
        label: { en: "You ask", zh: "你提出要求" },
        caption: {
          en: "You type one sentence. Before the model reads it, omp-config appends four messages after it. None of them appears on your screen.",
          zh: "你输入一句话。模型读到它之前，omp-config 在后面追加了四条消息，屏幕上一条都不显示。",
        },
        alt: { en: "Tern showing the prompt just sent to omp", zh: "Tern 里刚发给 omp 的那句话" },
      },
      refused: {
        label: { en: "rm is refused", zh: "rm 被拒绝" },
        caption: {
          en: "The agent runs `rm -rf build` as asked. delete-guard refuses the call before it runs and returns the reason to the model.",
          zh: "代理照你说的执行 `rm -rf build`。delete-guard 在命令运行前拒绝了这次调用，并把原因返回给模型。",
        },
        alt: { en: "Tern showing the refused rm -rf build call", zh: "Tern 里被拒绝的 rm -rf build 调用" },
      },
      trash: {
        label: { en: "Into the trash", zh: "进了回收站" },
        caption: {
          en: "The agent switches to the `delete` tool. The directory goes to the system trash, where you can restore it, and the agent reports what happened.",
          zh: "代理改用 `delete` 工具。目录进了系统回收站，可以恢复；代理如实报告了结果。",
        },
        alt: { en: "Tern showing the delete tool moving build to the trash", zh: "Tern 里 delete 工具把 build 移进回收站" },
      },
    } satisfies Record<MomentId, { label: Text; caption: Text; alt: Text }>,
    sent: { en: "Sent to the model", zh: "发给模型的文字" },
    hidden: { en: "not on screen", zh: "屏幕上不显示" },
    shown: { en: "also on screen", zh: "屏幕上也有" },
    appended: { en: "4 messages appended after your prompt · 17,332 characters", zh: "在你的话之后追加了 4 条消息 · 共 17,332 个字符" },
    quoted: { en: "One sentence from", zh: "其中一句，出自" },
    result: { en: "tool result", zh: "工具返回" },
    gloss: { en: "Translation", zh: "译文" },
    provenance: {
      en: "Session {session} · {date} · omp {omp} · {model}. Every frame is Tern's own rendering of that session at this size; nothing is redrawn.",
      zh: "会话 {session} · {date} · omp {omp} · {model}。每一帧都是 Tern 按此尺寸渲染这次会话的画面，没有重画。",
    },
  },
  products: {
    title: { en: "Three products run whole workflows", zh: "三个产品各管一条完整的工作流" },
    lede: {
      en: "Each has its own page, with its own workflow from start to finish.",
      zh: "每个产品各有一页，从头到尾讲它自己的工作流。",
    },
    plugins: { en: "Plugins, each usable on its own", zh: "插件，每个都能单独使用" },
  },
  install: {
    title: { en: "Install one plugin, or the whole set", zh: "单装一个插件，或整套接入" },
    lede: {
      en: "Each plugin works on stock omp; omp-config adds the shared checks, and Tern draws the panels.",
      zh: "每个插件都能在原生 omp 上单独使用；omp-config 加上共用的检查，Tern 负责绘制面板。",
    },
  },
} as const;
