import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { routeReport } from '@/config/constants';
import { formatPrice } from '@/lib/formatters';
import type { Report } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  report: Report | undefined;
  compact?: boolean;
};

type IndexRow = NonNullable<Report['nonCrypto']>['indices'][number];
type Dca = NonNullable<IndexRow['dcaSignal']>;

function biasTone(bias?: string): string {
  const b = (bias ?? '').toLowerCase();
  if (b.includes('bull')) return 'text-bull';
  if (b.includes('bear')) return 'text-bear';
  return 'text-ink-muted';
}

const dcaTone: Record<string, string> = {
  'very-cheap': 'bg-bull/20 text-bull ring-bull/40',
  cheap: 'bg-bull/10 text-bull ring-bull/30',
  fair: 'bg-bg/40 text-ink-muted ring-stroke',
  rich: 'bg-bear/10 text-bear ring-bear/30',
};

const dcaLabel: Record<string, string> = {
  'very-cheap': 'Very cheap · strong DCA',
  cheap: 'Cheap · good DCA entry',
  fair: 'Fair value',
  rich: 'Rich · patience',
};

function DcaZoneBadge({ dca }: { dca: Dca }): React.ReactNode {
  return (
    <div className="mt-2 rounded-lg border border-stroke/50 bg-bg/30 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
          <Wallet className="size-3.5 shrink-0" aria-hidden />
          Monthly DCA
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1',
            dcaTone[dca.zone] ?? dcaTone.fair,
          )}
        >
          {dcaLabel[dca.zone] ?? dca.zone}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[11px] tabular-nums text-ink-muted">
        {dca.percentileInMonth}% up from month low
        {dca.pctVs20dAvg != null
          ? ` · ${dca.pctVs20dAvg >= 0 ? '+' : ''}${dca.pctVs20dAvg.toFixed(2)}% vs 20-day avg`
          : ''}
        {dca.rsi14 != null ? ` · RSI ${dca.rsi14.toFixed(0)}` : ''}
      </p>
      {dca.note ? <p className="mt-1 text-[11px] text-ink-muted">{dca.note}</p> : null}
    </div>
  );
}

export function NonCryptoPanel({ report, compact = false }: Props): React.ReactNode {
  const indices = report?.nonCrypto?.indices ?? [];
  const stocks = report?.nonCrypto?.stockWatchlist ?? [];

  if (indices.length === 0 && stocks.length === 0) {
    return (
      <Card>
        <Title level={3}>VOO / QQQ</Title>
        <p className="mt-2 text-sm text-ink-muted">
          No non-crypto snapshot in this report yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Title level={3}>VOO / QQQ &amp; stocks</Title>
        {report ? (
          <Link to={routeReport(report.id)} className="text-link text-xs">
            Source report
          </Link>
        ) : null}
      </div>
      <div className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'md:grid-cols-2')}>
        {indices.map((idx) => (
          <div
            key={idx.ticker}
            className="rounded-xl border border-stroke/60 bg-bg/40 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">{idx.ticker}</span>
              {idx.bias ? (
                <span className={cn('text-xs capitalize', biasTone(idx.bias))}>
                  {idx.bias}
                </span>
              ) : null}
            </div>
            {idx.price != null ? (
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink">
                {formatPrice(idx.price)}
                {idx.changePct != null ? (
                  <span
                    className={cn(
                      'ml-2 text-xs',
                      idx.changePct >= 0 ? 'text-bull' : 'text-bear',
                    )}
                  >
                    {idx.changePct >= 0 ? '+' : ''}
                    {idx.changePct.toFixed(2)}%
                  </span>
                ) : null}
              </p>
            ) : idx.level ? (
              <p className="mt-1 font-mono text-base tabular-nums text-ink">{idx.level}</p>
            ) : null}
            {idx.dcaSignal ? <DcaZoneBadge dca={idx.dcaSignal} /> : null}
            {idx.note ? <p className="mt-2 text-xs text-ink-muted">{idx.note}</p> : null}
            {idx.source?.url ? (
              <a
                href={idx.source.url}
                target="_blank"
                rel="noreferrer"
                className="text-link mt-2 inline-block text-xs"
              >
                {idx.source.title ?? 'Price source'} ↗
              </a>
            ) : null}
          </div>
        ))}
      </div>
      {stocks.length > 0 ? (
        <ul className="space-y-3">
          {stocks.map((s) => (
            <li
              key={s.ticker}
              className="rounded-xl border border-stroke/60 bg-bg/30 px-3 py-2.5 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{s.ticker}</span>
                {s.company ? (
                  <span className="text-ink-muted">{s.company}</span>
                ) : null}
                {s.stance ? (
                  <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-signal ring-1 ring-signal/35">
                    {s.stance}
                  </span>
                ) : null}
              </div>
              {s.whyNow ? <p className="mt-1 text-xs text-ink-muted">{s.whyNow}</p> : null}
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {s.keyStat ? (
                  <>
                    <dt className="text-ink-muted">Key stat</dt>
                    <dd>{s.keyStat}</dd>
                  </>
                ) : null}
                {s.valuation ? (
                  <>
                    <dt className="text-ink-muted">Valuation</dt>
                    <dd>{s.valuation}</dd>
                  </>
                ) : null}
                {s.analystView ? (
                  <>
                    <dt className="text-ink-muted">Analyst</dt>
                    <dd>{s.analystView}</dd>
                  </>
                ) : null}
                {s.risk ? (
                  <>
                    <dt className="text-ink-muted">Risk</dt>
                    <dd>{s.risk}</dd>
                  </>
                ) : null}
              </dl>
              {s.source?.url ? (
                <a
                  href={s.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link mt-2 text-xs"
                >
                  {s.source.title ?? 'Source'}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
