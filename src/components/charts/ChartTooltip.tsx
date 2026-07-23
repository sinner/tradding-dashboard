import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  x: number;
  y: number;
  title: string;
  rows: { label: string; value: string; tone?: 'up' | 'down' | 'muted' }[];
  className?: string;
};

export function ChartTooltip({ x, y, title, rows, className }: Props): ReactNode {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-20 min-w-[168px] rounded-xl border border-stroke/80',
        'bg-bg-deep/95 px-3 py-2 shadow-glow backdrop-blur-md',
        'animate-fade-in font-sans text-xs',
        className,
      )}
      style={{ left: x, top: y, transform: 'translate(-50%, calc(-100% - 12px))' }}
      role="tooltip"
    >
      <p className="mb-1.5 font-medium text-ink">{title}</p>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd
              className={cn(
                'font-mono tabular-nums',
                row.tone === 'up' && 'text-bull',
                row.tone === 'down' && 'text-bear',
                (!row.tone || row.tone === 'muted') && 'text-ink',
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
