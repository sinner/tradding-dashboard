import { Lightbulb } from 'lucide-react';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';
import { formatSession } from '@/lib/formatters';
import type { Portfolio } from '@/lib/types';

/** Patterns the desk has learned across sessions and rounds. */
export function LearnedPatterns({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const lessons = [...(portfolio.lessons ?? [])].reverse();
  return (
    <CollapsibleCard
      defaultOpen={false}
      summary={
        lessons.length === 0
          ? 'empty'
          : `${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`
      }
      title={
        <span className="flex items-center gap-2 text-base font-medium text-ink">
          <Lightbulb className="size-4 text-amber-300" aria-hidden />
          Learned patterns
        </span>
      }
    >
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
    </CollapsibleCard>
  );
}
