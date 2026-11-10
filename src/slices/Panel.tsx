import type { Lang } from "../i18n";
import Agents, { type AgentRow } from "./Agents";
import AskPanel, { type AskData } from "./AskPanel";
import ContextBar, { type ContextRow } from "./ContextBar";
import ModeMount, { type ModeMountData } from "./ModeMount";
import SqlQuery, { type SqlQueryData } from "./SqlQuery";
import Terminals, { type TerminalsData } from "./Terminals";
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
  | { readonly kind: "modes"; readonly data: ModeMountData }
  | { readonly kind: "sql"; readonly data: SqlQueryData };

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
    case "modes":
      return <ModeMount data={p.data} />;
    case "sql":
      return <SqlQuery data={p.data} />;
  }
}
