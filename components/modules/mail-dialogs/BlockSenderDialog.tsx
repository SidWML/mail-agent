import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

interface BlockSenderDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  senderEmail: string;
}

export default function BlockSenderDialog({ action, hiddenFields, closeHref, senderEmail }: BlockSenderDialogProps) {
  return (
    <Modal
      title="Mark as spam and block sender"
      subtitle="Stop unwanted mail from reaching the queue."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="dangerSolid" large>
            Block sender
          </Button>
        </>
      }
    >
      <div className="flex gap-3 bg-[#fde7e9] px-4 py-3.5 text-sm text-brand-dark">
        <Icon name="lock" size={16} className="mt-0.5" />
        <p>
          Future mail from <strong className="font-semibold">{senderEmail}</strong> will be sorted into Spam automatically.
        </p>
      </div>
      <p className="mt-4 text-[13.5px] text-ink-3">This mail will also be marked as acted with the outcome Spam.</p>
    </Modal>
  );
}
