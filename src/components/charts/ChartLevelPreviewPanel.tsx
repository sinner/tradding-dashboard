import { LEVEL_COLORS, type LevelKind, type LevelLine } from '@/components/charts/chartLevels';
import { formatPrice } from '@/lib/formatters';

type Props = {
  kind: LevelKind;
  levels: (LevelLine & { y: number })[];
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

const SESSION_ORDER: Record<string, number> = {
  endday: 0,
  midday: 1,
  morning: 2,
};

function sortBySessionNewestFirst<T extends { session: string; price: number }>(
  levels: T[],
): T[] {
  return [...levels].sort((a, b) => {
    const sa = SESSION_ORDER[a.session] ?? 99;
    const sb = SESSION_ORDER[b.session] ?? 99;
    if (sa !== sb) return sa - sb;
    return b.price - a.price;
  });
}

/** Level list overlay sized to its content. */
export function ChartLevelPreviewPanel({
  kind,
  levels,
  onPointerEnter,
  onPointerLeave,
}: Props): React.ReactNode {
  if (levels.length === 0) return null;
  const ordered = sortBySessionNewestFirst(levels);

  return (
    <div
      className="animate-fade-in absolute right-14 top-2 z-20 w-[min(14rem,42%)] rounded-xl border border-stroke/80 bg-bg-deep/95 p-3 shadow-glow backdrop-blur-md"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <p
        className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: LEVEL_COLORS[kind] }}
      >
        {kind} levels
      </p>
      <ul className="space-y-1 text-xs">
        {ordered.map((l) => (
          <li
            key={`${l.session}-${l.price}`}
            className="flex justify-between gap-3 font-mono tabular-nums"
          >
            <span className="capitalize text-ink-muted">{l.session}</span>
            <span className="text-ink">{formatPrice(l.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
