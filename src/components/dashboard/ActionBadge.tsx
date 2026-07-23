import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { classifyAction, SIDE_META } from '@/lib/tradeActions';
import { cn } from '@/lib/cn';

type Props = {
  action: string;
  market?: string;
  className?: string;
};

export function ActionBadge({ action, market, className }: Props): React.ReactNode {
  const side = classifyAction(action);
  const meta = SIDE_META[side];
  const Icon = meta.Icon;
  const isFutures = (market ?? '').toLowerCase().includes('futures');

  return (
    <InfoPopover
      variant="text"
      label={`What does ${action} mean?`}
      title={meta.title}
      className={className}
      textClassName={cn(
        'inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px]',
        'font-semibold uppercase tracking-wide ring-1 ring-stroke border-0',
        meta.tone,
      )}
      text={
        <span className="inline-flex items-center gap-1">
          <Icon className="size-3.5" aria-hidden />
          {action}
        </span>
      }
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-lg bg-bg ring-1 ring-stroke',
            meta.tone,
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span className={cn('text-sm font-semibold', meta.tone)}>{meta.label}</span>
      </div>
      {meta.body.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {isFutures && (side === 'long' || side === 'short') ? (
        <p>
          This row is a <span className="font-medium text-ink">futures</span> suggestion.
          Check entry, stop, and targets on the card before sizing.
        </p>
      ) : null}
      {isFutures && side === 'wait' ? (
        <p>Futures: stay flat — no long and no short until the setup improves.</p>
      ) : null}
    </InfoPopover>
  );
}

/** Compact long vs short primer shown above operations. */
export function FuturesSideLegend(): React.ReactNode {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-stroke/60 bg-bg/30 p-2.5">
      <InfoPopover
        variant="text"
        label="When to go long"
        title="Long (futures)"
        textClassName="flex w-full items-start gap-2 rounded-lg border border-bull/25 bg-bull/5 p-2 text-left text-xs text-ink no-underline border-solid"
        text={
          <span className="flex gap-2">
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-bull" aria-hidden />
            <span>
              <span className="font-semibold text-bull">Long</span>
              <span className="mt-0.5 block text-[11px] text-ink-muted">
                Profit if price rises · hover
              </span>
            </span>
          </span>
        }
      >
        {SIDE_META.long.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </InfoPopover>
      <InfoPopover
        variant="text"
        label="When to go short"
        title="Short (futures)"
        textClassName="flex w-full items-start gap-2 rounded-lg border border-bear/25 bg-bear/5 p-2 text-left text-xs text-ink no-underline border-solid"
        text={
          <span className="flex gap-2">
            <ArrowDownRight className="mt-0.5 size-4 shrink-0 text-bear" aria-hidden />
            <span>
              <span className="font-semibold text-bear">Short</span>
              <span className="mt-0.5 block text-[11px] text-ink-muted">
                Profit if price falls · hover
              </span>
            </span>
          </span>
        }
      >
        {SIDE_META.short.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </InfoPopover>
    </div>
  );
}
