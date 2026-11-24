import { handleRoute } from '@/server/handle-route';
import { ApiError, perform } from '@/server/actions';
import { findMail } from '@/server/store';

// POST /api/mails/bulk   body: { ids: string[], action: 'acted'|'assign'|'recategorize'|'delete', ...payload }
// FR-13: up to 100 mails, one confirmation. Mails that are not allowed are reported, the rest go through.
export const POST = handleRoute('any-staff', async (req, u) => {
  const { ids, action, ...payload } = await req.json();
  if (!Array.isArray(ids) || !ids.length) throw new ApiError(400, 'NO_IDS', 'Select at least one mail.');
  if (ids.length > 100) throw new ApiError(400, 'TOO_MANY', 'You can change up to 100 mails at once.');
  if (!['acted', 'assign', 'recategorize', 'delete'].includes(action)) throw new ApiError(400, 'BAD_ACTION', 'Unknown bulk action.');
  const done: string[] = [];
  const failed: { id: string; reason: string }[] = [];
  for (const id of ids) {
    try {
      const m = findMail(id);
      if (!m) throw new ApiError(404, 'NOT_FOUND', 'Mail not found');
      perform(u, m, { type: action, ...payload, version: undefined });
      done.push(id);
    } catch (e) {
      failed.push({ id, reason: e instanceof Error ? e.message : 'Could not do this.' });
    }
  }
  return { done, failed };
});
