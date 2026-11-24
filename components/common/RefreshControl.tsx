import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatClockTime } from "@/lib/format";
import AutoRefresh from "./AutoRefresh";

interface RefreshControlProps {
  /** The current address. Pressing Refresh loads the same page again with fresh data. */
  href: string;
  /** When the data was fetched (ISO). */
  syncedAt: string;
  /** Refresh by itself every this many seconds. Leave out for manual refresh only. */
  autoRefreshSeconds?: number;
}

const LINK_ID = "refresh-link";

/** "Synced 10:42 · Refresh". The link is a normal soft navigation to the same address, so nothing is lost. */
export default function RefreshControl({ href, syncedAt, autoRefreshSeconds }: RefreshControlProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-muted">Synced {formatClockTime(syncedAt)}</span>
      <Link
        id={LINK_ID}
        href={href}
        replace
        scroll={false}
        prefetch={false}
        className="inline-flex h-9 items-center gap-2 border border-line-input bg-card px-3 text-[13px] font-semibold transition-colors duration-150 ease-out hover:border-ink-faint hover:bg-stripe active:scale-[0.97]"
      >
        <Icon name="refresh" size={14} strokeWidth={2.2} />
        Refresh
      </Link>
      {autoRefreshSeconds && <AutoRefresh everySeconds={autoRefreshSeconds} linkId={LINK_ID} />}
    </div>
  );
}
