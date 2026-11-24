import { handleRoute } from '@/server/handle-route';
import { dashboardExportResponse, type ExportFormat } from '@/server/dashboard-export';
import { db, now, USERS } from '@/server/store';
import { category, isOpen, needsReview, slaBreached } from '@/server/rules';
import type { Mail } from '@/types/mailbox';

const H = 3600_000, D = 24 * H;
const median = (a: number[]) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);
const p90 = (a: number[]) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * 0.9))] : 0);
const top = (m: Mail[], f: (x: Mail) => string, n = 5) => {
  const c: Record<string, number> = {};
  m.forEach((x) => (c[f(x)] = (c[f(x)] || 0) + 1));
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, value]) => ({ name, value }));
};

// GET /api/dashboard?days=30&category=<id>&assignee=<userId>   (DB-01 .. DB-12)
export const GET = handleRoute('all', async (req) => {
  const sp = req.nextUrl.searchParams;
  const days = Number(sp.get('days') || 30);
  const t = now();
  // assignee is one person (u-ravi) or a whole team (team:Support EMEA)
  const assigneeParam = sp.get('assignee') ?? '';
  const assigneeIds = assigneeParam.startsWith('team:') ? USERS.filter((x) => x.team === assigneeParam.slice(5)).map((x) => x.id) : [assigneeParam];
  const base = db().mails.filter((m) => m.status !== 'Deleted' && (!sp.get('category') || m.categoryId === sp.get('category')) && (!sp.get('assignee') || assigneeIds.includes(m.ownerId ?? '')));
  const inRange = (m: Mail, from: number, to: number) => { const x = new Date(m.receivedAt).getTime(); return x >= from && x < to; };
  const cur = base.filter((m) => inRange(m, t - days * D, t + 1));
  const prev = base.filter((m) => inRange(m, t - 2 * days * D, t - days * D));
  const open = base.filter(isOpen);

  // One bar per calendar day (UTC), so a click on a day shows the same mails in the inbox date filter.
  const todayStart = new Date(t).setUTCHours(0, 0, 0, 0);
  const volume = Array.from({ length: 14 }, (_, i) => {
    const k = 13 - i, from = todayStart - k * D, to = from + D;
    return {
      day: new Date(from).toISOString().slice(5, 10),
      received: base.filter((m) => inRange(m, from, to)).length,
      acted: base.filter((m) => m.actedAt && new Date(m.actedAt).getTime() >= from && new Date(m.actedAt).getTime() < to).length,
    };
  });

  const cats = db().categories;
  const byCategory = cats.map((c) => ({ name: c.name, value: cur.filter((m) => m.categoryId === c.id).length })).filter((x) => x.value).sort((a, b) => b.value - a.value);
  const trendCats = byCategory.slice(0, 4).map((c) => c.name);
  const categoryTrend = trendCats.map((name) => ({
    name,
    weeks: Array.from({ length: 8 }, (_, i) => {
      const k = 7 - i;
      return base.filter((m) => category(m.categoryId)?.name === name && inRange(m, t - (k + 1) * 7 * D, t - k * 7 * D)).length;
    }),
  }));

  const ageH = (m: Mail) => (t - new Date(m.receivedAt).getTime()) / H;
  const backlog = [
    { name: '< 1 day', value: open.filter((m) => ageH(m) < 24).length },
    { name: '1–3 days', value: open.filter((m) => ageH(m) >= 24 && ageH(m) < 72).length },
    { name: '3–7 days', value: open.filter((m) => ageH(m) >= 72 && ageH(m) < 168).length },
    { name: '> 7 days', value: open.filter((m) => ageH(m) >= 168).length },
  ];

  const resp = (m: Mail) => (m.firstReplyAt ? (new Date(m.firstReplyAt).getTime() - new Date(m.receivedAt).getTime()) / H : null);
  const all = cur.map(resp).filter((x): x is number => x !== null);
  const tta = cur.filter((m) => m.actedAt).map((m) => (new Date(m.actedAt!).getTime() - new Date(m.receivedAt).getTime()) / H);
  const respByCat = byCategory.slice(0, 6).map((c) => {
    const v = cur.filter((m) => category(m.categoryId)?.name === c.name).map(resp).filter((x): x is number => x !== null);
    return { name: c.name, median: +median(v).toFixed(1), p90: +p90(v).toFixed(1) };
  });

  const breaches = base.filter(slaBreached);
  const judged = cur.filter((m) => m.firstReplyAt || slaBreached(m));
  const inTime = judged.filter((m) => !slaBreached(m) && (!m.firstReplyAt || resp(m)! <= (category(m.categoryId)?.slaHours ?? 24))).length;

  const agents = USERS.filter((u) => u.role === 'agent' || u.role === 'owner');
  const workload = agents.map((u) => ({
    name: u.name,
    claimed: cur.filter((m) => m.ownerId === u.id).length,
    replied: cur.filter((m) => m.thread.some((x) => x.kind === 'out' && x.authorId === u.id)).length,
    acted: cur.filter((m) => m.ownerId === u.id && m.status === 'Acted').length,
  }));

  // DB-09: how many mails of each tone arrived per calendar day (same days as the volume chart).
  const sentimentTrend = Array.from({ length: 14 }, (_, i) => {
    const k = 13 - i, from = todayStart - k * D, to = from + D;
    const day = base.filter((m) => inRange(m, from, to));
    return { day: new Date(from).toISOString().slice(5, 10), positive: day.filter((m) => m.sentiment === 'Positive').length, neutral: day.filter((m) => m.sentiment === 'Neutral').length, negative: day.filter((m) => m.sentiment === 'Negative').length };
  });

  const mix = (f: (m: Mail) => string, keys: string[]) => keys.map((k) => ({ name: k, value: open.filter((m) => f(m) === k).length }));
  const topicNow = top(cur, (m) => m.topic, 6);
  const topicPrev: Record<string, number> = {};
  prev.forEach((m) => (topicPrev[m.topic] = (topicPrev[m.topic] || 0) + 1));
  // DB-10: each topic comes with two example mails the person can open.
  const topics = topicNow.map((x) => ({ ...x, examples: cur.filter((m) => m.topic === x.name).slice(0, 2).map((m) => ({ id: m.id, subject: m.subject })), change: topicPrev[x.name] ? Math.round(((x.value - topicPrev[x.name]) / topicPrev[x.name]) * 100) : null }));

  const ai = {
    autoSortedPct: cur.length ? Math.round((cur.filter((m) => m.categoryId === m.aiCategoryId && !needsReview(m)).length / cur.length) * 100) : 0,
    overriddenPct: cur.length ? Math.round((cur.filter((m) => m.categoryId !== m.aiCategoryId).length / cur.length) * 100) : 0,
    needsReviewPct: cur.length ? Math.round((cur.filter((x) => needsReview(x)).length / cur.length) * 100) : 0,
    accuracyByCategory: byCategory.slice(0, 5).map((c) => {
      const l = cur.filter((m) => category(m.categoryId)?.name === c.name);
      return { name: c.name, value: l.length ? Math.round((l.filter((m) => m.categoryId === m.aiCategoryId).length / l.length) * 100) : 0 };
    }),
  };

  const week = base.filter((m) => inRange(m, t - 7 * D, t + 1)).length;
  const narrative = `In the last ${days} days ${cur.length} mails arrived${prev.length ? `, ${Math.round(((cur.length - prev.length) / prev.length) * 100)}% vs the period before` : ''}. ` +
    `${byCategory[0]?.name ?? 'No category'} leads (${byCategory[0]?.value ?? 0}). ${open.length} mails are open and ${open.filter((m) => !m.ownerId).length} are unassigned. ` +
    `${breaches.length} mail(s) are past their SLA. The AI sorted ${ai.autoSortedPct}% without help. This week: ${week} mails.`;

  const result = {
    range: { days },
    tiles: {
      received: { today: base.filter((m) => inRange(m, t - D, t + 1)).length, week, month: base.filter((m) => inRange(m, t - 30 * D, t + 1)).length, range: cur.length, prev: prev.length },
      open: { total: open.length, new: open.filter((m) => m.status === 'New').length, inProgress: open.filter((m) => m.status === 'In progress').length, waiting: open.filter((m) => m.status === 'Waiting on sender').length },
      acted: cur.filter((m) => m.status === 'Acted').length,
      unassigned: open.filter((m) => !m.ownerId).length,
    },
    volume, byCategory, categoryTrend, backlog,
    response: { firstMedian: +median(all).toFixed(1), firstP90: +p90(all).toFixed(1), ttaMedian: +median(tta).toFixed(1), ttaP90: +p90(tta).toFixed(1), byCategory: respByCat },
    sla: { compliancePct: judged.length ? Math.round((inTime / judged.length) * 100) : 100, breaches: breaches.slice(0, 5).map((m) => ({ id: m.id, subject: m.subject, overByH: Math.round(ageH(m) - (category(m.categoryId)?.slaHours ?? 0)) })), breachCount: breaches.length },
    workload,
    urgency: mix((m) => m.urgency, ['High', 'Medium', 'Low']),
    sentiment: mix((m) => m.sentiment, ['Positive', 'Neutral', 'Negative']),
    topSenders: top(cur, (m) => m.sender), topBusinessUnits: top(cur, (m) => m.entities.businessUnit), topCountries: top(cur, (m) => m.entities.country),
    topics, ai, narrative, sentimentTrend,
  };
  const format = sp.get('format');
  if (format === 'csv' || format === 'xlsx' || format === 'pdf') return dashboardExportResponse(result, days, format as ExportFormat); // DB-13
  return result;
});
