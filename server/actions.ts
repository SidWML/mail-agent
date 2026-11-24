import type { Mail, Msg, Outcome, Status, User, Attachment } from '@/types/mailbox';
import { OUTCOMES } from '@/types/mailbox';
import { db, findMail, iso, logAudit, nextId, now, userById } from '@/server/store';
import { category, isOpen, permsFor, restoreLeft } from '@/server/rules';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAILBOX = 'ai@schindler.com';

const need = (ok: boolean, code = 'FORBIDDEN', msg = 'You are not allowed to do this.') => {
  if (!ok) throw new ApiError(403, code, msg);
};

export interface ActionBody {
  type: string;
  version?: number;
  [k: string]: any;
}

function setStatus(u: User, m: Mail, to: Status, detail?: string) {
  const from = m.status;
  if (from === to) return;
  m.status = to;
  logAudit(u, 'Status change', m, from, to, detail);
}

function setOwner(u: User, m: Mail, id: string | undefined, action: string) {
  const before = userById(m.ownerId)?.name ?? 'Unassigned';
  m.ownerId = id;
  logAudit(u, action, m, before, userById(id)?.name ?? 'Unassigned');
}

export function perform(u: User, m: Mail, body: ActionBody): Mail {
  const p = permsFor(u, m);
  // Optimistic locking: refuse if the caller saw an older version of this mail.
  if (body.version !== undefined && body.version !== m.version && body.type !== 'claim') {
    throw new ApiError(409, 'STALE', 'This mail changed while you were looking at it. It has been refreshed.');
  }

  switch (body.type) {
    case 'claim': {
      // Two users cannot claim the same mail.
      if (m.ownerId && m.ownerId !== u.id) {
        throw new ApiError(409, 'ALREADY_CLAIMED', `${userById(m.ownerId)?.name} took this mail first.`, { ownerName: userById(m.ownerId)?.name });
      }
      need(p.claim);
      m.ownerId = u.id;
      logAudit(u, 'Claim', m, 'Unassigned', u.name);
      setStatus(u, m, 'In progress', 'claimed');
      break;
    }
    case 'assign': {
      need(p.assign);
      const target = userById(body.userId);
      if (!target || target.role === 'viewer' || target.role === 'none') throw new ApiError(400, 'BAD_TARGET', 'Pick a team member.');
      setOwner(u, m, target.id, m.ownerId ? 'Reassign' : 'Assign');
      m.takeovers.forEach((t) => { if (t.state === 'open') t.state = 'declined'; });
      if (m.status === 'New') setStatus(u, m, 'In progress', 'assigned');
      break;
    }
    case 'assign_to_me': {
      need(p.assignToMe);
      setOwner(u, m, u.id, m.ownerId ? 'Reassign' : 'Assign');
      if (m.status === 'New') setStatus(u, m, 'In progress', 'assigned');
      break;
    }
    case 'takeover_request': {
      need(p.takeoverRequest);
      if (!String(body.reason || '').trim()) throw new ApiError(400, 'REASON_REQUIRED', 'Please say why you want to take it over.');
      m.takeovers.push({ id: nextId('tk'), byId: u.id, byName: u.name, reason: body.reason, at: iso(now()), state: 'open' });
      logAudit(u, 'Takeover requested', m, undefined, undefined, body.reason);
      break;
    }
    case 'takeover_decide': {
      need(p.takeoverDecide);
      const t = m.takeovers.find((x) => x.id === body.requestId && x.state === 'open');
      if (!t) throw new ApiError(404, 'NO_REQUEST', 'That request is no longer open.');
      if (body.approve) {
        setOwner(u, m, t.byId, 'Takeover approved');
        t.state = 'approved';
        m.takeovers.forEach((x) => { if (x.state === 'open') x.state = 'declined'; });
      } else {
        t.state = 'declined';
        logAudit(u, 'Takeover declined', m, undefined, undefined, t.byName);
      }
      break;
    }
    case 'reply': {
      need(p.reply);
      const text = String(body.body || '').trim();
      if (!text) throw new ApiError(400, 'EMPTY', 'Write something before sending.');
      if (db().flags.sendFails) throw new ApiError(502, 'SEND_FAILED', 'Microsoft 365 did not accept the reply. Nothing was sent.');
      const atts: Attachment[] = (body.attachments || []).map((a: any) => ({ id: nextId('att'), name: a.name, size: a.size || 1000, kind: a.kind || 'pdf', scanned: true }));
      // Recipients: the sender, anyone added to To, and anyone in Cc. Reply all also keeps the original To and Cc.
      const addresses = (list: unknown) => (Array.isArray(list) ? list.map((x) => String(x).trim()).filter(Boolean) : []);
      const bad = [...addresses(body.to), ...addresses(body.cc)].find((x) => !EMAIL.test(x));
      if (bad) throw new ApiError(400, 'BAD_TO', `'${bad}' is not an email address.`);
      const last = [...m.thread].reverse().find((x) => x.kind === 'in');
      const unique = (list: string[]) => [...new Set(list.map((x) => x.toLowerCase()))];
      const originalTo = body.replyAll ? (last?.to ?? []).filter((x) => x.toLowerCase() !== MAILBOX) : [];
      const to = unique([m.email, ...originalTo, ...addresses(body.to)]);
      const cc = unique([...(body.replyAll ? last?.cc ?? [] : []), ...addresses(body.cc)]).filter((x) => !to.includes(x) && x !== MAILBOX);
      const msg: Msg = {
        id: nextId('msg'), kind: 'out', author: u.name, authorId: u.id,
        to, cc,
        subject: `Re: ${m.subject}`, body: text, at: iso(now()), attachments: atts,
      };
      m.thread.push(msg);
      if (!m.firstReplyAt) m.firstReplyAt = msg.at;
      logAudit(u, 'Reply', m, undefined, undefined, `${body.replyAll ? 'Reply all' : 'Reply'} · ${atts.length} attachment(s)`);
      const next: Status = body.next === 'Acted' ? 'Acted' : body.next === 'In progress' ? 'In progress' : 'Waiting on sender';
      if (next === 'Acted') {
        m.outcome = 'Answered';
        m.actedAt = msg.at;
        m.prevOwnerId = m.ownerId;
      }
      setStatus(u, m, next, 'after reply');
      delete db().presence[m.id];
      break;
    }
    case 'forward': {
      need(p.forward);
      // One or more addresses, separated by comma, semicolon or space.
      const recipients = String(body.to || '').split(/[,;\s]+/).filter(Boolean);
      if (recipients.length === 0) throw new ApiError(400, 'BAD_TO', 'Enter an email address.');
      const badAddress = recipients.find((x) => !EMAIL.test(x));
      if (badAddress) throw new ApiError(400, 'BAD_TO', `'${badAddress}' is not an email address.`);
      m.thread.push({ id: nextId('msg'), kind: 'fwd', author: u.name, authorId: u.id, to: recipients, subject: `Fwd: ${m.subject}`, body: body.note || '(no message)', at: iso(now()), attachments: [] });
      logAudit(u, 'Forward', m, undefined, undefined, recipients.join(', '));
      break;
    }
    case 'note': {
      need(p.note);
      if (!String(body.text || '').trim()) throw new ApiError(400, 'EMPTY', 'Write a note first.');
      m.thread.push({ id: nextId('msg'), kind: 'note', author: u.name, authorId: u.id, body: body.text, at: iso(now()), attachments: [] });
      logAudit(u, 'Internal note', m);
      break;
    }
    case 'acted': {
      need(p.acted);
      const outcome = body.outcome as Outcome;
      if (!OUTCOMES.includes(outcome)) throw new ApiError(400, 'OUTCOME_REQUIRED', 'Choose an outcome.');
      if (!m.ownerId) { m.ownerId = u.id; logAudit(u, 'Claim', m, 'Unassigned', u.name); }
      m.outcome = outcome;
      m.outcomeNote = body.note;
      m.actedAt = iso(now());
      m.prevOwnerId = m.ownerId;
      setStatus(u, m, 'Acted', `${outcome}${body.note ? ' · ' + body.note : ''}`);
      break;
    }
    case 'reopen': {
      need(p.reopen);
      m.ownerId = m.prevOwnerId ?? m.ownerId; // back to the previous assignee (FR-22)
      m.outcome = undefined;
      m.actedAt = undefined;
      setStatus(u, m, 'In progress', 'reopened');
      break;
    }
    case 'recategorize': {
      need(p.recategorize);
      const c = category(body.categoryId);
      if (!c || !c.active) throw new ApiError(400, 'BAD_CATEGORY', 'Pick an active category.');
      if (!String(body.reason || '').trim()) throw new ApiError(400, 'REASON_REQUIRED', 'A reason is required for a category change.');
      const before = category(m.categoryId)?.name;
      m.categoryId = c.id;
      logAudit(u, 'Category override', m, before, c.name, body.reason);
      break;
    }
    case 'set_status': {
      // Used by the "Reply sent" step: the owner picks what happens to the mail next.
      need(p.reply);
      const to = body.status as Status;
      if (to !== 'In progress' && to !== 'Waiting on sender') throw new ApiError(400, 'BAD_STATUS', 'Pick In progress or Waiting on sender.');
      setStatus(u, m, to, 'chosen after reply');
      break;
    }
    case 'block': {
      need(p.block);
      m.blockedSender = true;
      m.categoryId = 'c-spam';
      m.outcome = 'Spam';
      m.actedAt = iso(now());
      m.prevOwnerId = m.ownerId;
      logAudit(u, 'Block sender', m, undefined, undefined, m.email);
      setStatus(u, m, 'Acted', 'Spam');
      break;
    }
    case 'delete': {
      need(p.del);
      m.prevStatus = m.status;
      m.deletedAt = iso(now());
      m.deletedBy = u.name;
      logAudit(u, 'Delete', m, m.status, 'Deleted');
      m.status = 'Deleted';
      break;
    }
    case 'restore': {
      need(u.role === 'owner' && m.status === 'Deleted');
      if (restoreLeft(m) <= 0) throw new ApiError(410, 'RESTORE_EXPIRED', 'This mail was deleted more than 30 days ago and cannot be restored.');
      logAudit(u, 'Restore', m, 'Deleted', m.prevStatus ?? 'New');
      m.status = m.prevStatus ?? 'New';
      m.deletedAt = undefined;
      m.deletedBy = undefined;
      break;
    }
    default:
      throw new ApiError(400, 'UNKNOWN_ACTION', `Unknown action "${body.type}".`);
  }
  m.version += 1;
  return m;
}

export function performById(u: User, id: string, body: ActionBody) {
  const m = findMail(id);
  if (!m) throw new ApiError(404, 'NOT_FOUND', 'Mail not found.');
  if (!permsFor(u, m).open) throw new ApiError(403, 'FORBIDDEN', 'You cannot see this mail.');
  return perform(u, m, body);
}

export { isOpen };
