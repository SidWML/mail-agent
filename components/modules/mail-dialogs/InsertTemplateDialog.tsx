import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import CategoryTag from "@/components/ui/CategoryTag";
import type { CategoryWithCount } from "@/types/api";
import type { Template } from "@/types/mailbox";

interface InsertTemplateDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  templates: Template[];
  categories: CategoryWithCount[];
  suggestedIds: string[];
  searchText: string;
  senderName: string;
  categoryName: string;
}

/** Pick a reply template. ‹sender name› and ‹category› are filled in; the text can still be edited. */
export default function InsertTemplateDialog({
  action,
  hiddenFields,
  closeHref,
  templates,
  categories,
  suggestedIds,
  searchText,
  senderName,
  categoryName,
}: InsertTemplateDialogProps) {
  const visible = templates.filter((template) => template.name.toLowerCase().includes(searchText.toLowerCase()));
  // The first suggested template is preselected; if none is suggested, the first one in the list.
  const preselected = visible.find((template) => suggestedIds.includes(template.id)) ?? visible[0];

  return (
    <Modal
      title="Insert template"
      subtitle={`Placeholders are filled with ${senderName} and ${categoryName}. You can edit the text before sending.`}
      closeHref={closeHref}
      action={action}
      hiddenFields={
        <>
          {hiddenFields}
          <input type="hidden" name="senderFirstName" value={senderName.split(" ")[0]} />
          <input type="hidden" name="categoryName" value={categoryName} />
        </>
      }
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" name="intent" value="insert" variant="primary" large>
            Insert into reply
          </Button>
        </>
      }
    >
      <label className="flex h-10 items-center gap-2.5 border border-line-control px-3">
        <Icon name="search" size={16} className="text-ink-muted" />
        <input
          name="tplq"
          defaultValue={searchText}
          placeholder="Search templates (press Enter)"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      <div className="mt-4 border border-line-control">
        {visible.length === 0 && <p className="px-3.5 py-4 text-sm text-ink-3">No templates match.</p>}
        {visible.map((template) => {
          const category = categories.find((item) => item.id === template.categoryId);
          return (
            <label
              key={template.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-[#f0f0f0] px-3.5 text-[13.5px] font-semibold first:border-t-0 has-checked:bg-brand-tint-soft"
            >
              <input
                type="radio"
                name="templateId"
                value={template.id}
                defaultChecked={template.id === preselected?.id}
                className="sr-only"
              />
              <span className="mr-auto">{template.name}</span>
              {category && <CategoryTag name={category.name} />}
              {suggestedIds.includes(template.id) && (
                <span className="bg-ok-bg px-2 py-0.5 text-[11px] font-bold text-ok-dark">Suggested</span>
              )}
            </label>
          );
        })}
      </div>
    </Modal>
  );
}
