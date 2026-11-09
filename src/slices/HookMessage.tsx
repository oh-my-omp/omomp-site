/** How a silent hook reached the model: a reminder appended to context, a refused call, or a judge's verdict. */
export type HookKind = "reminder" | "block" | "judge";

export interface Hook {
  readonly kind: HookKind;
  /** Extension or plugin that produced the message, e.g. `isolation-nudge`. */
  readonly source: string;
  /** Where in the turn it fired, already localized: "tool call", "回合结束". */
  readonly at: string;
  /** Short label for the kind, already localized: "refused", "已拦下". */
  readonly label: string;
  /** Message text exactly as the model receives it, in the one language its source template is written in. */
  readonly body: string;
  /** A reading aid when the template's language is not the page's: label and translated text, both localized. */
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
