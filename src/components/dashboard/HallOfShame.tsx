import { Skull } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { formatSession, formatPrice } from '@/lib/formatters';
import type { Portfolio } from '@/lib/types';

/** Bankruptcy log — each fall from grace with its lesson. */
export function HallOfShame({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
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
