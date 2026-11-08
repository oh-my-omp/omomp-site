---
name: task-low-short-single-use
description: "A task:low agent gets one short job and is never reused; Main runs review, commit, push and deploy itself"
condition: ["\"agent\":\\s*\"task:low"]
scope: "tool"
---

task:low 只做一件短活，做完就弃用：

- 一个 task:low 只领一步：只写一页的中英文案，或只实现一个 island，或只按源仓库核对一组组件事实。不要把「写文案、送审、实现、构建、浏览器走查、提交推送」串成一个 brief。预计超过约 40 次工具调用的活，就拆给多个新的 task:low，或由 Main 自己做。
- 给 copy-editor 送审、提交、推送、部署，这些几条命令就能做完的步骤一律由 Main 自己执行，不写进 task:low 的 brief。
- 禁止复用 task:low。它结束、超限或被停之后，不给它发新活，不用 `write agent://<id>` 追加任务，也不让它「顺便再改一遍」。剩下的工作由 Main 自己做，或另派一个全新的 task:low，brief 只写剩下的那一步。
- 文案或设计改了需要重做时，同样按上一条处理：另派新的 task:low，或由 Main 自己重做，不让原来那个 agent 接着干。
- 回答 task:low 在运行中提出的阻塞问题可以，但答复只能是裁决，不能借机追加新步骤；裁决会让它的活明显变长时，停掉它，把剩余步骤拆给新的 agent。
