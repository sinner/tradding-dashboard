import * as d3 from 'd3';
import type { CandleGeom } from '@/components/charts/ChartCandleLayer';
import { collectLevels, type LevelLine } from '@/components/charts/chartLevels';
import {
  findLevelHits,
  priceYDomain,
  type LevelHit,
  type YFitMode,
} from '@/components/charts/chartScale';
import { formatPrice } from '@/lib/formatters';
import type { Candle, Report } from '@/lib/types';

export const CHART_WIDTH = 860;
export const CHART_MARGIN = { top: 12, right: 16, bottom: 28, left: 58 } as const;

export type PriceChartGeom = {
  innerW: number;
  innerH: number;
  y: d3.ScaleContinuousNumeric<number, number>;
  xTicks: { x: number; label: string }[];
  yTicks: { y: number; label: string }[];
  levelLines: (LevelLine & { y: number })[];
  candleRects: CandleGeom[];
  hits: LevelHit[];
};

/** 'linear' = equal price steps; 'log' = equal percentage steps (useful on wide ranges). */
export type YScaleMode = 'linear' | 'log';

export function buildPriceChartGeom(options: {
  candles: Candle[];
  reports: Report[];
  height: number;
  fitMode: YFitMode;
  showHitMarkers: boolean;
  scaleMode?: YScaleMode;
}): PriceChartGeom {
  const { candles, reports, height, fitMode, showHitMarkers, scaleMode = 'linear' } = options;
  const { left, right, top, bottom } = CHART_MARGIN;
  const innerW = CHART_WIDTH - left - right;
  const innerH = height - top - bottom;
  const empty: PriceChartGeom = {
    xTicks: [],
    yTicks: [],
    levelLines: [],
    candleRects: [],
    hits: [],
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
  // Nice the domain on a linear scale first: nice() on a log scale snaps to powers of 10.
  const lin = d3
    .scaleLinear()
    .domain(priceYDomain(candles, levels, fitMode))
    .nice()
    .range([innerH, 0]);
  const y: d3.ScaleContinuousNumeric<number, number> =
    scaleMode === 'log' && lin.domain()[0] > 0
      ? d3.scaleLog().domain(lin.domain()).range([innerH, 0])
      : lin;
  const step = Math.max(1, Math.floor(candles.length / 6));

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
    // Tick values come from the linear scale (log ticks over a narrow range are unreadable).
    yTicks: lin.ticks(scaleMode === 'log' ? 7 : 5).map((t) => ({ y: y(t), label: formatPrice(t, 0) })),
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
    hits: showHitMarkers ? findLevelHits(candles, levels) : [],
  };
}
