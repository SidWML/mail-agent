import { refreshPage } from "@/actions/refresh";
import Icon from "@/components/ui/Icon";
import { formatClockTime } from "@/lib/format";
import { changeUrl } from "@/lib/url";
import AutoRefresh from "./AutoRefresh";

interface RefreshControlProps {
  /** The current address. Refreshing comes back to it. */
  href: string;
  /** When the data was fetched (ISO). */
  syncedAt: string;
  /** How many mails the page knows about now. Refreshing tells you how many arrived since. Leave out on pages without a list. */
  knownCount?: number;
  /** Refresh by itself every this many seconds. Leave out for manual refresh only. */
  autoRefreshSeconds?: number;
}

const AUTO_BUTTON_ID = "refresh-auto-button";

/** "Synced 10:42 · Refresh". Refresh says what changed; the timer only speaks when something did. */
export default function RefreshControl({ href, syncedAt, knownCount, autoRefreshSeconds }: RefreshControlProps) {
  // A message that is still in the address must not come back after a refresh.
  const returnTo = changeUrl(href, { notice: undefined, noticeTone: undefined });
  const hiddenFields = (
    <>
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="syncedAt" value={syncedAt} />
      {knownCount !== undefined && <input type="hidden" name="knownCount" value={knownCount} />}
    </>
  );

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-muted">Synced {formatClockTime(syncedAt)}</span>
      <form action={refreshPage}>
        {hiddenFields}
        <button
          type="submit"
          className="inline-flex h-9 cursor-pointer items-center gap-2 border border-line-input bg-card px-3 text-[13px] font-semibold transition-colors duration-150 ease-out hover:border-ink-faint hover:bg-stripe active:scale-[0.97]"
        >
          <Icon name="refresh" size={14} strokeWidth={2.2} />
          Refresh
        </button>
      </form>
      {autoRefreshSeconds && (
        <>
          <form action={refreshPage} data-silent hidden>
            {hiddenFields}
            <input type="hidden" name="auto" value="1" />
            <button type="submit" id={AUTO_BUTTON_ID} />
          </form>
          <AutoRefresh everySeconds={autoRefreshSeconds} buttonId={AUTO_BUTTON_ID} />
        </>
      )}
    </div>
  );
}
