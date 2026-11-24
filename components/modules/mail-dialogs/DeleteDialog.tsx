import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

interface DeleteDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  /** Sender and subject of the one mail being deleted. */
  sender?: string;
  subject?: string;
  bulkCount?: number;
}

/** Soft delete: the mail goes to the Deleted tab for 30 days. */
export default function DeleteDialog({ action, hiddenFields, closeHref, sender, subject, bulkCount }: DeleteDialogProps) {
  return (
    <Modal
      title={bulkCount ? `Delete ${bulkCount} mails?` : "Delete this mail?"}
      subtitle="Only the Platform Owner can delete."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="dangerSolid" large>
            {bulkCount ? "Delete mails" : "Delete mail"}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 bg-[#fde7e9] px-4 py-3.5 text-sm text-brand-dark">
        <Icon name="trash" size={16} className="mt-0.5" />
        <p>
          {bulkCount ? "These mails move" : "This mail moves"} to the Deleted tab. You can restore {bulkCount ? "them" : "it"} for 30
          days; after that {bulkCount ? "they are" : "it is"} gone for good.
        </p>
      </div>
      {sender && (
        <p className="mt-4 text-sm">
          <strong className="font-semibold">{sender}</strong> · {subject}
        </p>
      )}
    </Modal>
  );
}
