import { useQuery } from '@tanstack/react-query';
import { BINANCE, QUERY_KEYS, type KlineInterval } from '@/config/constants';
import { usePageVisible } from '@/hooks/usePageVisible';
import { binanceService } from '@/services/binanceService';

export function useKlines(options: {
  interval: KlineInterval;
  startTime?: number;
  endTime?: number;
  symbol?: string;
  enabled?: boolean;
  /** Poll while the tab is visible. Default: BINANCE.klinesRefreshMs. Pass false to disable. */
  refreshMs?: number | false;
}) {
  const {
    interval,
    startTime,
    endTime,
    symbol = BINANCE.symbol,
    enabled = true,
    refreshMs = BINANCE.klinesRefreshMs,
  } = options;

  const pageVisible = usePageVisible();
  const poll =
    refreshMs !== false && pageVisible && enabled ? refreshMs : false;

  return useQuery({
    queryKey: QUERY_KEYS.klines(symbol, interval, startTime, endTime),
    queryFn: () => {
      if (startTime !== undefined && endTime !== undefined) {
        return binanceService.fetchKlinesRange({
          symbol,
          interval,
          startTime,
          endTime,
        });
      }
      return binanceService.fetchKlines({
        symbol,
        interval,
        startTime,
        endTime,
        limit: BINANCE.klinesLimit,
      });
    },
    enabled,
    staleTime: typeof refreshMs === 'number' ? refreshMs / 2 : 60_000,
    refetchInterval: poll,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/** ET midnight → next midnight as UTC ms for a YYYY-MM-DD date. */
export function dayBoundsEt(date: string): { startTime: number; endTime: number } {
  const start = new Date(`${date}T00:00:00-04:00`);
  const end = new Date(`${date}T23:59:59.999-04:00`);
  return { startTime: start.getTime(), endTime: end.getTime() };
}
