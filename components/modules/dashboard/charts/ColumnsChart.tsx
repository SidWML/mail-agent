"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";
import type { BarRow } from "./HorizontalBarsChart";

interface ColumnsChartProps {
  rows: BarRow[];
  height: number;
  valueName: string;
}

/** Vertical columns, one colour per column (the backlog by age). Click a column to open its mails. */
export default function ColumnsChart({ rows, height, valueName }: ColumnsChartProps) {
  return (
    <div className="[&_.recharts-bar-rectangle]:cursor-pointer [&_.recharts-bar-rectangle:hover]:opacity-80">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} margin={{ top: 16, right: 4, bottom: 0, left: -26 }}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f3f4" }} />
          <Bar dataKey="value" name={valueName} onClick={(_, index) => goTo(rows[index]?.href)}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.color ?? CHART_COLORS.red} />
            ))}
            <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 600, fill: CHART_COLORS.ink }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
