import { handleRoute } from '@/server/handle-route';
import { performById } from '@/server/actions';
import { toRow } from '@/server/rules';

// POST /api/mails/:id/actions   body: { type: 'claim' | 'assign' | 'reply' | 'acted' | ... , ...payload, version? }
// One endpoint for every button. All rules live in lib/actions.ts + lib/rules.ts.
export const POST = handleRoute('any-staff', async (req, u, ctx) => {
  const body = await req.json();
  const m = performById(u, ctx.params.id, body);
  return { ok: true, row: toRow(u, m) };
});
