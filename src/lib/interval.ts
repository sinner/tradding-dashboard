import type { KlineInterval } from '@/config/constants';

/** Bars needed so EMA200 / MACD(26,9) / RSI(14) have a full warm-up. */
export const INDICATOR_WARMUP_BARS = 220;

export function intervalToMs(interval: KlineInterval): number {
  switch (interval) {
    case '15m':
      return 15 * 60_000;
    case '1h':
      return 60 * 60_000;
    case '4h':
      return 4 * 60 * 60_000;
    case '1d':
      return 24 * 60 * 60_000;
  }
}

/** Extend day start backward by N bars for indicator warm-up. */
export function warmupStartTime(
  dayStartMs: number,
  interval: KlineInterval,
  bars = INDICATOR_WARMUP_BARS,
): number {
  return dayStartMs - bars * intervalToMs(interval);
}

/** First candle index at or after `dayStartMs`, or 0 if none. */
export function displayStartIndex(
  candles: { openTime: number }[],
  dayStartMs: number,
): number {
  const i = candles.findIndex((c) => c.openTime >= dayStartMs);
  return i >= 0 ? i : 0;
}
