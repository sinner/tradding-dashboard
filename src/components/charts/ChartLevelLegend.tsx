import { LEVEL_COLORS, type LevelKind } from '@/components/charts/chartLevels';
import { cn } from '@/lib/cn';

type Props = {
  activeKinds: Record<LevelKind, boolean>;
  onToggle: (kind: LevelKind) => void;
  onPreview?: (kind: LevelKind | null) => void;
};

const kinds = Object.keys(LEVEL_COLORS) as LevelKind[];

export function ChartLevelLegend({
  activeKinds,
  onToggle,
  onPreview,
}: Props): React.ReactNode {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onToggle(kind)}
          onPointerEnter={() => onPreview?.(kind)}
          onPointerLeave={() => onPreview?.(null)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition',
            activeKinds[kind]
              ? 'border-transparent bg-bg text-ink hover:ring-1 hover:ring-brand/40'
              : 'border-stroke/60 text-ink-muted opacity-50',
          )}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: LEVEL_COLORS[kind] }}
          />
          {kind}
        </button>
      ))}
      <span className="self-center text-[11px] text-ink-muted">
        Hover candles for OHLC · hover legend to highlight levels
      </span>
    </div>
  );
}
