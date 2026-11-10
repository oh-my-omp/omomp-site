import type { Lang } from "../i18n";

/** What reached the model at one moment of a run, quoted from that run's session log. */
export type Sent =
  /** Messages appended after the prompt and kept off the screen, with one sentence quoted from one of them. */
  | {
      readonly kind: "appended";
      readonly messages: readonly { readonly source: string; readonly chars: number }[];
      readonly quote: { readonly source: string; readonly text: string; readonly gloss: string };
    }
  /** A tool call that a guard refused before it ran; the screen shows the refusal too. */
  | { readonly kind: "refused"; readonly tool: string; readonly at: string; readonly guard: string }
  /** A delete call that moved its path to the system trash; the screen shows the result too. */
  | { readonly kind: "trashed"; readonly tool: string; readonly at: string; readonly to: string };

export type MomentId = "ask" | "refused" | "trash";

/** Pixel size of one capture at 2× scale, so the page can reserve its box before the image loads. */
export interface ShotSize {
  readonly desktop: readonly [number, number];
  readonly mobile: readonly [number, number];
}

/** One real session: when it ran, what the model was sent at each captured moment, and the size of each capture. */
export interface RealRun {
  readonly date: string;
  readonly omp: string;
  readonly sent: Readonly<Record<MomentId, Sent>>;
  readonly shots: Readonly<Record<MomentId, ShotSize>>;
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
  gloss: "会话里有 `delete` 工具时，删文件一律用它，不要在 bash 里删：`rm`、`unlink`、`rmdir`、`shred`、`find -delete` 这类删除命令，以及命令名或内嵌脚本不是明文写出的命令，运行前就会被拒绝。",
} as const;

/** Captures of moment `n` live in `public/real/<lang>-<n>-desktop.png` and `-mobile.png`. */
export const moments: readonly MomentId[] = ["ask", "refused", "trash"];

/** Times are the local time Tern shows on screen (GMT+9). */
export const realRuns: Readonly<Record<Lang, RealRun>> = {
  en: {
    date: "2026-11-10",
    omp: "18.18.6",
    sent: {
      ask: { kind: "appended", messages: appended, quote },
      refused: { kind: "refused", tool: "bash", at: "14:06:15", guard: "delete-guard" },
      trash: { kind: "trashed", tool: "delete", at: "14:06:17", to: "~/.Trash/build 14-06-17-079" },
    },
    shots: {
      ask: { desktop: [1440, 615], mobile: [720, 580] },
      refused: { desktop: [1440, 435], mobile: [720, 560] },
      trash: { desktop: [1440, 385], mobile: [720, 455] },
    },
  },
  zh: {
    date: "2026-11-10",
    omp: "18.18.6",
    sent: {
      ask: { kind: "appended", messages: appended, quote },
      refused: { kind: "refused", tool: "bash", at: "14:08:56", guard: "delete-guard" },
      trash: { kind: "trashed", tool: "delete", at: "14:08:58", to: "~/.Trash/build 14-08-58-307" },
    },
    shots: {
      ask: { desktop: [1440, 450], mobile: [720, 535] },
      refused: { desktop: [1440, 407], mobile: [720, 545] },
      trash: { desktop: [1440, 357], mobile: [720, 473] },
    },
  },
};
