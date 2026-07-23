import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ChartLevelLegend } from '@/components/charts/ChartLevelLegend';
import { ChartLevelPreviewPanel } from '@/components/charts/ChartLevelPreviewPanel';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { PriceChartPlot } from '@/components/charts/PriceChartPlot';
import {
  MA_LEGEND,
  type MaCrossMark,
  type MaSeriesMap,
} from '@/components/charts/MovingAveragesOverlay';
import { type LevelKind } from '@/components/charts/chartLevels';
import { type YFitMode } from '@/components/charts/chartScale';
import {
  CHART_WIDTH,
  buildPriceChartGeom,
} from '@/components/charts/priceChartGeom';
import { useDelayedPreview } from '@/components/charts/useDelayedPreview';
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
  const [fitMode, setFitMode] = useState<YFitMode>('price');
  const [maActive, setMaActive] = useState(defaultMaActive);
  const [activeKinds, setActiveKinds] = useState<Record<LevelKind, boolean>>({
    support: true,
    resistance: true,
    reduce: true,
    add: true,
  });
  const { previewKind, openPreview, schedulePreviewClose, clearPreviewClose } =
    useDelayedPreview();

  const geom = useMemo(
    () =>
      buildPriceChartGeom({
        candles,
        reports,
        height,
        fitMode,
        showHitMarkers,
      }),
    [candles, reports, height, fitMode, showHitMarkers],
  );

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
          onPreview={openPreview}
          onPreviewLeave={schedulePreviewClose}
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
        <PriceChartPlot
          height={height}
          innerW={geom.innerW}
          innerH={geom.innerH}
          y={geom.y}
          yTicks={geom.yTicks}
          xTicks={geom.xTicks}
          levelLines={geom.levelLines}
          candleRects={geom.candleRects}
          hits={geom.hits}
          activeKinds={activeKinds}
          previewKind={previewKind}
          hoverIndex={hover?.index ?? null}
          onHover={(index, clientX, clientY) => setHover({ index, clientX, clientY })}
          maSeries={maSeries}
          maCrosses={maCrosses}
          maActive={maActive}
          divergences={divergences}
          divergenceActive={divergenceActive}
        />
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
        {previewKind ? (
          <ChartLevelPreviewPanel
            kind={previewKind}
            levels={previewLevels}
            onPointerEnter={clearPreviewClose}
            onPointerLeave={schedulePreviewClose}
          />
        ) : null}
      </div>
      <p className="text-[11px] text-ink-muted">
        Candles = intraday structure. Dashed lines = report levels. Markers = REDUCE/ADD
        first touch. Fit price keeps the axis tight; Fit levels shows all levels.
      </p>
    </div>
  );
}
