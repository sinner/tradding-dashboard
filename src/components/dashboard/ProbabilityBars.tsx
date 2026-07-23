import type { Report } from '@/lib/types';
import { cn } from '@/lib/cn';

type Props = {
  probabilities: Report['probabilities'];
  className?: string;
};

const bars = [
  { key: 'bullish' as const, label: 'Bull', color: 'bg-bull' },
  { key: 'range' as const, label: 'Range', color: 'bg-signal' },
  { key: 'bearish' as const, label: 'Bear', color: 'bg-bear' },
];

export function ProbabilityBars({ probabilities, className }: Props): React.ReactNode {
  return (
    <div className={cn('space-y-2', className)}>
      {bars.map((bar) => {
        const value = probabilities[bar.key];
        return (
          <div key={bar.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">{bar.label}</span>
              <span className="font-mono tabular-nums text-ink">{value.toFixed(2)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  bar.color,
                )}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
