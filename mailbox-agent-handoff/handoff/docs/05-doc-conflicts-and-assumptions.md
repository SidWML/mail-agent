# 05 · Where the requirements doc is silent or contradicts itself

Decisions taken in the backend. Change them in `backend/lib/rules.ts` if the business decides otherwise.
| Topic | Doc says | Decision |
|---|---|---|
| Who can reopen | Persona table: own items. FR-22: any agent. | Any team member can reopen; mail returns to the previous assignee. |
| Taking over a mail | FR-15 mentions a takeover request, no approver | The current owner approves or declines; the Platform Owner can always reassign. |
| Owner replying | Owner can do everything, reply rule unclear | Owner must press "Assign to me" first, then reply (keeps one clear sender per mail). |
| Role label | "Support Agent" | Shown as **Support team member** (a team, not a single agent). |
| SLA hours | Per category, values not given | Sample values in the seed; Owner edits them on Categories & SLAs. |
| Reply all | FR-17 | Replies to the sender and keeps the original Cc; extra Cc can be added. |
Items not in the doc and therefore only suggestions: the scenario lab, the alerts outbox page, the dashboard one-line narrative.
