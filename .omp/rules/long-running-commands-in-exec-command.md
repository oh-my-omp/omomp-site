---
name: long-running-commands-in-exec-command
description: "Never run potentially long-running commands in bash or eval; run them observably in exec_command without suppressing output"
condition: ["\"code\":\"[\\s\\S]*subprocess\\.(?:Popen|run|call|check_output)\\(", "\"code\":\"[\\s\\S]*Bun\\.(?:spawn|\\$)", "\"command\":\"[^\"]*--mode rpc", "\"command\":\"[^\"]*\\btimeout \\d+", "\"command\":\"[^\"]*\\b(?:(?:npm|pnpm|yarn|bun) (?:run|test|dev)|astro (?:dev|build|preview|check)|npx (?:astro|playwright|hyperframes)|playwright test|mmdc)\\b", "\"command\":\"[^\"]*2>/dev/null", "\"command\":\"[^\"]*>\\s*/dev/null"]
scope: "tool"
---

Commands that may run for a long time (omp `--mode rpc` processes, `astro dev`/`astro preview` servers, site builds, Playwright runs, demo renders, `timeout N …` wrappers, any spawned subprocess) MUST NOT be run in `bash` or `eval` (no `subprocess.Popen/run`, no `Bun.spawn`). Run them in `exec_command` so the session is observable, then use `write_stdin`/`monitor` to follow it.

Never hide output: no `2>/dev/null`, `>/dev/null`, `capture_output` that is discarded, or `| head` used to silence a running process. Keep stdout/stderr visible so failures and progress can be observed. This applies globally, in every repo and task.

如果你的subagent缺少工具，允许去直接修改对应的agent定义并且用harness restart
