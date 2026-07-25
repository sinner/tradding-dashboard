import { MessageSquare, Skull, Lightbulb, History as HistoryIcon } from 'lucide-react';
import { PortfolioPanel } from '@/components/dashboard/PortfolioPanel';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { usePortfolio } from '@/hooks/useDayReports';
import { REPORT_DEPLOY_POLL_MS } from '@/config/constants';
import { formatSession, formatDateTime, formatPrice } from '@/lib/formatters';
import type { Portfolio } from '@/lib/types';

export function PaperWalletPage(): React.ReactNode {
  const { data: portfolio, isLoading } = usePortfolio({
    refetchInterval: REPORT_DEPLOY_POLL_MS,
  });
  const p = portfolio ?? null;
  const hasData = Boolean(p && p.latest);

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Paper wallet</Title>
        <p className="mt-1 text-sm text-ink-muted">
          The four sessions relay ONE paper wallet of {formatPrice(100)} (not real money),
          must cover a monthly cost of living, and learn from every bankruptcy. Spot,
          shorts and leverage allowed.
        </p>
      </div>

      {p?.status === 'bankrupt' ? (
        <Card className="border-bear/50 bg-bear/10">
          <p className="flex items-center gap-2 text-sm font-medium text-bear">
            <Skull className="size-4" aria-hidden />
            Bankrupt — the wallet is frozen (no trading) and will restart at the next
            midnight session.
          </p>
        </Card>
      ) : null}

      <PortfolioPanel portfolio={p} isLoading={isLoading} />

      {hasData ? (
        <>
          <Messages portfolio={p!} />
          <div className="grid gap-4 md:grid-cols-2">
            <HallOfShame portfolio={p!} />
            <Lessons portfolio={p!} />
          </div>
          <RecentHistory portfolio={p!} />
        </>
      ) : null}
    </div>
  );
}

function Messages({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const msgs = [...(portfolio.messages ?? [])].reverse().slice(0, 12);
  return (
    <Card className="space-y-3">
      <Title level={4} className="flex items-center gap-2">
        <MessageSquare className="size-4 text-brand-light" aria-hidden />
        Hand-off notes
      </Title>
      {msgs.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No data yet — no hand-off notes between sessions so far.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {msgs.map((m, i) => (
            <li key={`${m.ts}-${i}`} className="text-sm">
              <span className="mr-2 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium capitalize text-brand-light">
                {formatSession(m.from)} → {m.to ? formatSession(String(m.to)) : 'all'}
              </span>
              <span className="text-ink">{m.text}</span>
              <span className="ml-2 text-[11px] text-ink-muted">
                {formatDateTime(m.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function HallOfShame({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const entries = [...(portfolio.hallOfShame ?? [])].reverse();
  return (
    <Card className="space-y-3">
      <Title level={4} className="flex items-center gap-2">
        <Skull className="size-4 text-bear" aria-hidden />
        Hall of shame
        <span className="text-xs font-normal text-ink-muted">
          {portfolio.bankruptcies ?? 0} bankruptcies
        </span>
      </Title>
      {entries.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No bankruptcies yet — nobody has fallen from grace. 🎉
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e, i) => (
            <li key={`${e.ts}-${i}`} className="border-l-2 border-bear/50 pl-3 text-sm">
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">
                round {e.round} · {e.session ? formatSession(e.session) : '—'} ·{' '}
                {e.equityBefore != null ? formatPrice(e.equityBefore) : ''}
              </p>
              <p className="text-ink">{e.reason}</p>
              <p className="mt-0.5 text-ink-muted">
                <span className="font-medium text-amber-300">Lesson:</span> {e.lesson}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Lessons({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const lessons = [...(portfolio.lessons ?? [])].reverse();
  return (
    <Card className="space-y-3">
      <Title level={4} className="flex items-center gap-2">
        <Lightbulb className="size-4 text-amber-300" aria-hidden />
        Learned patterns
      </Title>
      {lessons.length === 0 ? (
        <p className="text-sm text-ink-muted">No lessons recorded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {lessons.map((l, i) => (
            <li key={`${l.ts}-${i}`} className="text-sm">
              <span className="font-medium text-ink">{l.pattern}</span>
              {l.session ? (
                <span className="ml-2 text-[11px] capitalize text-ink-muted">
                  {formatSession(l.session)}
                </span>
              ) : null}
              <p className="text-ink-muted">{l.insight}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RecentHistory({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const rows = [...(portfolio.history ?? [])].reverse().slice(0, 12);
  return (
    <Card className="space-y-3 overflow-x-auto">
      <Title level={4} className="flex items-center gap-2">
        <HistoryIcon className="size-4 text-ink-muted" aria-hidden />
        Recent snapshots
      </Title>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-[11px] uppercase text-ink-muted">
          <tr>
            <th className="pb-1.5 pr-3 font-medium">When</th>
            <th className="pb-1.5 pr-3 font-medium">Session</th>
            <th className="pb-1.5 pr-3 font-medium">Action</th>
            <th className="pb-1.5 pr-3 text-right font-medium">Mark</th>
            <th className="pb-1.5 text-right font-medium">Equity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <tr key={`${s.ts}-${i}`} className="border-t border-stroke/60">
              <td className="py-1.5 pr-3 text-ink-muted">{formatDateTime(s.ts)}</td>
              <td className="py-1.5 pr-3 capitalize">{formatSession(s.session)}</td>
              <td className="py-1.5 pr-3">{s.action}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-ink-muted">
                {formatPrice(s.markPrice)}
              </td>
              <td className="py-1.5 text-right font-mono tabular-nums text-ink">
                {formatPrice(s.equityUsd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
