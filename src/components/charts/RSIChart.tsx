import { useMemo } from 'react';
import * as d3 from 'd3';
import { rsi } from '@/indicators';
import type { Candle } from '@/lib/types';

type Props = {
  candles: Candle[];
  height?: number;
  snapshot?: { index?: number; value: number } | null;
};

export function RSIChart({ candles, height = 140, snapshot }: Props): React.ReactNode {
  const width = 800;
  const margin = { top: 12, right: 16, bottom: 20, left: 40 };

  const { path, guides, snapshotDot } = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const series = rsi(closes, 14);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, Math.max(1, candles.length - 1)])
      .range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

    const line = d3
      .line<number | null>()
      .defined((d) => d !== null)
      .x((_, i) => x(i))
      .y((d) => y(d as number));

    const guides = [30, 50, 70].map((g) => ({ y: y(g), label: String(g) }));

    let snapshotDot: { cx: number; cy: number } | null = null;
    if (snapshot) {
      let idx = snapshot.index ?? -1;
      if (idx < 0) {
        for (let i = series.length - 1; i >= 0; i--) {
          if (series[i] !== null) {
            idx = i;
            break;
          }
        }
      }
      if (idx >= 0) {
        snapshotDot = { cx: x(idx), cy: y(snapshot.value) };
      }
    }

    return {
      path: line(series) ?? '',
      guides,
      snapshotDot,
    };
  }, [candles, height, snapshot, margin.left, margin.right, margin.top, margin.bottom]);

  if (candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-ink-muted"
        style={{ height }}
      >
        No RSI data
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {guides.map((g) => (
          <g key={g.label}>
            <line
              x1={0}
              x2={width - margin.left - margin.right}
              y1={g.y}
              y2={g.y}
              stroke="#24393E"
              strokeDasharray="2 3"
            />
            <text
              x={-6}
              y={g.y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#8FA6AD"
              fontSize={9}
            >
              {g.label}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#A78BFA" strokeWidth={1.5} />
        {snapshotDot ? (
          <circle
            cx={snapshotDot.cx}
            cy={snapshotDot.cy}
            r={4}
            fill="#E879F9"
            stroke="#0E081C"
            strokeWidth={1}
          />
        ) : null}
      </g>
    </svg>
  );
}
