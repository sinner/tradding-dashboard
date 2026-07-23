import {
  LEVEL_COLORS,
  sessionLevelStroke,
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
  const presentSessions = new Set(levels.map((l) => l.session));

  return (
    <>
      {levels.map((l, i) => {
        if (!activeKinds[l.kind]) return null;
        const active = hoverIndex === i || previewKind === l.kind;
        const dimmed = previewKind !== null && previewKind !== l.kind;
        const style = sessionLevelStroke(l.kind, l.session, presentSessions);
        const opacity = dimmed ? 0.15 : active ? 1 : style.opacity;

        return (
          <g key={`${l.kind}-${l.price}-${i}`} opacity={opacity}>
            <line
              x1={0}
              x2={innerW}
              y1={l.y}
              y2={l.y}
              stroke={active ? LEVEL_COLORS[l.kind] : style.color}
              strokeWidth={active ? 2.5 : style.strokeWidth}
              strokeDasharray={l.kind === 'reduce' || l.kind === 'add' ? '7 4' : '3 4'}
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
