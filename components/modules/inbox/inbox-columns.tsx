import type { TableColumn } from "@/components/common/DataTable";
import SelectAllCheckbox from "@/components/common/SelectAllCheckbox";
import CategoryTag from "@/components/ui/CategoryTag";
import UrgencyBadge from "@/components/ui/UrgencyBadge";
import type { InboxTab } from "@/types/api";
import type { MailRow, Role, Urgency } from "@/types/mailbox";
import { AgeCell, DeletedCell, OwnerCell, SenderCell, StatusCell, SubjectCell, TimeToActCell } from "./InboxCells";
import InboxRowActions from "./InboxRowActions";

/** Id of the (empty) form that the row checkboxes and the bulk bar buttons belong to. */
export const BULK_FORM_ID = "bulk-form";

export const INBOX_GRID_COLUMNS =
  "32px minmax(130px,1.1fr) minmax(150px,2.2fr) minmax(160px,1fr) minmax(88px,.6fr) minmax(164px,1fr) minmax(116px,.8fr) minmax(88px,.6fr) minmax(214px,1.25fr)";

/** The coloured left edge of a row follows its urgency. */
export const URGENCY_ACCENT: Record<Urgency, string> = {
  High: "border-l-urgency-high-bar",
  Medium: "border-l-urgency-medium-bar",
  Low: "border-l-urgency-low-bar",
};

interface BuildColumnsOptions {
  tab: InboxTab;
  role: Role;
  getMailHref: (mailId: string) => string;
  /** Link to a dialog about one mail, opened over the list. */
  getDialogHref: (mailId: string, dialog: string) => string;
  /** Where a button in a row returns to. */
  getReturnTo: (mailId: string) => string;
}

/** Columns of the inbox table. The 7th column and the last one change with the tab and the role. */
export function buildInboxColumns({ tab, role, getMailHref, getDialogHref, getReturnTo }: BuildColumnsOptions): TableColumn<MailRow>[] {
  const canSelect = role !== "viewer";

  const lastColumnHeader = role === "viewer" ? "Open" : "Quick actions";
  const timeColumn: TableColumn<MailRow> =
    tab === "acted"
      ? { id: "time", header: "Time to act", cell: (mail) => <TimeToActCell mail={mail} /> }
      : tab === "deleted"
        ? { id: "time", header: "Deleted", cell: (mail) => <DeletedCell mail={mail} /> }
        : { id: "time", header: "Age", cell: (mail) => <AgeCell mail={mail} /> };

  return [
    {
      id: "select",
      narrow: true,
      header: canSelect ? <SelectAllCheckbox targetName="mailId" /> : null,
      cell: (mail) =>
        canSelect ? (
          <input
            type="checkbox"
            name="mailId"
            value={mail.id}
            form={BULK_FORM_ID}
            aria-label="Select this mail"
            className="m-0 size-[15px] accent-brand"
          />
        ) : null,
    },
    { id: "sender", header: "Sender", cell: (mail) => <SenderCell mail={mail} /> },
    {
      id: "subject",
      header: "Mail · AI summary",
      cell: (mail) => <SubjectCell mail={mail} href={getMailHref(mail.id)} />,
    },
    { id: "category", header: "Category", cell: (mail) => <CategoryTag name={mail.category} /> },
    { id: "urgency", header: "Urgency", cell: (mail) => <UrgencyBadge urgency={mail.urgency} /> },
    { id: "status", header: "Status", cell: (mail) => <StatusCell mail={mail} /> },
    { id: "owner", header: "Owner", cell: (mail) => <OwnerCell mail={mail} /> },
    timeColumn,
    {
      id: "actions",
      header: lastColumnHeader,
      cell: (mail) => <InboxRowActions
          mail={mail}
          role={role}
          mailHref={getMailHref(mail.id)}
          getDialogHref={(dialog) => getDialogHref(mail.id, dialog)}
          returnTo={getReturnTo(mail.id)}
        />,
    },
  ];
}
