import Link from "next/link";
import { cookies } from "next/headers";
import { markAlertsRead } from "@/actions/alerts-bell";
import { ALERTS_SEEN_COOKIE } from "@/lib/alerts-cookie";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { getAlerts } from "@/services/alerts";
import type { Alert } from "@/types/mailbox";

const KIND_STYLES: Record<Alert["kind"], { icon: IconName; label: string; tone: string }> = {
  high_urgency: { icon: "warning", label: "High urgency", tone: "bg-urgency-high-bg text-urgency-high-fg" },
  sla_breach: { icon: "clock", label: "SLA breach", tone: "bg-status-progress-bg text-status-progress-fg" },
  digest: { icon: "document", label: "Daily digest", tone: "bg-status-new-bg text-status-new-fg" },
  sync: { icon: "refresh", label: "Sync", tone: "bg-[#ececec] text-ink-2" },
};

const SHOWN_ALERTS = 5;

/** The bell in the header: how many alerts are new, the latest few, and a link to all of them. */
export default async function AlertsBell() {
  const [alerts, store] = await Promise.all([getAlerts(), cookies()]);
  const seenAt = store.get(ALERTS_SEEN_COOKIE)?.value ?? "";
  const unread = alerts.filter((alert) => alert.at > seenAt);

  return (
    <details name="filter-menu" className="dropdown group relative">
      <summary
        className="relative flex size-11 items-center justify-center border border-line-control bg-card text-ink-2 transition-colors duration-150 ease-out hover:border-ink-faint hover:bg-stripe group-open:border-brand"
        title={unread.length > 0 ? `${unread.length} new alerts` : "Alerts"}
        aria-label={`Alerts, ${unread.length} new`}
      >
        <Icon name="bell" size={19} strokeWidth={1.9} />
        {unread.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] items-center justify-center bg-brand px-1 text-[11px] leading-[18px] font-bold text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </summary>

      <div className="absolute top-[calc(100%+8px)] right-0 z-[22] w-[380px] border border-line-control border-t-2 border-t-brand bg-card shadow-[0_6px_18px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">Alerts</p>
            <p className="mt-[3px] text-xs text-ink-muted">{unread.length > 0 ? `${unread.length} new since you last looked` : "You are up to date"}</p>
          </div>
          {unread.length > 0 && (
            <form action={markAlertsRead}>
              <button type="submit" className="cursor-pointer text-xs font-semibold text-brand transition-opacity duration-150 hover:opacity-75">
                Mark all as read
              </button>
            </form>
          )}
        </div>

        {alerts.length === 0 && <p className="border-t border-[#f0f0f0] px-3.5 py-4 text-[13px] text-ink-3">No alerts yet.</p>}
        {alerts.slice(0, SHOWN_ALERTS).map((alert) => {
          const style = KIND_STYLES[alert.kind];
          const isNew = alert.at > seenAt;
          const href = alert.mailIds?.[0] ? `/inbox?tab=all&mail=${alert.mailIds[0]}` : "/alerts";
          return (
            <Link
              key={alert.id}
              href={href}
              className={cn(
                "flex gap-3 border-t border-[#f0f0f0] px-3.5 py-2.5 transition-colors duration-150 ease-out hover:bg-stripe",
                isNew && "bg-brand-tint-soft",
              )}
            >
              <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center", style.tone)}>
                <Icon name={style.icon} size={14} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">{alert.title}</span>
                <span className="block text-xs text-ink-muted">
                  {style.label} · {alert.channel} · {formatMessageTime(alert.at)}
                </span>
              </span>
            </Link>
          );
        })}

        <Link href="/alerts" className="block border-t border-line-soft bg-stripe px-3.5 py-2.5 text-center text-[12.5px] font-semibold text-brand">
          See all alerts →
        </Link>
      </div>
    </details>
  );
}
