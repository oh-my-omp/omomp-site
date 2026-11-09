import { For, Show, type JSX } from "solid-js";

/**
 * Chrome around a rendered interface: a top bar with tabs and a right-hand meta line.
 * Slices are Solid components so Astro renders them as static HTML on pages and the replay island reuses them live.
 */
export default function Window(props: {
  tabs?: readonly string[];
  active?: number;
  meta?: string;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <div class={`sl-win ${props.class ?? ""}`}>
      <Show when={(props.tabs?.length ?? 0) > 0 || props.meta}>
        <div class="sl-win-bar">
          <div class="sl-win-tabs">
            <For each={props.tabs ?? []}>{(tab, i) => <span classList={{ on: i() === (props.active ?? 0) }}>{tab}</span>}</For>
          </div>
          <Show when={props.meta}>
            <span class="sl-win-meta">{props.meta}</span>
          </Show>
        </div>
      </Show>
      <div class="sl-win-body">{props.children}</div>
    </div>
  );
}
