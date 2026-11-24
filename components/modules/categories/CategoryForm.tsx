import { saveCategory } from "@/actions/categories";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import FormField, { TextArea, TextInput } from "@/components/ui/FormField";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { readParam, type SearchParams } from "@/lib/url";
import type { CategoryWithCount } from "@/types/api";

interface CategoryFormProps {
  /** The category being edited. Leave out to add a new one. */
  category?: CategoryWithCount;
  params: SearchParams;
  closeHref: string;
  returnTo: string;
}

const FORM_ID = "category-form";

/** Add category / Edit category. After a validation error the typed values come back through the address. */
export default function CategoryForm({ category, params, closeHref, returnTo }: CategoryFormProps) {
  const isEdit = category !== undefined;
  const name = readParam(params, "draftName") ?? category?.name;
  const typical = readParam(params, "draftTypical") ?? category?.typical;
  const slaHours = readParam(params, "draftSla") ?? category?.slaHours;

  return (
    <Modal
      title={isEdit ? "Edit category" : "Add category"}
      subtitle="Changes apply immediately. No software release is needed."
      closeHref={closeHref}
      width={640}
      footer={
        <>
          <ButtonLink href={closeHref} large>
            Cancel
          </ButtonLink>
          <Button type="submit" form={FORM_ID} variant="primary" large>
            Save category
          </Button>
        </>
      }
    >
      <form id={FORM_ID} action={saveCategory} className="flex flex-col gap-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="categoryId" value={category?.id ?? ""} />

        <FormField label="Category name" required>
          <TextInput name="name" defaultValue={name} placeholder="For example: Billing question" autoFocus />
        </FormField>

        <FormField label="Typical mail (helps the AI)" required>
          <TextArea
            name="typical"
            defaultValue={typical}
            placeholder="Describe the kind of mail that belongs here"
            className="min-h-[70px]"
          />
        </FormField>

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold">
            SLA: reply within<span className="ml-0.5 text-brand"> *</span>
          </span>
          <div className="flex items-center gap-2.5">
            <TextInput
              type="number"
              name="slaHours"
              min={1}
              defaultValue={slaHours}
              aria-label="SLA in hours"
              className="w-[110px] max-w-[110px] flex-none"
            />
            <span className="text-[13.5px] text-ink-3">hours</span>
            <span className="ml-2 text-xs text-[#8a8a8a]">Mails past this time count as an SLA breach and trigger an alert.</span>
          </div>
        </div>

        {isEdit && (
          <ToggleSwitch
            name="recategorize"
            label="Re-categorize existing mails"
            description="Apply the change to mails already in the mailbox, not only to new mail."
          />
        )}
        <ToggleSwitch
          name="active"
          label="Active"
          description="Retired categories are no longer chosen by the AI, but old mails keep them."
          defaultChecked={category?.active ?? true}
        />
      </form>
    </Modal>
  );
}
