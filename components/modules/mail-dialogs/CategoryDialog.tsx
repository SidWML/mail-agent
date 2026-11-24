import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import { CATEGORY_ICONS } from "@/lib/icons";
import type { CategoryWithCount } from "@/types/api";

interface CategoryDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  categories: CategoryWithCount[];
  /** Category the mail has now (preselected). */
  currentCategoryId?: string;
  /** Category the AI chose, shown with an "AI suggested" tag. */
  aiCategoryId?: string;
  aiCategoryName?: string;
  confidencePercent?: number;
  bulkCount?: number;
}

/** Override the category. A reason is required; before and after go to the audit log. */
export default function CategoryDialog({
  action,
  hiddenFields,
  closeHref,
  categories,
  currentCategoryId,
  aiCategoryId,
  aiCategoryName,
  confidencePercent,
  bulkCount,
}: CategoryDialogProps) {
  return (
    <Modal
      title={bulkCount ? `Change category of ${bulkCount} mails` : "Change category"}
      subtitle="Override the AI category. A reason is required."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            Save category
          </Button>
        </>
      }
    >
      <p className="mb-2 text-[13px] font-semibold">
        New category <span className="text-brand">*</span>
      </p>
      <div className="max-h-[330px] overflow-y-auto border border-line-control">
        {categories
          .filter((category) => category.active)
          .map((category) => (
            <label
              key={category.id}
              className="flex h-[37px] cursor-pointer items-center gap-2.5 border-t border-[#f0f0f0] px-3 text-[13.5px] first:border-t-0 has-checked:bg-brand-tint-soft has-checked:font-semibold"
            >
              <input
                type="radio"
                name="categoryId"
                value={category.id}
                required
                defaultChecked={category.id === currentCategoryId}
                className="peer sr-only"
              />
              <span className="flex w-4 justify-center text-brand opacity-0 peer-checked:opacity-100">
                <Icon name="check" size={14} strokeWidth={2.5} />
              </span>
              <Icon name={CATEGORY_ICONS[category.name] ?? "tag"} size={15} strokeWidth={1.9} className="text-brand" />
              <span>{category.name}</span>
              {category.id === aiCategoryId && (
                <span className="ml-auto bg-status-progress-bg px-2 py-0.5 text-[11px] font-semibold text-status-progress-fg">AI suggested</span>
              )}
            </label>
          ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-semibold">
          Reason for the change <span className="text-brand">*</span>
        </span>
        <TextArea name="reason" required placeholder="Tell us why the AI got it wrong. This helps improve the sorting." className="min-h-[70px]" />
      </label>

      {aiCategoryName && (
        <p className="mt-3 flex gap-2 text-[12.5px] text-ink-3">
          <Icon name="sparkles" size={12} filled className="mt-0.5 text-brand" />
          AI chose “{aiCategoryName}”{confidencePercent !== undefined ? ` with ${confidencePercent}% confidence` : ""}. The list is the
          category list the Platform Owner manages.
        </p>
      )}
    </Modal>
  );
}
