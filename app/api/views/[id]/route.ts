import { handleRoute } from '@/server/handle-route';
import { db } from '@/server/store';

// DELETE /api/views/:id  - remove one of your saved views
export const DELETE = handleRoute('all', async (_req, u, ctx) => {
  const views = db().views[u.id] ?? [];
  db().views[u.id] = views.filter((view) => view.id !== ctx.params.id);
  return { ok: true };
});
