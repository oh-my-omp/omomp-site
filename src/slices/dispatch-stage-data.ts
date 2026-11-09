import type { Lang } from "../i18n";
import type { Art } from "./Art";

/** One node of the issue tree the coordinator convenes into tickets. */
export interface DispatchIssue {
  /** Issue number, e.g. 48 → shown as `#48`; the ticket id is the same number. */
  readonly n: number;
  readonly title: string;
  /**
   * What the coordinator keeps for this issue's ticket:
   * a verbatim workflow state once a ticket is live, or `waiting` when it may not launch yet.
   */
  readonly ticket: { readonly kind: "state"; readonly name: string } | { readonly kind: "waiting" };
  /** Ticket ids this ticket waits for, the convene entry's `dependsOn`; empty for an independent ticket. */
  readonly dependsOn: readonly number[];
}

/** The four steps a reader knows from a pull-request flow, laid onto the workflow states that carry them. */
export type DispatchStep = "pr" | "ci" | "review" | "merge";

/** One state of the default ticket machine, in order (default-workflow.yml). */
export interface DispatchState {
  readonly name: string;
  /** Verbatim machine vocabulary: `work`, `action`, `decision`, `judge`, `final`. */
  readonly kind: "work" | "action" | "decision" | "judge" | "final";
  /** Verbatim seat role, gate judges or action verb attached to the state; none for decision/final. */
  readonly meta?: string;
  /** Times the ticket has entered this state; 2 marks a re-entry after drift routed it back. */
  readonly visits?: number;
  readonly mark: "done" | "current" | "pending";
  /** The pull-request step this state carries, when it is one of them. */
  readonly step?: DispatchStep;
}

/** A gate verdict: judge role plus its gate status, verbatim (`pending` / `passed` / `failed`). */
export interface DispatchVerdict {
  readonly role: string;
  readonly status: "pending" | "passed" | "failed";
}

export interface DispatchStageContent {
  /** Column headings, localized. */
  readonly issues: string;
  readonly ticket: string;
  readonly drift: string;
  /** Issue-tree column */
  readonly issuesCaption: string;
  readonly umbrellaTag: string;
  readonly waiting: string;
  readonly launcherOutcome: string;
  /** Ticket column */
  readonly ticketCaption: string;
  readonly ticketTitle: string;
  readonly steps: Readonly<Record<DispatchStep, string>>;
  /** Drift column */
  readonly driftCaption: string;
  /** Verbatim engine note recorded when the open PR changes head. */
  readonly driftNote: string;
  /**
   * Reading aids for the two English plugin lines (driftNote, the judge checkout line) on a page in
   * another language: label and translated text, both localized. Absent where the page is English.
   */
  readonly gloss?: { readonly label: string; readonly drift: string; readonly checkout: string };
  readonly oldFingerprintLabel: string;
  readonly newFingerprintLabel: string;
  readonly voided: string;
  readonly seatsLabel: string;
  readonly umbrella: DispatchIssue;
  readonly children: readonly DispatchIssue[];
  readonly states: readonly DispatchState[];
}

/** Language-invariant facts of the scene: SHAs, roles, verbatim seat names and the judge checkout line. */
export const dispatchScene = {
  repo: "omomp/shop-api",
  command: "omp --dispatch omomp/shop-api#47",
  launcherUrl: "127.0.0.1:47591/omomp/shop-api/issues/47",
  ticketSeat: "owner: 48",
  oldSha: "a1b2c3d",
  newSha: "e4f5a6b",
  target: "main",
  subject: "pullRequest",
  /** The gate seated on the old head: review had passed, accept was still judging. */
  oldVerdicts: [
    { role: "review", status: "passed" },
    { role: "accept", status: "pending" },
  ] as readonly DispatchVerdict[],
  /** Judge seats reopened on the new head: display names `<role>: <ticketId>` (host.ts:170). */
  seats: ["review: 48", "accept: 48"] as const,
  /** Judge brief checkout description, verbatim (briefs.ts). */
  checkout: "a detached checkout of exactly the pull request head under judgment",
  newVerdicts: [
    { role: "review", status: "pending" },
    { role: "accept", status: "pending" },
  ] as readonly DispatchVerdict[],
} as const;

const states = (): readonly DispatchState[] => [
  { name: "Coding", kind: "work", meta: "owner", mark: "done" },
  { name: "Publishing", kind: "action", meta: "publishPr", mark: "done", step: "pr" },
  { name: "AwaitingChecks", kind: "decision", visits: 2, mark: "done", step: "ci" },
  { name: "Reviewing", kind: "judge", meta: "review · accept", visits: 2, mark: "current", step: "review" },
  { name: "Merging", kind: "action", meta: "merge", mark: "pending", step: "merge" },
  { name: "Verifying", kind: "judge", meta: "postMerge", mark: "pending" },
  { name: "Closing", kind: "action", meta: "closeIssue", mark: "pending" },
  { name: "Done", kind: "final", mark: "pending" },
];

/** Issue titles and captions in the shop-api rate-limit scenario, written natively per language. */
export const dispatchStage: Record<Lang, DispatchStageContent> = {
  en: {
    issues: "Issue tree",
    ticket: "Ticket #48",
    drift: "New push",
    issuesCaption: "The parent issue and its sub-issues become tickets; the route tickets wait for #48.",
    umbrellaTag: "parent",
    waiting: "waiting",
    launcherOutcome: "launched",
    ticketCaption: "Each ticket walks the workflow file; the lit state is where #48 is now.",
    ticketTitle: "Add the Redis-backed rate-limit middleware",
    steps: { pr: "PR", ci: "CI", review: "Review", merge: "Merge" },
    driftCaption: "The owner pushed again while both judges were seated.",
    driftNote: "Open PR changed to head e4f5a6b; gates restart on the new fingerprint.",
    oldFingerprintLabel: "previous head",
    newFingerprintLabel: "current head",
    voided: "gate deleted · the passed review no longer counts",
    seatsLabel: "new blank judge sessions",
    umbrella: { n: 47, title: "Rate-limit the shop-api endpoints behind one middleware", ticket: { kind: "waiting" }, dependsOn: [] },
    children: [
      { n: 48, title: "Add the Redis-backed rate-limit middleware", ticket: { kind: "state", name: "Reviewing" }, dependsOn: [] },
      { n: 49, title: "Apply the middleware in src/routes/orders.ts", ticket: { kind: "waiting" }, dependsOn: [48] },
      { n: 50, title: "Apply the middleware in src/routes/search.ts", ticket: { kind: "waiting" }, dependsOn: [48] },
      { n: 51, title: "Apply the middleware in src/routes/webhooks.ts", ticket: { kind: "waiting" }, dependsOn: [48] },
    ],
    states: states(),
  },
  zh: {
    issues: "工单树",
    ticket: "工单 #48",
    drift: "新的推送",
    issuesCaption: "父 issue 和它的子 issue 各成一张工单，接入路由的工单要等 #48 交付。",
    umbrellaTag: "父 issue",
    waiting: "等待中",
    launcherOutcome: "已启动",
    ticketCaption: "每张工单按工作流文件推进，亮着的是 #48 当前所在的状态。",
    ticketTitle: "新增基于 Redis 的限流中间件",
    steps: { pr: "开 PR", ci: "CI", review: "评审", merge: "合并" },
    driftCaption: "两位判定者都已入座，负责人又推了一次。",
    driftNote: "Open PR changed to head e4f5a6b; gates restart on the new fingerprint.",
    gloss: {
      label: "译文",
      drift: "已开的 PR 换成了 head e4f5a6b；各道关卡按新指纹重新开始。",
      checkout: "工作目录是被裁决的 PR head 的分离检出，提交一个不差。",
    },
    oldFingerprintLabel: "之前的 head",
    newFingerprintLabel: "当前的 head",
    voided: "判定记录已删除，通过的评审不再作数",
    seatsLabel: "重新开出的空白判定会话",
    umbrella: { n: 47, title: "为 shop-api 的对外接口统一加上限流中间件", ticket: { kind: "waiting" }, dependsOn: [] },
    children: [
      { n: 48, title: "新增基于 Redis 的限流中间件", ticket: { kind: "state", name: "Reviewing" }, dependsOn: [] },
      { n: 49, title: "在 src/routes/orders.ts 接入中间件", ticket: { kind: "waiting" }, dependsOn: [48] },
      { n: 50, title: "在 src/routes/search.ts 接入中间件", ticket: { kind: "waiting" }, dependsOn: [48] },
      { n: 51, title: "在 src/routes/webhooks.ts 接入中间件", ticket: { kind: "waiting" }, dependsOn: [48] },
    ],
    states: states(),
  },
};

/** Capsule links beside the How it works heading: the files that define each mechanism. */
export const dispatchLinks: readonly { readonly label: string; readonly href: string }[] = [
  { label: "default-workflow.yml", href: "https://github.com/oh-my-omp/omp-dispatch/blob/HEAD/src/default-workflow.yml" },
  { label: "dispatch-owner", href: "https://github.com/oh-my-omp/omp-dispatch/blob/HEAD/agents/dispatch-owner.md" },
  { label: "dispatch-reviewer", href: "https://github.com/oh-my-omp/omp-dispatch/blob/HEAD/agents/dispatch-reviewer.md" },
];

/**
 * The slice above each cell of the page's How it works grid, in cell order:
 * the default workflow from opening the PR to merging it, the brief a review seat
 * receives (src/domain/briefs.ts, with its English text glossed on other pages), and the
 * durable effect record a GitHub write leaves behind (effectSchema in src/domain/model.ts,
 * the merge action in src/domain/public-grammar.ts). Workflow lines, brief sentences, record
 * keys and the gh command are verbatim from the plugin; "…" marks an elision and `#` lines
 * are site comments in the page language.
 */
const briefBody = [
  "You are the review seat for dispatch ticket 48. You own only this ticket, in its Reviewing state.",
  "Independently verify the complete current contract against this checkout, not just prior findings.",
  "Your working directory is a detached checkout of exactly the pull request head under judgment. Judge it against the complete current contract and the exact gate stamp. … Do not modify code.",
].join("\n\n");

const sectionArt = (lang: Lang): readonly [Art, Art, Art] => [
  {
    kind: "code",
    title: "default-workflow.yml",
    lines: [
      "Publishing:",
      "  kind: action",
      "  action: publishPr",
      "  on: {done: AwaitingChecks}",
      "AwaitingChecks:",
      "  kind: decision",
      "  branches:",
      "    - when: {all: [{checks: passing}, {mergeable: 'yes'}]}",
      "      to: Reviewing",
      "Reviewing:",
      "  kind: judge",
      "  subject: pullRequest",
      "  …",
      "  on: {passed: Merging, rejected: Coding, escalated: escalate}",
      "Merging:",
      "  kind: action",
      "  action: merge",
    ],
  },
  {
    kind: "hook",
    hook: {
      kind: "judge",
      source: "omp-dispatch",
      at: dispatchScene.seats[0],
      label: lang === "en" ? "seat brief" : "席位简报",
      body: briefBody,
      gloss:
        lang === "en"
          ? undefined
          : {
              label: "译文",
              text: "你是 dispatch 工单 48 的 review 席位，只负责这张工单的 Reviewing 状态。对照这份检出独立核验完整的现行契约，不只看此前的结论。工作目录是被裁决的 PR head 的分离检出；按完整的现行契约和确切的关卡戳裁决。…不要改代码。",
            },
    },
  },
  {
    kind: "code",
    title: "effect · merge",
    lines: [
      "ticketId: 48",
      "action:",
      "  kind: merge",
      "  pr: omomp/shop-api#52",
      `  head: ${dispatchScene.newSha}`,
      `  target: ${dispatchScene.target}`,
      "origin: {state: Merging, …}",
      "state: {kind: executing}",
      lang === "en" ? "# saved before the write" : "# 写入之前先落盘",
      "$ gh pr merge 52 --repo omomp/shop-api \\",
      `    --merge --match-head-commit ${dispatchScene.newSha}`,
      lang === "en" ? "# then a fresh GitHub read" : "# 随后重新读取 GitHub",
      "state:",
      "  kind: confirmed",
      "  result: {kind: merged, …}",
    ],
  },
];

export const dispatchSectionArt: Record<Lang, readonly [Art, Art, Art]> = { en: sectionArt("en"), zh: sectionArt("zh") };
