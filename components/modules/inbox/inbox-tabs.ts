import type { InboxTab } from "@/types/api";
import type { Role } from "@/types/mailbox";

export const INBOX_TAB_LABELS: Record<InboxTab, string> = {
  active: "Active",
  mine: "My items",
  unassigned: "Unassigned",
  acted: "Acted / Closed",
  all: "All",
  deleted: "Deleted",
};

/** Tabs each role sees, in order. Deleted is for the Platform Owner only. */
const TABS_BY_ROLE: Record<Role, InboxTab[]> = {
  owner: ["active", "mine", "unassigned", "acted", "all", "deleted"],
  agent: ["active", "mine", "unassigned", "acted", "all"],
  viewer: ["active", "unassigned", "acted", "all"],
  none: [],
};

export function getTabsForRole(role: Role) {
  return TABS_BY_ROLE[role];
}

export function isInboxTab(value: string | undefined): value is InboxTab {
  return value !== undefined && value in INBOX_TAB_LABELS;
}

const VIEWER_SUBTITLE = "Read-only. You can search, open mails and see the dashboard, but not reply, change status or delete.";

const PAGE_TITLES: Record<InboxTab, { title: string; subtitle: string }> = {
  active: { title: "Inbox", subtitle: "Every mail that still needs an owner or a reply, newest first." },
  mine: { title: "My items", subtitle: "Mails you own. Reply, wait for the sender, or mark them acted." },
  unassigned: { title: "Unassigned", subtitle: "Nobody owns these yet. Take one so everyone knows you are on it." },
  acted: {
    title: "Acted / Closed",
    subtitle: "Handled mails. They are hidden from the Active view; reopen one if more work is needed.",
  },
  all: { title: "All mails", subtitle: "Every mail in every status." },
  deleted: {
    title: "Deleted",
    subtitle: "Soft-deleted mails stay here for 30 days and can be restored. Only the Platform Owner sees this tab.",
  },
};

export function getPageTitle(tab: InboxTab, role: Role) {
  const page = PAGE_TITLES[tab];
  return role === "viewer" ? { ...page, subtitle: VIEWER_SUBTITLE } : page;
}

/** "Showing 8 of 47 active mails" - only the Active tab says "active". */
export function getFooterSummary(tab: InboxTab, shown: number, total: number) {
  return `Showing ${shown} of ${total} ${tab === "active" ? "active " : ""}mails`;
}
