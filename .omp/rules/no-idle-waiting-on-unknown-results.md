---
name: no-idle-waiting-on-unknown-results
description: "Don't idle-wait on jobs or terminals whose progress you can't see; find their logs, investigate, and use exec_command monitors with short reminders."
condition: ["\"i\"\\s*:\\s*\"Waiting for", "\"remind_after_ms\"\\s*:\\s*([3-9]\\d{5}|\\d{7,})"]
scope: "tool"
---

Don't block on `wait` or a long `monitor` when you don't know how a job is going.

- **Look at the evidence first.** Read the job's log: the exec_command `log_path`, the `term://` output, `proc://<id>`, or the files the process writes, such as session dirs and sim output. If you don't know where its logs go, find out yourself or send a subagent to look. Don't sit waiting.
- **Anything running past about 5 minutes is suspect.** Check whether it is hung, stuck on input, or quietly failing. Don't assume it is making progress.
- **Run long commands with `exec_command`** (servers, sims, test suites, omp processes). It wakes you on timeout or exit.
- **Keep `monitor` reminders short.** Set `remind_after_ms` to 300000 or less, and give it a `condition` or `judge` so a hang or error wakes you early.
- **Do other work while jobs run.** Results arrive on their own. If a terminal shows no output, treat that as something to diagnose, not as a reason to keep waiting.