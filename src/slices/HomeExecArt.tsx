import type { Lang } from "../i18n";
import Terminals, { type TermSession } from "./Terminals";
import "../styles/home-slices.css";

/** Elapsed times as the plugin formats them per language (src/format-time.ts). */
const elapsed: Readonly<Record<Lang, readonly [string, string]>> = { en: ["4m12s", "3m58s"], zh: ["4分12秒", "3分58秒"] };

const sessions = (lang: Lang): readonly TermSession[] => [
  {
    id: 1,
    title: "pnpm test --watch",
    command: "pnpm test --watch",
    state: "running",
    elapsed: elapsed[lang][0],
    cwd: "~/code/shop-api",
    size: "120×32",
    screen: [
      { text: " ✗ src/routes/webhooks.test.ts > signed callbacks skip the limiter" },
      { text: " Tests  1 failed | 15 passed (16)" },
      { text: " Waiting for file changes..." },
      { text: "p", by: "you" },
      { text: " ? Input filename pattern › webhooks", by: "you" },
      { text: " ✓ src/routes/webhooks.test.ts (3 tests)" },
      { text: "a", by: "agent" },
      { text: " Tests  16 passed (16)" },
    ],
  },
  {
    id: 2,
    title: "redis-cli monitor",
    command: "redis-cli monitor",
    state: "running",
    elapsed: elapsed[lang][1],
    cwd: "~/code/shop-api",
    size: "120×32",
    screen: [{ text: '"EVALSHA" "9f2c41d0" "1" "rl:key_live_7Q" "100" "1.67"' }],
  },
];

/**
 * The omp-unified-exec card: the Terminals view listing the running PTY sessions, and over it one session opened
 * full-pane, where keys go to the terminal — your keystrokes and the agent's `write_stdin` land in the same PTY.
 */
export default function HomeExecArt(props: { lang: Lang; you: string; agent: string }) {
  return (
    <div class="hx">
      <div class="hx-view">
        <Terminals lang={props.lang} data={{ mode: "view", selected: 1, sessions: sessions(props.lang) }} compact />
      </div>
      <div class="hx-page">
        <Terminals lang={props.lang} data={{ mode: "page", selected: 1, sessions: sessions(props.lang) }} compact />
      </div>
      <div class="hx-key" aria-hidden="true">
        <span class="by-you">{props.you}</span>
        <span class="by-agent">{props.agent}</span>
      </div>
    </div>
  );
}
