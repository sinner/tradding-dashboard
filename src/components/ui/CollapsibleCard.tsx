import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

type Props = Readonly<{
  title: ReactNode;
  children: ReactNode;
  /** Closed by default so long lists don’t push the rest of the page. */
  defaultOpen?: boolean;
  className?: string;
  summary?: string;
}>;

/** Card whose body toggles open/closed. Prefer closed for long secondary lists. */
export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  className,
  summary,
}: Props): React.ReactNode {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <Card className={cn('space-y-0 p-0', className)} padded={false}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3.5 text-left transition hover:bg-bg/30 md:px-5"
      >
        <div className="min-w-0 flex-1">{title}</div>
        {!open && summary ? (
          <span className="hidden shrink-0 text-[11px] text-ink-muted sm:inline">
            {summary}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="border-t border-stroke/60 px-4 py-3 md:px-5 md:pb-5">
          {children}
        </div>
      ) : (
        <div id={panelId} hidden />
      )}
    </Card>
  );
}
