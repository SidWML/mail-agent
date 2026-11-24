"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface WorkloadRow {
  name: string;
  claimed: number;
  replied: number;
  acted: number;
  /** Inbox list of this person's mails. */
  href: string;
}

/** Claimed, replied and acted per person as one stacked bar each. Click a bar to open that person's mails. */
export default function StackedBarsChart({ rows, height }: { rows: WorkloadRow[]; height: number }) {
  return (
    <div className="[&_.recharts-bar-rectangle]:cursor-pointer [&_.recharts-bar-rectangle:hover]:opacity-80">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap={6}>
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={76} tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f3f4" }} />
          <Bar dataKey="claimed" name="Claimed" stackId="work" fill={CHART_COLORS.grey} onClick={(_, index) => goTo(rows[index]?.href)} />
          <Bar dataKey="replied" name="Replied" stackId="work" fill={CHART_COLORS.red} onClick={(_, index) => goTo(rows[index]?.href)} />
          <Bar dataKey="acted" name="Acted" stackId="work" fill={CHART_COLORS.ink} onClick={(_, index) => goTo(rows[index]?.href)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
