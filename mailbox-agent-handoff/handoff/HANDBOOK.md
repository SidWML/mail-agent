# Mailbox Agent · Handbook for building it into your Next.js project

You asked for the **same approved screens and branding**, built into your Next.js + Tailwind project with dummy server APIs. This folder is the hand-over for that. Give it to Claude Code (or any developer) and build phase by phase.

## What is in this folder
| Folder / file | What it is |
|---|---|
| `design-reference/screens-png/` | 64 pictures of every approved screen. Claude can look at these. |
| `design-reference/screens-html/` | The same screens as markup with exact inline styles (sizes, colours, spacing). |
| `docs/01-design-system.md` | Colours, type, shapes, table, drawer, dialogs, charts, taken from the screens |
| `docs/02-screens.md` | Every screen → the component or route that renders it, and the shared behaviours |
| `docs/03-rules-and-api.md` | Personas, status flow, permission matrix, all endpoints, error codes |
| `docs/04-scenarios-and-tests.md` | Scenario lab, seed data and the acceptance checklist |
| `docs/05-doc-conflicts-and-assumptions.md` | Where the requirements doc was silent and what we chose |
| `backend/` | Working dummy server: `lib/` (types, rules, actions, store) and `app-api/` (all route handlers). Tested. |
| `frontend-helpers/` | `tailwind.preset.ts` (design tokens) and `client.ts` (fetch helper that sends `x-user-id`) |
| `reference-behaviour/` | Unstyled wiring example. Not the design. |

## Set up (10 minutes)
1. Copy `backend/lib/` to your project's `lib/mailbox/` (or `lib/`) and `backend/app-api/*` to `app/api/` (App Router). Keep the `@/*` path alias; if you move `lib`, fix the imports with a find-and-replace.
2. Copy `frontend-helpers/tailwind.preset.ts` next to `tailwind.config.ts` and add `presets: [require('./tailwind.preset').default]`. Add the Inter font with `next/font/google`.
3. Copy `frontend-helpers/client.ts` to `lib/client.ts`.
4. Copy the whole `docs/` and `design-reference/` folders into the repo under `/docs/mailbox/` so Claude Code can read them.
5. Run `npm run dev` and check `curl -H 'x-user-id: u-ravi' localhost:3000/api/mails?pageSize=1`.
6. Next 15 only: `params` is a Promise. In `lib/server.ts` change `ctx.params` to `await ctx.params`.

## Build order and the prompt for each phase
Paste each prompt into Claude Code in your project. Do one phase, review it against the pictures, then the next.

**Phase 1 · Shell and design tokens**
> Read docs/mailbox/docs/01-design-system.md and look at docs/mailbox/design-reference/screens-png/Main.png. Build the app shell: header with logo, role-based nav (Inbox, Dashboard, Categories & SLAs, Templates, Audit log) and the user chip with a persona switcher that sets the `x-user-id` header through lib/client.ts. Use Tailwind with the preset tokens. Square corners, Inter, exactly as the picture. No other pages yet.

**Phase 2 · Inbox list (all tabs, all personas)**
> Build the inbox page from docs/02-screens.md (Main, Agent_*, Owner_*, Viewer_* PNGs). Tabs with counts, the filter bar (Inbox_Filters.png), sorting, the table with the 4-segment age strip, bulk bar for roles that have it, pagination, empty states (Empty_Inbox, Empty_Search), sync banner (Err_SyncDown). Data from GET /api/mails. Show buttons only when `perms` allows.

**Phase 3 · Mail drawer**
> Build the right-side drawer at 84% width opened by `?mail=<id>` for all states: Agent_D_New, Mail, Agent_D_Waiting, Agent_D_Locked, Agent_D_Acted, Owner_D_*, Viewer_D_Mail. Include ownership bar, thread, attachments with preview (Attachment_Preview), AI summary and classification column, presence notice, previous/next, Esc to close. Data from GET /api/mails/:id.

**Phase 4 · Composer and every action dialog**
> Build the composer (reply, reply all, note, AI draft, insert template, attach files, next status) and every dialog in the "Dialogs and results" and "States and errors" pages. Wire each to POST /api/mails/:id/actions. Map errors as described in docs/02-screens.md (conflict, stale, send failed, restore expired). Bulk actions use POST /api/mails/bulk.

**Phase 5 · Dashboard**
> Build the three dashboards (Dashboard, Dashboard_Owner, Dashboard_Viewer) and Dash_Filters from GET /api/dashboard. Bar, line, donut, horizontal bars, gauge and small multiples as in the pictures. Use SVG or a chart library with the colours in the design system.

**Phase 6 · Owner screens**
> Build Categories & SLAs (list, Form_Category, Form_CategoryNew, Form_Merge, Dlg_Retire), Templates (Form_Template, Dlg_TplDelete) and Audit log (filters, CSV export). Owner only. Support team members and viewers see Categories and Templates read-only.

**Phase 7 · Alerts, access and the scenario lab**
> Build the Access denied screen, an Alerts page that lists GET /api/alerts in the style of Alert_High, Alert_Breach and Alert_Digest, and a dev-only /lab page with the buttons in docs/04-scenarios-and-tests.md.

**Phase 8 · Verify**
> Run the acceptance checklist in docs/04-scenarios-and-tests.md as each persona with Playwright and fix every difference from the PNGs.

## Rules to give Claude Code every time
- The screens in `design-reference/` are the source of truth. If something is not in them, do not invent it; ask.
- The server decides what is allowed (`perms`). The UI never recomputes permissions.
- Do not change the backend rules without updating docs/03 and docs/05.
- Keep the dummy API contract unchanged so the real backend can replace `backend/lib/store.ts` later.
