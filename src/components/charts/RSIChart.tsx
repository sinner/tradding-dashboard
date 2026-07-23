import { useMemo } from 'react';
import * as d3 from 'd3';
import { DivergenceOverlay } from '@/components/charts/DivergenceOverlay';
import { rsi } from '@/indicators';
import type { DivergenceHit, DivergenceType } from '@/indicators';
import type { Candle } from '@/lib/types';

type Props = {
  candles: Candle[];
  height?: number;
  snapshot?: { index?: number; value: number } | null;
  /** Index where the display window starts (after warm-up). */
  visibleFrom?: number;
  divergences?: DivergenceHit[];
  divergenceActive?: Record<DivergenceType, boolean>;
};

export function RSIChart({
  candles,
  height = 140,
  snapshot,
  visibleFrom = 0,
  divergences,
  divergenceActive,
}: Props): React.ReactNode {
  const width = 800;
  const margin = { top: 12, right: 16, bottom: 20, left: 40 };

  const geom = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const full = rsi(closes, 14);
    const series = full.slice(visibleFrom);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const validCount = series.filter((v) => v !== null).length;

    const x = d3
      .scaleLinear()
      .domain([0, Math.max(1, series.length - 1)])
      .range([0, innerW]);
    const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

    const line = d3
      .line<number | null>()
      .defined((d) => d !== null)
      .x((_, i) => x(i))
      .y((d) => y(d as number));

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
      if (idx >= 0) snapshotDot = { cx: x(idx), cy: y(snapshot.value) };
    }

    return {
      path: line(series) ?? '',
      guides: [30, 50, 70].map((g) => ({ y: y(g), label: String(g) })),
      zones: [
        { y: Math.min(y(100), y(70)), h: Math.abs(y(70) - y(100)), fill: '#F472B6', opacity: 0.08 },
        { y: Math.min(y(30), y(0)), h: Math.abs(y(0) - y(30)), fill: '#C4B5FD', opacity: 0.08 },
      ],
      snapshotDot,
      validCount,
      innerW,
      y,
      x,
      seriesLen: series.length,
    };
  }, [candles, height, snapshot, visibleFrom, margin]);

  if (candles.length === 0 || geom.validCount < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-ink-muted"
        style={{ height }}
      >
        Not enough bars to compute RSI(14) at this timeframe
      </div>
    );
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {geom.zones.map((z, i) => (
            <rect
              key={i}
              x={0}
              y={z.y}
              width={geom.innerW}
              height={Math.abs(z.h)}
              fill={z.fill}
              opacity={z.opacity}
            />
          ))}
          {geom.guides.map((g) => (
            <g key={g.label}>
              <line
                x1={0}
                x2={geom.innerW}
                y1={g.y}
                y2={g.y}
                stroke="#2D2450"
                strokeDasharray="2 3"
              />
              <text
                x={-6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#9B8FB8"
                fontSize={9}
              >
                {g.label}
              </text>
            </g>
          ))}
          <path d={geom.path} fill="none" stroke="#A78BFA" strokeWidth={1.5} />
          {divergences && divergenceActive ? (
            <DivergenceOverlay
              hits={divergences.map((h) => ({
                ...h,
                fromIndex: Math.max(0, h.fromIndex - visibleFrom),
                toIndex: Math.max(0, h.toIndex - visibleFrom),
              }))}
              active={divergenceActive}
              useOscillator
              pointAt={(index, osc) => {
                if (index < 0 || index >= geom.seriesLen) return null;
                return { x: geom.x(index), y: geom.y(osc) };
              }}
            />
          ) : null}
          {geom.snapshotDot ? (
            <circle
              cx={geom.snapshotDot.cx}
              cy={geom.snapshotDot.cy}
              r={4}
              fill="#E879F9"
              stroke="#0E081C"
              strokeWidth={1}
            />
          ) : null}
        </g>
      </svg>
      <p className="mt-1 text-[11px] text-ink-muted">
        RSI above 70 = stretched high; below 30 = stretched low. 50 = mid-range.
      </p>
    </div>
  );
}
