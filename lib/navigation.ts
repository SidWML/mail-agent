import type { IconName } from "@/lib/icons";
import type { Role } from "@/types/mailbox";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Inbox", href: "/inbox", icon: "inbox", roles: ["owner", "agent", "viewer"] },
  { label: "Dashboard", href: "/dashboard", icon: "chart", roles: ["owner", "agent", "viewer"] },
  { label: "Categories & SLAs", href: "/categories", icon: "tag", roles: ["owner"] },
  { label: "Templates", href: "/templates", icon: "document", roles: ["owner"] },
  { label: "Audit log", href: "/audit", icon: "list", roles: ["owner"] },
  { label: "AI settings", href: "/settings", icon: "settings", roles: ["owner"] },
];

/** Role names exactly as the header chip shows them. */
export const ROLE_LABELS: Record<Role, string> = {
  owner: "Platform Owner",
  agent: "Support team member",
  viewer: "Viewer",
  none: "No access",
};
