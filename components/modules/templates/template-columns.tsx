import type { TableColumn } from "@/components/common/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import CategoryTag from "@/components/ui/CategoryTag";
import { withParams, type SearchParams } from "@/lib/url";
import type { Category, Template } from "@/types/mailbox";
import { TEMPLATES_PATH } from "./template-params";

interface BuildColumnsOptions {
  params: SearchParams;
  categories: Category[];
  /** Only the Platform Owner gets the Edit / Delete buttons. */
  canManage: boolean;
}

/** First line of the reply, cut short, as in "Hello ‹sender name›, your access request has been approved...". */
function getPreviewText(body: string) {
  const text = body.replace(/\s+/g, " ").trim();
  return text.length > 70 ? `${text.slice(0, 70).trimEnd()}...` : text;
}

export function buildTemplateColumns({ params, categories, canManage }: BuildColumnsOptions): TableColumn<Template>[] {
  const getDialogHref = (dialog: string, templateId: string) =>
    withParams(TEMPLATES_PATH, params, { dialog, id: templateId, notice: undefined, noticeTone: undefined });

  const columns: TableColumn<Template>[] = [
    { id: "name", header: "Template", cell: (template) => <span className="text-[13.5px] font-semibold">{template.name}</span> },
    {
      id: "category",
      header: "Category",
      cell: (template) => {
        const category = categories.find((item) => item.id === template.categoryId);
        return category ? <CategoryTag name={category.name} /> : <span className="text-[12.5px] text-ink-muted">Any category</span>;
      },
    },
    {
      id: "preview",
      header: "Preview",
      cell: (template) => <span className="truncate text-[13px] text-ink-2">{getPreviewText(template.body)}</span>,
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: (template) => (
        <>
          <ButtonLink href={getDialogHref("edit", template.id)}>Edit</ButtonLink>
          <ButtonLink href={getDialogHref("delete", template.id)} variant="danger">
            Delete
          </ButtonLink>
        </>
      ),
    });
  }
  return columns;
}
