import type { Lang } from "../i18n";

/** What reached the model at one moment of a run, quoted from that run's session log. */
export type Sent =
  /** Messages appended after the prompt and kept off the screen, with one sentence quoted from one of them. */
  | {
      readonly kind: "appended";
      readonly messages: readonly { readonly source: string; readonly chars: number }[];
      readonly quote: { readonly source: string; readonly text: string; readonly gloss: string };
    }
  /** What a tool call returned to the model; the screen shows it too. */
  | { readonly kind: "result"; readonly tool: string; readonly at: string; readonly text: string; readonly gloss: string };

export type MomentId = "ask" | "refused" | "trash";

/** One real session: where it ran, and what the model was sent at each of the three captured moments. */
export interface RealRun {
  readonly session: string;
  readonly date: string;
  readonly omp: string;
  readonly model: string;
  readonly sent: Readonly<Record<MomentId, Sent>>;
}

const appended = [
  { source: "omp-config/append-system-model", chars: 815 },
  { source: "omp-config/repo-rules", chars: 615 },
  { source: "omp-config/tool-topics", chars: 13720 },
  { source: "omp-config/system-prompt-replace", chars: 2182 },
] as const;

const quote = {
  source: "omp-config/tool-topics",
  text: "Delete files with the `delete` tool when the session has it, never from bash: deletion commands (`rm`, `unlink`, `rmdir`, `shred`, `find -delete`) and commands whose name or nested script is not literal are refused before they run.",
  gloss: "会话里有 `delete` 工具时，删除文件用它，不要在 bash 里删：删除命令（`rm`、`unlink`、`rmdir`、`shred`、`find -delete`），以及命令名或嵌套脚本不是字面量的命令，在运行前就会被拒绝。",
} as const;

const refused = {
  text: "delete-guard: deletion commands are disabled; this call did not run. Deletion command: `rm -rf build` (`rm` deletes files). To delete files, call the `delete` tool with literal paths and leave `mode` unset; the default moves them to the system trash.",
  gloss: "delete-guard：删除命令已停用，这次调用没有执行。删除命令：`rm -rf build`（`rm` 会删除文件）。要删除文件，请用字面路径调用 `delete` 工具，不要设置 `mode`；默认会把它们移到系统回收站。",
} as const;

/** Shots of moment `n` live in `public/real/<lang>-<n>-desktop.png` and `-mobile.png`. */
export const moments: readonly MomentId[] = ["ask", "refused", "trash"];

export const realRuns: Readonly<Record<Lang, RealRun>> = {
  en: {
    session: "01a1c382-1ba0-716e-8fbb-b7a2c714106e",
    date: "2026-11-10",
    omp: "18.18.6",
    model: "futureppo-pool/grok-4.7",
    sent: {
      ask: { kind: "appended", messages: appended, quote },
      refused: { kind: "result", tool: "bash", at: "03:31:32Z", ...refused },
      trash: {
        kind: "result",
        tool: "delete",
        at: "03:31:38Z",
        text: "delete (trash): all 1 done\nok     build: moved to /Users/mouriya/.Trash/build 12-31-38-873",
        gloss: "delete（回收站）：1 项全部完成。build 已移到 /Users/mouriya/.Trash/build 12-31-38-873。",
      },
    },
  },
  zh: {
    session: "01a1c384-b57c-7333-b06e-1c90ea4135f0",
    date: "2026-11-10",
    omp: "18.18.6",
    model: "futureppo-pool/grok-4.7",
    sent: {
      ask: { kind: "appended", messages: appended, quote },
      refused: { kind: "result", tool: "bash", at: "03:34:57Z", ...refused },
      trash: {
        kind: "result",
        tool: "delete",
        at: "03:35:01Z",
        text: "delete (trash): all 1 done\nok     build: moved to /Users/mouriya/.Trash/build 12-35-00-689",
        gloss: "delete（回收站）：1 项全部完成。build 已移到 /Users/mouriya/.Trash/build 12-35-00-689。",
      },
    },
  },
};
