import type { Report } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';

type Props = {
  report: Report;
};

function scalarValue(
  v: number | { value?: number; changePct?: number | null; note?: string } | null | undefined,
): { value?: number; changePct?: number | null; note?: string } | null {
  if (v == null) return null;
  if (typeof v === 'number') return { value: v };
  return v;
}

function fmtUsd(n: number): string {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

/** Compact "what's moving it" strip from report macro + sources. */
export function MacroStrip({ report }: Props): React.ReactNode {
  const m = report.macro;
  if (!m) return null;

  const brent = scalarValue(m.brent);
  const dxy = scalarValue(m.dxy);
  const us10y = scalarValue(m.us10y);
  const fg = m.fearGreed;
  const etf = m.etfFlows;
  const liq = m.liquidations;
  const earnings = m.earnings?.slice(0, 3) ?? [];
  const sources = report.sources.slice(0, 3);
  const changed = report.decisionBox.changed;

  const chips: { label: string; value: string }[] = [];
  if (fg != null) chips.push({ label: 'Fear & Greed', value: String(fg) });
  if (etf?.streakDays != null) {
    chips.push({ label: 'ETF streak', value: `${etf.streakDays}d` });
  }
  if (liq?.skew != null) {
    chips.push({ label: 'Liq skew', value: `${liq.skew}× long` });
  } else if (liq?.longsUsd != null && liq?.shortsUsd != null) {
    chips.push({
      label: 'Liquidations',
      value: `${fmtUsd(liq.longsUsd)} L / ${fmtUsd(liq.shortsUsd)} S`,
    });
  }
  if (brent?.value != null) {
    chips.push({
      label: 'Brent',
      value:
        brent.changePct != null
          ? `$${brent.value} (${brent.changePct > 0 ? '+' : ''}${brent.changePct}%)`
          : `$${brent.value}`,
    });
  }
  if (dxy?.value != null) chips.push({ label: 'DXY', value: String(dxy.value) });
  if (us10y?.value != null) chips.push({ label: 'US10Y', value: `${us10y.value}%` });

  if (chips.length === 0 && !changed && earnings.length === 0) return null;

  return (
    <Card className="space-y-3">
      <Title level={4}>What&apos;s moving it</Title>
      {changed ? <p className="text-sm text-ink-muted">{changed}</p> : null}
      {chips.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <li
              key={c.label}
              className="rounded-lg border border-stroke/60 bg-bg/40 px-2.5 py-1.5 text-xs"
            >
              <span className="text-ink-muted">{c.label}</span>
              <span className="ml-1.5 font-mono tabular-nums text-ink">{c.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {etf?.note ? <p className="text-[11px] text-ink-muted">{etf.note}</p> : null}
      {earnings.length > 0 ? (
        <p className="text-xs text-ink-muted">
          Catalysts:{' '}
          {earnings
            .map((e) => `${e.ticker}${e.reaction ? ` (${e.reaction})` : ''}`)
            .join(' · ')}
        </p>
      ) : null}
      {sources.length > 0 ? (
        <ul className="flex flex-wrap gap-3 text-xs">
          {sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
