import { NextResponse } from 'next/server';
import { handle } from '@/lib/server';
import { db } from '@/lib/store';

// GET /api/audit?user=&action=&q=&format=csv   (FR-29, Owner only, kept 1 year)
export const GET = handle(['owner'], async (req) => {
  const sp = req.nextUrl.searchParams;
  let rows = db().audit;
  if (sp.get('user')) rows = rows.filter((r) => r.userId === sp.get('user'));
  if (sp.get('action')) rows = rows.filter((r) => r.action === sp.get('action'));
  if (sp.get('q')) rows = rows.filter((r) => `${r.subject} ${r.detail}`.toLowerCase().includes(sp.get('q')!.toLowerCase()));
  if (sp.get('format') === 'csv') {
    const esc = (s?: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
    const csv = ['When,Who,Action,Mail,Before,After,Detail', ...rows.map((r) => [r.at, r.userName, r.action, r.subject, r.before, r.after, r.detail].map(esc).join(','))].join('\n');
    return new NextResponse(csv, { headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="audit.csv"' } });
  }
  return { entries: rows.slice(0, 200), total: rows.length, actions: Array.from(new Set(db().audit.map((r) => r.action))).sort() };
});
