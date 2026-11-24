import { handle } from '@/lib/server';
import { db, logAudit } from '@/lib/store';
import { ApiError } from '@/lib/actions';

// PUT = edit/rename/set SLA. Optional recategorize:true is only meaningful when renaming is not enough; kept for the UI toggle.
export const PUT = handle(['owner'], async (req, u, ctx) => {
  const b = await req.json();
  const c = db().categories.find((x) => x.id === ctx.params.id);
  if (!c) throw new ApiError(404, 'NOT_FOUND', 'Category not found.');
  const before = `${c.name} · ${c.slaHours} h`;
  if (b.name !== undefined) c.name = String(b.name).trim() || c.name;
  if (b.typical !== undefined) c.typical = b.typical;
  if (b.slaHours !== undefined && Number(b.slaHours) > 0) c.slaHours = Number(b.slaHours);
  if (b.active !== undefined) c.active = !!b.active;
  logAudit(u, 'Category edited', undefined, before, `${c.name} · ${c.slaHours} h`);
  return { category: c };
});

// DELETE = retire. ?recategorize=1 moves existing mails to "Needs review".
export const DELETE = handle(['owner'], async (req, u, ctx) => {
  const c = db().categories.find((x) => x.id === ctx.params.id);
  if (!c) throw new ApiError(404, 'NOT_FOUND', 'Category not found.');
  if (c.system) throw new ApiError(400, 'SYSTEM', 'This category is used by the system and cannot be retired.');
  c.active = false;
  let moved = 0;
  if (req.nextUrl.searchParams.get('recategorize') === '1') {
    db().mails.forEach((m) => { if (m.categoryId === c.id) { m.categoryId = 'c-review'; moved++; } });
  }
  logAudit(u, 'Category retired', undefined, c.name, undefined, `${moved} mail(s) moved to Needs review`);
  return { ok: true, moved };
});
