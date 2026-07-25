import { History as HistoryIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { formatSession, formatDateTime, formatPrice, formatBtc } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import type { Portfolio, PortfolioSnapshot } from '@/lib/types';

function isFutOpen(snap: PortfolioSnapshot): boolean {
  const fut = snap.futures;
  return Boolean(fut && fut.side !== 'flat' && (fut.sizeUsd ?? 0) > 0);
}

/** Compact per-snapshot description of BOTH books: what/side/size is actually held. */
function BooksCell({ snap }: { snap: PortfolioSnapshot }): React.ReactNode {
  const spot = snap.spot;
  const fut = snap.futures;
  const spotHeld = (spot?.btc ?? 0) > 0;
  const futOpen = isFutOpen(snap);

  if (!spotHeld && !futOpen) {
    return <span className="text-ink-muted">Cash only</span>;
  }

  return (
    <div className="flex flex-col gap-0.5 leading-tight">
      {spotHeld ? (
        <span className="text-ink">
          <span className="text-[10px] uppercase tracking-wide text-brand-light">Spot</span>{' '}
          <span className="font-mono tabular-nums">{formatBtc(spot!.btc)} BTC</span>
          {spot!.avgEntry != null ? (
            <span className="text-ink-muted"> @ {formatPrice(spot!.avgEntry)}</span>
          ) : null}
        </span>
      ) : null}
      {futOpen ? (
        <span>
          <span className="text-[10px] uppercase tracking-wide text-ink-muted">Fut</span>{' '}
          <span
            className={cn(
              'font-medium uppercase',
              fut!.side === 'long' ? 'text-bull' : 'text-bear',
            )}
          >
            {fut!.side}
          </span>{' '}
          <span className="font-mono tabular-nums text-ink">
            {formatPrice(fut!.sizeUsd ?? 0)}
            {(fut!.leverage ?? 1) > 1 ? ` · ${fut!.leverage}x` : ''}
          </span>
          {fut!.entryPrice != null ? (
            <span className="text-ink-muted"> @ {formatPrice(fut!.entryPrice)}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

const EPS_BTC = 1e-8;

/**
 * Human-readable description of what actually changed hands on this snapshot,
 * derived by diffing it against the previous one. Fills happen at the session
 * mark (no fees in this game).
 */
function tradeDelta(snap: PortfolioSnapshot, prev?: PortfolioSnapshot): string | null {
  const action = String(snap.action);
  if (action === 'INIT') return 'Seed (gift + cash)';
  if (action === 'RESET') return 'Reset to 100';

  // Spot book delta.
  const spotBefore = prev?.spot?.btc ?? 0;
  const spotNow = snap.spot?.btc ?? 0;
  const dBtc = spotNow - spotBefore;
  if (Math.abs(dBtc) >= EPS_BTC) {
    const usd = Math.abs(dBtc) * snap.markPrice;
    const verb = dBtc > 0 ? 'Buy' : 'Sell';
    return `${verb} ${formatPrice(usd)} · ${formatBtc(Math.abs(dBtc))} BTC @ ${formatPrice(snap.markPrice)}`;
  }

  // Futures book delta.
  const fBefore = prev?.futures;
  const fNow = snap.futures;
  const openBefore = Boolean(
    fBefore && fBefore.side !== 'flat' && (fBefore.sizeUsd ?? 0) > 0,
  );
  const openNow = isFutOpen(snap);
  if (!openBefore && openNow) {
    const entry = fNow!.entryPrice != null ? ` @ ${formatPrice(fNow!.entryPrice)}` : '';
    const lev = (fNow!.leverage ?? 1) > 1 ? ` · ${fNow!.leverage}x` : '';
    return `Open ${fNow!.side} ${formatPrice(fNow!.sizeUsd ?? 0)}${lev}${entry}`;
  }
  if (openBefore && !openNow) {
    return `Close futures @ ${formatPrice(snap.markPrice)}`;
  }
  if (openBefore && openNow) {
    if (fBefore!.side !== fNow!.side) {
      return `Flip to ${fNow!.side} ${formatPrice(fNow!.sizeUsd ?? 0)} @ ${formatPrice(snap.markPrice)}`;
    }
    const dSize = (fNow!.sizeUsd ?? 0) - (fBefore!.sizeUsd ?? 0);
    if (Math.abs(dSize) > 0.005) {
      return `${dSize > 0 ? 'Add' : 'Reduce'} futures ${formatPrice(Math.abs(dSize))} @ ${formatPrice(snap.markPrice)}`;
    }
  }
  return null;
}

/** Friendly action label — spells out the book/side so "ADD" isn't ambiguous. */
function actionLabel(snap: PortfolioSnapshot): string {
  const a = String(snap.action);
  const fut = snap.futures;
  const futOpen = isFutOpen(snap);
  switch (a) {
    case 'ADD':
    case 'REDUCE':
    case 'EXIT':
    case 'TAKE_PROFIT':
      // The spot core is long-only; only the futures book carries a true long/short side.
      return futOpen ? `${a} · futures ${fut!.side}` : `${a} · spot`;
    case 'FLIP':
      return futOpen ? `FLIP · futures ${fut!.side}` : 'FLIP';
    case 'STOPPED_OUT':
      return 'Stopped out · futures';
    case 'LIQUIDATED':
      return 'Liquidated · futures';
    case 'HOLD':
      return 'Hold (mark only)';
    default:
      return a;
  }
}

/** History of wallet snapshots, newest first, with the books held on each row. */
export function RecentSnapshots({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const hist = portfolio.history ?? [];
  const rows = hist
    .map((snap, idx) => ({ snap, prev: idx > 0 ? hist[idx - 1] : undefined }))
    .reverse()
    .slice(0, 12);
  return (
    <Card className="space-y-3 overflow-x-auto">
      <Title level={4} className="flex items-center gap-2">
        <HistoryIcon className="size-4 text-ink-muted" aria-hidden />
        Recent snapshots
      </Title>
      <p className="text-xs text-ink-muted">
        Each row is the wallet state after that session acted. “Trade” is what changed
        hands this session (filled at the mark, no fees); “Position” is the resulting
        books held — spot BTC and any open futures side/size.
      </p>
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-[11px] uppercase text-ink-muted">
          <tr>
            <th className="pb-1.5 pr-3 font-medium">When</th>
            <th className="pb-1.5 pr-3 font-medium">Session</th>
            <th className="pb-1.5 pr-3 font-medium">Action</th>
            <th className="pb-1.5 pr-3 font-medium">Trade</th>
            <th className="pb-1.5 pr-3 font-medium">Position</th>
            <th className="pb-1.5 pr-3 text-right font-medium">Mark</th>
            <th className="pb-1.5 text-right font-medium">Equity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ snap, prev }, i) => {
            const trade = tradeDelta(snap, prev);
            return (
              <tr key={`${snap.ts}-${i}`} className="border-t border-stroke/60 align-top">
                <td className="py-1.5 pr-3 text-ink-muted">{formatDateTime(snap.ts)}</td>
                <td className="py-1.5 pr-3 capitalize">{formatSession(snap.session)}</td>
                <td className="py-1.5 pr-3">{actionLabel(snap)}</td>
                <td className="py-1.5 pr-3 text-xs">
                  {trade ? (
                    <span className="font-mono tabular-nums text-ink">{trade}</span>
                  ) : (
                    <span className="text-ink-muted">— no trade</span>
                  )}
                </td>
                <td className="py-1.5 pr-3 text-xs">
                  <BooksCell snap={snap} />
                </td>
                <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-ink-muted">
                  {formatPrice(snap.markPrice)}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-ink">
                  {formatPrice(snap.equityUsd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
