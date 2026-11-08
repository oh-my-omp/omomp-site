---
name: no-self-blocking-on-decided-items
description: "Don't mark work blocked or wait on the user after you have already decided how to proceed; carry out the decision and keep working."
condition: ["需要你处理", "blocked: 等用户", "BLOCK \"", "排在[^。\\n]{0,30}之后", "等用户(从|在|决定|选定|确认)"]
scope: ["text", "tool"]
---

You are in goal mode: never stop and never block. If you already made a decision (for example, "deploy to GitHub Pages now, move hosting later if the user picks another host"), act on it. Don't mark that item `blocked`, don't list it again under 需要你处理, and don't park work behind it.

- **Pending user choices that don't stop progress:** mention them once as an FYI. Don't repeat them as blockers every turn, and don't put them into Todo as BLOCK.
- **Serialization:** look for a way to remove a constraint before you queue work behind it. For example, write the next page's copy while the copy-editor reviews the current one. Don't announce that work is "排在…之后" when a decided workaround exists.
- **Real blocks:** only when no tool, agent or decision of yours can advance the item, such as a passkey only the user holds. Even then, finish every other reachable step first and keep the rest moving.