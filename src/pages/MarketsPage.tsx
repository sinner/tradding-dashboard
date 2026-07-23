import { Link } from 'react-router-dom';
import { NonCryptoPanel } from '@/components/dashboard/NonCryptoPanel';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { routeReport } from '@/config/constants';
import { useLatestDay } from '@/hooks/useLatestDay';
import { formatDate, formatSession } from '@/lib/formatters';
import type { Report, Session } from '@/lib/types';

export function MarketsPage(): React.ReactNode {
  const { day, reports, isLoading, isManifestLoading, manifestError } = useLatestDay();
  const sessions: Session[] = ['endday', 'midday', 'morning'];
  const primary =
    sessions.map((s) => reports[s]).find(Boolean) ?? undefined;

  if (isManifestLoading || isLoading) {
    return <p className="text-ink-muted">Loading markets…</p>;
  }

  if (manifestError || !day) {
    return (
      <Card>
        <Title level={2}>Markets</Title>
        <p className="mt-2 text-sm text-ink-muted">No report data for indices yet.</p>
      </Card>
    );
  }

  const withNonCrypto = sessions
    .map((s) => ({ session: s, report: reports[s] as Report | undefined }))
    .filter((x) => x.report?.nonCrypto);

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Markets</Title>
        <p className="mt-1 text-sm text-ink-muted">
          VOO / QQQ and stock watchlist from the latest reports ({formatDate(day.date)}).
          Snapshot levels — not live quotes.
        </p>
      </div>

      <NonCryptoPanel report={primary} />

      {withNonCrypto.length > 1 ? (
        <div className="space-y-3">
          <Title level={3}>By session</Title>
          <ul className="space-y-2 text-sm">
            {withNonCrypto.map(({ session, report }) =>
              report ? (
                <li key={session} className="flex flex-wrap items-center gap-3">
                  <span className="capitalize text-ink-muted">
                    {formatSession(session)}
                  </span>
                  <span className="text-ink-muted">
                    {(report.nonCrypto?.indices ?? [])
                      .map((i) => `${i.ticker} ${i.level ?? ''}`.trim())
                      .join(' · ')}
                  </span>
                  <Link to={routeReport(report.id)} className="text-link text-xs">
                    Report
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
