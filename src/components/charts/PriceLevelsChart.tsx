import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ChartCandleLayer, type CandleGeom } from '@/components/charts/ChartCandleLayer';
import { ChartLevelLayer } from '@/components/charts/ChartLevelLayer';
import { ChartLevelLegend } from '@/components/charts/ChartLevelLegend';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import {
  DivergenceOverlay,
} from '@/components/charts/DivergenceOverlay';
import {
  MA_LEGEND,
  MovingAveragesOverlay,
  type MaCrossMark,
  type MaSeriesMap,
} from '@/components/charts/MovingAveragesOverlay';
import {
  LEVEL_COLORS,
  collectLevels,
  type LevelKind,
  type LevelLine,
} from '@/components/charts/chartLevels';
import { findLevelHits, priceYDomain, type YFitMode } from '@/components/charts/chartScale';
import type { DivergenceHit, DivergenceType } from '@/indicators';
import { formatPrice } from '@/lib/formatters';
import type { Candle, Report } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  candles: Candle[];
  reports: Report[];
  height?: number;
  maSeries?: MaSeriesMap;
  maCrosses?: MaCrossMark[];
  divergences?: DivergenceHit[];
  divergenceActive?: Record<DivergenceType, boolean>;
  showHitMarkers?: boolean;
};

type CandleHover = { index: number; clientX: number; clientY: number };

const defaultMaActive = {
  ema20: true,
  ema50: true,
  ema100: false,
  ema200: true,
};

const CHART_WIDTH = 860;
const CHART_MARGIN = { top: 12, right: 16, bottom: 28, left: 58 } as const;

export function PriceLevelsChart({
  candles,
  reports,
  height = 340,
  maSeries,
  maCrosses,
  divergences,
  divergenceActive,
  showHitMarkers = true,
}: Props): React.ReactNode {
  const [hover, setHover] = useState<CandleHover | null>(null);
  const [previewKind, setPreviewKind] = useState<LevelKind | null>(null);
  const [fitMode, setFitMode] = useState<YFitMode>('price');
  const [maActive, setMaActive] = useState(defaultMaActive);
  const [activeKinds, setActiveKinds] = useState<Record<LevelKind, boolean>>({
    support: true,
    resistance: true,
    reduce: true,
    add: true,
  });

  const geom = useMemo(() => {
    const { left, right, top, bottom } = CHART_MARGIN;
    const innerW = CHART_WIDTH - left - right;
    const innerH = height - top - bottom;
    const empty = {
      xTicks: [] as { x: number; label: string }[],
      yTicks: [] as { y: number; label: string }[],
      levelLines: [] as (LevelLine & { y: number })[],
      candleRects: [] as CandleGeom[],
      hits: [] as ReturnType<typeof findLevelHits>,
      y: d3.scaleLinear(),
      innerW,
      innerH,
    };
    if (candles.length === 0) return empty;

    const x = d3
      .scaleBand()
      .domain(candles.map((_, i) => String(i)))
      .range([0, innerW])
      .padding(0.2);
    const levels = collectLevels(reports);
    const y = d3
      .scaleLinear()
      .domain(priceYDomain(candles, levels, fitMode))
      .nice()
      .range([innerH, 0]);
    const step = Math.max(1, Math.floor(candles.length / 6));
    const candleRects = candles.map((c, i) => {
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
    });
    return {
      innerW,
      innerH,
      y,
      xTicks: candles
        .map((c, i) => ({ c, i }))
        .filter(({ i }) => i % step === 0)
        .map(({ c, i }) => ({
          x: (x(String(i)) ?? 0) + x.bandwidth() / 2,
          label: d3.timeFormat('%H:%M')(new Date(c.openTime)),
        })),
      yTicks: y.ticks(5).map((t) => ({ y: y(t), label: formatPrice(t, 0) })),
      levelLines: levels.map((l) => ({ ...l, y: y(l.price) })),
      candleRects,
      hits: showHitMarkers ? findLevelHits(candles, levels) : [],
    };
  }, [candles, reports, height, fitMode, showHitMarkers]);

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

  const tipCandle = hover ? geom.candleRects[hover.index] : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ChartLevelLegend
          activeKinds={activeKinds}
          onToggle={(kind) =>
            setActiveKinds((prev) => ({ ...prev, [kind]: !prev[kind] }))
          }
          onPreview={setPreviewKind}
        />
        <div className="flex flex-wrap gap-1">
          {(['price', 'levels'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFitMode(m)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium transition',
                fitMode === m
                  ? 'bg-brand/25 text-brand-light'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              Fit {m}
            </button>
          ))}
        </div>
      </div>
      {maSeries ? (
        <div className="flex flex-wrap gap-1">
          {MA_LEGEND.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMaActive((p) => ({ ...p, [m.key]: !p[m.key] }))}
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 transition',
                maActive[m.key]
                  ? 'bg-bg text-ink ring-stroke'
                  : 'text-ink-muted/50 ring-transparent',
              )}
              style={{ color: maActive[m.key] ? m.color : undefined }}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="relative" onPointerLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${height}`}
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
            x={CHART_MARGIN.left}
            y={CHART_MARGIN.top}
            width={geom.innerW}
            height={geom.innerH}
            fill="url(#plotFade)"
            rx={8}
          />
          <g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
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
            {maSeries ? (
              <MovingAveragesOverlay
                series={maSeries}
                candles={geom.candleRects}
                y={geom.y}
                crosses={maCrosses}
                active={maActive}
              />
            ) : null}
            <ChartCandleLayer
              candles={geom.candleRects}
              hoverIndex={hover?.index ?? null}
              innerH={geom.innerH}
              margin={CHART_MARGIN}
              width={CHART_WIDTH}
              onHover={(index, clientX, clientY) =>
                setHover({ index, clientX, clientY })
              }
            />
            {divergences && divergenceActive ? (
              <DivergenceOverlay
                hits={divergences}
                active={divergenceActive}
                pointAt={(index, price) => {
                  const g = geom.candleRects[index];
                  if (!g) return null;
                  return { x: g.x + g.width / 2, y: geom.y(price) };
                }}
              />
            ) : null}
            {geom.hits.map((h) => {
              const g = geom.candleRects[h.index];
              if (!g) return null;
              return (
                <g key={`${h.kind}-${h.session}-${h.price}`}>
                  <circle
                    cx={g.x + g.width / 2}
                    cy={geom.y(h.price)}
                    r={6}
                    fill={LEVEL_COLORS[h.kind]}
                    fillOpacity={0.25}
                    stroke={LEVEL_COLORS[h.kind]}
                    strokeWidth={1.5}
                  />
                  <title>
                    {h.kind.toUpperCase()} hit · {h.session} · {formatPrice(h.price)}
                  </title>
                </g>
              );
            })}
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
        {tipCandle && hover ? (
          <ChartTooltip
            x={Math.min(Math.max(hover.clientX, 90), CHART_WIDTH - 90)}
            y={Math.max(hover.clientY, 80)}
            title={d3.timeFormat('%b %d · %H:%M')(new Date(tipCandle.candle.openTime))}
            rows={[
              { label: 'Open', value: formatPrice(tipCandle.candle.open) },
              { label: 'High', value: formatPrice(tipCandle.candle.high), tone: 'up' },
              { label: 'Low', value: formatPrice(tipCandle.candle.low), tone: 'down' },
              {
                label: 'Close',
                value: formatPrice(tipCandle.candle.close),
                tone: tipCandle.up ? 'up' : 'down',
              },
            ]}
          />
        ) : null}
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
      <p className="text-[11px] text-ink-muted">
        Candles = intraday structure. Dashed lines = report levels. Markers = REDUCE/ADD
        first touch. Fit price keeps the axis tight; Fit levels shows all levels.
      </p>
    </div>
  );
}
