import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { formatSession } from '@/lib/formatters';
import type { Portfolio, PortfolioMessage } from '@/lib/types';

/** Hand-off notes older than this (vs the newest note) are hidden; the ledger prunes them too. */
const HANDOFF_WINDOW_DAYS = 5;
const DAY_MS = 86_400_000;

function dayKey(ts: string): string {
  return new Date(ts).toLocaleDateString('en-CA'); // YYYY-MM-DD in the viewer's zone
}

function dayLabel(key: string, todayKey: string): string {
  const d = new Date(`${key}T12:00:00`);
  const diff = Math.round((new Date(`${todayKey}T12:00:00`).getTime() - d.getTime()) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Group the last N days of notes by day, newest day first, relay order inside a day. */
function groupHandoffs(
  messages: PortfolioMessage[],
  now: Date = new Date(),
): { key: string; label: string; items: PortfolioMessage[] }[] {
  if (messages.length === 0) return [];
  const newest = Math.max(...messages.map((m) => new Date(m.ts).getTime()));
  const cutoff = Math.min(newest, now.getTime()) - HANDOFF_WINDOW_DAYS * DAY_MS;
  const recent = messages
    .filter((m) => new Date(m.ts).getTime() >= cutoff)
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const todayKey = dayKey(now.toISOString());
  const groups = new Map<string, PortfolioMessage[]>();
  for (const m of recent) {
    const k = dayKey(m.ts);
    groups.set(k, [...(groups.get(k) ?? []), m]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ key, label: dayLabel(key, todayKey), items }));
}

/** Inter-session hand-off notes for the last 5 days, grouped by day. */
export function HandoffNotes({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const days = groupHandoffs(portfolio.messages ?? []);
  return (
    <Card className="space-y-3">
      <Title level={4} className="flex items-center gap-2">
        <MessageSquare className="size-4 text-brand-light" aria-hidden />
        Hand-off notes
        <span className="text-[11px] font-normal text-ink-muted">
          last {HANDOFF_WINDOW_DAYS} days
        </span>
      </Title>
      {days.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No data yet — no hand-off notes between sessions so far.
        </p>
      ) : (
        <div className="space-y-4">
          {days.map((d) => (
            <section key={d.key} className="space-y-2">
              <h5 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {d.label}
              </h5>
              <ol className="space-y-2 border-l border-stroke/60 pl-3">
                {d.items.map((m, i) => (
                  <li key={`${m.ts}-${i}`} className="text-sm">
                    <span className="mr-2 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium capitalize text-brand-light">
                      {formatSession(m.from)} → {m.to ? formatSession(String(m.to)) : 'all'}
                    </span>
                    <span className="text-ink">{m.text}</span>
                    <span className="ml-2 text-[11px] text-ink-muted">
                      {new Date(m.ts).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
}
