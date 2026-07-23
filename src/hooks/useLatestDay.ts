import { useManifest } from '@/hooks/useManifest';
import { useDayReports } from '@/hooks/useDayReports';

export function useLatestDay() {
  const manifestQuery = useManifest();
  const latestId = manifestQuery.data?.latest;

  const day =
    manifestQuery.data?.days.find((d) =>
      Object.values(d.sessions).some(
        (p) => p !== null && latestId !== undefined && p.includes(latestId),
      ),
    ) ?? manifestQuery.data?.days[0];

  const dayReports = useDayReports(day);

  return {
    manifest: manifestQuery.data,
    day,
    ...dayReports,
    isManifestLoading: manifestQuery.isLoading,
    manifestError: manifestQuery.error,
  };
}
