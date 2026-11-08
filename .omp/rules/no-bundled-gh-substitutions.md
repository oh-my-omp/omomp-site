---
name: no-bundled-gh-substitutions
description: "Do not chain several $(gh …) captures, inline python and gh mutations into one shell call"
condition: ["\\$\\(gh [a-z]+ [a-z-]+[\\s\\S]*?\\$\\(gh [a-z]+ [a-z-]+", "\\$\\([\\s\\S]*?\\$\\([\\s\\S]*?\\$\\("]
scope: "tool"
---

An earlier shell call did too much in one command. It created an issue, captured its number with `$(gh …)`, built a value with `$(python3 …)`, read the body back with `$(gh issue view …)`, then edited the issue. Calls like that crashed omp.

Give each step its own tool call:
- Run each mutating command (`gh issue create`, `gh issue edit`, `gh api -X …`, `gh project …`) as a separate call, and read its output before you start the next step.
- Compute values such as numbers, URL-encoded specs or bodies in `eval` from output you already have. Write bodies to a file with `write`, then pass the file with `--body-file` or `-F body=@file`. Never build a body inline with `$(…)`.
- Run long or interactive programs in `exec_command`.
- A short pipeline that filters one program's output is fine. Several `$(…)` captures chained with create, read and edit steps in one command are not.