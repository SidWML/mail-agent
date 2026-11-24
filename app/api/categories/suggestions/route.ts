import { handleRoute } from '@/server/handle-route';
import { db } from '@/server/store';
import { needsReview } from '@/server/rules';

// GET /api/categories/suggestions   (AI-09, Owner only)
// When mails keep landing in "Needs review", the AI proposes a new category for each recurring topic.
// The Owner approves before it is used: nothing is created here.
export const GET = handleRoute(['owner'], async () => {
  const d = db();
  const existing = new Set(d.categories.map((c) => c.name.toLowerCase()));
  const groups = new Map<string, typeof d.mails>();
  for (const mail of d.mails) {
    if (mail.status === 'Deleted' || !needsReview(mail)) continue;
    groups.set(mail.topic, [...(groups.get(mail.topic) ?? []), mail]);
  }
  const suggestions = [...groups.entries()]
    .filter(([topic]) => !existing.has(topic.toLowerCase()))
    .map(([topic, mails]) => ({
      name: topic,
      count: mails.length,
      mailIds: mails.map((m) => m.id),
      typical: mails[0].summary,
      examples: mails.slice(0, 2).map((m) => ({ id: m.id, subject: m.subject })),
    }))
    .sort((a, b) => b.count - a.count);
  return { suggestions, needsReviewCount: [...groups.values()].reduce((sum, mails) => sum + mails.length, 0) };
});
