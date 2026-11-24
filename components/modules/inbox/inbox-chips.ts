import { withParams, type SearchParams } from "@/lib/url";
import type { CategoryWithCount } from "@/types/api";
import type { User } from "@/types/mailbox";
import { DATE_OPTIONS, FILTER_PARAM_KEYS, INBOX_PATH, type InboxFilters } from "./inbox-filters";

export interface FilterChipData {
  label: string;
  removeHref: string;
}

interface BuildChipsOptions {
  filters: InboxFilters;
  params: SearchParams;
  categories: CategoryWithCount[];
  allUsers: User[];
}

/** One chip per applied filter, each with a link that removes just that filter. */
export function buildFilterChips({ filters, params, categories, allUsers }: BuildChipsOptions) {
  const chips: FilterChipData[] = [];
  const add = (label: string, keys: readonly string[]) =>
    chips.push({
      label,
      removeHref: withParams(INBOX_PATH, params, { ...Object.fromEntries(keys.map((key) => [key, undefined])), page: undefined }),
    });

  if (filters.categoryIds.length) {
    const names = filters.categoryIds.map((id) => categories.find((category) => category.id === id)?.name ?? id);
    add(`Category: ${names.join(", ")}`, FILTER_PARAM_KEYS.category);
  }
  if (filters.urgencies.length) add(`Urgency: ${filters.urgencies.join(", ")}`, FILTER_PARAM_KEYS.urgency);
  if (filters.statuses.length) add(`Status: ${filters.statuses.join(", ")}`, FILTER_PARAM_KEYS.status);

  if (filters.assignee) {
    const assigneeName =
      filters.assignee === "me"
        ? "Me"
        : filters.assignee === "unassigned"
          ? "Unassigned"
          : filters.assignee.startsWith("team:")
            ? `Team ${filters.assignee.slice(5)}`
            : (allUsers.find((user) => user.id === filters.assignee)?.name ?? filters.assignee);
    add(`Assignee: ${assigneeName}`, FILTER_PARAM_KEYS.assignee);
  }

  if (filters.date === "custom") {
    add(`Date: ${filters.dateFrom || "…"} to ${filters.dateTo || "…"}`, FILTER_PARAM_KEYS.date);
  } else if (filters.date) {
    add(`Date: ${DATE_OPTIONS.find((option) => option.value === filters.date)?.label ?? filters.date}`, FILTER_PARAM_KEYS.date);
  }

  if (filters.needsReviewOnly) add("Needs review", FILTER_PARAM_KEYS.review);
  if (filters.lateOnly) add("Past reply time (SLA)", FILTER_PARAM_KEYS.late);
  if (filters.hasAttachment) add("Has attachment", FILTER_PARAM_KEYS.attachment);
  if (filters.sentiments.length) add(`Sentiment: ${filters.sentiments.join(", ")}`, FILTER_PARAM_KEYS.sentiment);
  if (filters.domain) add(`Sender domain: ${filters.domain}`, FILTER_PARAM_KEYS.domain);
  if (filters.search) add(`Search: “${filters.search}”`, FILTER_PARAM_KEYS.search);

  return chips;
}
