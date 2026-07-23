import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { routeDay } from '@/config/constants';
import { formatPrice } from '@/lib/formatters';
import type { Report, Session } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  livePrice: number | undefined;
  isLoading: boolean;
  reports: Partial<Record<Session, Report>>;
  date?: string;
};

export function LivePriceStrip({
  livePrice,
  isLoading,
  reports,
  date,
}: Props): React.ReactNode {
  const sessions: Session[] = ['morning', 'midday', 'endday'];

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand animate-pulse-live" />
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Live BTC-USDT
            </p>
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums text-brand-light md:text-4xl">
            {isLoading && livePrice === undefined
              ? '…'
              : livePrice !== undefined
                ? formatPrice(livePrice, 2)
                : '—'}
          </p>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          {sessions.map((session) => {
            const report = reports[session];
            if (!report || livePrice === undefined) {
              return (
                <div
                  key={session}
                  className="rounded-xl border border-stroke/50 bg-bg/40 px-3 py-2.5 text-xs text-ink-muted"
                >
                  {session}: —
                </div>
              );
            }
            const delta =
              ((livePrice - report.priceSnapshot.value) /
                report.priceSnapshot.value) *
              100;
            const body = (
              <>
                <span className="capitalize text-ink-muted">{session}</span>
                <p
                  className={cn(
                    'mt-0.5 font-mono text-sm font-medium tabular-nums',
                    delta >= 0 ? 'text-bull' : 'text-bear',
                  )}
                >
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(2)}% vs snapshot
                </p>
              </>
            );
            const className =
              'rounded-xl border border-stroke/50 bg-bg/50 px-3 py-2.5 text-xs transition hover:border-signal/40 hover:bg-bg';
            return date ? (
              <Link key={session} to={`${routeDay(date)}#${session}`} className={className}>
                {body}
              </Link>
            ) : (
              <div key={session} className={className}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
