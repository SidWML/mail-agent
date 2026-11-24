/** How a category's weekly count moved: last week against the week before. */
export interface TrendChange {
  /** Text next to the line, for example "↑ 12%", "→ flat" or "↑ new". */
  label: string;
  /** Percent change, used to find the fastest riser. 0 when flat. */
  percent: number;
}

const FLAT_BELOW_PERCENT = 5;

export function getTrendChange(weeks: number[]): TrendChange {
  const last = weeks[weeks.length - 1] ?? 0;
  const before = weeks[weeks.length - 2] ?? 0;

  if (before === 0 && last === 0) return { label: "→ flat", percent: 0 };
  if (before === 0) return { label: "↑ new", percent: 100 };

  const percent = Math.round(((last - before) / before) * 100);
  if (Math.abs(percent) < FLAT_BELOW_PERCENT) return { label: "→ flat", percent: 0 };
  return { label: `${percent > 0 ? "↑" : "↓"} ${Math.abs(percent)}%`, percent };
}
