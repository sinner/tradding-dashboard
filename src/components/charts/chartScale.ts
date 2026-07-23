import * as d3 from 'd3';
import type { LevelLine } from '@/components/charts/chartLevels';
import type { Candle } from '@/lib/types';

export type YFitMode = 'price' | 'levels';

/** Y-domain that keeps candles readable; far levels stay off-scale. */
export function priceYDomain(
  candles: Candle[],
  levels: LevelLine[],
  mode: YFitMode,
): [number, number] {
  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const cMin = Math.min(...lows);
  const cMax = Math.max(...highs);

  if (mode === 'levels' && levels.length > 0) {
    const prices = [...lows, ...highs, ...levels.map((l) => l.price)];
    const [lo, hi] = d3.extent(prices) as [number, number];
    const pad = (hi - lo) * 0.04 || hi * 0.002;
    return [lo - pad, hi + pad];
  }

  const span = cMax - cMin || cMax * 0.01;
  const band = span * 0.5;
  const near = levels
    .map((l) => l.price)
    .filter((p) => p >= cMin - band && p <= cMax + band);
  const min = Math.min(cMin, ...(near.length ? near : [cMin]));
  const max = Math.max(cMax, ...(near.length ? near : [cMax]));
  const pad = (max - min) * 0.06 || max * 0.002;
  return [min - pad, max + pad];
}

export type LevelHit = {
  kind: 'reduce' | 'add';
  price: number;
  session: string;
  index: number;
};

/** First candle that touches a REDUCE (low ≤) or ADD (high ≥) level. */
export function findLevelHits(
  candles: Candle[],
  levels: LevelLine[],
): LevelHit[] {
  const hits: LevelHit[] = [];
  for (const level of levels) {
    if (level.kind !== 'reduce' && level.kind !== 'add') continue;
    const idx = candles.findIndex((c) =>
      level.kind === 'reduce' ? c.low <= level.price : c.high >= level.price,
    );
    if (idx < 0) continue;
    hits.push({
      kind: level.kind,
      price: level.price,
      session: level.session,
      index: idx,
    });
  }
  return hits;
}
