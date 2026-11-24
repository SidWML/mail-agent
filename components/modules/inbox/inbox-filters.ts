import { readList, readParam, type SearchParams } from "@/lib/url";
import type { InboxTab, MailListQuery } from "@/types/api";
import { isInboxTab } from "./inbox-tabs";

export const INBOX_PATH = "/inbox";
export const PAGE_SIZE = 8;

export const URGENCY_OPTIONS = ["High", "Medium", "Low"] as const;
export const STATUS_OPTIONS = ["New", "In progress", "Waiting on sender", "Acted", "Deleted"] as const;
export const SENTIMENT_OPTIONS = ["Positive", "Neutral", "Negative"] as const;

export const DATE_OPTIONS = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Received date, newest first (default)", short: "Newest first" },
  { value: "oldest", label: "Received date, oldest first", short: "Oldest first" },
  { value: "urgency", label: "Urgency", short: "Urgency" },
  { value: "category", label: "Category", short: "Category" },
  { value: "sender", label: "Sender", short: "Sender" },
  { value: "status", label: "Status", short: "Status" },
  { value: "assignee", label: "Assignee", short: "Assignee" },
  { value: "sla", label: "Age / SLA breach", short: "Age / SLA breach" },
] as const;

/** The URL query names each filter uses. Needed to remove a filter or clear them all. */
export const FILTER_PARAM_KEYS = {
  search: ["q"],
  category: ["category"],
  urgency: ["urgency"],
  status: ["status"],
  assignee: ["assignee"],
  date: ["date", "from", "to"],
  review: ["review"],
  late: ["late"],
  attachment: ["attachment"],
  sentiment: ["sentiment"],
  domain: ["domain"],
} as const;

export const ALL_FILTER_KEYS = Object.values(FILTER_PARAM_KEYS).flat();

export interface InboxFilters {
  tab: InboxTab;
  search: string;
  categoryIds: string[];
  urgencies: string[];
  statuses: string[];
  /** "me", "unassigned" or a user id. Empty means anyone. */
  assignee: string;
  /** "1", "7", "30" or "custom". Empty means any date. */
  date: string;
  dateFrom: string;
  dateTo: string;
  needsReviewOnly: boolean;
  /** Only mails past their reply time (SLA). */
  lateOnly: boolean;
  hasAttachment: boolean;
  sentiments: string[];
  domain: string;
  sort: string;
}

/** Turn the page's ?query into filter values. */
export function parseInboxFilters(params: SearchParams): InboxFilters {
  const tabParam = readParam(params, "tab");
  return {
    tab: isInboxTab(tabParam) ? tabParam : "active",
    search: readParam(params, "q") ?? "",
    categoryIds: readList(params, "category"),
    urgencies: readList(params, "urgency"),
    statuses: readList(params, "status"),
    assignee: readParam(params, "assignee") ?? "",
    date: readParam(params, "date") ?? "",
    dateFrom: readParam(params, "from") ?? "",
    dateTo: readParam(params, "to") ?? "",
    needsReviewOnly: readParam(params, "review") === "1",
    lateOnly: readParam(params, "late") === "1",
    hasAttachment: readParam(params, "attachment") === "1",
    sentiments: readList(params, "sentiment"),
    domain: readParam(params, "domain") ?? "",
    sort: readParam(params, "sort") ?? "newest",
  };
}

/** Turn filter values into what GET /api/mails expects. */
export function toMailListQuery(filters: InboxFilters, page: number): MailListQuery {
  const isCustomDate = filters.date === "custom";
  return {
    tab: filters.tab,
    q: filters.search,
    category: filters.categoryIds.join(","),
    urgency: filters.urgencies.join(","),
    status: filters.statuses.join(","),
    sentiment: filters.sentiments.join(","),
    assignee: filters.assignee,
    dateDays: filters.date && !isCustomDate ? Number(filters.date) : undefined,
    dateFrom: isCustomDate ? filters.dateFrom : undefined,
    dateTo: isCustomDate ? filters.dateTo : undefined,
    domain: filters.domain,
    hasAttachment: filters.hasAttachment ? "1" : undefined,
    needsReview: filters.needsReviewOnly ? "1" : undefined,
    slaBreached: filters.lateOnly ? "1" : undefined,
    sort: filters.sort,
    page,
    pageSize: PAGE_SIZE,
  };
}

export function hasActiveFilters(filters: InboxFilters) {
  return (
    filters.search !== "" ||
    filters.categoryIds.length > 0 ||
    filters.urgencies.length > 0 ||
    filters.statuses.length > 0 ||
    filters.assignee !== "" ||
    filters.date !== "" ||
    filters.needsReviewOnly ||
    filters.lateOnly ||
    filters.hasAttachment ||
    filters.sentiments.length > 0 ||
    filters.domain !== ""
  );
}
