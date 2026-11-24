import type { Category, Mail, MailRow, Perms, Template, User } from "./mailbox";

export type InboxTab = "active" | "mine" | "unassigned" | "acted" | "all" | "deleted";

/** Query values the mails endpoint understands. List values are comma separated. */
export interface MailListQuery {
  tab?: InboxTab;
  q?: string;
  category?: string;
  urgency?: string;
  status?: string;
  sentiment?: string;
  assignee?: string;
  dateDays?: number;
  dateFrom?: string;
  dateTo?: string;
  domain?: string;
  hasAttachment?: "1";
  needsReview?: "1";
  /** Only mails past the reply time of their category. */
  slaBreached?: "1";
  sort?: string;
  page?: number;
  pageSize?: number;
}

/** Number of mails for each filter option, counted in the current tab. */
export interface MailFacets {
  category: Record<string, number>;
  urgency: Record<string, number>;
  status: Record<string, number>;
  sentiment: Record<string, number>;
  assignee: Record<string, number>;
  hasAttachment: number;
  needsReview: number;
}

export interface MailListResponse {
  items: MailRow[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<InboxTab, number>;
  facets: MailFacets;
  needsReviewCount: number;
  syncDown: boolean;
  lastSync: string;
}

/** One mail with everything the drawer shows (GET /api/mails/:id). */
export interface MailDetail extends Mail {
  category?: string;
  aiCategory?: string;
  ownerName?: string;
  needsReview: boolean;
  slaBreached: boolean;
  slaHours?: number;
  daysLeftToRestore?: number;
  duplicateSubject?: string;
}

export interface MailDetailResponse {
  mail: MailDetail;
  perms: Perms;
  /** Name of a teammate who is typing a reply right now. */
  someoneReplying: string | null;
  suggestedTemplateIds: string[];
}

export interface BulkResult {
  done: string[];
  failed: Array<{ id: string; reason: string }>;
}

export interface AiDraftResponse {
  draft: string;
  language: string;
  basedOn: string;
}

export interface TemplatesResponse {
  templates: Template[];
}

export interface UsersResponse {
  users: User[];
}

export interface CategoryWithCount extends Category {
  mailCount: number;
}

export interface CategoriesResponse {
  categories: CategoryWithCount[];
}
