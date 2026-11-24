/** Chart colours, taken from the approved design. Recharts needs real colour values, not Tailwind classes. */
export const CHART_COLORS = {
  red: "#e3000f",
  darkRed: "#8f0009",
  ink: "#1a1a1c",
  grey: "#bfc5cc",
  amber: "#f2b24b",
  blue: "#1d5fd6",
  purple: "#7a4dd8",
  green: "#0e8a4f",
  grid: "#e6e7ea",
  axis: "#6b6b6b",
} as const;

/** Mail status colours (state colours are used for state only). */
export const STATUS_COLORS: Record<string, string> = {
  New: "#1d5fd6",
  "In progress": "#c97a00",
  "Waiting on sender": "#7a4dd8",
};

export const URGENCY_COLORS: Record<string, string> = {
  High: "#e3000f",
  Medium: "#e39a00",
  Low: "#c9c9c9",
};

export const SENTIMENT_COLORS: Record<string, string> = {
  Positive: "#1d5fd6",
  Neutral: "#c9c9c9",
  Negative: "#e8742a",
};

/** Light to dark, one colour per age bucket of the backlog chart. */
export const AGE_COLORS = ["#bfc5cc", "#f2b24b", "#e3000f", "#8f0009"];

/** Lines of the category trend chart. */
export const TREND_COLORS = ["#e3000f", "#1a1a1c", "#f2b24b", "#1d5fd6", "#7a4dd8"];

export const AXIS_TICK = { fontSize: 11, fill: CHART_COLORS.axis };
