import { History as HistoryIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { formatSession, formatDateTime, formatPrice, formatBtc } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import type { Portfolio, PortfolioSnapshot } from '@/lib/types';

type Tone = 'ink' | 'bull' | 'bear';

const TONE_CLASS: Record<Tone, string> = {
  ink: 'text-ink',
  bull: 'text-bull',
  bear: 'text-bear',
};

function isFutOpen(snap: PortfolioSnapshot): boolean {
  const fut = snap.futures;
  return Boolean(fut && fut.side !== 'flat' && (fut.sizeUsd ?? 0) > 0);
}

/**
 * Auto-resolved SL/TP/liquidation fills the ledger applied this snapshot.
 * Prefers the structured `autoExits` field the ledger now persists; falls back
 * to parsing the legacy rationale string ("…; auto: TP@63000; mark …") for
 * snapshots written before that field existed.
 */
function parseAutoExits(
  snap: PortfolioSnapshot,
): { kind: string; price: number; side?: string | null }[] {
  const structured = snap.autoExits;
  if (structured && structured.length > 0) {
    return structured.map((e) => ({
      kind: String(e.reason).toUpperCase(),
      price: e.price,
      side: e.side ?? null,
    }));
  }
  const r = String(snap.rationale ?? '');
  const m = r.match(/auto:\s*([^;]+)/i);
  if (!m) return [];
  return [...m[1].matchAll(/([A-Za-z_]+)@([\d.]+)/g)].map((x) => ({
    kind: x[1].toUpperCase(),
    price: Number(x[2]),
  }));
}

/** Compact per-snapshot description of BOTH books: what/side/size is held, plus the open futures' scheduled stop/target levels. */
function BooksCell({ snap }: { snap: PortfolioSnapshot }): React.ReactNode {
  const spot = snap.spot;
  const fut = snap.futures;
  const spotHeld = (spot?.btc ?? 0) > 0;
  const futOpen = isFutOpen(snap);

  if (!spotHeld && !futOpen) {
    return <span className="text-ink-muted">Cash only</span>;
  }

  const tps = fut?.takeProfit ?? [];

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
      {futOpen && (fut!.stopPrice != null || tps.length > 0 || fut!.liquidationPrice != null) ? (
        <span className="font-mono text-[11px] tabular-nums text-ink-muted">
          {fut!.stopPrice != null ? (
            <>
              <span className="text-bear">SL</span> {formatPrice(fut!.stopPrice)}
            </>
          ) : null}
          {fut!.stopPrice != null && tps.length > 0 ? ' · ' : ''}
          {tps.length > 0 ? (
            <>
              <span className="text-bull">TP</span> {tps.map((t) => formatPrice(t)).join(' / ')}
            </>
          ) : null}
          {(fut!.stopPrice != null || tps.length > 0) && fut!.liquidationPrice != null ? ' · ' : ''}
          {fut!.liquidationPrice != null ? `Liq ${formatPrice(fut!.liquidationPrice)}` : null}
        </span>
      ) : null}
    </div>
  );
}

const EPS_BTC = 1e-8;

/**
 * Every thing that changed hands on this snapshot, as separate segments — a
 * session can BOTH auto-close a futures leg (TP/SL/liquidation) AND run a
 * discretionary spot/futures trade, so we never collapse to a single event.
 * Fills happen at the session mark (no fees in this game).
 */
function tradeSegments(
  snap: PortfolioSnapshot,
  prev?: PortfolioSnapshot,
): { text: string; tone: Tone }[] {
  const action = String(snap.action);
  if (action === 'INIT') return [{ text: 'Seed (gift + cash)', tone: 'ink' }];
  if (action === 'RESET') return [{ text: 'Reset to 100', tone: 'ink' }];
  if (action === 'FROZEN') return [{ text: 'Frozen — no trade (bankrupt)', tone: 'ink' }];
  if (action === 'BANKRUPTCY') return [{ text: 'Bankrupt — flattened to cash', tone: 'bear' }];

  const segs: { text: string; tone: Tone }[] = [];

  const fBefore = prev?.futures;
  const openBefore = Boolean(
    fBefore && fBefore.side !== 'flat' && (fBefore.sizeUsd ?? 0) > 0,
  );
  const openNow = isFutOpen(snap);
  const autos = parseAutoExits(snap);

  // 1) A futures leg that closed this session — describe it first (it's the "result" event).
  if (openBefore && !openNow) {
    const side = fBefore!.side;
    // Reason: prefer the parsed auto token, else fall back to the snapshot's action
    // (the ledger stamps TP / STOPPED_OUT / LIQUIDATED even when a custom rationale
    // replaces the auto string).
    const kind = autos[0]?.kind ?? String(snap.action);
    // Fill price: exact from the auto token when present, else the scheduled level of
    // the position that closed (from the prior row), else the mark.
    let price = autos[0]?.price ?? snap.markPrice;
    if (autos[0] == null) {
      const tps = fBefore!.takeProfit ?? [];
      if (kind === 'STOPPED_OUT' && fBefore!.stopPrice != null) price = fBefore!.stopPrice;
      else if (kind === 'LIQUIDATED' && fBefore!.liquidationPrice != null)
        price = fBefore!.liquidationPrice;
      else if (kind === 'TP' && tps.length > 0)
        price = side === 'short' ? Math.max(...tps) : Math.min(...tps);
    }
    const label =
      kind === 'TP'
        ? 'Take-profit'
        : kind === 'STOPPED_OUT'
          ? 'Stop-loss'
          : kind === 'LIQUIDATED'
            ? 'Liquidated'
            : 'Closed';
    const tone: Tone = kind === 'TP' ? 'bull' : kind === 'STOPPED_OUT' || kind === 'LIQUIDATED' ? 'bear' : 'ink';
    segs.push({ text: `${label}: closed ${side} @ ${formatPrice(price)}`, tone });
  }

  // 2) Spot book delta.
  const dBtc = (snap.spot?.btc ?? 0) - (prev?.spot?.btc ?? 0);
  if (Math.abs(dBtc) >= EPS_BTC) {
    const usd = Math.abs(dBtc) * snap.markPrice;
    const verb = dBtc > 0 ? 'Buy' : 'Sell';
    segs.push({
      text: `${verb} ${formatPrice(usd)} · ${formatBtc(Math.abs(dBtc))} BTC @ ${formatPrice(snap.markPrice)}`,
      tone: 'ink',
    });
  }

  // 3) Futures open / flip / add / reduce (position changes short of a full close).
  if (!openBefore && openNow) {
    const fut = snap.futures!;
    const lev = (fut.leverage ?? 1) > 1 ? ` · ${fut.leverage}x` : '';
    const entry = fut.entryPrice != null ? ` @ ${formatPrice(fut.entryPrice)}` : '';
    segs.push({
      text: `Open ${fut.side} ${formatPrice(fut.sizeUsd ?? 0)}${lev}${entry}`,
      tone: fut.side === 'long' ? 'bull' : 'bear',
    });
  } else if (openBefore && openNow) {
    const fut = snap.futures!;
    if (fBefore!.side !== fut.side) {
      segs.push({
        text: `Flip to ${fut.side} ${formatPrice(fut.sizeUsd ?? 0)} @ ${formatPrice(snap.markPrice)}`,
        tone: fut.side === 'long' ? 'bull' : 'bear',
      });
    } else {
      const dSize = (fut.sizeUsd ?? 0) - (fBefore!.sizeUsd ?? 0);
      if (Math.abs(dSize) > 0.005) {
        segs.push({
          text: `${dSize > 0 ? 'Add' : 'Reduce'} futures ${formatPrice(Math.abs(dSize))} @ ${formatPrice(snap.markPrice)}`,
          tone: 'ink',
        });
      }
    }
  }

  return segs;
}

/**
 * Realized P&L banked on THIS snapshot. The ledger stores `realizedPnlUsd`
 * per-session (reset each snapshot, accumulated only within the session), so
 * it is read directly — not diffed against the prior row.
 */
function sessionRealized(snap: PortfolioSnapshot): number | null {
  const action = String(snap.action);
  if (action === 'INIT' || action === 'RESET') return null; // baseline rows, not a trade result
  return snap.realizedPnlUsd ?? null;
}

/** Discretionary action this session CHOSE, derived from the book deltas (the auto-exits are handled separately). */
function discretionaryActionLabel(
  snap: PortfolioSnapshot,
  prev?: PortfolioSnapshot,
): { text: string; tone: Tone } | null {
  const dBtc = (snap.spot?.btc ?? 0) - (prev?.spot?.btc ?? 0);
  if (dBtc >= EPS_BTC) return { text: 'ADD · spot', tone: 'ink' };
  if (dBtc <= -EPS_BTC) return { text: 'REDUCE · spot', tone: 'ink' };

  const fBefore = prev?.futures;
  const openBefore = Boolean(fBefore && fBefore.side !== 'flat' && (fBefore.sizeUsd ?? 0) > 0);
  const openNow = isFutOpen(snap);
  if (!openBefore && openNow) {
    const side = snap.futures!.side;
    return { text: `Open ${side} · futures`, tone: side === 'long' ? 'bull' : 'bear' };
  }
  if (openBefore && openNow) {
    const side = snap.futures!.side;
    if (fBefore!.side !== side) return { text: `Flip ${side} · futures`, tone: side === 'long' ? 'bull' : 'bear' };
    const dSize = (snap.futures!.sizeUsd ?? 0) - (fBefore!.sizeUsd ?? 0);
    if (dSize > 0.005) return { text: 'Add · futures', tone: 'ink' };
    if (dSize < -0.005) return { text: 'Reduce · futures', tone: 'ink' };
  }
  return null;
}

/** Simple one-off label for actions that don't decompose into auto + discretionary parts. */
function simpleActionLabel(snap: PortfolioSnapshot): string {
  const a = String(snap.action);
  const fut = snap.futures;
  const futOpen = isFutOpen(snap);
  switch (a) {
    case 'ADD':
    case 'REDUCE':
    case 'EXIT':
    case 'TAKE_PROFIT':
      return futOpen ? `${a} · futures ${fut!.side}` : `${a} · spot`;
    case 'FLIP':
      return futOpen ? `FLIP · futures ${fut!.side}` : 'FLIP';
    case 'SKIP':
      return 'Skip (no trade)';
    case 'FROZEN':
      return 'Frozen (bankrupt)';
    case 'BANKRUPTCY':
      return 'Bankruptcy';
    case 'HOLD':
      return 'Hold (mark only)';
    case 'INIT':
      return 'Seed (gift + cash)';
    case 'RESET':
      return 'Reset to 100';
    default:
      return a;
  }
}

/**
 * All the actions that happened on this snapshot, newest-relevant first — a
 * session can auto-resolve a stop/target AND run a discretionary trade, so the
 * Action column stacks each one (e.g. "Take-profit hit · futures short" then
 * "ADD · spot") instead of hiding the second.
 */
function actionLabels(snap: PortfolioSnapshot, prev?: PortfolioSnapshot): { text: string; tone: Tone }[] {
  const a = String(snap.action);
  if (a === 'INIT' || a === 'RESET' || a === 'FROZEN' || a === 'BANKRUPTCY' || a === 'SKIP' || a === 'HOLD') {
    return [{ text: simpleActionLabel(snap), tone: 'ink' }];
  }

  const labels: { text: string; tone: Tone }[] = [];
  const closedSide =
    prev?.futures?.side && prev.futures.side !== 'flat' ? prev.futures.side : '';

  // 1) Auto-resolved exits (from the persisted structured field, else derived).
  const autos = parseAutoExits(snap);
  const autoKinds =
    autos.length > 0
      ? autos.map((e) => ({ kind: e.kind, side: e.side ?? closedSide }))
      : ['TP', 'STOPPED_OUT', 'LIQUIDATED', 'CLOSE'].includes(a)
        ? [{ kind: a, side: closedSide }]
        : [];
  for (const { kind, side } of autoKinds) {
    if (kind === 'TP') labels.push({ text: `Take-profit hit · futures ${side}`.trim(), tone: 'bull' });
    else if (kind === 'STOPPED_OUT') labels.push({ text: `Stopped out · futures ${side}`.trim(), tone: 'bear' });
    else if (kind === 'LIQUIDATED') labels.push({ text: `Liquidated · futures ${side}`.trim(), tone: 'bear' });
    else labels.push({ text: `Closed · futures ${side}`.trim(), tone: 'ink' });
  }

  // 2) The discretionary trade the session chose (may co-exist with an auto-exit).
  const disc = discretionaryActionLabel(snap, prev);
  if (disc && !labels.some((l) => l.text === disc.text)) labels.push(disc);

  // 3) Fallback to the raw mapping if nothing decomposed.
  if (labels.length === 0) labels.push({ text: simpleActionLabel(snap), tone: 'ink' });
  return labels;
}

/** Realized-P&L cell: green gain / red loss for closing rows, muted dash otherwise. */
function ResultCell({ value }: { value: number | null }): React.ReactNode {
  if (value == null || Math.abs(value) < 0.005) {
    return <span className="text-ink-muted">—</span>;
  }
  const gain = value > 0;
  return (
    <span className={cn('font-mono tabular-nums', gain ? 'text-bull' : 'text-bear')}>
      {gain ? '+' : '−'}
      {formatPrice(Math.abs(value))}
    </span>
  );
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
        Each row is the wallet state after that session acted. “Trade” lists everything that
        changed hands — including any stop/target that auto-filled — filled at the mark, no
        fees. “Position” is the resulting books (spot BTC and any open futures side/size with
        its scheduled SL/TP). “Result” is the realized P&amp;L banked when a position closed.
      </p>
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="text-[11px] uppercase text-ink-muted">
          <tr>
            <th className="pb-1.5 pr-3 font-medium">When</th>
            <th className="pb-1.5 pr-3 font-medium">Session</th>
            <th className="pb-1.5 pr-3 font-medium">Action</th>
            <th className="pb-1.5 pr-3 font-medium">Trade</th>
            <th className="pb-1.5 pr-3 font-medium">Position</th>
            <th className="pb-1.5 pr-3 text-right font-medium">Result</th>
            <th className="pb-1.5 pr-3 text-right font-medium">Mark</th>
            <th className="pb-1.5 text-right font-medium">Equity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ snap, prev }, i) => {
            const segs = tradeSegments(snap, prev);
            return (
              <tr key={`${snap.ts}-${i}`} className="border-t border-stroke/60 align-top">
                <td className="py-1.5 pr-3 text-ink-muted">{formatDateTime(snap.ts)}</td>
                <td className="py-1.5 pr-3 capitalize">{formatSession(snap.session)}</td>
                <td className="py-1.5 pr-3">
                  <div className="flex flex-col gap-0.5 leading-tight">
                    {actionLabels(snap, prev).map((l, li) => (
                      <span key={li} className={TONE_CLASS[l.tone]}>
                        {l.text}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-1.5 pr-3 text-xs">
                  {segs.length > 0 ? (
                    <div className="flex flex-col gap-0.5 leading-tight">
                      {segs.map((s, si) => (
                        <span
                          key={si}
                          className={cn('font-mono tabular-nums', TONE_CLASS[s.tone])}
                        >
                          {s.text}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-ink-muted">— no trade</span>
                  )}
                </td>
                <td className="py-1.5 pr-3 text-xs">
                  <BooksCell snap={snap} />
                </td>
                <td className="py-1.5 pr-3 text-right text-xs">
                  <ResultCell value={sessionRealized(snap)} />
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
