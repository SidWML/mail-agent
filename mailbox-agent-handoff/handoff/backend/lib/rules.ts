// Business rules: who may do what to which mail, and how statuses change.
// This is the single source of truth. The UI only renders what the server says is allowed.
//
// Status flow (doc, section D):
//   New --claim/assign--> In progress --reply (asks info)--> Waiting on sender
//   In progress / Waiting --mark acted--> Acted
//   Waiting --sender replies--> In progress
//   Acted --reopen or sender replies--> In progress (back to the previous owner)
//   any --Owner delete--> Deleted --restore (within 30 days)--> previous status

import type { Mail, MailRow, Perms, User, Category } from './types';
import { db, now, userById } from './store';

export const RESTORE_DAYS = 30;

export function isOpen(m: Mail) {
  return m.status === 'New' || m.status === 'In progress' || m.status === 'Waiting on sender';
}

export function permsFor(u: User, m: Mail): Perms {
  const none: Perms = {
    open: false, claim: false, assign: false, takeoverRequest: false, takeoverDecide: false, reply: false, forward: false,
    note: false, acted: false, reopen: false, recategorize: false, del: false, restore: false, block: false, assignToMe: false,
  };
  if (u.role === 'none') return none;
  const owner = u.role === 'owner';
  const agent = u.role === 'agent';
  const staff = owner || agent;
  const open = isOpen(m);
  const mine = m.ownerId === u.id;
  const deleted = m.status === 'Deleted';

  if (deleted) {
    // Deleted mails are only visible to the Platform Owner (FR-08)
    return owner ? { ...none, open: true, restore: restoreLeft(m) > 0 } : none;
  }
  return {
    open: true,
    claim: staff && m.status === 'New' && !m.ownerId,
    assign: owner && open,
    assignToMe: owner && open && !mine,
    takeoverRequest: agent && open && !!m.ownerId && !mine && !m.takeovers.some((t) => t.byId === u.id && t.state === 'open'),
    takeoverDecide: staff && open && m.takeovers.some((t) => t.state === 'open') && (mine || owner),
    reply: staff && open && mine,
    forward: staff && open && mine,
    note: staff,
    acted: staff && open && (mine || !m.ownerId),
    reopen: staff && m.status === 'Acted', // FR-22 (any agent); see "doc conflict" note in README
    recategorize: staff && open,
    del: owner,
    restore: false,
    block: staff && open && mine,
  };
}

export function restoreLeft(m: Mail): number {
  if (!m.deletedAt) return 0;
  const days = (now() - new Date(m.deletedAt).getTime()) / 86400_000;
  return Math.max(0, Math.ceil(RESTORE_DAYS - days));
}

export function category(id: string): Category | undefined {
  return db().categories.find((c) => c.id === id);
}

/** SLA breach: unassigned or unanswered mail past the hours set for its category (FR-27). */
export function slaBreached(m: Mail): boolean {
  if (!(m.status === 'New' || m.status === 'In progress')) return false;
  if (m.firstReplyAt) return false;
  const c = category(m.categoryId);
  if (!c) return false;
  const ageH = (now() - new Date(m.receivedAt).getTime()) / 3600_000;
  return ageH > c.slaHours;
}

export function needsReview(m: Mail, threshold = 0.6) {
  return m.confidence < threshold || m.categoryId === 'c-review';
}

export function toRow(u: User, m: Mail): MailRow {
  const att = m.thread.reduce((n, x) => n + x.attachments.length, 0);
  return {
    id: m.id, version: m.version, sender: m.sender, email: m.email, subject: m.subject, summary: m.summary,
    category: category(m.categoryId)?.name ?? '—', needsReview: needsReview(m), urgency: m.urgency, status: m.status,
    ownerId: m.ownerId, ownerName: userById(m.ownerId)?.name, receivedAt: m.receivedAt,
    ageHours: (now() - new Date(m.receivedAt).getTime()) / 3600_000, slaBreached: slaBreached(m), attachmentCount: att,
    outcome: m.outcome, deletedAt: m.deletedAt, daysLeftToRestore: m.status === 'Deleted' ? restoreLeft(m) : undefined,
    perms: permsFor(u, m), openTakeover: m.takeovers.some((t) => t.state === 'open'),
  };
}

export function tabMatch(tab: string, u: User, m: Mail): boolean {
  switch (tab) {
    case 'active': return isOpen(m); // FR-07
    case 'mine': return isOpen(m) && m.ownerId === u.id;
    case 'unassigned': return isOpen(m) && !m.ownerId;
    case 'acted': return m.status === 'Acted';
    case 'deleted': return m.status === 'Deleted';
    case 'all': return m.status !== 'Deleted';
    default: return true;
  }
}
