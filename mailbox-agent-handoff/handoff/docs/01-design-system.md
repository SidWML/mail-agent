# 01 · Design system (taken from the approved screens)

Nothing here is new. Every value was read from the 64 approved screens in `design-reference/`.
`frontend-helpers/tailwind.preset.ts` holds the same values as Tailwind tokens.

## Brand and shape
- Schindler red `#E3000F` is the only accent. Used for: primary buttons, the active nav underline, the active page number, the checkbox accent, the AI sparkle icon, and category icons.
- **Square corners everywhere** (0 radius): buttons, icon buttons, avatars, the logo block, inputs, cards, tables.
- **Fully round (999px) only for pills** (status, urgency, sentiment). Category tags use a 4px radius.
- Font: **Inter** 400/500/600/700. Page text colour `#1A1A1A`. Secondary text `#5A5A5A` / `#6B6B6B`.
- Page background `#F3F3F4`. Cards and header are white. Table head `#ECEDF0` with a 2px `#C4C7CD` bottom border.

## Type scale (px)
11 (table headers, uppercase, .07em tracking, 700) · 11.5 (email under name) · 12 (pills, meta) · 12.5 (buttons, cells) · 13 (body) · 13.5 (subject in list) · 14 (nav, inputs) · 15 · 20 · 22 · 24 · 26 · 30 (dashboard numbers)

## Layout
- Page container: `max-width 1440px`, centred, `padding 24px`, vertical gap 16px.
- Header: white, 1px `#E4E4E4` bottom border, min-height 64px. Logo = 36px red square with a white envelope icon, then "Mailbox Agent" (16px/600) and "ai@schindler.com" (12px, muted). Nav items: 14px, icon 18px, padding 0 16px; active = weight 600, dark text, red icon, **3px red bottom border**. User chip at the right: dark 24–32px square avatar with initials, name, role.
- Nav per role: Agent = Inbox, Dashboard · Owner = Inbox, Dashboard, Categories & SLAs, Templates, Audit log · Viewer = Inbox, Dashboard.
- Inbox tabs (with counts): Active (default) · My items · Unassigned · Acted / Closed · All · Deleted (Owner only).

## Inbox table (every tab uses the same table)
- Grid columns: `32px | sender 1.1fr | subject+AI summary 2.4fr | category 1fr | urgency .6fr | status 1fr | owner .8fr | age .6fr | actions 1.1fr` (min 1090px, scrolls horizontally below that).
- Row: min-height 58px, 3px left border in the urgency bar colour, 1px `#DCDEE3` row and column borders, zebra `#F5F6F8` on alternate rows (selected row `#FFF5F5`).
- Cell 1: checkbox 15px, `accent-color #E3000F` (hidden for Viewer).
- Sender: name 13px/600 over email 11.5px muted. Subject: 13.5px/600, paperclip icon when it has attachments. Under it: red sparkle icon + AI summary 12.5px `#4A4A4A`, one line with ellipsis.
- Age cell: text (e.g. "2 h", "3 d") + a **4-segment age strip**, each segment 14×5px, filled with `ramp[0..bucket]`, empty `#E6E6E6`. Buckets: <1 day, 1–3 days, 3–7 days, >7 days. Acted rows show time-to-acted instead. Deleted rows show "x d ago" and "n days left".
- Owner cell: 24px dark avatar + name 12.5px/500. Unassigned shows a "Take it" outline button where allowed.
- Footer: pagination squares 34px; current page filled red.
- Bulk bar appears when rows are selected (Owner screen `Owner_Active`).

## Status, urgency and other pills
| Status | bg | text | dot |
|---|---|---|---|
| New | #E6EEFC | #174EA6 | #1D5FD6 |
| In progress | #FFF0D1 | #7A4A00 | #C97A00 |
| Waiting on sender | #EFE8FB | #5B34B5 | #7A4DD8 |
| Acted | #E3F4EA | #0A6B3D | #0E8A4F |
| Deleted | #ECECEC | #555555 | #8A8A8A |

Status pill = 7px dot + label, padding 3px 11px 3px 9px, 12px/600. Large version (drawer) 5px 13px, 12.5px.
Urgency: High `#FDE7E9/#A8000B`, Medium `#FFF0D1/#7A4A00`, Low `#ECECEC/#444`. Sentiment: Positive `#E6EEFC/#174EA6`, Neutral `#ECECEC/#444`, Negative `#FDEBD3/#8A4300`.
Category tag: icon 14px + name, bg `#F3F3F4`, icon red. **Needs review** uses bg `#FFF0D1`, icon `#7A4A00`.

## Buttons (all 30px high, 12.5px/600, square)
primary = red fill · outline = red border, white fill, red text · neutral = `#C9CBD0` border · green = `#0E8A4F` border (Mark as acted) · danger = `#C9CBD0` border with `#A8000B` text (Delete) · dangerfill / greenfill for confirm buttons in dialogs. Icon buttons are 30px squares with a 15px icon.

## Drawer (mail detail)
- Opens from the right, **84% width**, full height, over a scrim `rgba(26,26,28,.52)`; shadow `-14px 0 40px rgba(0,0,0,.28)`; left border `#C4C7CD`. The list stays visible behind it.
- Top bar 56px white: close (X) square, previous/next arrows, position text ("3 of 37"), hint on the right. Closing returns to the same list position. Esc closes.
- Body: left = mail (ownership bar, actions row, thread, composer); right column = AI summary, classification, extracted details.
- Ownership bar changes by state: Unassigned (Take it / Assign) · Yours · Locked by another (Request takeover; Owner: Assign to me / Reassign) · Acted (Reopen) · Deleted (Restore, days left).

## Dialogs
Centred, white, square, scrim as above. Title 20px/600, body 13–14px, buttons right-aligned (Cancel neutral, confirm primary / dangerfill / greenfill). Destructive dialogs name what happens and for how long (30-day restore).

## Charts (Dashboard)
Bar, line, donut, horizontal bar, gauge, stacked bar, small multiples. Series order: grey `#BFC5CC`, amber `#F2B24B`, red `#E3000F`, dark red `#8F0009` for magnitude; use status colours only for state. Always show the numbers or a table. Thin marks, light grid, no dual axes. See `Dashboard*.png`.

## Icons
Inline 24px-viewBox stroke icons, stroke 1.75–2.2, round caps. The icon paths are in `design-reference/screens-html` (search for `ICON =` style paths inside the markup) and match the Lucide look. Using `lucide-react` with the same names is fine: Inbox, BarChart3, Tag, FileText, List, Lock, Eye, Paperclip, X, Plus, Reply, Forward, Check, Trash2, Undo2, User, Sparkles, ShieldCheck.
