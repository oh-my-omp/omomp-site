---
name: no-backgrounded-sleep-in-commands-or-briefs
description: "Never use or tell subagents to use `cmd & sleep N; kill` style compound or blind-wait commands; the user's shell rules apply to briefs too"
condition: ["&\\s*sleep\\s+\\S+", "\\bsleep\\s+\\S+\\s*;\\s*kill\\b", "tail\\s+-F[^\\n\"]*&"]
scope: "tool"
---

The user's hard shell rules bind you **and every brief, plan file and agent message you write**. Breaking them is treating what the user said as noise.

- One simple command per bash call. Never compose `cmd & sleep N; kill`, `tail -F … & sleep …` or other backgrounded or compound pipelines.
- No blind waits: no `sleep`, no poll loops.
- Long-running or streaming processes such as `tail -F`, daemons and servers run only in `exec_command`. Watch them with `monitor`, or read their log with `read` and a tail selector.
- To check a server or build log, run a plain command on a log that already exists. For example, `grep -n 'Local' <astro dev log>` after the server printed its address, not a timed background tail.

Before you send any brief or plan text, reread it against the user's rules: one simple command per call, no `| head`, no `2>/dev/null`, no `>` redirection, no heredocs, file reads only via read/grep/glob, long processes in exec_command, no blind waits.