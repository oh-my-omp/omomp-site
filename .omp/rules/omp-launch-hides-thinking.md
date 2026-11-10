---
name: omp-launch-hides-thinking
description: "Every omp you start (tests, recordings, Tern scenarios, subagent briefs) carries --hide-thinking"
condition: ["(?<![\\w./-])omp(?=\\s+-|\\s*(?:$|[\"'\\n\\\\]))(?![^\"'\\n\\\\]*--hide-thinking)"]
scope: ["tool:bash", "tool:exec_command", "tool:task", "tool:write", "tool:edit"]
---

Start omp only with thinking display turned off: `omp --hide-thinking …`. This is the same switch the omp-unified-exec plugin applies through its init file (`alias omp='omp --hide-thinking'` in `~/.config/omp-unified-exec/init.sh`).

- The alias reaches only shells that read that init file. A Tern scenario's `run "…"`, `tern -e omp`, `omp -p`, `omp --mode rpc` and every script you write bypass it, so spell the flag out in each launch line.
- Briefs, scenario files and scripts you hand to subagents spell it out too. Subagents do not inherit this rule.
- `omp install`, `omp plugin` and other subcommands that start no session need no flag. Commands the site shows its readers are copy, not launches; leave them as readers would type them.
