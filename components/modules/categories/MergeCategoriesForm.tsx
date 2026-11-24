import { mergeCategoryList } from "@/actions/categories";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import CategoryTag from "@/components/ui/CategoryTag";
import FormField, { SelectInput } from "@/components/ui/FormField";
import Icon from "@/components/ui/Icon";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import type { CategoryWithCount } from "@/types/api";

interface MergeCategoriesFormProps {
  /** Active categories the Owner may merge (not the system one). */
  categories: CategoryWithCount[];
  closeHref: string;
  returnTo: string;
}

const FORM_ID = "merge-form";

/** Pick the categories to merge and the one they go into. Row highlight and tick are CSS. */
export default function MergeCategoriesForm({ categories, closeHref, returnTo }: MergeCategoriesFormProps) {
  return (
    <Modal
      title="Merge categories"
      subtitle="Combine two or more categories into one."
      closeHref={closeHref}
      width={640}
      footer={
        <>
          <ButtonLink href={closeHref} large>
            Cancel
          </ButtonLink>
          <Button type="submit" form={FORM_ID} variant="primary" large>
            Merge categories
          </Button>
        </>
      }
    >
      <form id={FORM_ID} action={mergeCategoryList} className="flex flex-col gap-4">
        <input type="hidden" name="returnTo" value={returnTo} />

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold">
            Merge these categories<span className="ml-0.5 text-brand"> *</span>
          </span>
          <div className="flex max-h-[250px] flex-col gap-2 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex h-[43px] shrink-0 cursor-pointer items-center gap-3 border border-line-control bg-card px-3 has-checked:border-brand has-checked:bg-brand-tint-soft"
              >
                <input type="checkbox" name="sourceId" value={category.id} className="peer sr-only" />
                <span className="flex size-[18px] shrink-0 items-center justify-center border-[1.5px] border-ink-faint bg-card peer-checked:border-brand peer-checked:bg-brand [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                  <Icon name="check" size={12} strokeWidth={3} className="text-white" />
                </span>
                <CategoryTag name={category.name} />
                <span className="ml-auto text-[13px] text-ink-3">
                  {category.mailCount} {category.mailCount === 1 ? "mail" : "mails"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <FormField label="Into" required>
          <SelectInput name="targetId" defaultValue={categories[0]?.id}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <ToggleSwitch
          name="recategorize"
          label="Re-categorize existing mails"
          description="Mails in the merged categories move to the target category."
          defaultChecked
        />
      </form>
    </Modal>
  );
}
