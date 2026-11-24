import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import FormField, { TextArea, TextInput } from "@/components/ui/FormField";

interface ForwardDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  attachmentNames: string[];
}

export default function ForwardDialog({ action, hiddenFields, closeHref, attachmentNames }: ForwardDialogProps) {
  return (
    <Modal
      title="Forward mail"
      subtitle="Send this mail to someone else. The forward is sent from the shared mailbox."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            Forward
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Forward as">
          <TextInput value="ai@schindler.com" readOnly />
        </FormField>
        <FormField label="To" required>
          <TextInput name="to" required placeholder="Type a name or email address" />
        </FormField>
        <FormField label="Message (optional)">
          <TextArea name="note" placeholder="Add a line above the original mail" className="min-h-20" />
        </FormField>
        <p className="text-[13px] text-ink-3">
          The original mail{attachmentNames.length > 0 ? ` and its ${attachmentNames.length === 1 ? "attachment" : "attachments"} ${attachmentNames.join(", ")} are` : " is"}{" "}
          included.
        </p>
      </div>
    </Modal>
  );
}
