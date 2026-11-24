import Link from "next/link";
import type { ReactNode } from "react";
import NoticeToast from "@/components/common/NoticeToast";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Notice } from "@/lib/notice";
import { NAV_ITEMS } from "@/lib/navigation";
import { getCurrentUser, getUsers } from "@/services/users";
import AlertsBell from "./AlertsBell";
import UserSwitcher from "./UserSwitcher";

interface AppShellProps {
  /** The nav link to highlight, for example "/inbox". */
  activePath: string;
  /** Strip shown under the header, for example the sync warning. */
  banner?: ReactNode;
  /** One-time result message from the last action (use getNotice from lib/notice). */
  notice?: Notice;
  /** Overlays (dialogs, the mail drawer) drawn above the page. */
  overlay?: ReactNode;
  children: ReactNode;
}

/**
 * Fixed one-screen layout: the header (and banner) stay put,
 * only the area below them can scroll if a screen is too small.
 */
export default async function AppShell({ activePath, banner, notice, overlay, children }: AppShellProps) {
  const [currentUser, allUsers] = await Promise.all([getCurrentUser(), getUsers()]);
  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="shrink-0 border-b border-line-header bg-card">
        <div className="flex min-h-16 items-center gap-8 px-6">
          <Link href="/inbox" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center bg-brand text-white">
              <Icon name="mail" size={20} strokeWidth={1.75} />
            </span>
            <span className="flex flex-col">
              <span className="text-base leading-[1.2] font-semibold whitespace-nowrap">Mailbox Agent</span>
              <span className="text-xs text-ink-muted">ai@schindler.com</span>
            </span>
          </Link>

          <nav aria-label="Main" className="flex gap-1 self-stretch">
            {visibleNavItems.map((item) => {
              const active = item.href === activePath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 items-center gap-2 border-b-[3px] px-4 text-sm",
                    active ? "border-brand font-semibold text-ink" : "border-transparent font-medium text-ink-3",
                  )}
                >
                  <Icon name={item.icon} size={18} strokeWidth={1.75} className={active ? "text-brand" : ""} />
                  <span className="max-xl:sr-only">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Viewers get no alerts (see the permission table). */}
            {currentUser.role !== "viewer" && <AlertsBell />}
            <UserSwitcher currentUser={currentUser} allUsers={allUsers} />
          </div>
        </div>
      </header>

      {banner}

      <main id="main-content" tabIndex={-1} className="animate-fade flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-5 pb-4">{children}</main>

      {overlay}
      {notice && <NoticeToast notice={notice} />}
    </div>
  );
}
