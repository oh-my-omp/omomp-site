import type { Lang, Text } from "../i18n";
import type { Art } from "./Art";

/**
 * Demo data for the omp-remote-build stage: this machine's worktrees, the one-way
 * Mutagen sync, and the remote Komodo container where commands run.
 *
 * `remoteBuildScene` is language-invariant: file paths, config contents, command
 * lines and tool output — plugin tool reports are always English by design.
 * `remoteBuildStage.ui` holds strings the plugin renders for a human, verbatim per
 * language; `.copy` is authored site text (zone titles, captions) free to differ.
 */

/** One `git status --short` line in a checkout: the edits an agent has made there. */
export interface Change {
  readonly mark: "M" | "A";
  readonly path: string;
}

/** A checkout on this machine. `env`/`container` exist only for worktrees. */
export interface EnvRoot {
  readonly path: string;
  /** What this checkout is, shown in grey next to the path. */
  readonly role: Text;
  /** Environment id `<slug>-<sha256-10>`; absent on the main checkout. */
  readonly env?: string;
  /** Container/Mutagen name `rb-<id>` derived from the env id. */
  readonly container?: string;
  readonly changes: readonly Change[];
}

export interface ScreenLine {
  readonly text: string;
  /** `agent`: typed by the agent into the container PTY. */
  readonly by?: "agent";
}

/** One Mutagen session as the stream column shows it: its name, endpoints and current status. */
export interface SyncSession {
  readonly name: string;
  readonly alpha: string;
  readonly beta: string;
  /** Mutagen's own status text for the session. */
  readonly status: string;
  /** Files staged to the replica in this flush, from the worktree's changes. */
  readonly staged: readonly Change[];
}

export const remoteBuildScene: {
  id: string;
  container: string;
  roots: readonly EnvRoot[];
  envNote: string;
  sessions: readonly SyncSession[];
  ignored: readonly string[];
  syncFlush: string;
  report: readonly string[];
  execArgs: string;
  resultHead: readonly string[];
  screen: readonly ScreenLine[];
} = {
  /** The demo env whose whole chain is shown across the three zones. */
  id: "rate-limit-a3f9c1b7e2",
  container: "rb-rate-limit-a3f9c1b7e2",
  roots: [
    {
      path: "~/work/shop-api/",
      role: { en: "main checkout", zh: "主检出" },
      changes: [],
    },
    {
      path: "~/work/worktrees/rate-limit/",
      role: { en: "agent · rate-limit", zh: "agent · rate-limit" },
      env: "rate-limit-a3f9c1b7e2",
      container: "rb-rate-limit-a3f9c1b7e2",
      changes: [
        { mark: "A", path: "src/middleware/rate-limit.ts" },
        { mark: "M", path: "src/routes/orders.ts" },
        { mark: "M", path: "src/routes/search.ts" },
      ],
    },
    {
      path: "~/work/worktrees/coverage/",
      role: { en: "agent · coverage", zh: "agent · coverage" },
      env: "coverage-7e04d2f6c1",
      container: "rb-coverage-7e04d2f6c1",
      changes: [{ mark: "A", path: "test/orders.spec.ts" }],
    },
  ],
  /** Plugin message when a worktree command runs in the main checkout (verbatim, English-only). */
  envNote: "remote-build environments exist only in git worktrees; ~/work/shop-api is the main checkout",
  sessions: [
    {
      name: "rb-rate-limit-a3f9c1b7e2",
      alpha: "~/work/worktrees/rate-limit",
      beta: "builder.internal:/srv/rb/rate-limit-a3f9c1b7e2",
      status: "Staging files on beta",
      staged: [
        { mark: "A", path: "src/middleware/rate-limit.ts" },
        { mark: "M", path: "src/routes/orders.ts" },
        { mark: "M", path: "src/routes/search.ts" },
      ],
    },
    {
      name: "rb-coverage-7e04d2f6c1",
      alpha: "~/work/worktrees/coverage",
      beta: "builder.internal:/srv/rb/coverage-7e04d2f6c1",
      status: "Watching for changes",
      staged: [],
    },
  ],
  /** What `--ignore-vcs --ignore=".env*"` keeps on this machine. */
  ignored: [".git", ".env*"],
  syncFlush: "mutagen sync flush rb-rate-limit-a3f9c1b7e2",
  /** remote_env_init report lines (key: value, English-only). */
  report: [
    "status: ready",
    "container: rb-rate-limit-a3f9c1b7e2 on server builder; workdir /workspace; shell bash",
    "image_source: built from worktree Dockerfile .devcontainer/Dockerfile",
  ],
  /** container_exec call, `input` is C-escape decoded. */
  execArgs: '"pnpm build && pnpm test\\n"',
  /** Tool result text head, then `---` and the PTY output. */
  resultHead: [
    "[running] session_id: 3",
    "log_path: ~/.omp/agent/logs/container-rb-rate-limit-a3f9c1b7e2-3.log",
    "note: km always exits 0; this is only the local transport's exit code. Read command exit codes from the container shell output, e.g. echo $? immediately after the command.",
  ],
  screen: [
    { text: "/workspace # pnpm build && pnpm test", by: "agent" },
    { text: "> tsc -p tsconfig.json" },
    { text: " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms" },
    { text: " ✓ src/routes/orders.test.ts (4 tests) 88ms" },
    { text: " ✓ src/routes/search.test.ts (5 tests) 63ms" },
    { text: "" },
    { text: " Test Files  3 passed (3)" },
    { text: "      Tests  15 passed (15)" },
    { text: "/workspace # echo $?", by: "agent" },
    { text: "0" },
    { text: "/workspace # ", by: "agent" },
  ],
};

export interface RemoteBuildStageData {
  /** Authored site copy — free to differ between languages. */
  readonly copy: {
    readonly zones: readonly [string, string, string];
    readonly captions: readonly [string, string, string];
    readonly flushNote: string;
    readonly clean: string;
    readonly ignored: string;
    /** Reading aid under the English envNote on a page in another language; absent where the page is English. */
    readonly gloss?: { readonly label: string; readonly envNote: string };
  };
  /** Human-facing plugin strings, verbatim in each language. */
  readonly ui: {
    readonly ptyTitle: string;
    readonly notify: string;
  };
}

export const remoteBuildStage: Record<Lang, RemoteBuildStageData> = {
  en: {
    copy: {
      zones: ["This machine", "One-way sync", "Remote build host"],
      captions: [
        "Each worktree is its own remote-build environment, so parallel agents edit side by side.",
        "A Mutagen session per environment in one-way-replica mode: edits flow out, never back.",
        "The environment's Komodo container on the build host; the agent types into its shell.",
      ],
      flushNote: "flushed automatically after each write-type tool call",
      clean: "no remote-build environment",
      ignored: "stays on this machine",
    },
    ui: {
      ptyTitle: "Container rb-rate-limit-a3f9c1b7e2",
      notify: "remote-build: ready rb-rate-limit-a3f9c1b7e2 <- ~/work/worktrees/rate-limit",
    },
  },
  zh: {
    copy: {
      zones: ["本机", "单向同步", "远程构建主机"],
      captions: [
        "每个 worktree 是一个独立的 remote-build 环境，并行的 agent 各改各的。",
        "每个环境一条 one-way-replica 模式的 Mutagen 会话：改动只往外推，不回传。",
        "构建主机上该环境的 Komodo 容器；agent 用容器工具在它的 shell 里敲命令。",
      ],
      flushNote: "每次写入类工具调用后自动执行",
      clean: "没有 remote-build 环境",
      ignored: "留在本机",
      gloss: { label: "译文", envNote: "remote-build 环境只存在于 git worktree 中；~/work/shop-api 是主检出" },
    },
    ui: {
      ptyTitle: "容器 rb-rate-limit-a3f9c1b7e2",
      notify: "remote-build：已就绪 rb-rate-limit-a3f9c1b7e2 <- ~/work/worktrees/rate-limit",
    },
  },
} as const satisfies Record<Lang, RemoteBuildStageData>;

/**
 * The slice above each cell of the page's How it works grid, in cell order:
 * the Mutagen session remote_env_init creates for a worktree and the flush that
 * follows each write-type tool call (src/mutagen.ts); the remote_env_init reports of
 * two worktrees with the same Dockerfile, the second reusing the first one's image
 * (src/init.ts, tag shape src/project.ts); and a container_exec call with its result
 * head. Flags, report keys and values, tool names and result lines are verbatim;
 * `#` lines are site comments in the page language.
 */
const image = "rb-project-shop-api-5c1e8d0b2a:7c2e91d04b5fa318";

const sectionArt = (lang: Lang): readonly [Art, Art, Art] => [
  {
    kind: "code",
    title: "mutagen",
    lines: [
      "$ mutagen sync create \\",
      `    --name=${remoteBuildScene.container} \\`,
      "    --label=remote-build \\",
      `    --label=rb-env=${remoteBuildScene.id} \\`,
      "    --mode=one-way-replica \\",
      "    --ignore-vcs \\",
      '    --ignore=".env*" \\',
      `    ${remoteBuildScene.sessions[0]!.alpha} \\`,
      `    ${remoteBuildScene.sessions[0]!.beta}`,
      lang === "en" ? "# after each write-type tool call" : "# 每次写入类工具调用之后",
      `$ ${remoteBuildScene.syncFlush}`,
    ],
  },
  {
    kind: "code",
    title: "remote_env_init",
    lines: [
      "status: ready",
      `worktree: ${remoteBuildScene.sessions[0]!.alpha}`,
      `image: ${image}`,
      "image_source: built from worktree Dockerfile .devcontainer/Dockerfile",
      "",
      "status: ready",
      `worktree: ${remoteBuildScene.sessions[1]!.alpha}`,
      `image: ${image}`,
      "image_source: reused (cached build of .devcontainer/Dockerfile)",
    ],
  },
  {
    kind: "code",
    title: "container_*",
    lines: [
      lang === "en" ? "# registered at session start" : "# 会话启动时即已注册",
      "container_exec",
      "container_write_stdin",
      "container_list_sessions",
      "container_kill_session",
      "",
      `container_exec input: ${remoteBuildScene.execArgs}`,
      remoteBuildScene.resultHead[0]!,
      "---",
      ...remoteBuildScene.screen.slice(0, 4).map((l) => l.text),
    ],
  },
];

export const remoteBuildSectionArt: Record<Lang, readonly [Art, Art, Art]> = { en: sectionArt("en"), zh: sectionArt("zh") };

/** Capsule links beside the How it works heading: the files that define each mechanism. */
export const remoteBuildLinks: readonly { readonly label: string; readonly href: string }[] = [
  { label: "README", href: "https://github.com/oh-my-omp/omp-remote-build#readme" },
  { label: "mutagen.ts", href: "https://github.com/oh-my-omp/omp-remote-build/blob/HEAD/src/mutagen.ts" },
  { label: "init.ts", href: "https://github.com/oh-my-omp/omp-remote-build/blob/HEAD/src/init.ts" },
  { label: "container-tools.ts", href: "https://github.com/oh-my-omp/omp-remote-build/blob/HEAD/src/container-tools.ts" },
];
