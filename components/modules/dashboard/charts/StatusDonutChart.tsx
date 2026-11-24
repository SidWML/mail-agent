"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
  /** Inbox list for this slice. */
  href: string;
}

interface StatusDonutChartProps {
  slices: DonutSlice[];
  height: number;
  /** Big number in the middle, for example the total of open mails. */
  centerValue: number;
  centerLabel: string;
}

/** Donut with the total in the middle and a legend underneath. Hover a slice for its count; click it to open its mails. */
export default function StatusDonutChart({ slices, height, centerValue, centerLabel }: StatusDonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative shrink-0 [&_.recharts-sector]:cursor-pointer [&_.recharts-sector:hover]:opacity-85" style={{ width: height - 40, height: height - 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke="none"
              onClick={(_, index) => goTo(slices[index]?.href)}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl leading-none font-light">{centerValue}</span>
          <span className="text-[10.5px] text-ink-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex w-full min-w-0 flex-col gap-1">
        {slices.map((slice) => (
          <li key={slice.name}>
            <a href={slice.href} className="flex items-center gap-2 text-xs hover:underline">
              <span className="size-2.5 shrink-0" style={{ background: slice.color }} />
              <span className="truncate">{slice.name}</span>
              <span className="ml-auto font-semibold">{slice.value}</span>
              <span className="w-9 text-right text-ink-muted">{Math.round((slice.value / total) * 100)}%</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
