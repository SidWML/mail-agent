import { handle } from '@/lib/server';
import { db, findMail, logAudit, now, userById } from '@/lib/store';
import { category, needsReview, permsFor, slaBreached, restoreLeft } from '@/lib/rules';
import { ApiError } from '@/lib/actions';

// GET /api/mails/:id  -> full mail + thread + what you may do + who else is looking at it
export const GET = handle('all', async (_req, u, ctx) => {
  const m = findMail(ctx.params.id);
  if (!m) throw new ApiError(404, 'NOT_FOUND', 'Mail not found.');
  const perms = permsFor(u, m);
  if (!perms.open) throw new ApiError(403, 'FORBIDDEN', 'You cannot see this mail.');
  logAudit(u, 'View', m); // FR-29: views are audited
  const pr = db().presence[m.id];
  const someoneReplying = pr && pr.userId !== u.id && pr.replying && now() - pr.at < 30_000 ? pr.userName : null; // FR-16
  return {
    mail: {
      ...m,
      category: category(m.categoryId)?.name,
      aiCategory: category(m.aiCategoryId)?.name,
      ownerName: userById(m.ownerId)?.name,
      needsReview: needsReview(m),
      slaBreached: slaBreached(m),
      slaHours: category(m.categoryId)?.slaHours,
      daysLeftToRestore: m.status === 'Deleted' ? restoreLeft(m) : undefined,
      duplicateSubject: m.duplicateOf ? db().mails.find((x) => x.id === m.duplicateOf)?.subject : undefined,
    },
    perms,
    someoneReplying,
    suggestedTemplateIds: db().templates.filter((t) => t.categoryId === m.categoryId).map((t) => t.id),
  };
});
