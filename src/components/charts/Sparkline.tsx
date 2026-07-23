import { useMemo } from 'react';
import * as d3 from 'd3';

type Props = {
  values: (number | null)[];
  height?: number;
  color?: string;
};

/** Tiny rolling-% sparkline (nulls skipped in the path). */
export function Sparkline({
  values,
  height = 36,
  color = '#A78BFA',
}: Props): React.ReactNode {
  const width = 160;
  const path = useMemo(() => {
    const pts = values
      .map((v, i) => (v === null ? null : { i, v }))
      .filter((p): p is { i: number; v: number } => p !== null);
    if (pts.length < 2) return '';
    const x = d3
      .scaleLinear()
      .domain([0, Math.max(1, values.length - 1)])
      .range([2, width - 2]);
    const y = d3.scaleLinear().domain([0, 1]).range([height - 4, 4]);
    return (
      d3
        .line<{ i: number; v: number }>()
        .x((d) => x(d.i))
        .y((d) => y(d.v))
        .curve(d3.curveMonotoneX)(pts) ?? ''
    );
  }, [values, height]);

  if (!path) {
    return (
      <div className="flex items-center text-[11px] text-ink-muted" style={{ height }}>
        Need more scored sessions
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-full max-w-[160px]">
      <line
        x1={0}
        x2={width}
        y1={height / 2}
        y2={height / 2}
        stroke="#2D2450"
        strokeDasharray="3 3"
      />
      <path d={path} fill="none" stroke={color} strokeWidth={1.75} />
    </svg>
  );
}
