import type { Bias } from '@/lib/types';
import { cn } from '@/lib/cn';

const styles: Record<Bias, string> = {
  bullish: 'bg-bull/15 text-bull ring-bull/35',
  range: 'bg-signal/15 text-signal ring-signal/35',
  bearish: 'bg-bear/15 text-bear ring-bear/35',
};

type Props = {
  bias: Bias;
  className?: string;
};

export function BiasBadge({ bias, className }: Props): React.ReactNode {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1',
        styles[bias],
        className,
      )}
    >
      {bias}
    </span>
  );
}

/** Tiny color key for RANGE / BULLISH / BEARISH. */
export function BiasLegend({ className }: { className?: string }): React.ReactNode {
  return (
    <ul className={cn('flex flex-wrap gap-2 text-[10px]', className)}>
      {(Object.keys(styles) as Bias[]).map((b) => (
        <li key={b}>
          <BiasBadge bias={b} />
        </li>
      ))}
    </ul>
  );
}
