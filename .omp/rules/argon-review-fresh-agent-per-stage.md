---
name: argon-review-fresh-agent-per-stage
description: "Each Argon review stage needs a newly spawned copy-editor agent; never reuse ArgonEditor or any earlier reviewer"
condition: "\\bArgon(Editor)?\\b"
scope: "text"
---

Do not reuse an Argon reviewer between review stages. Never send a page group, a redirect or a re-review to `ArgonEditor` or any other reviewer that already exists, whether through `write agent://…` or by any other route.

For every review stage, re-reviews after fixes included:
- Spawn a new `task` with `agent: "copy-editor"` and a new unique name, for example `ArgonHome1` or `ArgonReplay2`.
- Make the assignment self-contained. List the screenshot paths of the finished rendered pages and the routes they cover, with desktop and mobile shots in both English and Chinese. For a re-review, also list the issues that were fixed.
- Let that reviewer yield its verdict and then leave it finished. The next stage gets a different fresh agent, so no stage inherits another stage's context or leniency.

When you plan or describe the review step, write it as "spawn a fresh copy-editor for <page group>", not as handing the work to Argon or ArgonEditor.