import type { TableColumn } from "@/components/common/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import CategoryTag from "@/components/ui/CategoryTag";
import { withParams, type SearchParams } from "@/lib/url";
import type { CategoryWithCount } from "@/types/api";
import { CATEGORIES_PATH } from "./category-params";

interface BuildColumnsOptions {
  params: SearchParams;
  /** Only the Platform Owner gets the Edit / Retire buttons. */
  canManage: boolean;
}

export function buildCategoryColumns({ params, canManage }: BuildColumnsOptions): TableColumn<CategoryWithCount>[] {
  const getDialogHref = (dialog: string, categoryId: string) =>
    withParams(CATEGORIES_PATH, params, { dialog, id: categoryId, notice: undefined, noticeTone: undefined });

  const columns: TableColumn<CategoryWithCount>[] = [
    {
      id: "category",
      header: "Category",
      cell: (category) => (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <span className="flex items-center gap-2">
            <CategoryTag name={category.name} />
            {!category.active && (
              <span className="bg-status-deleted-bg px-1.5 py-0.5 text-[11px] font-semibold text-status-deleted-fg">Retired</span>
            )}
          </span>
          {category.typical && <span className="max-w-full truncate text-xs text-ink-muted">{category.typical}</span>}
        </div>
      ),
    },
    { id: "mails", header: "Mails", cell: (category) => <span className="text-sm">{category.mailCount}</span> },
    { id: "sla", header: "SLA (hours)", cell: (category) => <span className="text-sm">{category.slaHours} h</span> },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: (category) => (
        <>
          <ButtonLink href={getDialogHref("edit", category.id)}>Edit</ButtonLink>
          {category.system ? (
            <span className="ml-1 text-[13px] text-ink-muted">System category</span>
          ) : (
            category.active && (
              <ButtonLink href={getDialogHref("retire", category.id)} variant="danger">
                Retire
              </ButtonLink>
            )
          )}
        </>
      ),
    });
  }
  return columns;
}
