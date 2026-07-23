import { useManifest } from '@/hooks/useManifest';
import { useDayReports } from '@/hooks/useDayReports';
import type { Manifest, ManifestDay } from '@/lib/types';

function hasReports(day: ManifestDay): boolean {
  return Object.values(day.sessions).some((p) => p !== null);
}

/** Calendar date from a report id like `2026-07-23-morning`. */
function dateFromLatestId(latest: string): string | undefined {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(latest);
  return m?.[1];
}

function dayFromLatestPointer(manifest: Manifest): ManifestDay | undefined {
  const latestId = manifest.latest;
  const byPath = manifest.days.find((d) =>
    Object.values(d.sessions).some(
      (p) => p !== null && p.includes(latestId),
    ),
  );
  if (byPath && hasReports(byPath)) return byPath;

  const date = dateFromLatestId(latestId);
  if (!date) return undefined;
  const byDate = manifest.days.find((d) => d.date === date);
  return byDate && hasReports(byDate) ? byDate : undefined;
}

function newestDayInList(manifest: Manifest): ManifestDay | undefined {
  const withReports = manifest.days.filter(hasReports);
  if (withReports.length === 0) return undefined;
  return [...withReports].sort((a, b) => b.date.localeCompare(a.date))[0];
}

/**
 * Prefer the chronologically later of:
 * - the day pointed at by `manifest.latest`
 * - the newest day in `days[]` that has a report
 */
export function resolveDashboardDay(manifest: Manifest): ManifestDay | undefined {
  const fromLatest = dayFromLatestPointer(manifest);
  const fromDays = newestDayInList(manifest);

  if (!fromLatest) return fromDays;
  if (!fromDays) return fromLatest;
  if (fromLatest.date === fromDays.date) return fromLatest;

  return fromLatest.date.localeCompare(fromDays.date) > 0 ? fromLatest : fromDays;
}

export function useLatestDay() {
  const manifestQuery = useManifest();
  const day = manifestQuery.data
    ? resolveDashboardDay(manifestQuery.data)
    : undefined;

  const dayReports = useDayReports(day);

  return {
    manifest: manifestQuery.data,
    day,
    ...dayReports,
    isManifestLoading: manifestQuery.isLoading,
    manifestError: manifestQuery.error,
  };
}
