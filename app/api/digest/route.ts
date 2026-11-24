import { buildDigest, sendDigest } from '@/server/digest';
import { handleRoute } from '@/server/handle-route';
import { logAudit } from '@/server/store';

// FR-28. GET shows what today's digest would contain. POST sends it to the Owner's alerts now (the real system sends it every morning).
export const GET = handleRoute(['owner'], () => ({ digest: buildDigest() }));

export const POST = handleRoute(['owner'], (_req, u) => {
  const digest = sendDigest();
  logAudit(u, 'Sent the daily digest', undefined, undefined, undefined, `Open ${digest.open}, unassigned ${digest.unassigned}, SLA breaches ${digest.breachCount}`);
  return { ok: true, digest };
});
