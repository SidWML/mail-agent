import { handle } from '@/lib/server';
import { db, logAudit, nextId } from '@/lib/store';
import { ApiError } from '@/lib/actions';

export const GET = handle('any-staff', async () => ({ templates: db().templates }));
export const POST = handle(['owner'], async (req, u) => {
  const b = await req.json();
  if (!String(b.name || '').trim() || !String(b.body || '').trim()) throw new ApiError(400, 'REQUIRED', 'Name and reply text are required.');
  const t = { id: nextId('t'), name: b.name.trim(), categoryId: b.categoryId || undefined, body: b.body };
  db().templates.push(t);
  logAudit(u, 'Template added', undefined, undefined, t.name);
  return { template: t };
});
