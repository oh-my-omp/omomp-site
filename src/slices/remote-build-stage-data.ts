import type { Lang, Text } from "../i18n";

/**
 * Demo data for the omp-remote-build stage: this machine's worktrees, the one-way
 * Mutagen sync, and the remote Komodo container where commands run.
 *
 * `remoteBuildScene` is language-invariant: file paths, config contents, command
 * lines and tool output — plugin tool reports are always English by design.
 * `remoteBuildStage.ui` holds strings the plugin renders for a human, verbatim per
 * language; `.copy` is authored site text (zone titles, captions) free to differ.
 */

/** One file-tree line under a worktree root. */
export interface TreeEntry {
  readonly text: string;
  /** Indent level below the root line. */
  readonly depth: number;
  readonly kind: "leaf" | "cfg";
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
  readonly tree?: readonly TreeEntry[];
}

export interface ScreenLine {
  readonly text: string;
  /** `agent`: typed by the agent into the container PTY. */
  readonly by?: "agent";
}

export const remoteBuildScene: {
  id: string;
  container: string;
  roots: readonly EnvRoot[];
  envNote: string;
  syncCreate: readonly string[];
  endpoints: { alpha: string; beta: string };
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
    },
    {
      path: "~/work/worktrees/rate-limit/",
      role: { en: "agent · rate-limit", zh: "agent · rate-limit" },
      env: "rate-limit-a3f9c1b7e2",
      container: "rb-rate-limit-a3f9c1b7e2",
      tree: [
        { text: ".omp/remote-build.json", depth: 0, kind: "cfg" },
        { text: '"dockerfile": ".devcontainer/Dockerfile"', depth: 1, kind: "leaf" },
        { text: '"workdir": "/workspace"', depth: 1, kind: "leaf" },
        { text: '"shell": "bash"', depth: 1, kind: "leaf" },
        { text: '"ignore": [".env*"]', depth: 1, kind: "leaf" },
      ],
    },
    {
      path: "~/work/worktrees/coverage/",
      role: { en: "agent · coverage", zh: "agent · coverage" },
      env: "coverage-7e04d2f6c1",
      container: "rb-coverage-7e04d2f6c1",
      tree: [{ text: ".omp/remote-build.json", depth: 0, kind: "cfg" }],
    },
  ],
  /** Plugin message when a worktree command runs in the main checkout (verbatim, English-only). */
  envNote: "remote-build environments exist only in git worktrees; ~/work/shop-api is the main checkout",
  syncCreate: [
    "mutagen sync create ~/work/worktrees/rate-limit builder.internal:/srv/rb/rate-limit-a3f9c1b7e2 \\",
    '  --name=rb-rate-limit-a3f9c1b7e2 --mode=one-way-replica --ignore-vcs --ignore=".env*" \\',
    "  --label=remote-build --label=rb-env=rate-limit-a3f9c1b7e2",
  ],
  endpoints: {
    alpha: "~/work/worktrees/rate-limit",
    beta: "builder.internal:/srv/rb/rate-limit-a3f9c1b7e2",
  },
  syncFlush: "mutagen sync flush rb-rate-limit-a3f9c1b7e2",
  /** remote_env_init report lines (key: value, English-only). */
  report: [
    "status: ready",
    "container: rb-rate-limit-a3f9c1b7e2 on server builder; workdir /workspace; shell bash",
    "image_source: built from worktree Dockerfile .devcontainer/Dockerfile",
  ],
  /** container_exec call, `input` is C-escape decoded. */
  execArgs: '"pnpm test\\n"',
  /** Tool result text head, then `---` and the PTY output. */
  resultHead: [
    "[running] session_id: 3",
    "log_path: ~/.omp/agent/logs/container-rb-rate-limit-a3f9c1b7e2-3.log",
    "note: km always exits 0; this is only the local transport's exit code. Read command exit codes from the container shell output, e.g. echo $? immediately after the command.",
  ],
  screen: [
    { text: "/workspace # pnpm test", by: "agent" },
    { text: "" },
    { text: " ✓ src/middleware/rate-limit.test.ts (6 tests) 41ms" },
    { text: " ✓ src/routes/orders.test.ts (4 tests) 88ms" },
    { text: " ✓ src/routes/search.test.ts (5 tests) 63ms" },
    { text: " ✓ src/routes/webhooks.test.ts (3 tests) 29ms" },
    { text: "" },
    { text: " Test Files  4 passed (4)" },
    { text: "      Tests  18 passed (18)" },
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
  };
  /** Human-facing plugin strings, verbatim in each language. */
  readonly ui: {
    readonly tools: readonly { readonly name: string; readonly label: string }[];
    readonly ptyTitle: string;
    readonly notify: string;
  };
}

export const remoteBuildStage: Record<Lang, RemoteBuildStageData> = {
  en: {
    copy: {
      zones: ["This machine", "One-way sync", "Remote build host"],
      captions: [
        "Three checkouts of shop-api; each worktree gets its own remote-build environment, one per parallel agent.",
        "One Mutagen session per environment, one-way-replica: edits flow out to the replica, never back.",
        "The env's Komodo container on the build host. The agent's container tools run commands inside it.",
      ],
      flushNote: "flushed automatically after each write-type tool call",
    },
    ui: {
      tools: [
        { name: "remote_env_init", label: "Remote env init" },
        { name: "container_exec", label: "Container exec" },
        { name: "container_write_stdin", label: "Container stdin" },
        { name: "container_list_sessions", label: "Container sessions" },
        { name: "container_kill_session", label: "Kill container session" },
      ],
      ptyTitle: "Container rb-rate-limit-a3f9c1b7e2",
      notify: "remote-build: ready rb-rate-limit-a3f9c1b7e2 <- ~/work/worktrees/rate-limit",
    },
  },
  zh: {
    copy: {
      zones: ["本机", "单向同步", "远程构建主机"],
      captions: [
        "同一仓库 shop-api 的三个检出；每个 worktree 有各自的 remote-build 环境，并行 agent 各占一个。",
        "每个环境一条 Mutagen 会话，one-way-replica：本机改动只往副本里推，不回传。",
        "构建主机上以环境命名的 Komodo 容器；agent 用容器工具在里面跑命令。",
      ],
      flushNote: "每次写入类工具调用后自动执行",
    },
    ui: {
      tools: [
        { name: "remote_env_init", label: "远程环境初始化" },
        { name: "container_exec", label: "容器执行" },
        { name: "container_write_stdin", label: "容器标准输入" },
        { name: "container_list_sessions", label: "容器会话" },
        { name: "container_kill_session", label: "终止容器会话" },
      ],
      ptyTitle: "容器 rb-rate-limit-a3f9c1b7e2",
      notify: "remote-build：已就绪 rb-rate-limit-a3f9c1b7e2 <- ~/work/worktrees/rate-limit",
    },
  },
} as const satisfies Record<Lang, RemoteBuildStageData>;
