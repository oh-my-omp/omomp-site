import { For, Show } from "solid-js";

export type TLine =
  | { readonly kind: "user"; readonly text: string; readonly by?: string }
  | { readonly kind: "say"; readonly text: string }
  | {
      readonly kind: "call";
      readonly tool: string;
      readonly args: string;
      readonly status: "ok" | "blocked" | "error" | "running";
      readonly result?: string;
      readonly gloss?: { readonly label: string; readonly text: string };
    }
  | { readonly kind: "card"; readonly tone: "warn" | "info"; readonly head: string; readonly text?: string };

const statusMark = { ok: "✓", blocked: "⊘", error: "✕", running: "●" } as const;

export default function Transcript(props: { lines: readonly TLine[]; class?: string }) {
  return (
    <div class={`sl-tx ${props.class ?? ""}`}>
      <For each={props.lines}>
        {(line) => {
          switch (line.kind) {
            case "user":
              return (
                <div class="sl-tx-user">
                  <Show when={line.by}>
                    <span class="sl-tx-by">{line.by}</span>
                  </Show>
                  <p>{line.text}</p>
                </div>
              );
            case "say":
              return <p class="sl-tx-say">{line.text}</p>;
            case "call":
              return (
                <div class={`sl-tx-call s-${line.status}`}>
                  <div class="sl-tx-sig">
                    <span class="m">{statusMark[line.status]}</span>
                    <b>{line.tool}</b>
                    <span class="a">{line.args}</span>
                  </div>
                  <Show when={line.result}>
                    <pre class="sl-pre">{line.result}</pre>
                  </Show>
                  <Show when={line.gloss}>
                    {(g) => (
                      <p class="sl-hook-gloss">
                        <span>{g().label}</span>
                        {g().text}
                      </p>
                    )}
                  </Show>
                </div>
              );
            case "card":
              return (
                <div class={`sl-tx-card t-${line.tone}`}>
                  <b>{line.head}</b>
                  <Show when={line.text}>
                    <p>{line.text}</p>
                  </Show>
                </div>
              );
          }
        }}
      </For>
    </div>
  );
}
