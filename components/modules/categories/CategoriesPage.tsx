import DataTable from "@/components/common/DataTable";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import TableFooter from "@/components/common/TableFooter";
import AppShell from "@/components/layout/AppShell";
import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { getNotice } from "@/lib/notice";
import { getCurrentUrl, readParam, withParams, type SearchParams } from "@/lib/url";
import { getCategories, getCategorySuggestions } from "@/services/categories";
import CategorySuggestions from "./CategorySuggestions";
import { getCurrentUser } from "@/services/users";
import CategoryDialog from "./CategoryDialog";
import { buildCategoryColumns } from "./category-columns";
import {
  CATEGORIES_PATH,
  CATEGORY_GRID_COLUMNS,
  CATEGORY_PAGE_SIZE,
  CATEGORY_READ_ONLY_GRID_COLUMNS,
} from "./category-params";

interface CategoriesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CategoriesPage({ searchParams: searchParamsPromise }: CategoriesPageProps) {
  const params = await searchParamsPromise;
  const [currentUser, categories] = await Promise.all([getCurrentUser(), getCategories()]);
  // The AI proposes categories only to the Platform Owner, who approves before anything is created (AI-09).
  const suggestions = currentUser.role === "owner" ? await getCategorySuggestions() : [];

  // The server refuses writes from anyone else; the buttons are simply not shown.
  const canManage = currentUser.role === "owner";
  const totalPages = Math.max(1, Math.ceil(categories.length / CATEGORY_PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number(readParam(params, "page")) || 1));
  const rows = categories.slice((page - 1) * CATEGORY_PAGE_SIZE, page * CATEGORY_PAGE_SIZE);
  const getPageHref = (pageNumber: number) =>
    withParams(CATEGORIES_PATH, params, { page: pageNumber, notice: undefined, noticeTone: undefined });
  const getDialogHref = (dialog: string) =>
    withParams(CATEGORIES_PATH, params, { dialog, id: undefined, notice: undefined, noticeTone: undefined });

  return (
    <AppShell
      activePath={CATEGORIES_PATH}
      notice={getNotice(CATEGORIES_PATH, params)}
      overlay={canManage ? <CategoryDialog params={params} categories={categories} /> : undefined}
    >
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Categories & SLAs"
          subtitle="Manage the categories the AI sorts mails into and the time allowed for each."
        />
        {canManage && (
          <div className="flex gap-2">
            <ButtonLink href={getDialogHref("merge")} large className="h-10">
              Merge
            </ButtonLink>
            <ButtonLink href={getDialogHref("new")} variant="primary" large className="h-10 gap-2">
              <Icon name="plus" size={14} strokeWidth={2.4} />
              Add category
            </ButtonLink>
          </div>
        )}
      </div>

      <CategorySuggestions suggestions={suggestions} returnTo={getCurrentUrl(CATEGORIES_PATH, params)} />

      <section className="flex shrink-0 flex-col border border-line-soft bg-card">
        <DataTable
          columns={buildCategoryColumns({ params, canManage })}
          gridColumns={canManage ? CATEGORY_GRID_COLUMNS : CATEGORY_READ_ONLY_GRID_COLUMNS}
          rows={rows}
          getRowId={(category) => category.id}
          minWidth={760}
        />
        {totalPages > 1 && (
          <TableFooter summary={`Showing ${rows.length} of ${categories.length} categories`}>
            <Pagination currentPage={page} totalPages={totalPages} getPageHref={getPageHref} />
          </TableFooter>
        )}
      </section>
    </AppShell>
  );
}
