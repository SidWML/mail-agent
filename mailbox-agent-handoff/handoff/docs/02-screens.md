# 02 · Screen map

Every approved screen, with the component or route that should render it. The picture is in `design-reference/screens-png/<Name>.png`; the exact markup and inline styles are in `design-reference/screens-html/<Name>.dc.html`.

**Suggested routes:** `/` (inbox, tab in `?tab=`; the mail drawer is `?mail=<id>`, not a separate page) · `/dashboard` · `/categories` · `/templates` · `/audit` · `/lab` (scenario lab, dev only).

## Support Agent

| Screen file | Title | Build as |
|---|---|---|
| `Main` | Inbox · Active | InboxPage (tab=active) |
| `Agent_Mine` | My items | InboxPage (tab=mine) |
| `Agent_Unassigned` | Unassigned | InboxPage (tab=unassigned) |
| `Agent_Acted` | Acted / Closed | InboxPage (tab=acted) |
| `Agent_All` | All | InboxPage (tab=all) |
| `Agent_D_New` | Drawer · Mail, New (not owned) | MailDrawer · state New, not owned |
| `Mail` | Drawer · Mail, mine | MailDrawer · state In progress, mine |
| `Agent_D_Waiting` | Drawer · Mail, waiting on sender | MailDrawer · Waiting on sender |
| `Agent_D_Locked` | Drawer · Mail, locked (owned by other) | MailDrawer · locked by another |
| `Agent_D_Acted` | Drawer · Mail, acted | MailDrawer · Acted |

## Platform Owner

| Screen file | Title | Build as |
|---|---|---|
| `Owner_Active` | Inbox · Active (bulk bar) | InboxPage + BulkBar |
| `Owner_Mine` | My items | InboxPage |
| `Owner_Unassigned` | Unassigned | InboxPage |
| `Owner_Acted` | Acted / Closed | InboxPage |
| `Owner_All` | All | InboxPage |
| `Owner_Deleted` | Deleted (Owner only) | InboxPage (tab=deleted, Owner only) |
| `Owner_D_New` | Drawer · Mail, not owned (Owner) | MailDrawer · Owner, not owned |
| `Owner_D_Mail` | Drawer · Mail, Owner actions | MailDrawer · Owner actions |
| `Owner_D_Acted` | Drawer · Mail, acted (Owner) | MailDrawer · Owner, acted |
| `Owner_D_Deleted` | Drawer · Mail, deleted (Owner) | MailDrawer · deleted + Restore |
| `Owner_Categories` | Categories & SLAs | /categories |
| `Owner_Templates` | Templates | /templates |
| `Owner_Audit` | Audit log | /audit |

## Viewer

| Screen file | Title | Build as |
|---|---|---|
| `Viewer_Active` | Inbox · Active | InboxPage read-only |
| `Viewer_Unassigned` | Unassigned | InboxPage read-only |
| `Viewer_Acted` | Acted / Closed | InboxPage read-only |
| `Viewer_All` | All | InboxPage read-only |
| `Viewer_D_Mail` | Drawer · Mail, read only | MailDrawer read-only (all actions hidden) |

## Dialogs and results

| Screen file | Title | Build as |
|---|---|---|
| `Dlg_Acted` | Mark as acted | ActedDialog |
| `Dlg_Forward` | Forward | ForwardDialog |
| `Dlg_Category` | Change category | CategoryDialog |
| `Dlg_Sent` | After sending | SentConfirmation (toast/inline) |
| `Dlg_Assign` | Assign | AssignDialog |
| `Dlg_Takeover` | Request takeover | TakeoverRequestDialog |
| `Dlg_Delete` | Delete | DeleteDialog |
| `Dlg_Reopen` | Reopen | ReopenDialog |
| `Dlg_Block` | Mark as spam / block sender | BlockSenderDialog |
| `Dlg_Attach` | Attach files to reply | AttachFilesDialog |
| `Attachment_Preview` | Attachment preview | AttachmentPreview |
| `Dlg_InsertTpl` | Insert template (composer) | InsertTemplateMenu |
| `Form_Template` | Template form (Owner) | TemplateForm |
| `Dlg_TplDelete` | Delete template | TemplateDeleteDialog |
| `Form_Category` | Category form: edit (Owner) | CategoryForm (edit) |
| `Form_CategoryNew` | Category form: add (Owner) | CategoryForm (add) |
| `Form_Merge` | Merge categories | MergeCategoriesForm |
| `Dlg_Retire` | Retire category | RetireCategoryDialog |
| `Inbox_Filters` | Inbox filter menus | FilterBar menus |
| `Dash_Filters` | Dashboard filter menus | Dashboard filter menus |

## States and errors

| Screen file | Title | Build as |
|---|---|---|
| `Dlg_Conflict` | Someone took it first | ClaimConflictDialog (409 ALREADY_CLAIMED) |
| `Dlg_TakeoverReview` | Takeover request (as owner) | TakeoverReviewDialog (owner) |
| `Dlg_SendFailed` | Reply not sent | SendFailedDialog (502 SEND_FAILED) |
| `Dlg_RestoreExpired` | Cannot restore | RestoreExpiredDialog (410) |
| `Empty_Inbox` | Empty inbox | EmptyState |
| `Empty_Search` | No results | EmptyState (no results) |
| `Err_SyncDown` | Sync delayed banner | SyncBanner (flags.syncDown) |

## Alerts and access

| Screen file | Title | Build as |
|---|---|---|
| `Alert_High` | High urgency alert | Team-channel message (alerts outbox) |
| `Alert_Breach` | SLA breach alert | Owner email (alerts outbox) |
| `Alert_Digest` | Daily digest to Owner | Owner email digest |
| `Access_Denied` | No access | AccessDenied (403 NO_MAILBOX_ACCESS) |

## Dashboard and action map

| Screen file | Title | Build as |
|---|---|---|
| `Dashboard` | Dashboard · Agent | /dashboard (Agent) |
| `Dashboard_Owner` | Dashboard · Owner | /dashboard (Owner) |
| `Dashboard_Viewer` | Dashboard · Viewer | /dashboard (Viewer) |
| `ActionMap` | Action map | Reference only: every button and what it does |

## Behaviour that every inbox and drawer screen shares

- Tabs, counts, filters and sort come from `GET /api/mails` (counts are returned for all tabs in the same response).
- Row buttons and drawer buttons are **shown or enabled only if `perms.<action>` is true** in the response. Do not recompute permissions in the UI.
- Clicking a row opens the drawer (`?mail=id`), the list stays behind it, close returns to the same scroll position. Previous/next moves within the current list.
- Every action goes to `POST /api/mails/:id/actions` with `{type, version, ...}`. After success, refresh the drawer and the list counts and show a short toast.
- Errors map to screens: `409 ALREADY_CLAIMED` → Dlg_Conflict · `409 STALE` → refresh drawer, toast "someone changed this" · `502 SEND_FAILED` → Dlg_SendFailed (keep the typed text) · `410 RESTORE_EXPIRED` → Dlg_RestoreExpired · `403 NO_MAILBOX_ACCESS` → Access_Denied · `syncDown` → Err_SyncDown banner.
- Presence: while someone types a reply, call `POST /api/presence`; the drawer shows "X is replying" when `someoneReplying` is set. Poll the detail every ~8 s.
- Attachments: click opens Attachment_Preview; Download calls `/api/attachments/:mailId/:attId?download=1` (this writes a download line in the audit log).
