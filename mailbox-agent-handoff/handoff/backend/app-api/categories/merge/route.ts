import { handle } from '@/lib/server';
import { db, logAudit } from '@/lib/store';
import { ApiError } from '@/lib/actions';

// POST { sourceIds: string[], targetId: string, recategorize: boolean }
export const POST = handle(['owner'], async (req, u) => {
  const { sourceIds, targetId, recategorize } = await req.json();
  const target = db().categories.find((c) => c.id === targetId);
  if (!target || !Array.isArray(sourceIds) || !sourceIds.length) throw new ApiError(400, 'BAD_INPUT', 'Pick the categories to merge and a target.');
  let moved = 0;
  for (const id of sourceIds.filter((x: string) => x !== targetId)) {
    const c = db().categories.find((x) => x.id === id);
    if (!c || c.system) continue;
    c.active = false;
    if (recategorize) db().mails.forEach((m) => { if (m.categoryId === id) { m.categoryId = targetId; moved++; } });
  }
  logAudit(u, 'Categories merged', undefined, sourceIds.join(', '), target.name, `${moved} mail(s) moved`);
  return { ok: true, moved };
});
