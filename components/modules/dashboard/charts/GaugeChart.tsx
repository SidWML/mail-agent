"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  /** 0 to 100 */
  percent: number;
  height: number;
  /** The goal, shown as a tick label under the gauge. */
  target: number;
  fill: string;
  track: string;
}

/** Half-circle gauge with the percentage in the middle. */
export default function GaugeChart({ percent, height, target, fill, track }: GaugeChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart data={[{ name: "SLA", value: percent }]} startAngle={180} endAngle={0} innerRadius="72%" outerRadius="100%" cy="86%">
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar dataKey="value" cornerRadius={0} background={{ fill: track }} fill={fill} angleAxisId={0} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-[26px] leading-none font-light">{percent}%</span>
        <span className="text-[10.5px] opacity-70">answered in time · goal {target}%</span>
      </div>
    </div>
  );
}
