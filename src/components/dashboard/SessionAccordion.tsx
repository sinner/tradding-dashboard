import { useState } from 'react';
import { ChevronDown, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { BiasBadge } from '@/components/dashboard/BiasBadge';
import { formatGeneratedAt, formatSession } from '@/lib/formatters';
import { sessionMeta, type SessionKey } from '@/lib/sessions';
import type { Report } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  session: string;
  report?: Report;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

const ICONS: Record<SessionKey, typeof Moon> = {
  midnight: Moon,
  morning: Sunrise,
  midday: Sun,
  endday: Sunset,
};

/**
 * Groups every card of one scheduled agent (session) inside a single framed panel:
 * a coloured header (agent, schedule, generated time, bias) and the agent's cards
 * below. Collapsible on every screen size so you can focus on one agent.
 */
export function SessionAccordion({
  session,
  report,
  defaultOpen = true,
  children,
}: Props): React.ReactNode {
  const [open, setOpen] = useState(defaultOpen);
  const meta = sessionMeta(session);
  const accent = meta?.accent ?? '#A78BFA';
  const Icon = ICONS[session as SessionKey] ?? Sun;

  return (
    <section
      aria-label={`${formatSession(session)} agent`}
      className="self-start overflow-hidden rounded-2xl border border-stroke/60 bg-bg/30 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/20"
      style={{ borderTopColor: accent, borderTopWidth: 3 }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-bg/60"
        style={{ backgroundColor: `${accent}14` }}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}26`, color: accent }}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink">
              {formatSession(session)} agent
            </span>
            <span className="block truncate text-[11px] text-ink-muted">
              {meta?.schedule ?? ''}
              {report ? ` · generated ${formatGeneratedAt(report.generatedAt)}` : ' · not run yet'}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <BiasBadge bias={report?.overallBias} />
          <ChevronDown
            className={cn(
              'size-4 text-ink-muted transition-transform duration-300 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>
      {/* grid-rows 0fr→1fr animates to the content's real height; motion-reduce skips it */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'p-3 transition-transform duration-300 ease-out motion-reduce:transition-none',
              open ? 'translate-y-0' : '-translate-y-2',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
