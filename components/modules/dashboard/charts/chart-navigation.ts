import { goTo as goToAddress } from "@/lib/navigate";

/** Click on a chart: open the inbox list that holds the same mails, without reloading the page. */
export function goTo(href: string | undefined) {
  if (href) goToAddress(href);
}

/** Recharts passes the clicked position as an index in different shapes; this reads it safely. */
export function readClickedIndex(state: unknown): number | undefined {
  const candidate = state as { activeIndex?: string | number; activeTooltipIndex?: string | number } | undefined;
  const raw = candidate?.activeIndex ?? candidate?.activeTooltipIndex;
  const index = Number(raw);
  return Number.isFinite(index) ? index : undefined;
}
