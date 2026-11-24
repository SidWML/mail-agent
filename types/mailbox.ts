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
  /** Team the person works in, for example "Support EMEA". Used to group people when assigning. */
  team?: string;
  /** Region the team covers, for example "Europe". */
  region?: string;
}

/** A named filter + sort combination a person saved from the inbox (FR-12). */
export interface SavedView {
  id: string;
  name: string;
  /** The inbox address query, for example "tab=mine&urgency=High". */
  query: string;
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
  /** Pictures inside the mail body. They are blocked until the reader chooses to show them (FR-14). */
  images?: Array<{ url: string; alt: string }>;
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
  /** The numbers of a daily digest (kind 'digest'). */
  digest?: Digest;
}

/** The daily summary for the Owner: counts by category, open backlog and SLA breaches (FR-28). */
export interface Digest {
  open: number;
  unassigned: number;
  breachCount: number;
  receivedLastDay: number;
  byCategory: Array<{ name: string; value: number }>;
  backlog: Array<{ name: string; value: number }>;
  breaches: Array<{ id: string; subject: string; overByH: number }>;
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
  /** Messages in the conversation (internal notes not counted). */
  messageCount: number;
  outcome?: Outcome;
  /** Hours from received to acted (Acted tab, "Time to act"). */
  timeToActHours?: number;
  actedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  daysLeftToRestore?: number;
  perms: Perms;
  openTakeover: boolean;
}

/** Settings the Platform Owner can change without a release (requirements: "Maintainability"). */
export interface AiSettings {
  /** Below this confidence a mail is marked "Needs review" (AI-02, default 0.6). */
  confidenceThreshold: number;
  /** Instruction the AI follows to pick a category (AI-01). */
  classificationPrompt: string;
  /** Instruction for the one-line and bullet summaries (AI-04). */
  summaryPrompt: string;
  /** Instruction for AI-drafted replies (FR-19). */
  draftPrompt: string;
  /** Monthly AI budget in US dollars (AI cost control). */
  monthlyBudgetUsd: number;
  /** Warn the Owner when this share of the budget is used. */
  budgetAlertPercent: number;
}
