"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface TrendSeries {
  name: string;
  color: string;
  /** Inbox list of this category. */
  href: string;
}

interface TrendLinesChartProps {
  /** One row per week: { week: "W1", "Access request": 4, ... }. */
  weeks: Array<Record<string, number | string>>;
  series: TrendSeries[];
  height: number;
}

/** Mails per week for the busiest categories. Hover a week to compare; click a legend name to open that category. */
export default function TrendLinesChart({ weeks, series, height }: TrendLinesChartProps) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={weeks} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="week" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_COLORS.ink, strokeDasharray: "3 3" }} />
          {series.map((item) => (
            <Line key={item.name} type="monotone" dataKey={item.name} stroke={item.color} strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
        {series.map((item) => (
          <li key={item.name}>
            <button type="button" onClick={() => goTo(item.href)} className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink">
              <span className="h-0.5 w-3" style={{ background: item.color }} />
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
