import { retireCategoryById } from "@/actions/categories";
import Modal from "@/components/common/Modal";
import Button, { ButtonLink } from "@/components/ui/Button";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import type { CategoryWithCount } from "@/types/api";

interface RetireCategoryDialogProps {
  category: CategoryWithCount;
  closeHref: string;
  returnTo: string;
}

const FORM_ID = "retire-form";

export default function RetireCategoryDialog({ category, closeHref, returnTo }: RetireCategoryDialogProps) {
  return (
    <Modal
      title="Retire category"
      subtitle="It can no longer be picked by the AI or by agents."
      closeHref={closeHref}
      width={600}
      footer={
        <>
          <ButtonLink href={closeHref} large>
            Cancel
          </ButtonLink>
          <Button type="submit" form={FORM_ID} variant="dangerSolid" large>
            Retire category
          </Button>
        </>
      }
    >
      <form id={FORM_ID} action={retireCategoryById} className="flex flex-col gap-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="categoryId" value={category.id} />

        <p className="text-sm leading-[1.5]">
          Retire <strong>{category.name}</strong>? The AI will stop choosing it. The {category.mailCount}{" "}
          {category.mailCount === 1 ? "mail that already has" : "mails that already have"} it keep it unless you re-categorize them.
        </p>

        <ToggleSwitch name="recategorize" label="Re-categorize existing mails" description="Move them to Needs review." />
      </form>
    </Modal>
  );
}
