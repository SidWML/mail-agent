import { handleRoute } from '@/server/handle-route';
import { db, logAudit, nextId } from '@/server/store';
import { ApiError } from '@/server/actions';

export const GET = handleRoute('any-staff', async () => ({ templates: db().templates }));
export const POST = handleRoute(['owner'], async (req, u) => {
  const b = await req.json();
  if (!String(b.name || '').trim() || !String(b.body || '').trim()) throw new ApiError(400, 'REQUIRED', 'Name and reply text are required.');
  const t = { id: nextId('t'), name: b.name.trim(), categoryId: b.categoryId || undefined, body: b.body };
  db().templates.push(t);
  logAudit(u, 'Template added', undefined, undefined, t.name);
  return { template: t };
});
