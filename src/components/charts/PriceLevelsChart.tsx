import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ChartCandleLayer, type CandleGeom } from '@/components/charts/ChartCandleLayer';
import { ChartLevelLayer } from '@/components/charts/ChartLevelLayer';
import { ChartLevelLegend } from '@/components/charts/ChartLevelLegend';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import {
  LEVEL_COLORS,
  collectLevels,
  type LevelKind,
  type LevelLine,
} from '@/components/charts/chartLevels';
import { formatPrice } from '@/lib/formatters';
import type { Candle, Report } from '@/lib/types';

type Props = {
  candles: Candle[];
  reports: Report[];
  height?: number;
};

type CandleHover = { index: number; clientX: number; clientY: number };

export function PriceLevelsChart({
  candles,
  reports,
  height = 340,
}: Props): React.ReactNode {
  const width = 860;
  const margin = { top: 12, right: 16, bottom: 28, left: 58 };
  const [hover, setHover] = useState<CandleHover | null>(null);
  const [previewKind, setPreviewKind] = useState<LevelKind | null>(null);
  const [activeKinds, setActiveKinds] = useState<Record<LevelKind, boolean>>({
    support: true,
    resistance: true,
    reduce: true,
    add: true,
  });

  const geom = useMemo(() => {
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    if (candles.length === 0) {
      return {
        xTicks: [] as { x: number; label: string }[],
        yTicks: [] as { y: number; label: string }[],
        levelLines: [] as (LevelLine & { y: number })[],
        candleRects: [] as CandleGeom[],
        innerW,
        innerH,
      };
    }
    const x = d3
      .scaleBand()
      .domain(candles.map((_, i) => String(i)))
      .range([0, innerW])
      .padding(0.2);
    const levels = collectLevels(reports);
    const prices = candles.flatMap((c) => [c.high, c.low]);
    for (const l of levels) prices.push(l.price);
    const y = d3
      .scaleLinear()
      .domain(d3.extent(prices) as [number, number])
      .nice()
      .range([innerH, 0]);
    const step = Math.max(1, Math.floor(candles.length / 6));
    return {
      innerW,
      innerH,
      xTicks: candles
        .map((c, i) => ({ c, i }))
        .filter(({ i }) => i % step === 0)
        .map(({ c, i }) => ({
          x: (x(String(i)) ?? 0) + x.bandwidth() / 2,
          label: d3.timeFormat('%H:%M')(new Date(c.openTime)),
        })),
      yTicks: y.ticks(5).map((t) => ({ y: y(t), label: formatPrice(t, 0) })),
      levelLines: levels.map((l) => ({ ...l, y: y(l.price) })),
      candleRects: candles.map((c, i) => {
        const cx = x(String(i)) ?? 0;
        return {
          x: cx,
          width: x.bandwidth(),
          yHigh: y(c.high),
          yLow: y(c.low),
          yOpen: y(c.open),
          yClose: y(c.close),
          up: c.close >= c.open,
          candle: c,
        };
      }),
    };
  }, [candles, reports, height, margin.left, margin.right, margin.top, margin.bottom]);

  const previewLevels = previewKind
    ? geom.levelLines.filter((l) => l.kind === previewKind && activeKinds[l.kind])
    : [];

  if (candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-stroke/60 bg-bg/40 text-sm text-ink-muted"
        style={{ height }}
      >
        Waiting for klines…
      </div>
    );
  }

  const candleTip = (() => {
    if (!hover) return null;
    const g = geom.candleRects[hover.index];
    if (!g) return null;
    const c = g.candle;
    return (
      <ChartTooltip
        x={Math.min(Math.max(hover.clientX, 90), width - 90)}
        y={Math.max(hover.clientY, 80)}
        title={d3.timeFormat('%b %d · %H:%M')(new Date(c.openTime))}
        rows={[
          { label: 'Open', value: formatPrice(c.open) },
          { label: 'High', value: formatPrice(c.high), tone: 'up' },
          { label: 'Low', value: formatPrice(c.low), tone: 'down' },
          {
            label: 'Close',
            value: formatPrice(c.close),
            tone: g.up ? 'up' : 'down',
          },
          {
            label: 'Vol',
            value: c.volume.toLocaleString(undefined, { maximumFractionDigits: 2 }),
            tone: 'muted',
          },
        ]}
      />
    );
  })();

  return (
    <div className="space-y-3">
      <ChartLevelLegend
        activeKinds={activeKinds}
        onToggle={(kind) => setActiveKinds((prev) => ({ ...prev, [kind]: !prev[kind] }))}
        onPreview={setPreviewKind}
      />
      <div className="relative" onPointerLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full select-none"
          role="img"
          aria-label="BTC price with report levels"
        >
          <defs>
            <linearGradient id="plotFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#19103A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0E081C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x={margin.left}
            y={margin.top}
            width={geom.innerW}
            height={geom.innerH}
            fill="url(#plotFade)"
            rx={8}
          />
          <g transform={`translate(${margin.left},${margin.top})`}>
            {geom.yTicks.map((t) => (
              <g key={t.label}>
                <line
                  x1={0}
                  x2={geom.innerW}
                  y1={t.y}
                  y2={t.y}
                  stroke="#2D2450"
                  strokeDasharray="2 5"
                />
                <text
                  x={-10}
                  y={t.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#9B8FB8"
                  fontSize={10}
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {t.label}
                </text>
              </g>
            ))}
            <ChartLevelLayer
              levels={geom.levelLines}
              activeKinds={activeKinds}
              hoverIndex={null}
              previewKind={previewKind}
              innerW={geom.innerW}
            />
            <ChartCandleLayer
              candles={geom.candleRects}
              hoverIndex={hover?.index ?? null}
              innerH={geom.innerH}
              margin={margin}
              width={width}
              height={height}
              onHover={(index, clientX, clientY) => setHover({ index, clientX, clientY })}
            />
            {geom.xTicks.map((t) => (
              <text
                key={t.label + t.x}
                x={t.x}
                y={geom.innerH + 18}
                textAnchor="middle"
                fill="#9B8FB8"
                fontSize={10}
                fontFamily="IBM Plex Mono, monospace"
              >
                {t.label}
              </text>
            ))}
          </g>
        </svg>
        {candleTip}
        {previewKind && previewLevels.length > 0 ? (
          <div className="animate-fade-in absolute right-2 top-2 z-20 max-w-[220px] rounded-xl border border-stroke/80 bg-bg-deep/95 p-3 shadow-glow backdrop-blur-md">
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: LEVEL_COLORS[previewKind] }}
            >
              {previewKind} levels
            </p>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
              {previewLevels.map((l) => (
                <li
                  key={`${l.session}-${l.price}`}
                  className="flex justify-between gap-3 font-mono tabular-nums"
                >
                  <span className="capitalize text-ink-muted">{l.session}</span>
                  <span className="text-ink">{formatPrice(l.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
