import Link from "next/link";
import { removeSavedView, saveCurrentView } from "@/actions/inbox-views";
import ActionFields from "@/components/common/ActionFields";
import Icon from "@/components/ui/Icon";
import type { SavedView } from "@/types/mailbox";
import { INBOX_PATH } from "./inbox-filters";

interface SavedViewsMenuProps {
  views: SavedView[];
  /** Address the actions return to (the current list). */
  returnTo: string;
}

/** "Saved views": jump to a saved filter + sort combination, remove one, or save the current one (FR-12). */
export default function SavedViewsMenu({ views, returnTo }: SavedViewsMenuProps) {
  return (
    <details name="filter-menu" className="dropdown relative">
      <summary className="inline-flex h-10 items-center gap-2 border border-line-input bg-card px-3 text-[13px] font-medium">
        <Icon name="bookmark" size={14} />
        Views
        <span className="bg-table-head px-1.5 py-px text-xs font-semibold text-ink-3">{views.length}</span>
      </summary>

      <div className="absolute top-[calc(100%+4px)] right-0 z-[22] w-[320px] border border-line-control border-t-2 border-t-brand bg-card shadow-[0_6px_18px_rgba(0,0,0,0.1)]">
        <div className="px-3.5 pt-3 pb-2">
          <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">Saved views</p>
          <p className="mt-[3px] text-xs text-ink-muted">Save a filter and sort combination</p>
        </div>

        {views.length === 0 && <p className="border-t border-[#f0f0f0] px-3.5 py-3 text-[13px] text-ink-3">No saved views yet.</p>}
        {views.map((view) => (
          <div key={view.id} className="flex items-center border-t border-[#f0f0f0] hover:bg-stripe">
            <Link href={`${INBOX_PATH}?${view.query}`} className="min-w-0 flex-1 truncate px-3.5 py-2.5 text-[13.5px] font-medium">
              {view.name}
            </Link>
            <form action={removeSavedView}>
              <ActionFields returnTo={returnTo} />
              <input type="hidden" name="viewId" value={view.id} />
              <button type="submit" title="Remove this view" aria-label={`Remove ${view.name}`} className="cursor-pointer px-3 py-2.5 text-ink-muted hover:text-brand-dark">
                <Icon name="close" size={13} strokeWidth={2.4} />
              </button>
            </form>
          </div>
        ))}

        <form action={saveCurrentView} className="flex items-center gap-2 border-t border-line-soft bg-stripe px-3.5 py-2.5">
          <ActionFields returnTo={returnTo} />
          <input
            name="name"
            required
            maxLength={40}
            placeholder="Name the current view"
            className="h-[30px] min-w-0 flex-1 border border-line-input bg-card px-2.5 text-[13px] outline-none focus:border-brand"
          />
          <button type="submit" className="h-[30px] cursor-pointer bg-brand px-3 text-[12.5px] font-semibold text-white">
            + Save
          </button>
        </form>
      </div>
    </details>
  );
}
