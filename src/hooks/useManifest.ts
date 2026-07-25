import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/constants';
import { manifestService } from '@/services/manifestService';

type Options = Readonly<{
  /** Poll for a newer manifest (e.g. newly deployed session). */
  refetchInterval?: number | false;
}>;

export function useManifest(options: Options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.manifest,
    queryFn: () => manifestService.fetchManifest(),
    staleTime: 60_000,
    refetchInterval: options.refetchInterval ?? false,
    refetchIntervalInBackground: false,
  });
}
