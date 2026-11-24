import { handleRoute } from '@/server/handle-route';
import { db } from '@/server/store';

const SORTS = ['newest', 'oldest', 'urgency', 'category', 'sender', 'status', 'assignee', 'sla'];

// GET /api/preferences  -> { sort? }   PUT body { sort }  (FR-09: the sort choice is remembered per person)
export const GET = handleRoute('all', async (_req, u) => ({ preferences: db().preferences[u.id] ?? {} }));

export const PUT = handleRoute('all', async (req, u) => {
  const body = await req.json();
  const current = db().preferences[u.id] ?? {};
  if (typeof body.sort === 'string' && SORTS.includes(body.sort)) current.sort = body.sort;
  db().preferences[u.id] = current;
  return { preferences: current };
});
