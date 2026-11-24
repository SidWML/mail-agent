"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface BarRow {
  name: string;
  value: number;
  /** Inbox list for this bar. */
  href?: string;
  color?: string;
}

interface HorizontalBarsChartProps {
  rows: BarRow[];
  height: number;
  /** Width reserved for the names on the left. */
  labelWidth?: number;
  /** Name of the value in the hover box, for example "Mails". */
  valueName: string;
  unit?: string;
}

/** One bar per row, name on the left, number at the end. Hover for details; click a bar to open its mails. */
export default function HorizontalBarsChart({ rows, height, labelWidth = 104, valueName, unit = "" }: HorizontalBarsChartProps) {
  return (
    <div className="[&_.recharts-bar-rectangle]:cursor-pointer [&_.recharts-bar-rectangle:hover]:opacity-80">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }} barCategoryGap={4}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="name" width={labelWidth} tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: "#f3f3f4" }} />
          <Bar dataKey="value" name={valueName} radius={0} onClick={(_, index) => goTo(rows[index]?.href)}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.color ?? CHART_COLORS.red} />
            ))}
            <LabelList dataKey="value" position="right" style={{ fontSize: 11, fontWeight: 600, fill: CHART_COLORS.ink }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
