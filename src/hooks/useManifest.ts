import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/constants';
import { manifestService } from '@/services/manifestService';

export function useManifest() {
  return useQuery({
    queryKey: QUERY_KEYS.manifest,
    queryFn: () => manifestService.fetchManifest(),
    staleTime: 60_000,
  });
}
