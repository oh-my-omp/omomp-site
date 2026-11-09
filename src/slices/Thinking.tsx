import { For } from "solid-js";
import type { Lang } from "../i18n";
import { labels } from "./labels";

export interface ThinkingData {
  /** The model's thinking block, drawn by the host above the translation. */
  readonly thinking: readonly string[];
  /** One translated paragraph per finished line; lines still translating take no space. */
  readonly translated: readonly string[];
  readonly block: number;
}

/** omp-thinking-translator's section under a thinking block (extensions/thinking-translator.ts `describe`). */
export default function Thinking(props: { lang: Lang; data: ThinkingData; compact?: boolean }) {
  const done = () => props.data.translated.length;
  const total = () => props.data.thinking.length;
  return (
    <div class="sl-think" classList={{ compact: !!props.compact }}>
      <div class="sl-think-src">
        <For each={props.data.thinking}>{(line) => <p>{line}</p>}</For>
      </div>
      <div class="sl-think-tr">
        <div class="sl-think-head">
          <span classList={{ spin: done() < total() }} />
          {labels[props.lang].thinking.heading(props.data.block, done(), total())}
        </div>
        <For each={props.data.translated}>{(line) => <p>{line}</p>}</For>
      </div>
    </div>
  );
}
