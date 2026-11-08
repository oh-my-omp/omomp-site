---
name: argon-reviews-rendered-screenshots-only
description: "Send the Argon reviewer only screenshots of finished rendered pages, never source files or copy drafts"
condition: ["src/(copy|data|views|components|layouts|islands)/", "\\.(ya?ml|tsx?|astro)\\b", "(?i)\\bdraft \\d"]
scope: ["tool:write(agent://Argon*)", "tool:write(agent://*Editor*)"]
---

Argon reviews only the finished site, as the final polishing pass. Never send it source files, YAML or TS copy, or text drafts.

What to send:
- Screenshot paths of the actual rendered pages: desktop and mobile widths, English and Chinese, captured with headless Playwright after `astro build` + preview.
- One page or one page group per message, listing the routes the screenshots cover.

What Argon judges, at the bar of an Apple designer:
- **Visual consistency:** type scale, spacing rhythm, color, alignment, and component reuse across pages.
- **Aesthetics:** hierarchy, density, whitespace, motion, and polish at both widths.
- **Copy in context:** whether each headline and line reads well where it sits and works with the visuals, in both languages.

Check your copy against the sources yourself before building. Bring Argon in only once a page is implemented and rendered. Then fix every issue it raises, re-shoot the screenshots, and resend until it accepts.