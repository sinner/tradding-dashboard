import { useQuery } from '@tanstack/react-query';
import { BINANCE, QUERY_KEYS } from '@/config/constants';
import { binanceService } from '@/services/binanceService';

export function useLivePrice(symbol = BINANCE.symbol) {
  return useQuery({
    queryKey: QUERY_KEYS.livePrice(symbol),
    queryFn: () => binanceService.fetchLivePrice(symbol),
    refetchInterval: BINANCE.pricePollMs,
    staleTime: BINANCE.pricePollMs / 2,
  });
}
