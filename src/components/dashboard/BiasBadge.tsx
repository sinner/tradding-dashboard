import { CircleDashed } from 'lucide-react';
import type { Bias } from '@/lib/types';
import { cn } from '@/lib/cn';

/** A report's bias, or 'nodata' when the session has not produced a report. */
export type BiasTag = Bias | 'nodata';

const styles: Record<BiasTag, string> = {
  bullish: 'bg-bull/15 text-bull ring-1 ring-bull/35',
  range: 'bg-signal/15 text-signal ring-1 ring-signal/35',
  bearish: 'bg-bear/15 text-bear ring-1 ring-bear/35',
  nodata: 'border border-dashed border-ink-muted/50 bg-ink-muted/10 text-ink-muted',
};

const labels: Record<BiasTag, string> = {
  bullish: 'bullish',
  range: 'range',
  bearish: 'bearish',
  nodata: 'no data',
};

type Props = {
  /** Pass null/undefined (or 'nodata') when there is no report — renders the "No data" tag. */
  bias: BiasTag | null | undefined;
  className?: string;
};

export function BiasBadge({ bias, className }: Props): React.ReactNode {
  const tag: BiasTag = bias ?? 'nodata';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        styles[tag],
        className,
      )}
      title={tag === 'nodata' ? 'This session has not produced a report yet' : undefined}
    >
      {tag === 'nodata' ? <CircleDashed className="size-3" aria-hidden /> : null}
      {labels[tag]}
    </span>
  );
}

/** Tiny color key for RANGE / BULLISH / BEARISH / NO DATA. */
export function BiasLegend({ className }: { className?: string }): React.ReactNode {
  return (
    <ul className={cn('flex flex-wrap gap-2 text-[10px]', className)}>
      {(Object.keys(styles) as BiasTag[]).map((b) => (
        <li key={b}>
          <BiasBadge bias={b} />
        </li>
      ))}
    </ul>
  );
}
