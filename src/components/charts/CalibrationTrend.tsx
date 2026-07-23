import { useMemo } from 'react';
import * as d3 from 'd3';
import type { CalibrationRow } from '@/lib/types';

type Props = {
  rows: CalibrationRow[];
  height?: number;
};

export function CalibrationTrend({ rows, height = 280 }: Props): React.ReactNode {
  const width = 800;
  const margin = { top: 16, right: 16, bottom: 40, left: 40 };

  const { path, points, xLabels } = useMemo(() => {
    if (rows.length === 0) {
      return {
        path: '',
        points: [] as { x: number; y: number }[],
        xLabels: [] as { x: number; label: string }[],
      };
    }

    const scored = rows.map((r, i) => {
      let score: number | null = null;
      if (r.reduce_fired !== null || r.add_fired !== null) {
        const hits = (r.reduce_fired ? 1 : 0) + (r.add_fired ? 1 : 0);
        const total = (r.reduce_level !== null ? 1 : 0) + (r.add_level !== null ? 1 : 0);
        score = total > 0 ? hits / total : null;
      }
      if (r.acting_helped === true) score = score === null ? 1 : (score + 1) / 2;
      if (r.acting_helped === false) score = score === null ? 0 : score / 2;
      return { i, score: score ?? 0.5, date: r.date };
    });

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const x = d3
      .scaleLinear()
      .domain([0, Math.max(1, scored.length - 1)])
      .range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

    // rolling mean of last 5
    const rolling = scored.map((_, i) => {
      const slice = scored.slice(Math.max(0, i - 4), i + 1);
      return d3.mean(slice, (s) => s.score) ?? 0.5;
    });

    const line = d3
      .line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    const step = Math.max(1, Math.floor(scored.length / 6));
    return {
      path: line(rolling) ?? '',
      points: scored.map((s, i) => ({ x: x(i), y: y(s.score) })),
      xLabels: scored
        .map((s, i) => ({ s, i }))
        .filter(({ i }) => i % step === 0)
        .map(({ s, i }) => ({ x: x(i), label: s.date.slice(5) })),
    };
  }, [rows, height, margin.left, margin.right, margin.top, margin.bottom]);

  if (rows.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-stroke bg-surface/50 text-sm text-ink-muted"
        style={{ height }}
      >
        No calibration data yet
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      <g transform={`translate(${margin.left},${margin.top})`}>
        <line
          x1={0}
          x2={width - margin.left - margin.right}
          y1={(height - margin.top - margin.bottom) / 2}
          y2={(height - margin.top - margin.bottom) / 2}
          stroke="#24393E"
          strokeDasharray="4 4"
        />
        <path d={path} fill="none" stroke="#A78BFA" strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#C4B5FD" />
        ))}
        {xLabels.map((l) => (
          <text
            key={l.label + l.x}
            x={l.x}
            y={height - margin.top - 12}
            textAnchor="middle"
            fill="#8FA6AD"
            fontSize={10}
          >
            {l.label}
          </text>
        ))}
      </g>
    </svg>
  );
}
