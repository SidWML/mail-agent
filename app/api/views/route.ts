import { handleRoute } from '@/server/handle-route';
import { db, nextId } from '@/server/store';
import { ApiError } from '@/server/actions';
import type { SavedView } from '@/types/mailbox';

// Saved views start with two examples so a new person sees how they look (FR-12).
const STARTER_VIEWS: Array<Omit<SavedView, 'id'>> = [
  { name: 'Unassigned this week', query: 'tab=unassigned&date=7' },
  { name: 'My urgent mails', query: 'tab=mine&urgency=High' },
];

function viewsOf(userId: string): SavedView[] {
  const all = db().views;
  if (!all[userId]) all[userId] = STARTER_VIEWS.map((view) => ({ ...view, id: nextId('v') }));
  return all[userId];
}

// GET /api/views        -> { views: SavedView[] } for the signed-in person
// POST /api/views       body { name, query }
export const GET = handleRoute('all', async (_req, u) => ({ views: viewsOf(u.id) }));

export const POST = handleRoute('all', async (req, u) => {
  const body = await req.json();
  const name = String(body.name || '').trim();
  if (!name) throw new ApiError(400, 'NAME_REQUIRED', 'Give the view a name.');
  const views = viewsOf(u.id);
  if (views.length >= 20) throw new ApiError(400, 'TOO_MANY', 'You can keep up to 20 saved views.');
  const view = { id: nextId('v'), name, query: String(body.query || '') };
  views.push(view);
  return { view };
});
