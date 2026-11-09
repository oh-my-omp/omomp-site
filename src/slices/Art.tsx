import { For } from "solid-js";
import type { Lang } from "../i18n";
import HookMessage, { type Hook } from "./HookMessage";
import PanelView, { type Panel } from "./Panel";
import Transcript, { type TLine } from "./Transcript";

/** The small interface slice above a component's name in a grid cell: what that component looks like at work. */
export type Art =
  /** A message a silent hook puts in front of the model. */
  | { readonly kind: "hook"; readonly hook: Hook }
  /** Transcript rows: tool calls the agent makes and what comes back. */
  | { readonly kind: "lines"; readonly lines: readonly TLine[] }
  /** A plugin panel the person sees. */
  | { readonly kind: "panel"; readonly panel: Panel }
  /** A file, command or tool call as written, under its name: config, a prompt file, a slash command or a tool's arguments, and the output. */
  | { readonly kind: "code"; readonly title: string; readonly lines: readonly string[] };

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
              </div>
            );
        }
      })()}
    </div>
  );
}
