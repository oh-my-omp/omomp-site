import { For } from "solid-js";
import type { Lang } from "../i18n";
import HookMessage, { type Hook } from "./HookMessage";
import PanelView, { type Panel } from "./Panel";
import Transcript, { type TLine } from "./Transcript";

export type Art =
  | { readonly kind: "hook"; readonly hook: Hook }
  | { readonly kind: "lines"; readonly lines: readonly TLine[] }
  | { readonly kind: "panel"; readonly panel: Panel }
  | {
      readonly kind: "code";
      readonly title: string;
      readonly lines: readonly string[];
      readonly gloss?: { readonly label: string; readonly text: string };
    };

export default function ArtView(props: { lang: Lang; art: Art }) {
  const a = props.art;
  return (
    <div class={`sl-art k-${a.kind}`}>
      {(() => {
        switch (a.kind) {
          case "hook":
            return <HookMessage hook={a.hook} />;
          case "lines":
            return <Transcript lines={a.lines} />;
          case "panel":
            return <PanelView lang={props.lang} panel={a.panel} compact />;
          case "code":
            return (
              <div class="sl-art-code">
                <div class="sl-art-file">{a.title}</div>
                <pre>
                  <For each={a.lines}>{(line) => <span>{line + "\n"}</span>}</For>
                </pre>
                {a.gloss && (
                  <p class="sl-hook-gloss">
                    <span>{a.gloss.label}</span>
                    {a.gloss.text}
                  </p>
                )}
              </div>
            );
        }
      })()}
    </div>
  );
}
