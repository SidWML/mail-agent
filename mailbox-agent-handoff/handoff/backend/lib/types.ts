// Shared types for the dummy server and the UI.

export type Role = 'owner' | 'agent' | 'viewer' | 'none';
export type Status = 'New' | 'In progress' | 'Waiting on sender' | 'Acted' | 'Deleted';
export type Urgency = 'High' | 'Medium' | 'Low';
export type Sentiment = 'Positive' | 'Neutral' | 'Negative';
export type Outcome = 'Answered' | 'Forwarded' | 'No action needed' | 'Duplicate' | 'Spam';

export const STATUSES: Status[] = ['New', 'In progress', 'Waiting on sender', 'Acted', 'Deleted'];
export const OUTCOMES: Outcome[] = ['Answered', 'Forwarded', 'No action needed', 'Duplicate', 'Spam'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role; // derived from the Entra ID group in the real system (SEC-03)
  group: string;
  initials: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number; // bytes
  kind: 'pdf' | 'xlsx' | 'png' | 'docx';
  scanned: true; // Defender scan result (SEC-10)
}

export interface Msg {
  id: string;
  kind: 'in' | 'out' | 'note' | 'fwd';
  author: string;
  authorId?: string;
  to?: string[];
  cc?: string[];
  subject?: string;
  body: string;
  at: string; // ISO
  attachments: Attachment[];
}

export interface TakeoverRequest {
  id: string;
  byId: string;
  byName: string;
  reason: string;
  at: string;
  state: 'open' | 'approved' | 'declined';
}

export interface Mail {
  id: string;
  version: number; // optimistic locking (concurrency rule)
  sender: string;
  email: string;
  domain: string;
  subject: string;
  summary: string; // AI-04 one line
  bullets: string[]; // AI-04 3-5 bullets
  categoryId: string;
  aiCategoryId: string; // what the AI chose (for override accuracy)
  confidence: number; // AI-02
  urgency: Urgency;
  sentiment: Sentiment;
  entities: { businessUnit: string; country: string; application: string; language: string }; // AI-05
  topic: string; // AI-clustered theme (DB-10)
  status: Status;
  prevStatus?: Status; // used by restore
  ownerId?: string;
  prevOwnerId?: string; // reopen returns here (FR-22)
  receivedAt: string;
  firstReplyAt?: string;
  actedAt?: string;
  outcome?: Outcome;
  outcomeNote?: string;
  deletedAt?: string;
  deletedBy?: string;
  thread: Msg[];
  takeovers: TakeoverRequest[];
  blockedSender?: boolean;
  duplicateOf?: string; // AI-06 suggestion
}

export interface Category {
  id: string;
  name: string;
  typical: string;
  slaHours: number;
  active: boolean;
  system?: boolean;
}

export interface Template {
  id: string;
  name: string;
  categoryId?: string;
  body: string; // supports ‹sender name› and ‹category›
}

export interface AuditEntry {
  id: string;
  at: string;
  userId: string;
  userName: string;
  action: string;
  mailId?: string;
  subject?: string;
  before?: string;
  after?: string;
  detail?: string;
}

export interface Alert {
  id: string;
  at: string;
  kind: 'high_urgency' | 'sla_breach' | 'digest' | 'sync';
  channel: 'Team channel' | 'Email to Owner';
  title: string;
  body: string;
  mailIds?: string[];
}

// What the current user may do with one mail. Computed on the server (lib/rules.ts),
// shown by the UI. The UI never decides permissions itself.
export interface Perms {
  open: boolean;
  claim: boolean;
  assign: boolean;
  takeoverRequest: boolean;
  takeoverDecide: boolean;
  reply: boolean;
  forward: boolean;
  note: boolean;
  acted: boolean;
  reopen: boolean;
  recategorize: boolean;
  del: boolean;
  restore: boolean;
  block: boolean;
  assignToMe: boolean;
}

export interface MailRow {
  id: string;
  version: number;
  sender: string;
  email: string;
  subject: string;
  summary: string;
  category: string;
  needsReview: boolean;
  urgency: Urgency;
  status: Status;
  ownerId?: string;
  ownerName?: string;
  receivedAt: string;
  ageHours: number;
  slaBreached: boolean;
  attachmentCount: number;
  outcome?: Outcome;
  deletedAt?: string;
  daysLeftToRestore?: number;
  perms: Perms;
  openTakeover: boolean;
}
