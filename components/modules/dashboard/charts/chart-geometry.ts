/** Small calculations the SVG charts share. Plain numbers in, plain numbers out. */

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

/** Percent of the whole, rounded. 0 when there is nothing to divide. */
export function toPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

/** Width (0 to 100) of a bar whose full length stands for `max`. */
export function toBarWidth(value: number, max: number) {
  return max > 0 ? Math.min(100, (value / max) * 100) : 0;
}

/** Top of a chart axis: the next number that splits evenly into `steps` grid steps. */
export function getAxisTop(maxValue: number, steps: number) {
  return Math.max(steps, Math.ceil(maxValue / steps) * steps);
}

/** "x,y x,y ..." for a polyline. The lowest value sits at `bottom`, the highest at `top`. */
export function buildLinePoints(values: number[], width: number, top: number, bottom: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lastIndex = Math.max(1, values.length - 1);
  return values
    .map((value, index) => {
      const x = (index / lastIndex) * width;
      const y = max === min ? (top + bottom) / 2 : bottom - ((value - min) / (max - min)) * (bottom - top);
      return `${round(x)},${round(y)}`;
    })
    .join(" ");
}

export interface DonutSlice {
  name: string;
  value: number;
  /** Tailwind stroke class, for example "stroke-brand". */
  stroke: string;
  /** Tailwind background class for the legend square. */
  swatch: string;
}

export interface DonutArc extends DonutSlice {
  /** stroke-dasharray, for example "114 389.6" */
  dashArray: string;
  dashOffset: number;
}

const SLICE_GAP = 2;

/** Turn slice values into the dash lengths and offsets of stacked circle strokes. */
export function buildDonutSlices(slices: DonutSlice[], radius: number): DonutArc[] {
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let used = 0;

  return slices
    .filter((slice) => slice.value > 0)
    .map((slice) => {
      const length = (slice.value / total) * circumference;
      const arc = {
        ...slice,
        dashArray: `${round(Math.max(0, length - SLICE_GAP))} ${round(circumference)}`,
        dashOffset: -round(used),
      };
      used += length;
      return arc;
    });
}
