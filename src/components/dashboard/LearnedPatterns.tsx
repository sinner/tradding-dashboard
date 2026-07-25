import { Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { formatSession } from '@/lib/formatters';
import type { Portfolio } from '@/lib/types';

/** Patterns the desk has learned across sessions and rounds. */
export function LearnedPatterns({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
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
