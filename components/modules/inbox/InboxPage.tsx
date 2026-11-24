import Link from "next/link";
import RefreshControl from "@/components/common/RefreshControl";
import FilterChip from "@/components/common/FilterChip";
import NoticeBanner from "@/components/common/NoticeBanner";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import TabBar from "@/components/common/TabBar";
import TableFooter from "@/components/common/TableFooter";
import DataTable from "@/components/common/DataTable";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import { formatClockTime } from "@/lib/format";
import { getNotice } from "@/lib/notice";
import { changeUrl, getCurrentUrl, readParam, withParams, type SearchParams } from "@/lib/url";
import ActionFields from "@/components/common/ActionFields";
import MailOverlay from "@/components/modules/mail-drawer/MailOverlay";
import { getCategories } from "@/services/categories";
import { getMail, getMails } from "@/services/mails";
import { getPreferences } from "@/services/preferences";
import { getSavedViews } from "@/services/views";
import { getCurrentUser, getUsers } from "@/services/users";
import BulkBar from "./BulkBar";
import InboxEmptyState from "./InboxEmptyState";
import InboxToolbar from "./InboxToolbar";
import { buildInboxColumns, BULK_FORM_ID, INBOX_GRID_COLUMNS, URGENCY_ACCENT } from "./inbox-columns";
import { buildFilterChips } from "./inbox-chips";
import { ALL_FILTER_KEYS, INBOX_PATH, parseInboxFilters, toMailListQuery } from "./inbox-filters";
import { getFooterSummary, getPageTitle, getTabsForRole, INBOX_TAB_LABELS } from "./inbox-tabs";

interface InboxPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function InboxPage({ searchParams: searchParamsPromise }: InboxPageProps) {
  const params = await searchParamsPromise;
  const [currentUser, preferences] = await Promise.all([getCurrentUser(), getPreferences()]);

  // A tab this person may not see (for example Deleted for an agent) falls back to Active.
  const parsedFilters = parseInboxFilters(params);
  const visibleTabs = getTabsForRole(currentUser.role);
  const allowedFilters = visibleTabs.includes(parsedFilters.tab) ? parsedFilters : { ...parsedFilters, tab: "active" as const };
  // The sort in the address wins; otherwise the sort this person chose last time (FR-09).
  const filters = { ...allowedFilters, sort: readParam(params, "sort") ?? preferences.sort ?? "newest" };
  const page = Math.max(1, Number(readParam(params, "page")) || 1);

  // Everything the page needs is asked for at the same time (and the drawer's mail too), not one after another.
  const openMailId = readParam(params, "mail");
  const dialogMailId = readParam(params, "target") ?? openMailId;
  if (openMailId) void getMail(openMailId);
  if (dialogMailId) void getMail(dialogMailId);

  // The drawer needs the whole list (not just this page) to offer Previous / Next and "Mail 3 of 37".
  const [allUsers, categories, savedViews, mailList, wholeList] = await Promise.all([
    getUsers(),
    getCategories(),
    getSavedViews(),
    getMails(toMailListQuery(filters, page)),
    openMailId ? getMails({ ...toMailListQuery(filters, 1), pageSize: 100 }) : undefined,
  ]);

  const chips = buildFilterChips({ filters, params, categories, allUsers });
  const { title, subtitle } = getPageTitle(filters.tab, currentUser.role);
  const getMailHref = (mailId: string) => withParams(INBOX_PATH, params, { mail: mailId });
  const getDialogHref = (mailId: string, dialog: string) => withParams(INBOX_PATH, params, { dialog, target: mailId });
  const getReturnTo = (mailId: string) => changeUrl(getCurrentUrl(INBOX_PATH, params), { target: mailId });
  const columns = buildInboxColumns({ tab: filters.tab, role: currentUser.role, getMailHref, getDialogHref, getReturnTo });

  const overlay =
    openMailId || readParam(params, "dialog") ? (
      <MailOverlay
        params={params}
        currentUser={currentUser}
        position={{
          mailIds: wholeList?.items.map((item) => item.id) ?? [],
          total: wholeList?.total ?? 0,
          listLabel: INBOX_TAB_LABELS[filters.tab],
        }}
      />
    ) : undefined;
  const clearAllHref = withParams(INBOX_PATH, params, {
    ...Object.fromEntries(ALL_FILTER_KEYS.map((key) => [key, undefined])),
    page: undefined,
  });

  const tabs = visibleTabs.map((tab) => ({
    label: INBOX_TAB_LABELS[tab],
    count: mailList.counts[tab],
    active: tab === filters.tab,
    href: withParams(INBOX_PATH, params, { tab, page: undefined }),
    icon: tab === "deleted" ? <Icon name="lock" size={13} className="text-ink-muted" /> : undefined,
    alignRight: tab === "deleted",
  }));

  const syncBanner = mailList.syncDown ? (
    <NoticeBanner
      message={`Mail sync is delayed since ${formatClockTime(mailList.lastSync)}. New mail may not show up yet. We keep retrying, and nothing is lost.`}
      note={`Last updated ${formatClockTime(mailList.lastSync)}`}
    />
  ) : undefined;

  return (
    <AppShell activePath={INBOX_PATH} banner={syncBanner} notice={getNotice(INBOX_PATH, params)} overlay={overlay}>
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <PageHeader title={title} subtitle={subtitle} />
        {/* New mail should show up within a minute (FR-01); with a mail open the page checks every 8 seconds for "X is replying" (FR-16). */}
        <RefreshControl href={getCurrentUrl(INBOX_PATH, params)} syncedAt={mailList.lastSync} knownCount={mailList.counts.all} autoRefreshSeconds={openMailId ? 8 : 60} />
      </div>

      <section className="bulk-scope flex shrink-0 flex-col border border-line-soft bg-card">
        <div className="order-1">
          <TabBar tabs={tabs} />
        </div>

        <div className="order-2">
          <InboxToolbar
            filters={filters}
            params={params}
            facets={mailList.facets}
            categories={categories}
            currentUser={currentUser}
            allUsers={allUsers}
            needsReviewCount={mailList.needsReviewCount}
            savedViews={savedViews}
            returnTo={getCurrentUrl(INBOX_PATH, params)}
          />
        </div>

        {chips.length > 0 && mailList.items.length > 0 && (
          <div className="order-3 flex flex-wrap items-center gap-2 px-5 pb-3.5">
            {chips.map((chip) => (
              <FilterChip key={chip.label} label={chip.label} removeHref={chip.removeHref} />
            ))}
            <Link href={clearAllHref} className="px-1 text-[12.5px] font-semibold text-brand">
              Clear all
            </Link>
          </div>
        )}

        <form id={BULK_FORM_ID}>
          <ActionFields returnTo={getCurrentUrl(INBOX_PATH, params)} />
        </form>

        <div className="order-5">
          {mailList.items.length === 0 ? (
            <InboxEmptyState filters={filters} params={params} chips={chips} />
          ) : (
            <DataTable
              columns={columns}
              gridColumns={INBOX_GRID_COLUMNS}
              rows={mailList.items}
              getRowId={(mail) => mail.id}
              getRowAccentClass={(mail) => URGENCY_ACCENT[mail.urgency]}
            />
          )}
        </div>

        {mailList.items.length > 0 && (
          <div className="order-6">
            <TableFooter summary={getFooterSummary(filters.tab, mailList.items.length, mailList.total)}>
              <Pagination
                currentPage={mailList.page}
                totalPages={Math.max(1, Math.ceil(mailList.total / mailList.pageSize))}
                getPageHref={(pageNumber) => withParams(INBOX_PATH, params, { page: pageNumber })}
              />
            </TableFooter>
          </div>
        )}

        {/* After the table in the HTML (the counter needs that), shown above it by `order`. */}
        <BulkBar role={currentUser.role} />
      </section>
    </AppShell>
  );
}
