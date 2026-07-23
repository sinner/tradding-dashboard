import {
  LEVEL_COLORS,
  type LevelKind,
  type LevelLine,
} from '@/components/charts/chartLevels';

type Props = {
  levels: (LevelLine & { y: number })[];
  activeKinds: Record<LevelKind, boolean>;
  hoverIndex: number | null;
  previewKind?: LevelKind | null;
  innerW: number;
};

export function ChartLevelLayer({
  levels,
  activeKinds,
  hoverIndex,
  previewKind = null,
  innerW,
}: Props): React.ReactNode {
  return (
    <>
      {levels.map((l, i) => {
        if (!activeKinds[l.kind]) return null;
        const active = hoverIndex === i || previewKind === l.kind;
        const dimmed = previewKind !== null && previewKind !== l.kind;
        return (
          <g key={`${l.kind}-${l.price}-${i}`} opacity={dimmed ? 0.18 : 1}>
            <line
              x1={0}
              x2={innerW}
              y1={l.y}
              y2={l.y}
              stroke={LEVEL_COLORS[l.kind]}
              strokeWidth={active ? 2.4 : 1.3}
              strokeDasharray={l.kind === 'reduce' || l.kind === 'add' ? '7 4' : '3 4'}
              opacity={active ? 1 : 0.7}
              pointerEvents="none"
            />
            {active ? (
              <circle
                cx={innerW - 6}
                cy={l.y}
                r={4}
                fill={LEVEL_COLORS[l.kind]}
                stroke="#0E081C"
                strokeWidth={1.5}
                pointerEvents="none"
              />
            ) : null}
          </g>
        );
      })}
    </>
  );
}
