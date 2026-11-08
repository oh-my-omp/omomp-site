---
name: omp-tests-use-futureppo-pool
description: "LLM/omp test runs must use the futureppo-pool provider (unlimited usage), never other providers"
condition: ["--model[ =]+(?!futureppo-pool/)[A-Za-z0-9_.-]+/", "\\\"model\\\"\\s*:\\s*\\?\"(?!futureppo-pool/)(anthropic|openai-codex|commandcode|google-antigravity|devin|opencode-go)/"]
scope: "tool"
---

Every LLM or omp test run — `omp -p`, `omp --mode rpc`, `omp --dispatch`, sims, smoke probes, example/test configs, and curl payloads that carry a model — uses a `futureppo-pool/<model>` model (for example `futureppo-pool/grok-4.7`). Its usage is unlimited.

Do not test with anthropic, openai-codex, commandcode, google-antigravity, devin or opencode-go. These providers rate-limit, run out of quota or have deleted credentials, and they spend the user's paid budget.

Tests check mechanics, not decision quality, so a test never needs the production model. Production defaults in the design keep their designed models. Test configs and specs that you hand to subagents name futureppo-pool models explicitly.