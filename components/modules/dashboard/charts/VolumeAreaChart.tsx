"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo, readClickedIndex } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface VolumePoint {
  /** "11 Nov" */
  label: string;
  received: number;
  acted: number;
  /** Inbox list for this day. */
  href: string;
}

/** Mails received and acted per day. Hover for the numbers, click a day to open that day's mails. */
export default function VolumeAreaChart({ points, height }: { points: VolumePoint[]; height: number }) {
  return (
    <div className="[&_.recharts-wrapper]:cursor-pointer">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={points}
          margin={{ top: 6, right: 8, bottom: 0, left: -18 }}
          onClick={(state) => {
            const index = readClickedIndex(state);
            if (index !== undefined) goTo(points[index]?.href);
          }}
        >
          <defs>
            <linearGradient id="received-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_COLORS.ink, strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="received"
            name="Received"
            stroke={CHART_COLORS.red}
            strokeWidth={2}
            fill="url(#received-fill)"
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="acted"
            name="Acted"
            stroke={CHART_COLORS.ink}
            strokeWidth={1.75}
            strokeDasharray="4 3"
            fill="none"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
