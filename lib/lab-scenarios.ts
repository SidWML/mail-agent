/** One button of the Scenario lab (see docs/04-scenarios-and-tests.md). */
export interface LabScenario {
  key: string;
  label: string;
  /** What it proves, shown under the button. */
  proves: string;
  /** Body sent to POST /api/sim. */
  body: Record<string, unknown>;
  /** Shown in the notice when the server sends no message of its own. */
  fallbackMessage?: string;
}

export interface LabGroup {
  title: string;
  scenarios: LabScenario[];
}

export type FlagName = "syncDown" | "sendFails" | "latency";

/** On/off switches. The form sends the new value; the body is built in the action. */
export const LAB_FLAGS: Array<{ flag: FlagName; label: string; proves: string }> = [
  { flag: "syncDown", label: "Sync down", proves: "Sync warning banner in the inbox, plus a sync alert to the Owner." },
  { flag: "sendFails", label: "Send fails", proves: "Replying shows the send-failed dialog and keeps the typed text." },
  { flag: "latency", label: "Delay", proves: "Fake server delay, so the loading states can be seen." },
];

export const LAB_GROUPS: LabGroup[] = [
  {
    title: "New mail",
    scenarios: [
      { key: "new-random", label: "New mail (random)", proves: "New row at the top, AI category, summary, entities.", body: { type: "new_mail" } },
      { key: "new-high", label: "High-urgency mail", proves: "Alert posted to the team channel.", body: { type: "new_mail", high: true } },
      { key: "new-low-confidence", label: "Low-confidence mail", proves: "Needs review tag, counts update.", body: { type: "new_mail", lowConfidence: true } },
      { key: "new-spam", label: "Spam mail", proves: "Sorted to Spam.", body: { type: "new_mail", spam: true } },
      { key: "new-blocked", label: "Mail from blocked sender", proves: "Auto-sorted to Spam.", body: { type: "new_mail", fromBlocked: true } },
    ],
  },
  {
    title: "People and conversations",
    scenarios: [
      { key: "sender-reply", label: "Sender replies", proves: "Waiting on sender becomes In progress; Acted is reopened to the previous owner.", body: { type: "sender_reply" } },
      { key: "claim-by-other", label: "Another person claims", proves: "Open the same mail first, press this, then press Claim to see the conflict dialog.", body: { type: "claim_by_other" } },
      { key: "presence", label: "Someone is replying", proves: "\"Markus W. is replying\" notice in the mail drawer.", body: { type: "presence" } },
    ],
  },
  {
    title: "Time and reports",
    scenarios: [
      { key: "advance-6", label: "Advance time 6 h", proves: "SLA breaches and an Owner alert.", body: { type: "advance", hours: 6 } },
      { key: "advance-30", label: "Advance time 30 h", proves: "More SLA breaches, Owner alert and a digest.", body: { type: "advance", hours: 30 } },
      { key: "advance-744", label: "Advance time 744 h", proves: "The 31 day restore window ends (Restore shows the expired dialog).", body: { type: "advance", hours: 744 } },
      { key: "digest", label: "Daily digest", proves: "Digest email appears in the alerts outbox.", body: { type: "digest" } },
    ],
  },
];

export const RESET_SCENARIO: LabScenario = {
  key: "reset",
  label: "Reset",
  proves: "Seed data is back: mails, alerts, the clock and the switches (Delay is on by default).",
  body: { type: "reset" },
};
