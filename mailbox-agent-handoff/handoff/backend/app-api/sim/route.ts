import { NextRequest, NextResponse } from 'next/server';
import { addAlert, createIncoming, db, iso, logAudit, now, reset, SYSTEM, userById } from '@/lib/store';
import { ApiError, perform } from '@/lib/actions';
import { category, isOpen, slaBreached, toRow } from '@/lib/rules';

const alerted = (globalThis as any).__breachAlerted ?? ((globalThis as any).__breachAlerted = new Set<string>());

function checkSla() {
  const d = db();
  const fresh = d.mails.filter((m) => slaBreached(m) && !alerted.has(m.id));
  fresh.forEach((m) => alerted.add(m.id));
  if (fresh.length) {
    addAlert({ kind: 'sla_breach', channel: 'Email to Owner', title: `SLA breach: ${fresh.length} mail(s)`, body: fresh.slice(0, 5).map((m) => `${m.subject} (${category(m.categoryId)?.name})`).join('\n'), mailIds: fresh.map((m) => m.id) });
  }
  return fresh.length;
}

// Scenario lab. Each type drives one of the situations in the requirements doc.
//   new_mail        a mail arrives and the AI sorts it (options: high, lowConfidence, spam, fromBlocked)
//   sender_reply    the sender answers: Waiting -> In progress, Acted -> reopened to the previous owner
//   claim_by_other  another agent claims a mail first, so your own claim then fails with 409
//   advance         move the clock forward (hours) -> SLA breach alerts, restore windows expire
//   digest          send the daily digest to the Owner
//   presence        "Markus W. is replying" on a mail
//   flags           syncDown / sendFails / latency toggles
//   reset           back to the seed data
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const d = db();
    switch (b.type) {
      case 'new_mail': {
        const m = createIncoming(b);
        return NextResponse.json({ ok: true, message: `New mail from ${m.sender}: ${m.subject}${m.categoryId === 'c-spam' ? ' (auto-sorted to Spam)' : ''}` });
      }
      case 'sender_reply': {
        const m = (b.id && d.mails.find((x) => x.id === b.id)) || d.mails.find((x) => x.status === 'Waiting on sender') || d.mails.find((x) => x.status === 'Acted');
        if (!m) throw new ApiError(404, 'NONE', 'No mail is waiting for a reply.');
        m.thread.push({ id: `sim-${d.seq++}`, kind: 'in', author: m.sender, to: ['ai@schindler.com'], cc: [], body: 'Thank you. Here are the details you asked for.', at: iso(now()), attachments: [] });
        if (m.status === 'Waiting on sender' || m.status === 'Acted') {
          const from = m.status;
          if (from === 'Acted') { m.ownerId = m.prevOwnerId ?? m.ownerId; m.outcome = undefined; m.actedAt = undefined; }
          m.status = 'In progress';
          logAudit(SYSTEM, 'Status change', m, from, 'In progress', 'sender replied');
        }
        m.version++;
        return NextResponse.json({ ok: true, message: `${m.sender} replied. "${m.subject}" is back In progress with ${userById(m.ownerId)?.name ?? 'no owner'}.` });
      }
      case 'claim_by_other': {
        const m = (b.id && d.mails.find((x) => x.id === b.id)) || d.mails.find((x) => x.status === 'New' && !x.ownerId);
        if (!m) throw new ApiError(404, 'NONE', 'No unassigned mail.');
        perform(userById('u-anika')!, m, { type: 'claim' });
        return NextResponse.json({ ok: true, message: `Anika R. just took "${m.subject}".`, id: m.id });
      }
      case 'advance': {
        d.offsetMs += (Number(b.hours) || 24) * 3600_000;
        const n = checkSla();
        if ((Number(b.hours) || 24) >= 24) addAlert({ kind: 'digest', channel: 'Email to Owner', title: 'Daily summary', body: `Open ${d.mails.filter(isOpen).length} · Unassigned ${d.mails.filter((m) => isOpen(m) && !m.ownerId).length} · SLA breaches ${d.mails.filter(slaBreached).length}` });
        return NextResponse.json({ ok: true, message: `Clock moved ${b.hours || 24} h. ${n} new SLA breach alert(s).` });
      }
      case 'digest': {
        addAlert({ kind: 'digest', channel: 'Email to Owner', title: 'Daily summary', body: `Open ${d.mails.filter(isOpen).length} · Unassigned ${d.mails.filter((m) => isOpen(m) && !m.ownerId).length} · SLA breaches ${d.mails.filter(slaBreached).length}` });
        return NextResponse.json({ ok: true, message: 'Daily digest sent to the Owner.' });
      }
      case 'presence': {
        const m = (b.id && d.mails.find((x) => x.id === b.id)) || d.mails.find((x) => x.status === 'In progress');
        if (m) d.presence[m.id] = { userId: 'u-markus', userName: 'Markus W.', replying: true, at: now() };
        return NextResponse.json({ ok: true, message: `Markus W. is replying to "${m?.subject}".`, id: m?.id });
      }
      case 'flags': {
        Object.assign(d.flags, b.flags || {});
        if (b.flags?.syncDown) addAlert({ kind: 'sync', channel: 'Email to Owner', title: 'Mail sync failing', body: 'Sync has not succeeded for over 10 minutes.' });
        return NextResponse.json({ ok: true, flags: d.flags });
      }
      case 'reset': {
        alerted.clear();
        reset();
        return NextResponse.json({ ok: true, message: 'Data reset.' });
      }
      case 'state':
        return NextResponse.json({ flags: d.flags, offsetHours: d.offsetMs / 3600_000, unassignedNew: d.mails.filter((x) => x.status === 'New' && !x.ownerId).length });
    }
    throw new ApiError(400, 'UNKNOWN', 'Unknown scenario.');
  } catch (e: any) {
    if (e instanceof ApiError) return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: { code: 'SERVER', message: 'Something went wrong.' } }, { status: 500 });
  }
}
