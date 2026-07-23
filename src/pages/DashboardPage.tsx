import { Link } from 'react-router-dom';
import { LivePriceStrip } from '@/components/dashboard/LivePriceStrip';
import { SessionColumn } from '@/components/dashboard/SessionColumn';
import { PriceLevelsChart } from '@/components/charts/PriceLevelsChart';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { routeDay, routeStudies } from '@/config/constants';
import { useLatestDay } from '@/hooks/useLatestDay';
import { dayBoundsEt, useKlines } from '@/hooks/useKlines';
import { useLivePrice } from '@/hooks/useLivePrice';
import { formatDate } from '@/lib/formatters';
import type { Report } from '@/lib/types';

export function DashboardPage(): React.ReactNode {
  const { day, reports, isLoading, isManifestLoading, manifestError } = useLatestDay();
  const live = useLivePrice();

  const bounds = day ? dayBoundsEt(day.date) : undefined;
  const klines = useKlines({
    interval: '15m',
    startTime: bounds?.startTime,
    endTime: bounds?.endTime,
    enabled: Boolean(bounds),
  });

  const reportList = Object.values(reports).filter(Boolean) as Report[];

  if (isManifestLoading) {
    return <p className="animate-fade-up text-ink-muted">Loading manifest…</p>;
  }

  if (manifestError) {
    return (
      <Card className="animate-fade-up space-y-2">
        <Title level={2}>No data yet</Title>
        <p className="text-sm text-ink-muted">
          Could not load <code className="text-brand">public/data/manifest.json</code>.
          Add your report JSON files and a manifest to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="stagger-children space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Title level={1}>Daily dashboard</Title>
          {day ? (
            <p className="mt-1 text-sm text-ink-muted">
              {formatDate(day.date)} · three sessions vs live BTC
            </p>
          ) : null}
        </div>
        {day ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to={routeDay(day.date)} className="text-link">
              Day view
            </Link>
            <Link to={routeStudies(day.date)} className="text-link">
              Indicator studies
            </Link>
          </div>
        ) : null}
      </div>

      <LivePriceStrip
        livePrice={live.data}
        isLoading={live.isLoading}
        reports={reports}
        date={day?.date}
      />

      <Card padded={false} className="overflow-hidden p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <Title level={4} className="text-ink-muted">
            Intraday vs report levels
          </Title>
          <span className="hidden text-[11px] text-ink-muted sm:inline">
            15m · Binance
          </span>
        </div>
        {klines.isError ? (
          <p className="px-1 text-sm text-accent">
            Could not load Binance klines. Check network / rate limits.
          </p>
        ) : (
          <PriceLevelsChart candles={klines.data ?? []} reports={reportList} />
        )}
      </Card>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading session reports…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SessionColumn
            session="morning"
            report={reports.morning}
            livePrice={live.data}
          />
          <SessionColumn session="midday" report={reports.midday} livePrice={live.data} />
          <SessionColumn session="endday" report={reports.endday} livePrice={live.data} />
        </div>
      )}
    </div>
  );
}
