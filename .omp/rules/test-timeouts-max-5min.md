---
name: test-timeouts-max-5min
description: "Never set or approve a build, browser-check or smoke timeout above 300 s (5 minutes)"
condition: ["(?i)(timeout|上限|超时)[^\\n]{0,40}\\b(30[1-9]|3[1-9]\\d|[4-9]\\d{2}|\\d{4,})\\s*(s|秒|seconds)\\b", "(?i)\\b(30[1-9]|3[1-9]\\d|[4-9]\\d{2}|\\d{4,})\\s*(s|秒|seconds)\\b[^\\n]{0,40}(timeout|上限|超时)"]
scope: ["tool:write", "tool:edit(*.yaml)", "tool:write(*.yaml)", "tool:edit(*.yml)", "tool:write(*.yml)", "tool:task", "tool:fork_task"]
---

Builds, browser checks, smoke runs and deploy checks must never wait more than **5 minutes (300 s)** on anything. Keep Playwright and test-runner timeouts, exec deadlines and any agent instruction to wait at or below 300 s.

- Do not set, keep or approve larger values "so the build fits". If a build, a dev server start or a page load needs more than 5 minutes, that is a defect or an upstream fault. Investigate it; do not wait it out.
- If a run stalls (for example a dev server that never prints its address), cut it at once: restart with a bound of 300 s or less, and record what you observed.
- Never tell a subagent to leave a run until a long timeout. Give it a bound of 300 s or less, or an explicit stop condition.
