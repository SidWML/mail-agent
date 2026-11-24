import { handle } from '@/lib/server';
import { db, findMail } from '@/lib/store';
import { category } from '@/lib/rules';
import { ApiError } from '@/lib/actions';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// POST { mailId }  — FR-19: AI draft. Never sent automatically; the person reviews and clicks Send.
export const POST = handle('any-staff', async (req) => {
  const { mailId } = await req.json();
  const m = findMail(mailId);
  if (!m) throw new ApiError(404, 'NOT_FOUND', 'Mail not found.');
  await sleep(900);
  const cat = category(m.categoryId);
  const t = db().templates.find((x) => x.categoryId === m.categoryId);
  const first = m.sender.split(' ')[0];
  const body = t
    ? t.body.replace(/‹sender name›/g, first).replace(/‹category›/g, cat?.name ?? 'request')
    : `Hello ${first},\n\nThank you for your message about "${m.subject}". We have received it and are looking into it.\n\nBest regards,\nAI Platform Team`;
  return { draft: body, language: m.entities.language, basedOn: t ? `template “${t.name}”` : 'the mail and its category' };
});
