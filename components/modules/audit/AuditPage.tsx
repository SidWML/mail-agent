import { redirect } from "next/navigation";
import DataTable from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import TableFooter from "@/components/common/TableFooter";
import AppShell from "@/components/layout/AppShell";
import { getButtonClassName } from "@/components/ui/Button";
import { getNotice } from "@/lib/notice";
import { readParam, withParams, type SearchParams } from "@/lib/url";
import { toQueryString } from "@/services/http";
import { getAuditLog } from "@/services/audit";
import { getCurrentUser, getUsers } from "@/services/users";
import { AUDIT_COLUMNS } from "./audit-columns";
import { AUDIT_DENIED_URL, AUDIT_GRID_COLUMNS, AUDIT_PAGE_SIZE, AUDIT_PATH } from "./audit-params";
import AuditToolbar from "./AuditToolbar";

interface AuditPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AuditPage({ searchParams: searchParamsPromise }: AuditPageProps) {
  const params = await searchParamsPromise;
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "owner") redirect(AUDIT_DENIED_URL);

  const filters = { user: readParam(params, "user"), action: readParam(params, "action"), q: readParam(params, "q") };
  const [audit, users] = await Promise.all([getAuditLog(filters), getUsers()]);

  const totalPages = Math.max(1, Math.ceil(audit.entries.length / AUDIT_PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number(readParam(params, "page")) || 1));
  const rows = audit.entries.slice((page - 1) * AUDIT_PAGE_SIZE, page * AUDIT_PAGE_SIZE);
  const hasFilters = Boolean(filters.user || filters.action || filters.q);
  // The API accepts the signed-in cookie, so the export is a plain link with the same filters.
  const csvHref = `/api/audit${toQueryString({ ...filters, format: "csv" })}`;

  return (
    <AppShell activePath={AUDIT_PATH} notice={getNotice(AUDIT_PATH, params)}>
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <PageHeader title="Audit log" subtitle="Who did what, and when. Kept for one year." />
        <a href={csvHref} download className={getButtonClassName({ variant: "neutral", large: true, className: "h-10 px-[18px]" })}>
          Export CSV
        </a>
      </div>

      <AuditToolbar params={params} users={users.filter((user) => user.role !== "none")} actions={audit.actions} />

      <section className="flex shrink-0 flex-col border border-line-soft bg-card">
        {rows.length === 0 ? (
          <EmptyState
            icon="list"
            title={hasFilters ? "No entries match" : "Nothing logged yet"}
            message={hasFilters ? "Try another user, action or search text." : "Actions people take in the mailbox will show up here."}
          />
        ) : (
          <DataTable columns={AUDIT_COLUMNS} gridColumns={AUDIT_GRID_COLUMNS} rows={rows} getRowId={(entry) => entry.id} minWidth={900} />
        )}
        {rows.length > 0 && (
          <TableFooter summary={`Showing ${rows.length} of ${audit.total} entries`}>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                getPageHref={(pageNumber) =>
                  withParams(AUDIT_PATH, params, { page: pageNumber, notice: undefined, noticeTone: undefined })
                }
              />
            )}
          </TableFooter>
        )}
      </section>
    </AppShell>
  );
}
