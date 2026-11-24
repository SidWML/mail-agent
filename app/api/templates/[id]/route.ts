import { handleRoute } from '@/server/handle-route';
import { db, logAudit } from '@/server/store';
import { ApiError } from '@/server/actions';

export const PUT = handleRoute(['owner'], async (req, u, ctx) => {
  const b = await req.json();
  const t = db().templates.find((x) => x.id === ctx.params.id);
  if (!t) throw new ApiError(404, 'NOT_FOUND', 'Template not found.');
  Object.assign(t, { name: b.name ?? t.name, categoryId: b.categoryId || undefined, body: b.body ?? t.body });
  logAudit(u, 'Template edited', undefined, undefined, t.name);
  return { template: t };
});
export const DELETE = handleRoute(['owner'], async (_req, u, ctx) => {
  const d = db();
  const i = d.templates.findIndex((x) => x.id === ctx.params.id);
  if (i < 0) throw new ApiError(404, 'NOT_FOUND', 'Template not found.');
  logAudit(u, 'Template deleted', undefined, d.templates[i].name);
  d.templates.splice(i, 1);
  return { ok: true };
});
