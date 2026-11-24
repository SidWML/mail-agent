import { handle } from '@/lib/server';
import { db, now } from '@/lib/store';

// POST { mailId, replying }  — FR-16 live presence: "Ravi is replying"
export const POST = handle('any-staff', async (req, u) => {
  const { mailId, replying } = await req.json();
  db().presence[mailId] = { userId: u.id, userName: u.name, replying: !!replying, at: now() };
  return { ok: true };
});
