import { LEVEL_COLORS, LIQ_HEAT, type LevelKind } from '@/components/charts/chartLevels';
import { cn } from '@/lib/cn';

type Props = {
  activeKinds: Record<LevelKind, boolean>;
  onToggle: (kind: LevelKind) => void;
  onPreview?: (kind: LevelKind | null) => void;
  /** Called when pointer leaves a legend chip (parent may delay-clear). */
  onPreviewLeave?: () => void;
};

const kinds = Object.keys(LEVEL_COLORS) as LevelKind[];

export function ChartLevelLegend({
  activeKinds,
  onToggle,
  onPreview,
  onPreviewLeave,
}: Props): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onToggle(kind)}
          onPointerEnter={() => onPreview?.(kind)}
          onPointerLeave={() => onPreviewLeave?.() ?? onPreview?.(null)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition',
            activeKinds[kind]
              ? 'border-transparent bg-bg text-ink hover:ring-1 hover:ring-brand/40'
              : 'border-stroke/60 text-ink-muted opacity-50',
          )}
        >
          <span
            className={cn('rounded-full', kind === 'liquidation' ? 'h-2 w-5' : 'size-2')}
            style={
              kind === 'liquidation'
                ? {
                    background: `linear-gradient(90deg, ${LIQ_HEAT.low.color}, ${LIQ_HEAT.medium.color}, ${LIQ_HEAT.high.color}, ${LIQ_HEAT.extreme.color})`,
                  }
                : { backgroundColor: LEVEL_COLORS[kind] }
            }
          />
          {kind === 'liquidation' ? 'liq heatmap' : kind}
        </button>
      ))}
      <span className="self-center text-[11px] text-ink-muted">
        Hover candles for OHLC · hover legend to list levels
      </span>
    </div>
  );
}
