import { handle } from '@/lib/server';
import { db, logAudit, nextId } from '@/lib/store';
import { ApiError } from '@/lib/actions';

export const GET = handle('all', async () => ({
  categories: db().categories.map((c) => ({ ...c, mailCount: db().mails.filter((m) => m.categoryId === c.id && m.status !== 'Deleted').length })),
}));

// AI-08: Owner adds categories without a code release
export const POST = handle(['owner'], async (req, u) => {
  const b = await req.json();
  if (!String(b.name || '').trim()) throw new ApiError(400, 'NAME_REQUIRED', 'Give the category a name.');
  if (!(Number(b.slaHours) > 0)) throw new ApiError(400, 'SLA_REQUIRED', 'Set the SLA in hours.');
  const c = { id: nextId('c'), name: b.name.trim(), typical: b.typical || '', slaHours: Number(b.slaHours), active: true };
  db().categories.push(c);
  logAudit(u, 'Category added', undefined, undefined, c.name);
  return { category: c };
});
