import { saveTemplate } from "@/actions/templates";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import FormField, { SelectInput, TextArea, TextInput } from "@/components/ui/FormField";
import { readParam, type SearchParams } from "@/lib/url";
import type { Category, Template } from "@/types/mailbox";
import { fillPlaceholders, getPreviewSenderName } from "./template-params";

interface TemplateFormProps {
  /** The template being edited. Leave out to add a new one. */
  template?: Template;
  categories: Category[];
  params: SearchParams;
  closeHref: string;
  returnTo: string;
}

const FORM_ID = "template-form";

/** New template / Edit template. The preview shows the saved reply with the placeholders filled in. */
export default function TemplateForm({ template, categories, params, closeHref, returnTo }: TemplateFormProps) {
  const name = readParam(params, "draftName") ?? template?.name;
  const body = readParam(params, "draftBody") ?? template?.body;
  const categoryId = readParam(params, "draftCategory") ?? template?.categoryId ?? "";
  const previewCategory = categories.find((category) => category.id === template?.categoryId);

  return (
    <Modal
      title={template ? "Edit template" : "New template"}
      subtitle="The support team can insert this into a reply. Placeholders are filled in automatically when it is inserted."
      closeHref={closeHref}
      width={640}
      footer={
        <>
          <ButtonLink href={closeHref} large>
            Cancel
          </ButtonLink>
          <Button type="submit" form={FORM_ID} variant="primary" large>
            Save template
          </Button>
        </>
      }
    >
      <form id={FORM_ID} action={saveTemplate} className="flex flex-col gap-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="templateId" value={template?.id ?? ""} />

        <FormField label="Template name" required>
          <TextInput name="name" defaultValue={name} placeholder="For example: Access granted" autoFocus />
        </FormField>

        <FormField label="Use for category (optional)">
          <SelectInput name="categoryId" defaultValue={categoryId}>
            <option value="">Any category</option>
            {categories
              .filter((category) => category.active || category.id === categoryId)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </SelectInput>
        </FormField>

        <FormField label="Reply text" required>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12.5px] text-ink-3">Placeholders you can type</span>
            <span className="inline-flex h-7 items-center border border-[#c9d9f5] bg-status-new-bg px-2.5 text-[12.5px] font-semibold text-status-new-fg">
              ‹sender name›
            </span>
            <span className="inline-flex h-7 items-center border border-[#c9d9f5] bg-status-new-bg px-2.5 text-[12.5px] font-semibold text-status-new-fg">
              ‹category›
            </span>
          </div>
          <TextArea name="body" defaultValue={body} rows={7} className="min-h-[140px] leading-[1.5]" />
        </FormField>

        {template && (
          <div className="border border-line-soft bg-stripe px-3.5 py-3">
            <p className="mb-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">
              Preview for {getPreviewSenderName()}
            </p>
            <p className="text-[13.5px] leading-[1.6] whitespace-pre-line">
              {fillPlaceholders(template, previewCategory?.name ?? "request")}
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
