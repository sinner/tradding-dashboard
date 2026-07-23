import { rsi } from './movingAverages';

export type DcaZone = 'very-cheap' | 'cheap' | 'fair' | 'rich';

export type DcaSignal = {
  /** Where today's close sits in the trailing window: 0 = at the low, 100 = at the high. */
  percentileInMonth: number;
  pctVs20dAvg: number | null;
  pctFromHigh: number;
  rsi14: number | null;
  zone: DcaZone;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

function zoneFrom(percentile: number, rsi14: number | null): DcaZone {
  const oversold = rsi14 != null && rsi14 < 35;
  if (percentile <= 10 || (percentile <= 20 && oversold)) return 'very-cheap';
  if (percentile <= 30) return 'cheap';
  if (percentile <= 70) return 'fair';
  return 'rich';
}

/**
 * Relative-cheapness gauge for monthly DCA timing. NOT a bottom-caller — it says
 * how cheap today is versus its own recent range, which is what DCA timing needs.
 *
 * @param closes daily closes, oldest → newest
 * @param window trailing sessions that define "the month" (default 21)
 */
export function computeDcaSignal(closes: number[], window = 21): DcaSignal | null {
  if (closes.length < 2) return null;

  const w = closes.slice(-window);
  const last = w[w.length - 1]!;
  const lo = Math.min(...w);
  const hi = Math.max(...w);
  const percentile = hi === lo ? 50 : Math.round(((last - lo) / (hi - lo)) * 100);

  const recent = closes.slice(-20);
  const avg20 = recent.reduce((a, b) => a + b, 0) / recent.length;
  const pctVs20dAvg = avg20 > 0 ? round2((last / avg20 - 1) * 100) : null;
  const pctFromHigh = hi > 0 ? round2((last / hi - 1) * 100) : 0;

  const rsiSeries = rsi(closes, 14);
  const rsi14 = rsiSeries[rsiSeries.length - 1] ?? null;

  return {
    percentileInMonth: percentile,
    pctVs20dAvg,
    pctFromHigh,
    rsi14,
    zone: zoneFrom(percentile, rsi14),
  };
}
