import type { TableColumn } from "@/components/common/DataTable";
import type { AuditEntry } from "@/types/mailbox";
import { formatAuditTime, formatChange } from "./audit-format";

export const AUDIT_COLUMNS: TableColumn<AuditEntry>[] = [
  { id: "when", header: "When", cell: (entry) => <span className="text-[13px]">{formatAuditTime(entry.at)}</span> },
  { id: "who", header: "Who", cell: (entry) => <span className="text-[13px]">{entry.userName}</span> },
  { id: "action", header: "Action", cell: (entry) => <strong className="text-[13px]">{entry.action}</strong> },
  { id: "mail", header: "Mail", cell: (entry) => <span className="text-[13px]">{entry.subject ?? ""}</span> },
  {
    id: "change",
    header: "Before → After",
    cell: (entry) => (
      <div className="flex min-w-0 flex-col justify-center">
        <span className="text-[13px]">{formatChange(entry)}</span>
        {entry.detail && (entry.before || entry.after) && <span className="text-[11.5px] text-ink-muted">{entry.detail}</span>}
      </div>
    ),
  },
];
