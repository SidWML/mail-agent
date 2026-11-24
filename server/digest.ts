import type { Digest } from '@/types/mailbox';
import { category, isOpen, slaBreached } from './rules';
import { addAlert, db, now } from './store';

const DAY = 24 * 3600_000;

/** The numbers in the daily summary for the Owner (FR-28): counts by category, open backlog by age, SLA breaches. */
export function buildDigest(): Digest {
  const d = db();
  const open = d.mails.filter(isOpen);
  const age = (iso: string) => now() - new Date(iso).getTime();

  const byCategoryCounts = new Map<string, number>();
  for (const mail of d.mails.filter((m) => age(m.receivedAt) <= DAY * 30 && m.status !== 'Deleted')) {
    const name = category(mail.categoryId)?.name ?? 'Other';
    byCategoryCounts.set(name, (byCategoryCounts.get(name) ?? 0) + 1);
  }

  const breaches = d.mails.filter(slaBreached);
  const bucket = (from: number, to: number) => open.filter((m) => age(m.receivedAt) >= from * DAY && age(m.receivedAt) < to * DAY).length;

  return {
    open: open.length,
    unassigned: open.filter((m) => !m.ownerId).length,
    breachCount: breaches.length,
    receivedLastDay: d.mails.filter((m) => age(m.receivedAt) <= DAY).length,
    byCategory: [...byCategoryCounts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6),
    backlog: [
      { name: '< 1 day', value: bucket(0, 1) },
      { name: '1–3 days', value: bucket(1, 3) },
      { name: '3–7 days', value: bucket(3, 7) },
      { name: '> 7 days', value: bucket(7, 10_000) },
    ],
    breaches: breaches
      .map((m) => ({ id: m.id, subject: m.subject, overByH: Math.round(age(m.receivedAt) / 3600_000 - (category(m.categoryId)?.slaHours ?? 0)) }))
      .sort((a, b) => b.overByH - a.overByH)
      .slice(0, 5),
  };
}

/** "Send" the daily summary: it lands in the Owner's alerts with the full numbers. */
export function sendDigest() {
  const digest = buildDigest();
  addAlert({
    kind: 'digest',
    channel: 'Email to Owner',
    title: 'Daily summary',
    body: `Open ${digest.open} · Unassigned ${digest.unassigned} · SLA breaches ${digest.breachCount}`,
    digest,
  });
  return digest;
}
