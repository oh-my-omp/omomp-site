---
name: no-passive-long-waits
description: "Never sit idle on a wait expected to exceed five minutes; advance independent work instead"
condition: ["\"i\":\"(Waiting|Awaiting|Collecting|Blocking)[^\"]*(agents?|events|results|council|decisions?)", "(还要等|只能等|等待?[^。\\n]{0,30}(定案|续审|回报|结束|完成|叫醒))"]
scope: ["tool", "text"]
---

在等待预计超过 5 分钟的结果（copy-editor 审稿意见、subagent 交付、构建、Pages 部署 CI）时，不得调用 `wait` 空等，也不得对用户说「还要等」「只能等」。

应该这样做：
- 先列出不依赖这个结果的工作，并立即推进。可做的工作包括：写下一页的中英文案、按源仓库核对组件事实、同步 `docs/content-design.md`、在浏览器里走查已完成的页面、准备下一步 brief。
- 长时间的日志等待交给 `exec_command` 加 `monitor`。monitor 的条件要覆盖所有目标事件，例如构建的成功行和报错行都要写进去，不能只写成功行。设好 monitor 后继续干活，等它唤醒。
- subagent 超过 10 分钟没有新阶段时，主动读取它的 `proc://`/`history://`，或给它发消息确认卡在哪里，不要被动等待。
- 只有在确实没有任何可推进的工作时才调用 `wait`，并在回复中说明已经检查过、没有剩余的独立工作。