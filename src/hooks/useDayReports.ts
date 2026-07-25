import { useQueries, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/constants';
import type { ManifestDay, Report, Session } from '@/lib/types';
import { reportService } from '@/services/reportService';

type DayReportOptions = Readonly<{
  refetchInterval?: number | false;
}>;

export function useReport(path: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.reportPath(path ?? ''),
    queryFn: () => reportService.fetchReportByPath(path!),
    enabled: Boolean(path),
    staleTime: 5 * 60_000,
  });
}

export function useDayReports(
  day: ManifestDay | undefined,
  options: DayReportOptions = {},
): {
  reports: Partial<Record<Session, Report>>;
  isLoading: boolean;
  isError: boolean;
  dataUpdatedAt: number;
} {
  const sessions: Session[] = ['morning', 'midday', 'endday'];
  const paths = sessions.map((s) => day?.sessions[s] ?? null);
  const interval = options.refetchInterval ?? false;

  const results = useQueries({
    queries: paths.map((path) => ({
      queryKey: QUERY_KEYS.reportPath(path ?? ''),
      queryFn: () => reportService.fetchReportByPath(path!),
      enabled: Boolean(path),
      staleTime: 5 * 60_000,
      refetchInterval: interval,
      refetchIntervalInBackground: false,
    })),
  });

  const reports: Partial<Record<Session, Report>> = {};
  sessions.forEach((session, i) => {
    const data = results[i]?.data;
    if (data) reports[session] = data;
  });

  return {
    reports,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    dataUpdatedAt: Math.max(0, ...results.map((r) => r.dataUpdatedAt ?? 0)),
  };
}

export function useCalibration() {
  return useQuery({
    queryKey: QUERY_KEYS.calibration,
    queryFn: () => reportService.fetchCalibration(),
    staleTime: 5 * 60_000,
  });
}
