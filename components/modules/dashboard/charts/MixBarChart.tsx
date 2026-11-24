"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { goTo } from "./chart-navigation";
import ChartTooltip from "./ChartTooltip";

export interface MixSegment {
  name: string;
  value: number;
  color: string;
  /** Inbox list for this segment. */
  href: string;
}

interface MixBarChartProps {
  segments: MixSegment[];
  height?: number;
}

/** One stacked bar split into its parts (for example High / Medium / Low). Hover for counts; click a part to open its mails. */
export default function MixBarChart({ segments, height = 30 }: MixBarChartProps) {
  const row = Object.fromEntries(segments.map((segment) => [segment.name, segment.value]));

  return (
    <div className="[&_.recharts-bar-rectangle]:cursor-pointer [&_.recharts-bar-rectangle:hover]:opacity-80">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={[{ label: "mix", ...row }]} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }} stackOffset="expand">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" hide />
          <Tooltip content={<ChartTooltip title="" />} cursor={false} />
          {segments.map((segment) => (
            <Bar
              key={segment.name}
              dataKey={segment.name}
              name={segment.name}
              stackId="mix"
              fill={segment.color}
              onClick={() => goTo(segment.href)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
