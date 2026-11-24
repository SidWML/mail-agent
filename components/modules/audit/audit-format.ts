import type { AuditEntry } from "@/types/mailbox";

const pad = (value: number) => String(value).padStart(2, "0");

/** "Today 10:42", "Yesterday 16:30", then "21 Nov 14:10". */
export function formatAuditTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86400_000);

  if (daysAgo === 0) return `Today ${time}`;
  if (daysAgo === 1) return `Yesterday ${time}`;
  return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${time}`;
}

/** The "Before → after" cell: both values with an arrow, or whichever one exists. */
export function formatChange(entry: AuditEntry) {
  if (entry.before && entry.after) return `${entry.before} → ${entry.after}`;
  return entry.before ?? entry.after ?? entry.detail ?? "";
}
