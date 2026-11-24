# 04 · Scenarios, automation and how to test them

The **Scenario lab** (`POST /api/sim`) plays each situation. Build a dev-only `/lab` page with these buttons.
| Button | `POST /api/sim` body | What it proves |
|---|---|---|
| New mail (random) | `{type:'new_mail'}` | New row at the top, AI category, summary, entities |
| High-urgency mail | `{type:'new_mail', high:true}` | Alert posted to the team channel (Alert_High) |
| Low-confidence mail | `{type:'new_mail', lowConfidence:true}` | "Needs review" tag, counts update |
| Spam mail | `{type:'new_mail', spam:true}` | Sorted to Spam |
| Mail from blocked sender | `{type:'new_mail', fromBlocked:true}` | Auto-sorted to Spam (FR-25) |
| Sender replies | `{type:'sender_reply', id?}` | Waiting → In progress; Acted → reopened to previous owner |
| Another person claims | `{type:'claim_by_other'}` | Open the same mail first, press this, then press Claim → Dlg_Conflict |
| Someone is replying | `{type:'presence'}` | "Markus W. is replying" notice in the drawer |
| Advance time | `{type:'advance', hours:6|30|744}` | SLA breaches + Owner alert + digest; 744 h ends the restore window |
| Daily digest | `{type:'digest'}` | Alert_Digest in the outbox |
| Sync down / Send fails / Delay | `{type:'flags', flags:{syncDown|sendFails|latency}}` | Err_SyncDown banner / Dlg_SendFailed / loading states |
| Reset | `{type:'reset'}` | Seed data back |

## Seed data (about 81 mails)
14 New, 14 In progress, 9 Waiting on sender, 40 Acted, 4 Deleted. Includes an open takeover request, a duplicate suggestion, Needs-review mails, attachments, and mails in every category, urgency and sentiment.

## Acceptance checklist (run as each persona)
1. Owner: Active shows bulk bar on selection; Deleted tab visible; Categories, Templates, Audit visible.
2. Support team member: no Deleted tab, no Audit, cannot Assign; can Claim; Reply only on own mail; locked mail shows "Request takeover".
3. Viewer: everything read-only, no checkboxes, no action buttons.
4. No access user: Access denied screen only.
5. Claim race: conflict dialog and the mail now shows the other owner.
6. Reply with "Waiting on sender", then sender reply → In progress. Reply with Acted → Acted tab. Reopen → returns to previous owner.
7. Send failure keeps the typed text and offers Try again.
8. Takeover: request with reason → owner sees review → approve changes owner, decline keeps owner.
9. Category change needs a reason; the audit log shows before → after.
10. Delete (Owner) → Deleted tab with days left; Restore works; after +31 days Restore shows the expired dialog.
11. Bulk of up to 100; skipped mails are listed with the reason.
12. Dashboard numbers change after actions; filters (range, category, assignee) apply to every tile.
13. Audit CSV downloads; attachment download adds a line.

Run the backend checks quickly with curl, for example:
```
curl -H 'x-user-id: u-ravi' 'localhost:3000/api/mails?tab=unassigned&pageSize=1'
curl -X POST -H 'x-user-id: u-ravi' -H 'content-type: application/json' -d '{"type":"claim"}' localhost:3000/api/mails/<id>/actions
```
