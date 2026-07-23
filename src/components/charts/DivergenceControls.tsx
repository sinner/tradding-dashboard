import {
  DIVERGENCE_COLORS,
  DIVERGENCE_LABELS,
  DIVERGENCE_TYPES,
} from '@/components/charts/DivergenceOverlay';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { GLOSSARY } from '@/lib/glossary';
import type { DivergenceType } from '@/indicators';
import { cn } from '@/lib/cn';

const TYPE_GLOSSARY: Record<
  DivergenceType,
  (typeof GLOSSARY)['regularBull' | 'regularBear' | 'hiddenBull' | 'hiddenBear']
> = {
  regular_bullish: GLOSSARY.regularBull,
  regular_bearish: GLOSSARY.regularBear,
  hidden_bullish: GLOSSARY.hiddenBull,
  hidden_bearish: GLOSSARY.hiddenBear,
};

type Props = Readonly<{
  active: Record<DivergenceType, boolean>;
  onToggle: (type: DivergenceType) => void;
  pivotLookback: number;
  onPivotChange: (value: number) => void;
}>;

export function DivergenceControls({
  active,
  onToggle,
  pivotLookback,
  onPivotChange,
}: Props): React.ReactNode {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <InfoPopover
          variant="text"
          trigger="click"
          label="What are divergences?"
          title={GLOSSARY.divergences.title}
          textClassName="text-[11px] font-semibold uppercase tracking-wide text-signal hover:text-brand-light"
          text="Divergences — what is this?"
        >
          {GLOSSARY.divergences.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            Click each type name for its definition. Use the colored dot to show
            or hide that line on the RSI and price charts.
          </p>
        </InfoPopover>

        <label className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-muted">
          Pivot
          <input
            type="number"
            min={2}
            max={8}
            value={pivotLookback}
            onChange={(e) => onPivotChange(Number(e.target.value) || 3)}
            className="w-12 rounded border border-stroke bg-bg px-1.5 py-0.5 font-mono text-ink"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {DIVERGENCE_TYPES.map((t) => {
          const g = TYPE_GLOSSARY[t];
          const on = active[t];
          return (
            <div
              key={t}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-2 ring-1',
                on ? 'bg-bg ring-stroke' : 'bg-transparent ring-stroke/40',
              )}
            >
              <button
                type="button"
                onClick={() => onToggle(t)}
                aria-pressed={on}
                className={cn(
                  'size-2.5 shrink-0 rounded-full ring-1 ring-current transition',
                  on ? 'opacity-100' : 'opacity-30',
                )}
                style={{
                  backgroundColor: on ? DIVERGENCE_COLORS[t] : 'transparent',
                  color: DIVERGENCE_COLORS[t],
                }}
                title={on ? `Hide ${DIVERGENCE_LABELS[t]}` : `Show ${DIVERGENCE_LABELS[t]}`}
              />
              <InfoPopover
                variant="text"
                trigger="click"
                label={`What is ${g.title}?`}
                title={g.title}
                textClassName="text-[11px] font-medium text-ink hover:text-signal"
                text={
                  <span style={{ color: on ? DIVERGENCE_COLORS[t] : undefined }}>
                    {DIVERGENCE_LABELS[t]}
                  </span>
                }
              >
                {g.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </InfoPopover>
            </div>
          );
        })}
      </div>
    </div>
  );
}
