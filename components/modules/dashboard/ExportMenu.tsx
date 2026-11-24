import Icon from "@/components/ui/Icon";
import type { DashboardFilters } from "./dashboard-filters";
import PrintButton from "./PrintButton";

/** "Export": the numbers behind every chart as an Excel-ready file, or the page as a PDF through the print dialog (DB-13). */
export default function ExportMenu({ filters }: { filters: DashboardFilters }) {
  const query = new URLSearchParams({ days: String(filters.days), format: "csv" });
  if (filters.category) query.set("category", filters.category);
  if (filters.assignee) query.set("assignee", filters.assignee);

  const itemClassName = "flex w-full cursor-pointer items-center gap-2.5 border-t border-[#f0f0f0] px-3.5 py-2.5 text-left text-[13.5px] font-medium hover:bg-stripe";

  return (
    <details name="filter-menu" className="dropdown relative">
      <summary className="inline-flex h-10 items-center gap-2 border border-line-input bg-card px-3.5 text-[13px] font-semibold">
        <Icon name="download" size={14} />
        Export
        <Icon name="chevronDown" size={12} strokeWidth={2.5} />
      </summary>
      <div className="absolute top-[calc(100%+4px)] right-0 z-[22] w-[270px] border border-line-control border-t-2 border-t-brand bg-card shadow-[0_6px_18px_rgba(0,0,0,0.1)]">
        <div className="px-3.5 pt-3 pb-2">
          <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted uppercase">Export</p>
          <p className="mt-[3px] text-xs text-ink-muted">Uses the range, category and assignee you chose</p>
        </div>
        <a href={`/api/dashboard?${query.toString()}`} download className={itemClassName}>
          <Icon name="document" size={15} />
          <span>
            Excel (CSV)
            <span className="block text-xs font-normal text-ink-muted">All numbers, one block per chart</span>
          </span>
        </a>
        <PrintButton className={itemClassName}>
          <Icon name="document" size={15} />
          <span>
            PDF (print this page)
            <span className="block text-xs font-normal text-ink-muted">Choose “Save as PDF” in the print dialog</span>
          </span>
        </PrintButton>
      </div>
    </details>
  );
}
