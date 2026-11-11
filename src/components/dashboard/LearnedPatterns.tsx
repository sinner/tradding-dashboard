import { CalendarRange, Lightbulb } from 'lucide-react';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';
import { formatSession } from '@/lib/formatters';
import type { LessonDigest, Portfolio } from '@/lib/types';

function weekRange(d: LessonDigest): string {
  const fmt = (s: string) =>
    new Date(`${s.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  return `${fmt(d.weekStart)} – ${fmt(d.weekEnd)}`;
}

function statChips(d: LessonDigest): string[] {
  return Object.entries(d.stats ?? {})
    .filter(([, v]) => v !== null && v !== '')
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${v}`);
}

/** This week's raw lessons on top, weekly digests (newest first, collapsible) below. */
export function LearnedPatterns({ portfolio }: { portfolio: Portfolio }): React.ReactNode {
  const lessons = [...(portfolio.lessons ?? [])].reverse();
  const digests = [...(portfolio.lessonDigests ?? [])].reverse();
  const summary =
    lessons.length === 0 && digests.length === 0
      ? 'empty'
      : `${lessons.length} this week · ${digests.length} weekly digest${digests.length === 1 ? '' : 's'}`;

  return (
    <CollapsibleCard
      defaultOpen={false}
      summary={summary}
      title={
        <span className="flex items-center gap-2 text-base font-medium text-ink">
          <Lightbulb className="size-4 text-amber-300" aria-hidden />
          Learned patterns
        </span>
      }
    >
      <div className="space-y-5">
        <section className="space-y-2.5">
          <h5 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            This week
          </h5>
          {lessons.length === 0 ? (
            <p className="text-sm text-ink-muted">No new lessons since the last digest.</p>
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
        </section>
        {digests.length > 0 ? (
          <section className="space-y-2">
            <h5 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Weekly digests
            </h5>
            {digests.map((d, i) => (
              <details
                key={`${d.weekStart}-${i}`}
                open={i === 0}
                className="rounded-xl border border-stroke/60 bg-bg/40 px-3 py-2"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 text-sm text-ink">
                  <CalendarRange className="size-3.5 text-brand-light" aria-hidden />
                  <span className="font-medium">{weekRange(d)}</span>
                  {d.title ? <span className="text-ink-muted">· {d.title}</span> : null}
                  {d.lessonCount ? (
                    <span className="text-[11px] text-ink-muted">
                      ({d.lessonCount} lessons)
                    </span>
                  ) : null}
                </summary>
                <ul className="mt-2 space-y-2">
                  {d.patterns.map((p, j) => (
                    <li key={j} className="text-sm">
                      <span className="font-medium text-ink">{p.pattern}</span>
                      <p className="text-ink-muted">{p.insight}</p>
                    </li>
                  ))}
                </ul>
                {statChips(d).length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {statChips(d).map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] text-brand-light"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
              </details>
            ))}
          </section>
        ) : null}
      </div>
    </CollapsibleCard>
  );
}
