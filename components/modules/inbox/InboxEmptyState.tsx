import EmptyState from "@/components/common/EmptyState";
import FilterChip from "@/components/common/FilterChip";
import { ButtonLink } from "@/components/ui/Button";
import { withParams, type SearchParams } from "@/lib/url";
import type { FilterChipData } from "./inbox-chips";
import { ALL_FILTER_KEYS, INBOX_PATH, type InboxFilters } from "./inbox-filters";

interface InboxEmptyStateProps {
  filters: InboxFilters;
  params: SearchParams;
  /** Chips for the filters that are applied. Empty when nothing is filtered. */
  chips: FilterChipData[];
}

export default function InboxEmptyState({ filters, params, chips }: InboxEmptyStateProps) {
  // Filters are on: say so, show them, and offer to clear them.
  if (chips.length > 0) {
    const clearAllHref = withParams(INBOX_PATH, params, {
      ...Object.fromEntries(ALL_FILTER_KEYS.map((key) => [key, undefined])),
      page: undefined,
    });
    return (
      <EmptyState icon="search" title="No mails match" message="Try fewer filters or a different search word.">
        <div className="flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <FilterChip key={chip.label} label={chip.label} removeHref={chip.removeHref} />
          ))}
        </div>
        <ButtonLink href={clearAllHref} variant="primary" className="h-[38px]">
          Clear all filters
        </ButtonLink>
      </EmptyState>
    );
  }

  // The Active tab is empty: everything has been handled.
  if (filters.tab === "active") {
    return (
      <EmptyState
        icon="check"
        tone="success"
        title="All caught up"
        message="There are no active mails. New mail appears here within a minute of arriving in ai@schindler.com."
      >
        <ButtonLink href={withParams(INBOX_PATH, params, { tab: "acted", page: undefined })} variant="neutral" className="h-[38px]">
          See Acted / Closed
        </ButtonLink>
      </EmptyState>
    );
  }

  return <EmptyState icon="inbox" title="No mails here" message="There are no mails in this view." />;
}
