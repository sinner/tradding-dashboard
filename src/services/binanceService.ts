import { BINANCE } from '@/config/constants';
import type { Candle } from '@/lib/types';
import { logger } from '@/services/loggerService';

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

const parseCandle = (row: BinanceKline): Candle => ({
  openTime: row[0],
  open: Number(row[1]),
  high: Number(row[2]),
  low: Number(row[3]),
  close: Number(row[4]),
  volume: Number(row[5]),
  closeTime: row[6],
});

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status === 429) {
    logger.warn('binance', 'rate limited (429)');
    throw new Error('Binance rate limit exceeded');
  }
  if (!res.ok) {
    logger.error('binance', `HTTP ${res.status}`, { url });
    throw new Error(`Binance request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLivePrice(symbol = BINANCE.symbol): Promise<number> {
  const url = `${BINANCE.baseUrl}/ticker/price?symbol=${symbol}`;
  const data = await fetchJson<{ symbol: string; price: string }>(url);
  return Number(data.price);
}

export type KlinesParams = {
  symbol?: string;
  interval: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
};

export async function fetchKlines(params: KlinesParams): Promise<Candle[]> {
  const {
    symbol = BINANCE.symbol,
    interval,
    startTime,
    endTime,
    limit = BINANCE.klinesLimit,
  } = params;

  const qs = new URLSearchParams({
    symbol,
    interval,
    limit: String(limit),
  });
  if (startTime !== undefined) qs.set('startTime', String(startTime));
  if (endTime !== undefined) qs.set('endTime', String(endTime));

  const url = `${BINANCE.baseUrl}/klines?${qs.toString()}`;
  const rows = await fetchJson<BinanceKline[]>(url);
  logger.debug('binance', `klines ${interval}`, { count: rows.length });
  return rows.map(parseCandle);
}

/** Page backwards to fill a date range (max 1000 bars per request). */
export async function fetchKlinesRange(params: {
  symbol?: string;
  interval: string;
  startTime: number;
  endTime: number;
}): Promise<Candle[]> {
  const { symbol = BINANCE.symbol, interval, startTime, endTime } = params;
  const pageSize = 1000;
  const all: Candle[] = [];
  let cursor = endTime;

  while (cursor > startTime) {
    const batch = await fetchKlines({
      symbol,
      interval,
      startTime,
      endTime: cursor,
      limit: pageSize,
    });
    if (batch.length === 0) break;
    all.unshift(...batch);
    const earliest = batch[0]?.openTime;
    if (earliest === undefined || earliest <= startTime) break;
    cursor = earliest - 1;
    if (batch.length < pageSize) break;
  }

  return all.filter((c) => c.openTime >= startTime && c.openTime <= endTime);
}

export const binanceService = {
  fetchLivePrice,
  fetchKlines,
  fetchKlinesRange,
};
