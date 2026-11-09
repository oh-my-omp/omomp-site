import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { dispatchStage } from "./dispatch-stage-data";
import "../styles/stage-dispatch.css";

/**
 * The omp-dispatch coordinator as one composition: where the person enters it on GitHub,
 * the issue tree it keeps, one ticket's state rail, and what a new push does to an approval.
 * Workflow state names, kinds, roles, action verbs, the drift note and the badge label are
 * verbatim from the plugin (`local://ui-omp-dispatch.md`); only captions and titles localize.
 */
export default function DispatchStage(props: { lang: Lang }) {
  const d = () => dispatchStage[props.lang];
  return (
    <div class="st-dispatch">
      <div class="st-dispatch-head">
        <span class="st-dispatch-title">omomp/shop-api</span>
        <span class="st-dispatch-meta">omp --dispatch omomp/shop-api#47</span>
      </div>

      <div class="st-dispatch-grid">
        {/* Where the person enters: the issue body carries the launcher badge. */}
        <section class="st-dispatch-card st-dispatch-entry">
          <h3>{d().entry}</h3>
          <p class="st-dispatch-cap">{d().entryCaption}</p>
          <div class="st-dispatch-issue">
            <div class="st-dispatch-issue-head">
              <span class="st-dispatch-num">#{d().umbrella.n}</span>
              <span class="st-dispatch-issue-title">{d().umbrella.title}</span>
            </div>
            <span class="st-dispatch-badge">
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <circle cx="6" cy="6" r="1.4" fill="#fff" />
                <circle cx="6" cy="1.6" r="1.1" fill="#fff" />
                <circle cx="10.4" cy="6" r="1.1" fill="#fff" />
                <circle cx="6" cy="10.4" r="1.1" fill="#fff" />
                <circle cx="1.6" cy="6" r="1.1" fill="#fff" />
                <path
                  d="M6 2.7v1.9M9.3 6H7.4M6 9.3V7.4M2.7 6h1.9"
                  stroke="#fff"
                  stroke-width="0.7"
                />
              </svg>
              Coordinate with Dispatch
            </span>
          </div>
          <div class="st-dispatch-launch">
            <span class="st-dispatch-outcome">{d().launcherOutcome}</span>
            <code>{d().launcherUrl}</code>
          </div>
        </section>

        {/* The issue tree the coordinator reads: one umbrella ticket plus its children. */}
        <section class="st-dispatch-card st-dispatch-issues">
          <h3>{d().issues}</h3>
          <div class="st-dispatch-row is-umbrella">
            <span class="st-dispatch-num">#{d().umbrella.n}</span>
            <span class="st-dispatch-issue-title">{d().umbrella.title}</span>
            <span class="st-dispatch-tag">{d().umbrellaTag}</span>
          </div>
          <ol class="st-dispatch-children">
            <For each={d().children}>
              {(child) => (
                <li class="st-dispatch-row">
                  <span class="st-dispatch-num">#{child.n}</span>
                  <span class="st-dispatch-issue-title">{child.title}</span>
                  <span
                    class="st-dispatch-ticket"
                    classList={{ waiting: child.ticket.kind === "waiting" }}
                  >
                    {child.ticket.kind === "state" ? child.ticket.name : d().waiting}
                  </span>
                </li>
              )}
            </For>
          </ol>
          <span class="st-dispatch-tag">{d().childrenTag}</span>
        </section>

        {/* One ticket's state rail, verbatim state names and kinds, current state lit. */}
        <section class="st-dispatch-card st-dispatch-ticket">
          <h3>{d().ticket}</h3>
          <p class="st-dispatch-ticket-head">
            <span class="st-dispatch-issue-title">{d().ticketTitle}</span>
            <code>{d().ticketSeat}</code>
          </p>
          <ol class="st-dispatch-rail">
            <For each={d().states}>
              {(s) => (
                <li class={`st-dispatch-state m-${s.mark}`}>
                  <span class="st-dispatch-dot" />
                  <span class="st-dispatch-state-name">{s.name}</span>
                  <span class="st-dispatch-kind">{s.kind}</span>
                  <Show when={s.visits}>
                    <span class="st-dispatch-visits">×{s.visits}</span>
                  </Show>
                  <Show when={s.meta}>
                    <code class="st-dispatch-state-meta">{s.meta}</code>
                  </Show>
                </li>
              )}
            </For>
          </ol>
        </section>

        {/* Drift: the push retired the old fingerprint; the gate reseats on the new head. */}
        <section class="st-dispatch-card st-dispatch-drift">
          <h3>{d().drift}</h3>
          <p class="st-dispatch-cap">{d().driftCaption}</p>
          <p class="st-dispatch-note">{d().driftNote}</p>
          <div class="st-dispatch-fp is-old">
            <span class="st-dispatch-fp-label">{d().oldFingerprintLabel}</span>
            <span class="st-dispatch-fp-line">
              <code>{d().oldSha}</code>
              <span class="st-dispatch-kind">pullRequest</span>
            </span>
            <span class="st-dispatch-fp-foot">
              {d().oldVerdictsLabel}: {d().oldVerdictsText}
            </span>
          </div>
          <div class="st-dispatch-fp">
            <span class="st-dispatch-fp-label">{d().newFingerprintLabel}</span>
            <span class="st-dispatch-fp-line">
              <code>{d().newSha}</code>
              <span class="st-dispatch-kind">pullRequest</span>
              <span class="st-dispatch-fp-target">→ {d().target}</span>
            </span>
            <ul class="st-dispatch-verdicts">
              <For each={d().verdicts}>
                {(v) => (
                  <li>
                    <span class="st-dispatch-verdict-role">{v.role}</span>
                    <span class={`st-dispatch-verdict v-${v.status}`}>{v.status}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
