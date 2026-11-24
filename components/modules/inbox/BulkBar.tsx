import { startBulkAction } from "@/actions/bulk-actions";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import type { Role } from "@/types/mailbox";
import { BULK_FORM_ID } from "./inbox-columns";

interface BulkAction {
  label: string;
  /** Matches the dialog name: ?dialog=bulk-<value>. */
  value: "acted" | "assign" | "recategorize" | "delete";
  icon: IconName;
}

/** Which bulk buttons each role gets (permission matrix: Owner = acted, assign, category, delete; Agent = acted, category). */
const BULK_ACTIONS_BY_ROLE: Partial<Record<Role, BulkAction[]>> = {
  owner: [
    { label: "Mark as acted", value: "acted", icon: "check" },
    { label: "Assign", value: "assign", icon: "person" },
    { label: "Recategorize", value: "recategorize", icon: "tag" },
    { label: "Delete", value: "delete", icon: "trash" },
  ],
  agent: [
    { label: "Mark as acted", value: "acted", icon: "check" },
    { label: "Recategorize", value: "recategorize", icon: "tag" },
  ],
};

/**
 * Dark bar that appears when rows are ticked. It is hidden by CSS until a checkbox is ticked,
 * and "n selected" is a CSS counter. Each button submits the ticked rows and opens its confirmation dialog.
 */
export default function BulkBar({ role }: { role: Role }) {
  const actions = BULK_ACTIONS_BY_ROLE[role];
  if (!actions) return null;

  return (
    <div className="bulk-bar order-4 flex-wrap items-center gap-3 bg-bar-dark px-5 py-2.5 text-white">
      <span className="bulk-count text-[13px] font-semibold" />
      <span className="text-[12.5px] text-[#bdbdbd]">Up to 100 mails at once, with one confirmation</span>
      <div className="ml-auto flex gap-2">
        {actions.map((action) => (
          // The chosen action is bound into the server action: a button with a formAction cannot also carry a name.
          <Button key={action.value} type="submit" form={BULK_FORM_ID} formAction={startBulkAction.bind(null, action.value)} variant="dark">
            <Icon name={action.icon} size={14} />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
