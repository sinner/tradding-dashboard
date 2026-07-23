import { BiasBadge } from '@/components/dashboard/BiasBadge';
import { DecisionBox } from '@/components/dashboard/DecisionBox';
import { LevelsCard } from '@/components/dashboard/LevelsCard';
import { MacroStrip } from '@/components/dashboard/MacroStrip';
import { OperationsCard } from '@/components/dashboard/OperationsCard';
import { ProbabilityBars } from '@/components/dashboard/ProbabilityBars';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';
import { routeReport } from '@/config/constants';
import { formatPrice, formatSession } from '@/lib/formatters';
import type { Report } from '@/lib/types';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';

type Props = {
  report: Report | undefined;
  session: string;
  livePrice?: number;
  className?: string;
};

const sessionBlurb: Record<string, string> = {
  morning:
    'Written near the open (ET). It captures overnight moves and sets the first plan for the day.',
  midday:
    'Written around lunch (ET). It updates the morning call with how the session has actually traded.',
  endday:
    'Written after the cash close (ET). It scores the day and sets overnight / next-session risk.',
};

export function SessionColumn({
  report,
  session,
  livePrice,
  className,
}: Props): React.ReactNode {
  if (!report) {
    return (
      <Card
        className={cn(
          'flex min-h-[200px] items-center justify-center text-sm text-ink-muted',
          className,
        )}
      >
        No {formatSession(session)} report
      </Card>
    );
  }

  const delta =
    livePrice !== undefined
      ? ((livePrice - report.priceSnapshot.value) / report.priceSnapshot.value) * 100
      : null;

  return (
    <div id={session} className={cn('flex scroll-mt-24 flex-col gap-3', className)}>
      <Card interactive className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Title level={3}>{formatSession(session)}</Title>
              <InfoPopover
                label={`What is the ${formatSession(session)} snapshot?`}
                title={`${formatSession(session)} snapshot`}
              >
                <p>
                  {sessionBlurb[session] ??
                    'A point-in-time report for this trading session.'}
                </p>
                <p>
                  <span className="font-medium text-ink">Snapshot price</span> is BTC’s
                  price when this report was written — not the live price. Use it as the
                  baseline the analyst was reacting to.
                </p>
                <p>
                  <span className="font-medium text-ink">Live Δ</span> is how far today’s
                  live price has moved versus that snapshot (positive = higher now,
                  negative = lower now).
                </p>
                <p>
                  <span className="font-medium text-ink">Bias / probabilities</span> are
                  the analyst’s odds for bullish, range, or bearish outcomes from that
                  moment. <span className="font-medium text-ink">Confidence</span> is how
                  strongly they stand behind the call (higher = more conviction).
                </p>
              </InfoPopover>
            </div>
            <p className="mt-1 font-mono text-xs text-ink-muted">
              Snapshot {formatPrice(report.priceSnapshot.value)}
            </p>
          </div>
          <BiasBadge bias={report.overallBias} />
        </div>
        {delta !== null ? (
          <p
            className={cn(
              'font-mono text-sm tabular-nums',
              delta >= 0 ? 'text-bull' : 'text-bear',
            )}
          >
            Live Δ {delta >= 0 ? '+' : ''}
            {delta.toFixed(2)}%
          </p>
        ) : null}
        {report.confidence != null ? (
          <p className="text-xs text-ink-muted">
            Confidence {report.confidence.toFixed(2)}
          </p>
        ) : null}
        <ProbabilityBars probabilities={report.probabilities} />
        <Link to={routeReport(report.id)} className="text-link text-sm">
          Full report
          <span aria-hidden>→</span>
        </Link>
      </Card>
      <MacroStrip report={report} />
      <DecisionBox decision={report.decisionBox} />
      <OperationsCard operations={report.operations} />
      <LevelsCard levels={report.levels} />
    </div>
  );
}
