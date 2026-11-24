import { handle } from '@/lib/server';
import { db } from '@/lib/store';

// The "outbox": what the system would post to the team channel / email the Owner (FR-26, FR-27, FR-28).
// Support team members only see the team-channel alerts; the Owner also sees breach alerts and the digest.
export const GET = handle('any-staff', async (_req, u) => ({
  alerts: db().alerts.filter((a) => u.role === 'owner' || a.channel === 'Team channel').slice(0, 30),
}));
