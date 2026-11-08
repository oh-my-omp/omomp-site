---
name: no-launching-local-apps
description: "Never open, activate, script or screenshot any local macOS app other than the one you built, and never brief a subagent in a way that invites it"
condition: ["open\\s+-a\\b", "tell application", "System Events", "screencapture\\s+-x(?!\\s+-o\\s+-l)"]
scope: "tool"
---

The user's machine is not a reference library. A subagent once opened Notes, Mail, System Settings, Activity Monitor, Fork, Console and Finder windows to screenshot them as GUI references, quitting apps the user had open.

- Never run `open -a`, `open <app or folder>`, `osascript` against any application or `System Events`, or `activate`, except to drive the app you built yourself through `osascript … AXPress` on that app's own process.
- `screencapture` only with `-x -o -l <CGWindowID>` of a window owned by the app you built. Never a full-screen or region capture.
- GUI references come only from web search and screenshots published on the web (docs, blogs, galleries), fetched with `read`, `curl` or headless Playwright.
- Every brief that mentions native apps as reference systems MUST state these prohibitions explicitly. Listing a native app as a "system to search" means searching the web for it, never opening it locally.
