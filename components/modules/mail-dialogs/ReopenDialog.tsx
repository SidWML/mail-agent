import type { ReactNode } from "react";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";

interface ReopenDialogProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  closeHref: string;
  /** Name of the owner the mail goes back to. */
  previousOwnerName?: string;
}

export default function ReopenDialog({ action, hiddenFields, closeHref, previousOwnerName }: ReopenDialogProps) {
  return (
    <Modal
      title="Reopen mail"
      subtitle="Use this when a closed mail needs more work."
      closeHref={closeHref}
      action={action}
      hiddenFields={hiddenFields}
      footer={
        <>
          <ButtonLink href={closeHref} variant="neutral" large>
            Cancel
          </ButtonLink>
          <Button type="submit" variant="primary" large>
            Reopen
          </Button>
        </>
      }
    >
      <p className="text-sm leading-[1.5]">
        The mail goes back to <strong className="font-semibold">In progress</strong> and returns to the Active view.
        {previousOwnerName && (
          <>
            {" "}
            It goes back to its previous owner, <strong className="font-semibold">{previousOwnerName}.</strong>
          </>
        )}
      </p>
      <p className="mt-3 text-[12.5px] text-ink-3">A new reply from the sender also reopens a mail automatically.</p>
    </Modal>
  );
}
