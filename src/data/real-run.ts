/** What reached the model at one moment of a run, quoted from that run's session log. */
export type Sent =
  /** Messages omp-config sent with the prompt and kept off the screen. */
  | { readonly kind: "appended"; readonly messages: readonly { readonly source: string; readonly chars: number }[] }
  /**
   * A call refused before it ran. The screen shows the refusal, so this quotes the sentence of an appended message
   * that already told the model not to make the call.
   */
  | { readonly kind: "refused"; readonly quote: { readonly source: string; readonly text: string; readonly gloss: string } }
  /**
   * The `delete` call that moved its paths to the system trash. The screen shows only how many paths it sent, so this
   * lists them; the call set no `mode`, so the tool used its default, the trash.
   */
  | { readonly kind: "trashed"; readonly paths: readonly string[] };

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
  gloss: "会话里有 `delete` 工具时，删文件一律用它，不要在 bash 里删：`rm`、`unlink`、`rmdir`、`shred`、`find -delete` 这类删除命令，以及命令名或内嵌脚本不是字面写死的命令，运行前就会被拒绝。",
} as const;

/** Captures of moment `n` live in `public/real/<n>-desktop.png` and `-mobile.png`. */
export const moments: readonly MomentId[] = ["ask", "refused", "trash"];

/**
 * The one recorded session, in English. Both language pages show it: the Chinese page translates the text around the
 * captures, not the captures.
 */
export const realRun: RealRun = {
  date: "2026-11-10",
  omp: "18.18.6",
  sent: {
    ask: { kind: "appended", messages: appended },
    refused: { kind: "refused", quote },
    trash: { kind: "trashed", paths: ["/tmp/shop-api/build"] },
  },
  shots: {
    ask: { desktop: [1440, 615], mobile: [720, 580] },
    refused: { desktop: [1440, 435], mobile: [720, 560] },
    trash: { desktop: [1440, 385], mobile: [720, 455] },
  },
};
