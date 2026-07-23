import { Link, useParams } from 'react-router-dom';
import { LivePriceStrip } from '@/components/dashboard/LivePriceStrip';
import { SessionColumn } from '@/components/dashboard/SessionColumn';
import { PriceLevelsChart } from '@/components/charts/PriceLevelsChart';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { routeStudies } from '@/config/constants';
import { useDayReports } from '@/hooks/useDayReports';
import { dayBoundsEt, useKlines } from '@/hooks/useKlines';
import { useLivePrice } from '@/hooks/useLivePrice';
import { useManifest } from '@/hooks/useManifest';
import { formatDate } from '@/lib/formatters';
import type { Report } from '@/lib/types';

export function DayPage(): React.ReactNode {
  const { date = '' } = useParams();
  const manifest = useManifest();
  const day = manifest.data?.days.find((d) => d.date === date);
  const { reports, isLoading } = useDayReports(day);
  const live = useLivePrice();

  const bounds = date ? dayBoundsEt(date) : undefined;
  const klines = useKlines({
    interval: '15m',
    startTime: bounds?.startTime,
    endTime: bounds?.endTime,
    enabled: Boolean(date),
  });

  const reportList = Object.values(reports).filter(Boolean) as Report[];

  if (manifest.isLoading) {
    return <p className="animate-fade-up text-ink-muted">Loading…</p>;
  }

  if (!day) {
    return (
      <Card className="animate-fade-up">
        <Title level={2}>Day not found</Title>
        <p className="mt-2 text-sm text-ink-muted">
          No entry for <code className="text-brand">{date}</code> in the manifest.
        </p>
        <Link to="/history" className="text-link mt-4 text-sm">
          ← Back to history
        </Link>
      </Card>
    );
  }

  return (
    <div className="stagger-children space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Title level={1}>{formatDate(date)}</Title>
          <p className="mt-1 text-sm text-ink-muted">
            Session contrast · predicted vs actual
          </p>
        </div>
        <Link to={routeStudies(date)} className="text-link text-sm">
          Indicator studies
          <span aria-hidden>→</span>
        </Link>
      </div>

      <LivePriceStrip
        livePrice={live.data}
        isLoading={live.isLoading}
        reports={reports}
        date={date}
      />

      <Card padded={false} className="overflow-hidden p-3 md:p-4">
        <PriceLevelsChart candles={klines.data ?? []} reports={reportList} />
      </Card>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading reports…</p>
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
