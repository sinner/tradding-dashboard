import { useQueries, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/constants';
import type { ManifestDay, Report, Session } from '@/lib/types';
import { reportService } from '@/services/reportService';

export function useReport(path: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.reportPath(path ?? ''),
    queryFn: () => reportService.fetchReportByPath(path!),
    enabled: Boolean(path),
    staleTime: 5 * 60_000,
  });
}

export function useDayReports(day: ManifestDay | undefined): {
  reports: Partial<Record<Session, Report>>;
  isLoading: boolean;
  isError: boolean;
} {
  const sessions: Session[] = ['morning', 'midday', 'endday'];
  const paths = sessions.map((s) => day?.sessions[s] ?? null);

  const results = useQueries({
    queries: paths.map((path) => ({
      queryKey: QUERY_KEYS.reportPath(path ?? ''),
      queryFn: () => reportService.fetchReportByPath(path!),
      enabled: Boolean(path),
      staleTime: 5 * 60_000,
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
  };
}

export function useCalibration() {
  return useQuery({
    queryKey: QUERY_KEYS.calibration,
    queryFn: () => reportService.fetchCalibration(),
    staleTime: 5 * 60_000,
  });
}
