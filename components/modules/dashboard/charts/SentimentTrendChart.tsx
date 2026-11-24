"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, CHART_COLORS } from "./chart-colors";
import { goTo, readClickedIndex } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface SentimentPoint {
  /** "23 Nov" */
  label: string;
  positive: number;
  neutral: number;
  negative: number;
  /** Inbox list for this day. */
  href: string;
}

/** Positive, neutral and negative mails per day (DB-09). Hover a day for the numbers; click it to open that day's mails. */
export default function SentimentTrendChart({ points, height }: { points: SentimentPoint[]; height: number }) {
  return (
    <div className="[&_.recharts-wrapper]:cursor-pointer">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={points}
          margin={{ top: 4, right: 6, bottom: 0, left: -26 }}
          onClick={(state) => {
            const index = readClickedIndex(state);
            if (index !== undefined) goTo(points[index]?.href);
          }}
        >
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={26} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART_COLORS.ink, strokeDasharray: "3 3" }} />
          <Line type="monotone" dataKey="positive" name="Positive" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
          <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#c9c9c9" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
          <Line type="monotone" dataKey="negative" name="Negative" stroke="#e8742a" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
