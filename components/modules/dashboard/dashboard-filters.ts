import { readParam, withParams, type SearchParams } from "@/lib/url";
import type { InboxTab } from "@/types/api";

export const DASHBOARD_PATH = "/dashboard";
export const INBOX_PATH = "/inbox";

/** The ready-made ranges. Anything else in ?days= is a custom range. */
export const RANGE_OPTIONS = [
  { value: "1", label: "Today", previousLabel: "yesterday" },
  { value: "7", label: "This week", previousLabel: "last week" },
  { value: "30", label: "This month", previousLabel: "last month" },
] as const;

/** Query names the filter menus control. Used to keep the rest when a menu is applied. */
export const RANGE_PARAM_KEYS = ["days", "from", "to"];
export const ONE_TIME_KEYS = ["notice", "noticeTone"];

const DAY_MS = 86_400_000;

export interface DashboardFilters {
  /** "1", "7", "30" or "custom". */
  range: string;
  /** How many days back the API should look. */
  days: number;
  from: string;
  to: string;
  /** Category id, or empty for all. */
  category: string;
  /** User id, or empty for all. */
  assignee: string;
}

/** Turn the page's ?query into filter values. Custom ranges count the days back from the From date. */
export function parseDashboardFilters(params: SearchParams): DashboardFilters {
  const daysParam = readParam(params, "days") ?? "30";
  const from = readParam(params, "from") ?? "";
  const to = readParam(params, "to") ?? "";
  const isReady = RANGE_OPTIONS.some((option) => option.value === daysParam);
  const isCustom = !isReady && (daysParam === "custom" || Number(daysParam) > 0);

  let days = 30;
  if (isReady) days = Number(daysParam);
  else if (isCustom && from) days = daysSince(from);
  else if (isCustom && Number(daysParam) > 0) days = Math.min(365, Math.round(Number(daysParam)));

  return {
    range: isReady ? daysParam : isCustom ? "custom" : "30",
    days,
    from,
    to,
    category: readParam(params, "category") ?? "",
    assignee: readParam(params, "assignee") ?? "",
  };
}

function daysSince(dateText: string) {
  const time = new Date(dateText).getTime();
  if (Number.isNaN(time)) return 30;
  return Math.min(365, Math.max(1, Math.ceil((Date.now() - time) / DAY_MS)));
}

/** What the previous period is called in the Received tile: "vs last month". */
export function getPreviousPeriodLabel(range: string) {
  return RANGE_OPTIONS.find((option) => option.value === range)?.previousLabel ?? "the period before";
}

interface MailsLinkOptions {
  tab: InboxTab;
  /** Also limit the list to the dashboard date range. Open-mail charts do not use the range. */
  withDate?: boolean;
  /** Search text, for example a sender name. */
  search?: string;
  sort?: string;
  /** Overrides the dashboard category (used by the category chart rows). */
  category?: string;
  mailId?: string;
  /** Narrow the list to one status, urgency or sentiment (a chart slice). */
  status?: string;
  urgency?: string;
  sentiment?: string;
  /** Overrides the dashboard assignee (a person's bar in the workload chart). */
  assignee?: string;
  /** One whole day, "2026-11-23". Overrides the dashboard date range. */
  day?: string;
}

/** Link from a tile or chart to the inbox list that holds the same mails. */
export function getMailsHref(filters: DashboardFilters, options: MailsLinkOptions) {
  const isCustom = filters.range === "custom";
  return withParams(
    INBOX_PATH,
    {},
    {
      tab: options.tab,
      category: options.category ?? (filters.category || undefined),
      assignee: options.assignee ?? (filters.assignee || undefined),
      status: options.status,
      urgency: options.urgency,
      sentiment: options.sentiment,
      date: options.day ? "custom" : options.withDate ? (isCustom ? "custom" : filters.range) : undefined,
      from: options.day ?? (options.withDate && isCustom ? filters.from : undefined),
      to: options.day ?? (options.withDate && isCustom ? filters.to : undefined),
      q: options.search,
      sort: options.sort,
      mail: options.mailId,
    },
  );
}

/** "11-23" becomes "2026-11-23" (last year when the month is later than this month). */
export function toIsoDay(day: string, todayIso: string) {
  const year = Number(todayIso.slice(0, 4));
  const todayMonth = Number(todayIso.slice(5, 7));
  const month = Number(day.slice(0, 2));
  return `${month > todayMonth ? year - 1 : year}-${day}`;
}

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "11-23" becomes "23 Nov". */
export function toDayLabel(day: string) {
  return `${Number(day.slice(3, 5))} ${MONTH_NAMES[Number(day.slice(0, 2)) - 1]}`;
}
