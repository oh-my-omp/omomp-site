---
name: gui-tests-via-trusted-run
description: "Run screen capture, screen recording and AX tools for demo footage only through trusted-run, so macOS privacy grants persist"
condition: ["(?<!trusted-run )\\bosascript\\b", "(?<!trusted-run )\\bscreencapture\\s+-", "(?<!trusted-run )\\bopen\\s+-n\\b"]
scope: ["tool:task", "tool:exec_command", "tool:bash", "tool:write"]
---

macOS records privacy grants (Accessibility, Screen Recording) against the program that launchd starts. Capture tools and freshly built binaries started from versioned paths look like new programs after every upgrade or rebuild, so each one asks for authorization again.

`/Users/mouriya/.local/bin/trusted-run` is a launcher with a fixed path and fixed contents, and it stays alive as the responsible process.

- Capture real interfaces for site demos (an omp session in a terminal you started, its Tern panels) only through it: `trusted-run screencapture -x -o -l <id>`, `trusted-run osascript …`, `trusted-run <recorder> …`. Do not launch these directly or with `open -n`.
- Browser checks of the site itself use headless Playwright, which needs no grants.
- Every brief, script and command you write for subagents must spell out `trusted-run`. Subagents do not inherit the rule.
- Do not recompile, re-sign or otherwise change trusted-run, and do not touch the TCC database.
