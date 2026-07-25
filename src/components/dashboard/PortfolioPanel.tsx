import {
  Wallet,
  PiggyBank,
  CalendarClock,
  Coins,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';
import { formatPrice, formatPct, formatSession, formatDate } from '@/lib/formatters';
import type { Portfolio } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  portfolio: Portfolio | null | undefined;
  isLoading?: boolean;
};

export function Unavailable({ note }: { note: string }): React.ReactNode {
  return (
    <Card className="space-y-1">
      <Title level={4} className="flex items-center gap-2 text-ink-muted">
        <Wallet className="size-4" aria-hidden />
        Paper wallet
      </Title>
      <p className="text-sm text-ink-muted">{note}</p>
    </Card>
  );
}

export function PortfolioPanel({ portfolio, isLoading }: Props): React.ReactNode {
  if (isLoading) return <Unavailable note="Loading wallet…" />;
  if (!portfolio || !portfolio.latest) {
    return (
      <Unavailable note="No wallet data yet — the game starts when the next midnight session runs. Everything else works normally." />
    );
  }

  const snap = portfolio.latest;
  const initial = portfolio.initialCapitalUsd ?? 100;
  const savings = portfolio.savingsUsd ?? snap.savingsUsd ?? 0;
  const netWorth = snap.netWorthUsd ?? snap.equityUsd + savings;
  const pnl = netWorth - initial;
  const pnlPct = initial ? (pnl / initial) * 100 : 0;
  const exp = portfolio.expenses ?? null;
  const up = pnl >= 0;

  const spot = snap.spot ?? { btc: 0, valueUsd: 0, costBasisUsd: 0, avgEntry: null };
  const fut =
    snap.futures ??
    ({
      side: 'flat',
      sizeUsd: 0,
      leverage: 1,
      entryPrice: null,
      marginUsd: 0,
      stopPrice: null,
      liquidationPrice: null,
      unrealizedPnlUsd: 0,
    } as NonNullable<typeof snap.futures>);
  const futOpen = fut.side !== 'flat' && (fut.sizeUsd ?? 0) > 0;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <Title level={4} className="flex items-center gap-2">
          <Wallet className="size-4 text-brand-light" aria-hidden />
          Paper wallet
          <span className="text-xs font-normal text-ink-muted">
            round {portfolio.round ?? 1} · {formatSession(snap.session)} · {snap.action}
          </span>
        </Title>
        <InfoPopover label="About the paper wallet" title="Paper wallet game">
          <p>
            The four sessions relay ONE paper wallet seeded at {formatPrice(initial)} (not
            real money), split into a <span className="font-medium text-ink">spot book</span>{' '}
            (BTC held outright, long-only) and a{' '}
            <span className="font-medium text-ink">futures book</span> (perp long/short
            with leverage). Each run marks both to market and applies its decision.
          </p>
          <p>
            They must cover a {formatPrice(exp?.monthlyUsd ?? 30)}/month cost of living.
            Profits sweep 20% into an untouchable savings bucket. Can&apos;t pay → bankrupt
            + reset, logged in the hall of shame with a lesson.
          </p>
        </InfoPopover>
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">Net worth</p>
          <p className="font-mono text-3xl font-semibold tabular-nums text-ink">
            {formatPrice(netWorth)}
          </p>
        </div>
        <div className={cn('flex items-center gap-1.5', up ? 'text-bull' : 'text-bear')}>
          {up ? (
            <TrendingUp className="size-5" aria-hidden />
          ) : (
            <TrendingDown className="size-5" aria-hidden />
          )}
          <span className="font-mono text-lg tabular-nums">
            {up ? '+' : ''}
            {formatPrice(pnl)} ({formatPct(pnlPct)})
          </span>
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
        <Bucket
          label="Spot value"
          value={formatPrice(spot.valueUsd ?? 0)}
          icon={<Coins className="size-3.5 text-brand-light" aria-hidden />}
        />
        <Bucket
          label="Futures equity"
          value={formatPrice((fut.marginUsd ?? 0) + (fut.unrealizedPnlUsd ?? 0))}
          icon={<Gauge className="size-3.5 text-brand-light" aria-hidden />}
        />
        <Bucket label="Free cash" value={formatPrice(snap.cashUsd)} />
        <Bucket
          label="Savings"
          value={formatPrice(savings)}
          icon={<PiggyBank className="size-3.5 text-amber-300" aria-hidden />}
        />
      </div>

      {/* Spot book */}
      <div className="border-t border-stroke pt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-muted">
          <Coins className="size-3.5" aria-hidden /> Spot book
        </p>
        {spot.btc > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
            <Bucket label="BTC" value={`${spot.btc}`} />
            <Bucket
              label="Avg entry"
              value={spot.avgEntry != null ? formatPrice(spot.avgEntry) : '—'}
            />
            <Bucket label="Cost basis" value={formatPrice(spot.costBasisUsd ?? 0)} />
            <Bucket
              label="Value / uPnL"
              value={`${formatPrice(spot.valueUsd ?? 0)} (${formatPrice((spot.valueUsd ?? 0) - (spot.costBasisUsd ?? 0))})`}
              tone={
                ((spot.valueUsd ?? 0) - (spot.costBasisUsd ?? 0) >= 0
                  ? 'bull'
                  : 'bear') as Tone
              }
            />
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No BTC held.</p>
        )}
      </div>

      {/* Futures book */}
      <div className="border-t border-stroke pt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-muted">
          <Gauge className="size-3.5" aria-hidden /> Futures book
        </p>
        {futOpen ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
            <Bucket
              label="Side"
              value={`${fut.side}${(fut.leverage ?? 1) > 1 ? ` ${fut.leverage}x` : ''}`}
              tone={(fut.side === 'long' ? 'bull' : 'bear') as Tone}
              capitalize
            />
            <Bucket label="Size" value={formatPrice(fut.sizeUsd ?? 0)} />
            <Bucket
              label="Entry"
              value={fut.entryPrice != null ? formatPrice(fut.entryPrice) : '—'}
            />
            <Bucket
              label="Stop / Liq"
              value={
                (fut.stopPrice != null ? formatPrice(fut.stopPrice) : '—') +
                (fut.liquidationPrice != null
                  ? ` / ${formatPrice(fut.liquidationPrice)}`
                  : '')
              }
            />
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Flat — no open futures position.</p>
        )}
      </div>

      {/* Expenses */}
      {exp ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-stroke pt-3 text-sm">
          <span className="flex items-center gap-1.5 text-ink-muted">
            <CalendarClock className="size-3.5" aria-hidden />
            Cost of living
          </span>
          <span className="font-mono tabular-nums text-ink">
            {formatPrice(exp.monthlyUsd ?? 30)}/mo
          </span>
          {exp.nextChargeAt ? (
            <span className="text-ink-muted">
              next charge <span className="text-ink">{formatDate(exp.nextChargeAt)}</span>
            </span>
          ) : null}
          <span className="text-ink-muted">
            paid{' '}
            <span className="font-mono tabular-nums text-ink">
              {formatPrice(exp.totalPaidUsd ?? 0)}
            </span>
          </span>
          <span className={cn((portfolio.bankruptcies ?? 0) > 0 && 'text-bear')}>
            bankruptcies{' '}
            <span className="font-mono tabular-nums">{portfolio.bankruptcies ?? 0}</span>
          </span>
        </div>
      ) : null}

      {/* Scoreboard */}
      {portfolio.scoreboard.length > 0 ? (
        <div className="border-t border-stroke pt-3">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">
            Session scoreboard · quota {formatPrice(exp?.perSessionQuotaUsd ?? 7.5)}/mo each
          </p>
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase text-ink-muted">
              <tr>
                <th className="pb-1.5 pr-3 font-medium">Session</th>
                <th className="pb-1.5 pr-3 text-right font-medium">Dec.</th>
                <th className="pb-1.5 pr-3 text-right font-medium">Skips</th>
                <th className="pb-1.5 pr-3 text-right font-medium">Contrib.</th>
                <th className="pb-1.5 text-right font-medium">W / L</th>
              </tr>
            </thead>
            <tbody>
              {[...portfolio.scoreboard]
                .sort((a, b) => b.attributedPnlUsd - a.attributedPnlUsd)
                .map((sc) => {
                  const positive = sc.attributedPnlUsd >= 0;
                  return (
                    <tr key={sc.session} className="border-t border-stroke/60">
                      <td className="py-1.5 pr-3 capitalize">
                        {formatSession(sc.session)}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-ink-muted">
                        {sc.decisions}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-ink-muted">
                        {sc.skips ?? 0}
                      </td>
                      <td
                        className={cn(
                          'py-1.5 pr-3 text-right font-mono tabular-nums',
                          positive ? 'text-bull' : 'text-bear',
                        )}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {sc.attributedPnlUsd === 0 ? (
                            <Minus className="size-3" aria-hidden />
                          ) : positive ? (
                            <TrendingUp className="size-3" aria-hidden />
                          ) : (
                            <TrendingDown className="size-3" aria-hidden />
                          )}
                          {positive ? '+' : ''}
                          {formatPrice(sc.attributedPnlUsd)}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-ink-muted">
                        {sc.wins} / {sc.losses}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : null}

      {snap.rationale ? (
        <p className="border-t border-stroke pt-3 text-xs italic text-ink-muted">
          “{snap.rationale}”
        </p>
      ) : null}
    </Card>
  );
}

type Tone = 'bull' | 'bear' | undefined;

function Bucket({
  label,
  value,
  icon,
  tone,
  capitalize,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
  capitalize?: boolean;
}): React.ReactNode {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-ink-muted">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          'font-mono tabular-nums',
          capitalize && 'capitalize',
          tone === 'bull' && 'text-bull',
          tone === 'bear' && 'text-bear',
          !tone && 'text-ink',
        )}
      >
        {value}
      </p>
    </div>
  );
}
