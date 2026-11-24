"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface ResponseRow {
  /** Short name on the axis. */
  short: string;
  /** Full name in the hover box. */
  name: string;
  median: number;
  p90: number;
  href: string;
}

/** Median and slowest-10% reply time per category, in hours. Click a pair to open that category's mails. */
export default function GroupedColumnsChart({ rows, height }: { rows: ResponseRow[]; height: number }) {
  return (
    <div className="[&_.recharts-bar-rectangle]:cursor-pointer [&_.recharts-bar-rectangle:hover]:opacity-80">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} margin={{ top: 6, right: 4, bottom: 0, left: -22 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="short" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} unit="h" />
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload as never} title={(payload?.[0]?.payload as ResponseRow | undefined)?.name} unit=" h" />
            )}
            cursor={{ fill: "#f3f3f4" }}
          />
          <Bar dataKey="median" name="Median" fill={CHART_COLORS.red} onClick={(_, index) => goTo(rows[index]?.href)} />
          <Bar dataKey="p90" name="Slowest 10%" fill={CHART_COLORS.grey} onClick={(_, index) => goTo(rows[index]?.href)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
