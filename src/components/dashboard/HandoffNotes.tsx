import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { formatSession, formatDateTime } from '@/lib/formatters';
import type { Portfolio } from '@/lib/types';

/** Inter-session hand-off notes, newest first. */
export function HandoffNotes({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
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
