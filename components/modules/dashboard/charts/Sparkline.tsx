import { buildLinePoints } from "./chart-geometry";

interface SparklineProps {
  values: number[];
  width: number;
  height: number;
  /** Space kept free above the highest and below the lowest point. */
  padding: { top: number; bottom: number };
  /** Tailwind stroke class, for example "stroke-brand". */
  strokeClass: string;
}

/** A small line with no axes. Each series uses its own scale, so only the shape matters. */
export default function Sparkline({ values, width, height, padding, strokeClass }: SparklineProps) {
  if (values.length < 2) return null;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true" className="shrink-0">
      <polyline
        points={buildLinePoints(values, width, padding.top, height - padding.bottom)}
        fill="none"
        strokeWidth={2}
        className={strokeClass}
      />
    </svg>
  );
}
