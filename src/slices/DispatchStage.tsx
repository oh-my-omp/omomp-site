import { For, Show } from "solid-js";
import type { Lang } from "../i18n";
import { dispatchScene as s, dispatchStage, type DispatchVerdict } from "./dispatch-stage-data";
import "../styles/stage-dispatch.css";

/** The launcher badge an issue carries; label verbatim from the plugin's GitHub badge. */
function Badge() {
  return (
    <span class="st-dispatch-badge">
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="1.4" fill="#fff" />
        <circle cx="6" cy="1.6" r="1.1" fill="#fff" />
        <circle cx="10.4" cy="6" r="1.1" fill="#fff" />
        <circle cx="6" cy="10.4" r="1.1" fill="#fff" />
        <circle cx="1.6" cy="6" r="1.1" fill="#fff" />
        <path d="M6 2.7v1.9M9.3 6H7.4M6 9.3V7.4M2.7 6h1.9" stroke="#fff" stroke-width="0.7" />
      </svg>
      Coordinate with Dispatch
    </span>
  );
}

function Verdicts(props: { verdicts: readonly DispatchVerdict[] }) {
  return (
    <ul class="st-dispatch-verdicts">
      <For each={props.verdicts}>
        {(v) => (
          <li>
            <span class="st-dispatch-verdict-role">{v.role}</span>
            <span class={`st-dispatch-verdict v-${v.status}`}>{v.status}</span>
          </li>
        )}
      </For>
    </ul>
  );
}

/**
 * The omp-dispatch coordinator read left to right: the issue tree it convenes into tickets,
 * one ticket on the default workflow's state track, and what a new push does to that ticket's
 * judges. State names, kinds, roles, action verbs, seat names, the drift note, the judge checkout
 * line and the badge label are verbatim from the plugin (`local://ui-omp-dispatch.md`); headings
 * and captions localize.
 */
export default function DispatchStage(props: { lang: Lang }) {
  const d = () => dispatchStage[props.lang];
  return (
    <div class="st-dispatch">
      <div class="st-dispatch-head">
        <span class="st-dispatch-title">{s.repo}</span>
        <span class="st-dispatch-meta">{s.command}</span>
      </div>

      <div class="st-dispatch-cols">
        <section class="st-dispatch-col">
          <h3>{d().issues}</h3>
          <p class="st-dispatch-cap">{d().issuesCaption}</p>
          <div class="st-dispatch-issue">
            <div class="st-dispatch-row is-umbrella">
              <span class="st-dispatch-num">#{d().umbrella.n}</span>
              <span class="st-dispatch-issue-title">{d().umbrella.title}</span>
              <span class="st-dispatch-tag">{d().umbrellaTag}</span>
            </div>
            <Badge />
            <div class="st-dispatch-launch">
              <span class="st-dispatch-outcome">{d().launcherOutcome}</span>
              <code>{s.launcherUrl}</code>
            </div>
          </div>
          <ol class="st-dispatch-children">
            <For each={d().children}>
              {(child) => (
                <li class="st-dispatch-child" classList={{ "is-lit": child.ticket.kind === "state" }}>
                  <div class="st-dispatch-row">
                    <span class="st-dispatch-num">#{child.n}</span>
                    <span class="st-dispatch-issue-title">{child.title}</span>
                  </div>
                  <div class="st-dispatch-sub">
                    <span class="st-dispatch-ticket" classList={{ waiting: child.ticket.kind === "waiting" }}>
                      {child.ticket.kind === "state" ? child.ticket.name : d().waiting}
                    </span>
                    <Show when={child.dependsOn.length > 0}>
                      <code class="st-dispatch-dep">dependsOn: [{child.dependsOn.map((n) => `"${n}"`).join(", ")}]</code>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ol>
        </section>

        <span class="st-dispatch-arrow" aria-hidden="true">→</span>

        <section class="st-dispatch-col">
          <h3>{d().ticket}</h3>
          <p class="st-dispatch-cap">{d().ticketCaption}</p>
          <p class="st-dispatch-ticket-head">
            <span class="st-dispatch-issue-title">{d().ticketTitle}</span>
            <code>{s.ticketSeat}</code>
          </p>
          <ol class="st-dispatch-rail">
            <For each={d().states}>
              {(st) => (
                <li class={`st-dispatch-state m-${st.mark}`}>
                  <span class="st-dispatch-dot" />
                  <span class="st-dispatch-state-main">
                    <span class="st-dispatch-state-line">
                      <span class="st-dispatch-state-name">{st.name}</span>
                      <span class="st-dispatch-kind">{st.kind}</span>
                      <Show when={st.visits}>
                        <span class="st-dispatch-visits">×{st.visits}</span>
                      </Show>
                    </span>
                    <Show when={st.meta}>
                      <code class="st-dispatch-state-meta">{st.meta}</code>
                    </Show>
                  </span>
                  <Show when={st.step}>{(step) => <span class="st-dispatch-step">{d().steps[step()]}</span>}</Show>
                </li>
              )}
            </For>
          </ol>
        </section>

        <span class="st-dispatch-arrow" aria-hidden="true">→</span>

        <section class="st-dispatch-col st-dispatch-drift">
          <h3>{d().drift}</h3>
          <p class="st-dispatch-cap">{d().driftCaption}</p>
          <p class="st-dispatch-note">{d().driftNote}</p>
          <div class="st-dispatch-fp is-old">
            <span class="st-dispatch-fp-label">{d().oldFingerprintLabel}</span>
            <span class="st-dispatch-fp-line">
              <code>{s.oldSha}</code>
              <span class="st-dispatch-kind">{s.subject}</span>
            </span>
            <Verdicts verdicts={s.oldVerdicts} />
            <span class="st-dispatch-fp-foot">{d().voided}</span>
          </div>
          <div class="st-dispatch-fp is-new">
            <span class="st-dispatch-fp-label">{d().newFingerprintLabel}</span>
            <span class="st-dispatch-fp-line">
              <code>{s.newSha}</code>
              <span class="st-dispatch-kind">{s.subject}</span>
              <span class="st-dispatch-fp-target">→ {s.target}</span>
            </span>
            <span class="st-dispatch-seats-label">{d().seatsLabel}</span>
            <ul class="st-dispatch-seats">
              <For each={s.seats}>{(seat) => <li><code>{seat}</code></li>}</For>
            </ul>
            <p class="st-dispatch-checkout">{s.checkout}</p>
            <Verdicts verdicts={s.newVerdicts} />
          </div>
        </section>
      </div>
    </div>
  );
}
