"use client";

interface TooltipEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
  payload?: { fill?: string; name?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  /** Text after each number, for example "h" or "%". */
  unit?: string;
  /** Replaces the label (for example a long category name). */
  title?: string;
}

/** Small dark hover box shared by every chart: a title and one row per series. */
export default function ChartTooltip({ active, payload, label, unit = "", title }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const heading = title ?? (label !== undefined && label !== "" ? String(label) : payload[0]?.payload?.name);

  return (
    <div className="min-w-[110px] bg-[#1a1a1c] px-3 py-2 text-xs text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
      {heading && <p className="mb-1 font-semibold">{heading}</p>}
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="flex items-center gap-2">
          <span className="size-2 shrink-0" style={{ background: entry.color ?? entry.payload?.fill }} />
          <span className="text-[#bdbdbd]">{entry.name}</span>
          <span className="ml-auto pl-3 font-semibold">
            {entry.value}
            {unit}
          </span>
        </p>
      ))}
      <p className="mt-1 text-[10.5px] text-[#9a9da4]">Click to see the mails</p>
    </div>
  );
}
