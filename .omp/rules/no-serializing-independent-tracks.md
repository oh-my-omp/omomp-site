---
name: no-serializing-independent-tracks
description: "Do not queue independent work behind one shared bottleneck; find a way to isolate it and run the tracks in parallel"
condition: ["排在[^。\\n]{0,40}(之后|后面)", "(等|待)[^。\\n]{0,30}(跑完|结束|合并)(之?后)?再", "同一时间只能有一个", "strictly one after another", "[Dd]o the steps strictly", "one (council )?daemon at a time", "serially", "串行"]
scope: ["text", "tool:write(agent://*)", "tool:task"]
---

Before you queue work behind something else, check whether the dependency is real. If two tracks only share a resource (a repo, a daemon slot, ports, a model), isolate that resource and run both tracks now. For example:
- point one instance at a different repo or Project scope;
- copy existing session data;
- use separate ports;
- use another worktree.

Only code or merge order that the next step actually needs justifies serial order. When you do keep work serial, name the dependency and why no isolation exists.

Do not idle on long timeouts either (for example a dev server or deploy check that never reports back). Shorten the bound, restart, or work on another track meanwhile.

A status reply should list several tracks moving at once, not one blocked point.