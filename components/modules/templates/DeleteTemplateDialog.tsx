import { deleteTemplateById } from "@/actions/templates";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import type { Template } from "@/types/mailbox";

interface DeleteTemplateDialogProps {
  template: Template;
  closeHref: string;
  returnTo: string;
}

const FORM_ID = "delete-template-form";

export default function DeleteTemplateDialog({ template, closeHref, returnTo }: DeleteTemplateDialogProps) {
  return (
    <Modal
      title="Delete template?"
      subtitle="Only the Platform Owner manages templates."
      closeHref={closeHref}
      width={600}
      footer={
        <>
          <ButtonLink href={closeHref} large>
            Cancel
          </ButtonLink>
          <Button type="submit" form={FORM_ID} variant="dangerSolid" large>
            Delete template
          </Button>
        </>
      }
    >
      <form id={FORM_ID} action={deleteTemplateById}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="templateId" value={template.id} />
        <p className="text-sm leading-[1.5]">
          Delete the template <strong>{template.name}</strong>? Replies already sent are not changed.
        </p>
      </form>
    </Modal>
  );
}
