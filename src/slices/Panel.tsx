import type { Lang } from "../i18n";
import Agents, { type AgentRow } from "./Agents";
import AskPanel, { type AskData } from "./AskPanel";
import ContextBar, { type ContextRow } from "./ContextBar";
import Terminals, { type TerminalsData } from "./Terminals";
import Thinking, { type ThinkingData } from "./Thinking";
import TodoPanel, { type TodoData } from "./TodoPanel";
import Transcript, { type TLine } from "./Transcript";

/** One piece of what the person sees on screen: the session transcript or a plugin's panel. */
export type Panel =
  | { readonly kind: "transcript"; readonly lines: readonly TLine[] }
  | { readonly kind: "ask"; readonly data: AskData }
  | { readonly kind: "todo"; readonly data: TodoData }
  | { readonly kind: "terminals"; readonly data: TerminalsData }
  | { readonly kind: "agents"; readonly rows: readonly AgentRow[] }
  | { readonly kind: "context"; readonly rows: readonly ContextRow[] }
  | { readonly kind: "thinking"; readonly data: ThinkingData };

export default function PanelView(props: { lang: Lang; panel: Panel; compact?: boolean }) {
  const p = props.panel;
  switch (p.kind) {
    case "transcript":
      return <Transcript lines={p.lines} />;
    case "ask":
      return <AskPanel lang={props.lang} data={p.data} compact={!!props.compact} />;
    case "todo":
      return <TodoPanel lang={props.lang} data={p.data} compact={!!props.compact} />;
    case "terminals":
      return <Terminals lang={props.lang} data={p.data} compact={!!props.compact} />;
    case "agents":
      return <Agents rows={p.rows} />;
    case "context":
      return <ContextBar rows={p.rows} />;
    case "thinking":
      return <Thinking lang={props.lang} data={p.data} compact={!!props.compact} />;
  }
}
