import { handleRoute } from '@/server/handle-route';
import { db, USERS } from '@/server/store';
import { needsReview, slaBreached, tabMatch, toRow } from '@/server/rules';
import { category, isOpen } from '@/server/rules';
import { ApiError } from '@/server/actions';

const URG = { High: 3, Medium: 2, Low: 1 } as const;

// GET /api/mails?tab=&q=&category=&urgency=&status=&assignee=&dateDays=&domain=&hasAttachment=&sentiment=&needsReview=&sort=&page=&pageSize=
export const GET = handleRoute('all', async (req, u) => {
  const sp = req.nextUrl.searchParams;
  const tab = sp.get('tab') || 'active';
  if (tab === 'deleted' && u.role !== 'owner') throw new ApiError(403, 'FORBIDDEN', 'Only the Platform Owner can see Deleted.');
  const d = db();
  const q = (sp.get('q') || '').toLowerCase();
  const list = (k: string) => (sp.get(k) || '').split(',').filter(Boolean);
  const cats = list('category'), urgs = list('urgency'), sts = list('status'), sents = list('sentiment');
  const assignee = sp.get('assignee'); // me | unassigned | team:<team name> | <userId>
  const teamMemberIds = assignee?.startsWith('team:') ? USERS.filter((x) => x.team === assignee.slice(5)).map((x) => x.id) : undefined;
  const days = Number(sp.get('dateDays') || 0);
  const dateFrom = sp.get('dateFrom') ? new Date(sp.get('dateFrom') as string).getTime() : 0;
  const dateTo = sp.get('dateTo') ? new Date(sp.get('dateTo') as string).getTime() + 86400_000 : 0; // include the whole "to" day
  const domain = (sp.get('domain') || '').toLowerCase();

  // counts for the tabs ignore other filters (FR-08: "counts shown on each tab")
  const counts: Record<string, number> = {};
  for (const t of ['active', 'mine', 'unassigned', 'acted', 'all', 'deleted']) counts[t] = d.mails.filter((m) => tabMatch(t, u, m)).length;

  const tabRows = d.mails.filter((m) => tabMatch(tab, u, m));

  // Option counts shown inside the filter menus: counted over the current tab, ignoring the other filters.
  const countBy = (key: (m: (typeof tabRows)[number]) => string | undefined) => {
    const result: Record<string, number> = {};
    for (const m of tabRows) {
      const k = key(m);
      if (k) result[k] = (result[k] || 0) + 1;
    }
    return result;
  };
  const facets = {
    category: countBy((m) => m.categoryId),
    urgency: countBy((m) => m.urgency),
    status: countBy((m) => m.status),
    sentiment: countBy((m) => m.sentiment),
    assignee: countBy((m) => m.ownerId ?? 'unassigned'),
    hasAttachment: tabRows.filter((m) => m.thread.some((x) => x.attachments.length)).length,
    needsReview: tabRows.filter((m) => needsReview(m)).length,
  };

  let rows = tabRows;
  rows = rows.filter((m) => {
    if (q && !(`${m.subject} ${m.sender} ${m.email} ${m.thread.map((x) => x.body).join(' ')}`.toLowerCase().includes(q))) return false;
    if (cats.length && !cats.includes(m.categoryId)) return false;
    if (urgs.length && !urgs.includes(m.urgency)) return false;
    if (sts.length && !sts.includes(m.status)) return false;
    if (sents.length && !sents.includes(m.sentiment)) return false;
    if (assignee === 'me' && m.ownerId !== u.id) return false;
    if (assignee === 'unassigned' && m.ownerId) return false;
    if (teamMemberIds && !teamMemberIds.includes(m.ownerId ?? '')) return false;
    if (assignee && !teamMemberIds && assignee !== 'me' && assignee !== 'unassigned' && m.ownerId !== assignee) return false;
    if (days && Date.now() + d.offsetMs - new Date(m.receivedAt).getTime() > days * 86400_000) return false;
    if (dateFrom && new Date(m.receivedAt).getTime() < dateFrom) return false;
    if (dateTo && new Date(m.receivedAt).getTime() >= dateTo) return false;
    if (domain && !m.domain.includes(domain)) return false;
    if (sp.get('hasAttachment') === '1' && !m.thread.some((x) => x.attachments.length)) return false;
    if (sp.get('needsReview') === '1' && !needsReview(m)) return false;
    if (sp.get('slaBreached') === '1' && !slaBreached(m)) return false;
    return true;
  });

  const sort = sp.get('sort') || 'newest';
  const cmp: Record<string, (a: any, b: any) => number> = {
    newest: (a, b) => +new Date(b.receivedAt) - +new Date(a.receivedAt),
    oldest: (a, b) => +new Date(a.receivedAt) - +new Date(b.receivedAt),
    urgency: (a, b) => URG[b.urgency as 'High'] - URG[a.urgency as 'High'],
    category: (a, b) => (category(a.categoryId)?.name || '').localeCompare(category(b.categoryId)?.name || ''),
    sender: (a, b) => a.sender.localeCompare(b.sender),
    status: (a, b) => a.status.localeCompare(b.status),
    assignee: (a, b) => (a.ownerId || 'zzz').localeCompare(b.ownerId || 'zzz'),
    sla: (a, b) => Number(isOpen(b) && !b.firstReplyAt) - Number(isOpen(a) && !a.firstReplyAt) || +new Date(a.receivedAt) - +new Date(b.receivedAt),
  };
  rows.sort(cmp[sort] || cmp.newest);

  const page = Math.max(1, Number(sp.get('page') || 1));
  const pageSize = Math.min(100, Number(sp.get('pageSize') || 20));
  const total = rows.length;
  return {
    items: rows.slice((page - 1) * pageSize, page * pageSize).map((m) => toRow(u, m)),
    total, page, pageSize, counts, facets,
    needsReviewCount: d.mails.filter((m) => isOpen(m) && needsReview(m)).length,
    syncDown: d.flags.syncDown,
    lastSync: d.flags.syncDown ? new Date(Date.now() + d.offsetMs - 17 * 60_000).toISOString() : new Date(Date.now() + d.offsetMs).toISOString(),
  };
});
