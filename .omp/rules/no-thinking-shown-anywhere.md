---
name: no-thinking-shown-anywhere
description: "Model thinking blocks never appear anywhere: site pages, slices, captures, demos, review briefs"
condition: ["(?i)\\bthink(?:ing)?\\b", "思考", "(?i)reasoning[_ ]?content", "(?i)thinking[-_ ]?translator"]
scope: ["tool:write", "tool:edit", "tool:task", "tool:bash", "tool:exec_command"]
---

No thinking block is shown anywhere: not on any page of the site, not in a slice, panel or drawn interface, not in a screenshot, recording, replay step or demo, and not in material handed to a reviewer or subagent.

- Do not add a slice, panel variant, transcript line kind, replay beat, label or style for thinking, and do not introduce omp-thinking-translator.
- Real captures come from an omp started with `--hide-thinking` (see `omp-launch-hides-thinking`). Before a capture enters `public/` or a review, look at it; one that shows a thinking block is discarded and re-recorded, never cropped or retouched.
- Copy may not quote, translate or summarise what a model thought.
