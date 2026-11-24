# 03 · Roles, statuses, permissions and the API

The backend in `backend/` already implements all of this and was tested. Use it as the dummy server now, and as the contract for the real one later.

## Personas (header dropdown in the prototype, Entra groups in production)
| Persona | Role | Entra group | In the dummy data |
|---|---|---|---|
| Platform Owner | `owner` | SG-AI-Mailbox-Owner | Rajeev K. (`u-rajeev`) |
| Support team member | `agent` | SG-AI-Mailbox-Access | Ravi S., Anika R., Markus W., Sofia M. |
| Viewer | `viewer` | SG-AI-Mailbox-Viewer | Nina B. (`u-nina`) |
| Not in any group | `none` | n/a | `u-nobody` → Access denied screen |

The user is sent as the `x-user-id` header. The server decides everything from the role.

## Status flow
```
New ──claim / assign──▶ In progress ──reply (waiting)──▶ Waiting on sender
In progress / Waiting ──Mark as acted (outcome)──▶ Acted
Waiting ──sender replies──▶ In progress
Acted ──Reopen or sender replies──▶ In progress (back to the previous assignee)
any ──Owner deletes──▶ Deleted ──Restore within 30 days──▶ previous status
```
Outcomes for Acted: Answered, Forwarded, No action needed, Duplicate, Spam. Block sender = Spam + Acted + future mails from that sender go to Spam.

## Who can do what (`perms` in every response)
| Action | Owner | Support team member | Viewer |
|---|---|---|---|
| See mail | all except Deleted visible only to Owner | all except Deleted | all except Deleted |
| Claim (New, unassigned) | yes | yes | no |
| Assign / Reassign | yes (open mails) | no | no |
| Assign to me (on someone else's mail) | yes | no (must request takeover) | no |
| Request takeover (mail owned by another) | no (can reassign) | yes, with a reason | no |
| Approve / decline takeover | yes | only the current owner | no |
| Reply, Reply all, Forward, Block sender | only after it is **theirs** | only on their own mail | no |
| Internal note | yes | yes | no |
| Mark as acted | own mail, or unassigned | own mail, or unassigned | no |
| Change category (reason required) | yes | yes | no |
| Reopen (Acted) | yes | yes (any team member, see 05) | no |
| Delete / Restore | yes | no | no |
| Bulk (max 100) | acted, assign, category, delete | acted, category | no |
| Categories, Templates (add/edit/retire/merge) | yes | read only | read only |
| Audit log + CSV | yes | no | no |
| Alerts outbox | team + owner alerts | team alerts | none |

## Concurrency rule
Two people cannot claim the same mail. The first claim wins; the second gets `409 ALREADY_CLAIMED` with `ownerName`. Other actions send `version`; a mismatch returns `409 STALE`.

## SLA and review rules
- **SLA** = hours allowed for a first reply, set per category. A New/In-progress mail with no reply past that is "past SLA" (⏱ in the list, red in the drawer, Owner email alert).
- **Needs review** = AI confidence below 0.6 or category "Needs review". Shows the Needs review tag; people fix the category (reason required) which feeds AI quality on the dashboard.
- **Restore window** = 30 days after delete; then `410 RESTORE_EXPIRED`.

## Endpoints
| Method + path | Who | Purpose |
|---|---|---|
| `GET /api/me` | anyone | Persona list (dummy only) |
| `GET /api/mails?tab&q&category&urgency&status&sentiment&assignee&dateDays&domain&hasAttachment&needsReview&sort&page&pageSize` | any with access | List + `counts` for every tab + `needsReviewCount` + `syncDown` + `lastSync`. Items carry `perms`. |
| `GET /api/mails/:id` | any with access | Full mail, thread, AI fields, `perms`, `someoneReplying`, `suggestedTemplateIds`. Writes a View audit line. |
| `POST /api/mails/:id/actions` | staff | One endpoint for every button. Body `{type, version, ...}` |
| `POST /api/mails/bulk` | staff | `{ids[<=100], action: acted|assign|recategorize|delete, ...}` → `{done[], failed[{id,reason}]}` |
| `GET /api/dashboard?days&category&assignee` | any | All tiles and charts (DB-01..12) + a one-line narrative |
| `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`, `POST /api/categories/merge` | read: all · write: Owner | Categories and SLAs, retire (optionally move mails to Needs review), merge |
| `GET/POST /api/templates`, `PUT/DELETE /api/templates/:id` | read: staff · write: Owner | Reply templates |
| `GET /api/audit?user&action&q&format=csv` | Owner | Audit trail and CSV export |
| `GET /api/alerts` | staff | Outbox of alerts the system would send |
| `POST /api/ai/draft` | staff | `{mailId}` → draft reply (never auto-sent) |
| `POST /api/presence` | staff | `{mailId, replying}` |
| `GET /api/attachments/:mailId/:attId?download=1` | any with access | Preview / download (download is audited) |
| `POST /api/sim` | dev only | Scenario lab (see 04) |

### Action bodies (`type`)
`claim` · `assign {userId}` · `assign_to_me` · `takeover_request {reason}` · `takeover_decide {requestId, approve}` · `reply {body, replyAll, cc[], attachments[{name,size,kind}], next: "Waiting on sender"|"Acted"|"In progress"}` · `set_status {status: "In progress"|"Waiting on sender"}` (added: the "Reply sent" step, owner of an open mail only) · `forward {to, note}` · `note {text}` · `acted {outcome, note}` · `reopen` · `recategorize {categoryId, reason}` · `block` · `delete` · `restore`

### Error shape
`{ "error": { "code": "ALREADY_CLAIMED", "message": "Ravi S. took this mail first.", "ownerName": "Ravi S." } }`
Codes: `UNAUTHENTICATED 401` · `NO_MAILBOX_ACCESS 403` · `FORBIDDEN 403` · `NOT_FOUND 404` · `ALREADY_CLAIMED 409` · `STALE 409` · `SEND_FAILED 502` · `RESTORE_EXPIRED 410` · validation `400` (`REASON_REQUIRED`, `OUTCOME_REQUIRED`, `EMPTY`, `BAD_TO`, `NAME_REQUIRED`, `SLA_REQUIRED`).

## Going to the real system later
Keep the routes and shapes. Replace only `backend/lib/store.ts` (in-memory) with: Microsoft Graph (read mail, send as ai@schindler.com, scan result), a database, the AI classifier, and Entra group lookup in `lib/server.ts`. `rules.ts` and `actions.ts` stay as they are.
