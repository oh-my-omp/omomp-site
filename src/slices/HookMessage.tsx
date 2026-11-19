export type HookKind = "reminder" | "block" | "judge";

export interface Hook {
  readonly kind: HookKind;
  readonly source: string;
  readonly at: string;
  readonly label: string;
  readonly body: string;
  readonly gloss?: { readonly label: string; readonly text: string } | undefined;
}

export default function HookMessage(props: { hook: Hook; class?: string }) {
  return (
    <div class={`sl-hook k-${props.hook.kind} ${props.class ?? ""}`}>
      <div class="sl-hook-head">
        <span class="sl-hook-label">{props.hook.label}</span>
        <code class="sl-hook-src">{props.hook.source}</code>
        <span class="sl-hook-at">{props.hook.at}</span>
      </div>
      <p class="sl-hook-body">{props.hook.body}</p>
      {props.hook.gloss && (
        <p class="sl-hook-gloss">
          <span>{props.hook.gloss.label}</span>
          {props.hook.gloss.text}
        </p>
      )}
    </div>
  );
}
