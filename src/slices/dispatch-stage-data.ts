import type { Lang } from "../i18n";

/** One node of the issue tree the coordinator reads from GitHub. */
export interface DispatchIssue {
  /** Issue number, e.g. 48 → shown as `#48`. */
  readonly n: number;
  readonly title: string;
  /**
   * What the coordinator keeps for this issue's ticket:
   * a verbatim workflow state once a ticket is live, or `waiting` when no ticket exists yet.
   */
  readonly ticket: { readonly kind: "state"; readonly name: string } | { readonly kind: "waiting" };
}

/** One state of the default ticket machine, in order (default-workflow.yml). */
export interface DispatchState {
  readonly name: string;
  /** Verbatim machine vocabulary: `work`, `action`, `decision`, `judge`, `final`. */
  readonly kind: "work" | "action" | "decision" | "judge" | "final";
  /** Verbatim seat role, gate judge, or action verb attached to the state; none for decision/final. */
  readonly meta?: string;
  /** Times the ticket has entered this state; 2 marks a re-entry after drift routed it back. */
  readonly visits?: number;
  readonly mark: "done" | "current" | "pending";
}

/** A verdict line of the review gate: judge role plus its gate status, verbatim. */
export interface DispatchVerdict {
  readonly role: string;
  readonly status: "pending" | "passed" | "failed";
}

export interface DispatchStageContent {
  /** Headings of the composition, localized. */
  readonly entry: string;
  readonly issues: string;
  readonly ticket: string;
  readonly drift: string;
  /** Issue-tree card */
  readonly umbrellaTag: string;
  readonly childrenTag: string;
  readonly waiting: string;
  /** Entry card */
  readonly entryCaption: string;
  readonly launcherOutcome: string;
  readonly launcherUrl: string;
  /** Ticket card */
  readonly ticketTitle: string;
  readonly ticketSeat: string;
  /** Drift card */
  readonly driftCaption: string;
  readonly driftNote: string;
  readonly oldFingerprintLabel: string;
  readonly newFingerprintLabel: string;
  readonly oldVerdictsLabel: string;
  readonly oldVerdictsText: string;
  readonly oldSha: string;
  readonly newSha: string;
  readonly target: string;
  readonly verdicts: readonly DispatchVerdict[];
  /** The tickets as a flat list shared by both languages (titles localized inside). */
  readonly umbrella: DispatchIssue;
  readonly children: readonly DispatchIssue[];
  readonly states: readonly DispatchState[];
}

/** Issue titles and captions in the shop-api rate-limit scenario, written natively per language. */
export const dispatchStage: Record<Lang, DispatchStageContent> = {
  en: {
    entry: "Entry",
    issues: "Issue tree",
    ticket: "Ticket #48",
    drift: "Drift",
    umbrellaTag: "umbrella",
    childrenTag: "children",
    waiting: "waiting",
    entryCaption: "The person starts the coordinator from the issue.",
    launcherOutcome: "launched",
    launcherUrl: "127.0.0.1:47591/omomp/shop-api/issues/47",
    ticketTitle: "Add the Redis-backed rate-limit middleware",
    ticketSeat: "owner: 48",
    driftCaption: "A new push while the judges are seated.",
    driftNote: "Open PR changed to head e4f5a6b; gates restart on the new fingerprint.",
    oldFingerprintLabel: "previous fingerprint",
    newFingerprintLabel: "current fingerprint",
    oldVerdictsLabel: "approval",
    oldVerdictsText: "no longer counts",
    oldSha: "a1b2c3d",
    newSha: "e4f5a6b",
    target: "main",
    verdicts: [
      { role: "review", status: "pending" },
      { role: "accept", status: "pending" },
    ],
    umbrella: {
      n: 47,
      title: "Rate-limit the shop-api endpoints behind one middleware",
      ticket: { kind: "waiting" },
    },
    children: [
      {
        n: 48,
        title: "Add the Redis-backed rate-limit middleware",
        ticket: { kind: "state", name: "Reviewing" },
      },
      { n: 49, title: "Apply the middleware in src/routes/orders.ts", ticket: { kind: "waiting" } },
      { n: 50, title: "Apply the middleware in src/routes/search.ts", ticket: { kind: "waiting" } },
      { n: 51, title: "Apply the middleware in src/routes/webhooks.ts", ticket: { kind: "waiting" } },
    ],
    states: [
      { name: "Coding", kind: "work", meta: "owner", mark: "done" },
      { name: "Publishing", kind: "action", meta: "publishPr", mark: "done" },
      { name: "AwaitingChecks", kind: "decision", visits: 2, mark: "done" },
      { name: "Reviewing", kind: "judge", meta: "review · accept", visits: 2, mark: "current" },
      { name: "Merging", kind: "action", meta: "merge", mark: "pending" },
      { name: "Verifying", kind: "judge", meta: "postMerge", mark: "pending" },
      { name: "Closing", kind: "action", meta: "closeIssue", mark: "pending" },
      { name: "Done", kind: "final", mark: "pending" },
    ],
  },
  zh: {
    entry: "入口",
    issues: "工单树",
    ticket: "工单 #48",
    drift: "偏移",
    umbrellaTag: "总 issue",
    childrenTag: "子 issue",
    waiting: "尚未开工",
    entryCaption: "人在 issue 页上启动协调者。",
    launcherOutcome: "已启动",
    launcherUrl: "127.0.0.1:47591/omomp/shop-api/issues/47",
    ticketTitle: "新增基于 Redis 的限速中间件",
    ticketSeat: "owner: 48",
    driftCaption: "判定席位在席时，有人推了新提交。",
    driftNote: "Open PR changed to head e4f5a6b; gates restart on the new fingerprint.",
    oldFingerprintLabel: "旧指纹",
    newFingerprintLabel: "当前指纹",
    oldVerdictsLabel: "批准",
    oldVerdictsText: "不再计入",
    oldSha: "a1b2c3d",
    newSha: "e4f5a6b",
    target: "main",
    verdicts: [
      { role: "review", status: "pending" },
      { role: "accept", status: "pending" },
    ],
    umbrella: {
      n: 47,
      title: "为 shop-api 的对外接口统一加上限速中间件",
      ticket: { kind: "waiting" },
    },
    children: [
      {
        n: 48,
        title: "新增基于 Redis 的限速中间件",
        ticket: { kind: "state", name: "Reviewing" },
      },
      { n: 49, title: "在 src/routes/orders.ts 接入中间件", ticket: { kind: "waiting" } },
      { n: 50, title: "在 src/routes/search.ts 接入中间件", ticket: { kind: "waiting" } },
      { n: 51, title: "在 src/routes/webhooks.ts 接入中间件", ticket: { kind: "waiting" } },
    ],
    states: [
      { name: "Coding", kind: "work", meta: "owner", mark: "done" },
      { name: "Publishing", kind: "action", meta: "publishPr", mark: "done" },
      { name: "AwaitingChecks", kind: "decision", visits: 2, mark: "done" },
      { name: "Reviewing", kind: "judge", meta: "review · accept", visits: 2, mark: "current" },
      { name: "Merging", kind: "action", meta: "merge", mark: "pending" },
      { name: "Verifying", kind: "judge", meta: "postMerge", mark: "pending" },
      { name: "Closing", kind: "action", meta: "closeIssue", mark: "pending" },
      { name: "Done", kind: "final", mark: "pending" },
    ],
  },
};
