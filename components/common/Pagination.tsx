import Link from "next/link";
import { cn } from "@/lib/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Builds the link for a page number. */
  getPageHref: (page: number) => string;
}

const boxClassName = "flex size-[34px] items-center justify-center border text-sm transition-colors duration-150 ease-out hover:bg-stripe";

/** Pages to show: first, last and the ones around the current page, with "…" for gaps. */
function getVisiblePages(currentPage: number, totalPages: number) {
  const wanted = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = [...wanted].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

export default function Pagination({ currentPage, totalPages, getPageHref }: PaginationProps) {
  const previousDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className="flex gap-1.5">
      {previousDisabled ? (
        <span className={cn(boxClassName, "border-line-input bg-card text-[#9a9a9a]")}>‹</span>
      ) : (
        <Link href={getPageHref(currentPage - 1)} className={cn(boxClassName, "border-line-input bg-card")}>
          ‹
        </Link>
      )}

      {getVisiblePages(currentPage, totalPages).map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} className={cn(boxClassName, "border-transparent text-ink-muted")}>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={getPageHref(page)}
            className={cn(
              boxClassName,
              page === currentPage ? "border-brand bg-brand font-semibold text-white" : "border-line-input bg-card",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {nextDisabled ? (
        <span className={cn(boxClassName, "border-line-input bg-card text-[#9a9a9a]")}>›</span>
      ) : (
        <Link href={getPageHref(currentPage + 1)} className={cn(boxClassName, "border-line-input bg-card")}>
          ›
        </Link>
      )}
    </div>
  );
}
