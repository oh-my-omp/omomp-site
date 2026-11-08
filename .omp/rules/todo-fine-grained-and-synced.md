---
name: todo-fine-grained-and-synced
description: "Never add whole-stage or multi-hour todo items; break each stage into per-page copy, review, implement, and browser-check steps, and rewrite the todo whenever the direction changes"
condition: ["ADD \\\\?\"阶段 ?\\d", "ADD \\\\?\"[^\"\\\\]{1,60}\\\\?\" \\\\?\"[^\\n]*?\\\\?\" (?:1[3-9]\\d|[2-9]\\d{2}|\\d{4,})(?:\\\\n|\\n|$)"]
scope: ["tool:todo", "tool:_todo"]
---

The todo is the live plan. Don't use it as a list of stage headings.

- **Never add a todo item for a whole stage or for more than about 120 minutes of work.** For example, `ADD "阶段 1 守护群" … 240` is too coarse. Use stages as PHASE names. Under each phase, add one step per page or island for each of: write the EN and ZH copy, pass the copy-editor review, implement it (say which subagent does it), and check it in the browser. Each step names its page or component.
- **Update the todo in the same turn the user redirects you or adds a constraint**, before you call any other tool. Constraints include new pages, language and hosting choices, copy standards, how demos are produced, and components to fix. Rewrite stale items, add the new steps, and correct explanations and estimates.
- **Mark items done as soon as they finish.** Keep exactly one item in progress.
- **Scope DONE commit clauses to your own paths.** A bare clause must never commit unrelated working-tree changes.