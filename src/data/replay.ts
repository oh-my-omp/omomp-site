import { z } from "astro/zod";
import type { Lang, Text } from "../i18n";
import type { Labels, Shot } from "../islands/ReplayPlayer";
import sessions from "./replay-sessions.json";

/** Redacted excerpts from real session logs, as copied from the machine's history. */
const rawShots = z.object({
  shots: z.array(
    z.object({
      id: z.string(),
      mechanism: z.array(z.string()),
      session: z.object({ id: z.string(), date: z.string(), model: z.string().optional() }),
      events: z.array(
        z.object({
          t: z.string(),
          actor: z.enum(["user", "assistant", "tool", "hook", "subagent"]),
          kind: z.enum(["message", "tool_call", "tool_result", "reminder", "block"]),
          tool: z.string().optional(),
          text: z.string(),
        }),
      ),
      source: z.string(),
    }),
  ),
});

/** Site-authored framing for a shot: never part of the log itself. */
interface ShotCopy {
  readonly title: Text;
  readonly caption: Text;
  /** Annotations keyed by event index in the raw shot. */
  readonly notes?: Readonly<Record<number, Text>>;
}

export const shotCopy: Readonly<Record<string, ShotCopy>> = {
  "1": {
    title: { en: "A question in the agent's jargon is sent back", zh: "满是行话的问题被退回" },
    caption: {
      en: "The agent asks you to choose, in terms only it understands. The question is returned before it reaches you; fourteen seconds later the plain-words version opens the panel and you answer.",
      zh: "代理请你做选择，用的却是只有它自己懂的说法。问题在到你面前之前就被退回；十四秒后，改成大白话的版本才打开面板，你作答。",
    },
    notes: {
      1: {
        en: "The readability check reads the question as you would see it, with none of the session behind it.",
        zh: "可读性检查按你看到时的样子读这个问题，不带任何会话上下文。",
      },
      3: { en: "Your answer: retire the tool altogether.", zh: "你的回答：直接退役这个工具。" },
    },
  },
  "2": {
    title: { en: "An advisor quotes you back", zh: "顾问引用你的原话" },
    caption: {
      en: "The main agent hands its plan to a conservative advisor, with your requirement paraphrased. The advisor also has your exact words, and its first objection is that the plan breaks them.",
      zh: "主代理把方案交给保守派顾问，你的要求在任务里只剩转述。顾问另外拿到了你的原话，第一条意见就是方案违背了它。",
    },
    notes: {
      0: { en: "Your requirement, hours earlier in the session.", zh: "你的要求，在会话里早了几个小时。" },
      1: { en: "The brief says it in the agent's words, not yours.", zh: "任务里是代理的说法，不是你的。" },
      2: {
        en: "Your words reach the advisor through user-prompt-inject, not through the brief.",
        zh: "你的原话经 user-prompt-inject 送到顾问手里，不经过任务描述。",
      },
    },
  },
  "3": {
    title: { en: "A bundled dispatch is refused", zh: "打包派发被拦下" },
    caption: {
      en: "The main agent sends five workers into one checkout, three of them carrying several topics each. Two refusals later, the work goes out as one topic per worker.",
      zh: "主代理把五个执行者派进同一个工作区，其中三个各揣着好几个主题。被拒两次之后，工作按一个执行者一个主题重新发出。",
    },
    notes: {
      1: {
        en: "isolation-nudge: writers would share a checkout. Resending with the choice spelled out goes through.",
        zh: "isolation-nudge：几个改文件的执行者会共用一个工作区。写明是否隔离后重发即可放行。",
      },
      3: {
        en: "task-split-check: a judge reads every brief and names the ones that mix topics.",
        zh: "task-split-check：判定者读每一份任务，点出混了多个主题的那几份。",
      },
    },
  },
  "4": {
    title: { en: "Shell habits get flagged", zh: "shell 老习惯被点名" },
    caption: {
      en: "Deep into a session, the agent edits a file with one long shell line. The command runs, the reminders ride back on its result, and the agent switches to the dedicated tools.",
      zh: "会话进行到很深处，代理用一长串 shell 命令改文件。命令照常执行，提醒附在结果后面送回，代理随即改用专用工具。",
    },
    notes: {
      1: {
        en: "Appended to the tool result. Nothing on your screen shows it.",
        zh: "附在工具结果末尾，你的屏幕上看不到。",
      },
      5: {
        en: "From a separate test session: delete-guard stops deletion written as code, not only as `rm`.",
        zh: "出自另一个测试会话：delete-guard 拦的不只是 `rm`，写成代码的删除同样拦下。",
      },
    },
  },
  "5": {
    title: { en: "One terminal, kept across turns", zh: "同一个终端，跨轮次保留" },
    caption: {
      en: "The agent starts a full omp session in a terminal it keeps, then types into it over several minutes, restart included. In Tern you open the same terminal and type into it the same way.",
      zh: "代理在一个保留下来的终端里启动完整的 omp 会话，几分钟里不断向它输入，中间还重启了一次。在 Tern 里，你可以打开同一个终端，用同样的方式输入。",
    },
    notes: {
      0: { en: "The terminal outlives the call that started it.", zh: "终端比启动它的那次调用活得更久。" },
      2: { en: "A later turn, the same live terminal.", zh: "后面的一轮，还是同一个活着的终端。" },
    },
  },
  "6": {
    title: { en: "“Done” has to be shown", zh: "“做完了”要拿出证据" },
    caption: {
      en: "A subagent hands in its report. The judge compares it with the assignment and the calls that actually ran, finds the check used the wrong model, and sends it back.",
      zh: "子代理交上报告。判定者拿它和任务要求、实际执行过的调用对照，发现验证用错了模型，退了回去。",
    },
    notes: {
      2: { en: "Redone on the model the assignment named.", zh: "换成任务指定的模型重做。" },
      3: {
        en: "From another session: turn-judge, when the main agent stopped with the work unfinished.",
        zh: "出自另一个会话：主代理活没干完就停下时，turn-judge 发出的提示。",
      },
    },
  },
  playbooks: {
    title: { en: "Driving a Playbook from the agent", zh: "代理驱动一份 Playbook" },
    caption: {
      en: "In a test session, the agent reads the tool docs, opens a Playbook, reads its only block and starts a Run.",
      zh: "在一次测试会话里，代理先读工具说明，打开 Playbook，读出其中唯一的块，再启动一个 Run。",
    },
    notes: {
      2: { en: "Opening the file also opens its pane in Tern.", zh: "打开文件的同时，在 Tern 里打开它的面板。" },
      4: { en: "A Run copies the Playbook; the original stays a template.", zh: "Run 是 Playbook 的副本，原文件仍是模板。" },
    },
  },
  dispatch: {
    title: { en: "The coordinator rules, the state machine acts", zh: "协调者裁决，状态机执行" },
    caption: {
      en: "The coordinator wakes on a blocked ticket, reads the issue and the decision behind it, and rules. The state machine moves the ticket back to the owner; the agent writes nothing to GitHub itself.",
      zh: "协调者因一张卡住的工单被唤醒，读完 issue 和背后的决定后作出裁决。状态机把工单交回负责人；代理自己不往 GitHub 写任何东西。",
    },
    notes: {
      0: { en: "Injected when the coordinator is woken.", zh: "协调者被唤醒时注入。" },
      3: { en: "The new state comes back from the state machine.", zh: "新状态由状态机返回。" },
    },
  },
  "remote-build": {
    title: { en: "A file edited locally, read in the container", zh: "本机写的文件，在容器里读到" },
    caption: {
      en: "A test run on a project opted in to remote build. The agent asks for its container, then runs a command inside it; the file it prints was written on the laptop and arrived by sync.",
      zh: "在一个已接入远端构建的项目里试跑：代理先申请自己的容器，再在里面执行一条命令；它读出的文件写在本机，经同步送到容器。",
    },
    notes: {
      2: {
        en: "One container per worktree. Sync runs one way, laptop to container.",
        zh: "每个 worktree 一个容器；同步只有一个方向：本机到容器。",
      },
      4: {
        en: "The command ran on the build host; its output streams back to the agent.",
        zh: "命令在构建机上执行，输出流回代理。",
      },
    },
  },
  memory: {
    title: { en: "An unfinished plan won't let the turn close", zh: "计划没做完，回合就收不了尾" },
    caption: {
      en: "The agent stops while a build runs elsewhere. A hidden reminder hands back the plan it still owes; the agent closes the items it had finished, tries to stop again, and the reminder returns with the one item left.",
      zh: "别处的构建还在跑，代理先停了下来。一条隐藏的提醒把还欠着的计划原样递回；代理勾掉已经做完的几项，又想停下，提醒再次出现，只剩最后一项。",
    },
    notes: {
      1: { en: "The reminder carries the plan itself: open items, what each means, the goal.", zh: "提醒带回的就是计划本身：未完成项、每项的说明和目标。" },
      3: { en: "The plan answers with what is still open.", zh: "计划随即回报还剩下什么。" },
      5: { en: "The second stop gets the same reminder, now holding only what is still owed.", zh: "第二次停下，提醒又来了，只剩还没做完的那一项。" },
    },
  },
};

const raw = rawShots.parse(sessions).shots;

/** Shots in the order given, localized; ids with no real excerpt are skipped. */
export function shotsFor(ids: readonly string[], lang: Lang): Shot[] {
  return ids.flatMap((id) => {
    const shot = raw.find((s) => s.id === id);
    const copy = shotCopy[id];
    if (!shot || !copy) return [];
    return [
      {
        id,
        title: copy.title[lang],
        caption: copy.caption[lang],
        mechanisms: shot.mechanism,
        source: [shot.session.date, shot.session.id.slice(0, 8), ...(shot.session.model ? [shot.session.model] : [])],
        events: shot.events.map((e, i) => {
          const note = copy.notes?.[i]?.[lang];
          return { actor: e.actor, kind: e.kind, text: e.text, ...(e.tool ? { tool: e.tool } : {}), ...(note ? { note } : {}) };
        }),
      },
    ];
  });
}

/** Replay page chapters in seam order: intent, prompt, memory, delegation, execution, delivery. */
export const replayIds: readonly string[] = ["1", "memory", "2", "3", "4", "5", "6"];

export function replayLabels(lang: Lang): Labels {
  const zh = lang === "zh";
  return {
    play: zh ? "播放" : "Play",
    pause: zh ? "暂停" : "Pause",
    replay: zh ? "重播" : "Replay",
    step: zh ? "步骤" : "Step",
    humanView: zh ? "你看到的" : "What you saw",
    fullView: zh ? "模型看到的" : "What the model saw",
    hidden: zh
      ? { one: "另有 {n} 条消息只有模型看得到", other: "另有 {n} 条消息只有模型看得到" }
      : { one: "{n} more message only the model saw", other: "{n} more messages only the model saw" },
    actors: zh
      ? { user: "你", assistant: "代理", tool: "工具", hook: "钩子", subagent: "子代理" }
      : { user: "You", assistant: "Agent", tool: "Tool", hook: "Hook", subagent: "Subagent" },
    source: zh ? "来源" : "Source",
  };
}
