import DataTable from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import TableFooter from "@/components/common/TableFooter";
import AppShell from "@/components/layout/AppShell";
import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { getNotice } from "@/lib/notice";
import { readParam, withParams, type SearchParams } from "@/lib/url";
import { getCategories } from "@/services/categories";
import { getTemplates } from "@/services/templates";
import { getCurrentUser } from "@/services/users";
import TemplateDialog from "./TemplateDialog";
import { buildTemplateColumns } from "./template-columns";
import {
  TEMPLATES_PATH,
  TEMPLATE_GRID_COLUMNS,
  TEMPLATE_PAGE_SIZE,
  TEMPLATE_READ_ONLY_GRID_COLUMNS,
} from "./template-params";

interface TemplatesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function TemplatesPage({ searchParams: searchParamsPromise }: TemplatesPageProps) {
  const params = await searchParamsPromise;
  const currentUser = await getCurrentUser();
  const canManage = currentUser.role === "owner";
  // The server lets only the Owner and support team members read templates (viewers get 403).
  const canRead = currentUser.role === "owner" || currentUser.role === "agent";

  const [templates, categories] = canRead ? await Promise.all([getTemplates(), getCategories()]) : [[], []];
  const totalPages = Math.max(1, Math.ceil(templates.length / TEMPLATE_PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number(readParam(params, "page")) || 1));
  const rows = templates.slice((page - 1) * TEMPLATE_PAGE_SIZE, page * TEMPLATE_PAGE_SIZE);
  const getPageHref = (pageNumber: number) =>
    withParams(TEMPLATES_PATH, params, { page: pageNumber, notice: undefined, noticeTone: undefined });
  const newTemplateHref = withParams(TEMPLATES_PATH, params, {
    dialog: "new",
    id: undefined,
    notice: undefined,
    noticeTone: undefined,
  });

  return (
    <AppShell
      activePath={TEMPLATES_PATH}
      notice={getNotice(TEMPLATES_PATH, params)}
      overlay={canManage ? <TemplateDialog params={params} templates={templates} categories={categories} /> : undefined}
    >
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <PageHeader title="Templates" subtitle="Ready-made replies agents can insert in the composer." />
        {canManage && (
          <ButtonLink href={newTemplateHref} variant="primary" large className="h-10 gap-2">
            <Icon name="plus" size={14} strokeWidth={2.4} />
            New template
          </ButtonLink>
        )}
      </div>

      <section className="flex shrink-0 flex-col border border-line-soft bg-card">
        {!canRead ? (
          <EmptyState icon="lock" title="Templates are not available" message="Your role can not read reply templates." />
        ) : templates.length === 0 ? (
          <EmptyState icon="document" title="No templates yet" message="Reply templates the support team can insert will show up here." />
        ) : (
          <DataTable
            columns={buildTemplateColumns({ params, categories, canManage })}
            gridColumns={canManage ? TEMPLATE_GRID_COLUMNS : TEMPLATE_READ_ONLY_GRID_COLUMNS}
            rows={rows}
            getRowId={(template) => template.id}
            minWidth={820}
          />
        )}
        {totalPages > 1 && (
          <TableFooter summary={`Showing ${rows.length} of ${templates.length} templates`}>
            <Pagination currentPage={page} totalPages={totalPages} getPageHref={getPageHref} />
          </TableFooter>
        )}
      </section>
    </AppShell>
  );
}
