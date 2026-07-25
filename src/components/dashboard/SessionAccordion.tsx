import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BiasBadge } from '@/components/dashboard/BiasBadge';
import { formatSession } from '@/lib/formatters';
import type { Report } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  session: string;
  report?: Report;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/**
 * Mobile-only accordion wrapper for a session box.
 * On desktop (lg+) the header toggle is hidden and the content is always shown,
 * so the look & feel is identical to before. On mobile the header collapses the box.
 */
export function SessionAccordion({
  session,
  report,
  defaultOpen = true,
  children,
}: Props): React.ReactNode {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-stroke/60 bg-bg px-3 py-2 text-left lg:hidden"
      >
        <span className="text-sm font-medium text-ink">{formatSession(session)}</span>
        <span className="flex items-center gap-2">
          {report ? (
            <BiasBadge bias={report.overallBias} />
          ) : (
            <span className="text-xs text-ink-muted">no data</span>
          )}
          <ChevronDown
            className={cn('size-4 text-ink-muted transition', open && 'rotate-180')}
            aria-hidden
          />
        </span>
      </button>
      <div className={cn('lg:block', open ? 'block' : 'hidden')}>{children}</div>
    </div>
  );
}
