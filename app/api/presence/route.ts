import { handleRoute } from '@/server/handle-route';
import { db, now } from '@/server/store';

// POST { mailId, replying }  — FR-16 live presence: "Ravi is replying"
export const POST = handleRoute('any-staff', async (req, u) => {
  const { mailId, replying } = await req.json();
  db().presence[mailId] = { userId: u.id, userName: u.name, replying: !!replying, at: now() };
  return { ok: true };
});
