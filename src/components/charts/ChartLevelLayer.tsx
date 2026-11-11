import { useId } from 'react';
import {
  LEVEL_COLORS,
  LIQ_HEAT,
  sessionLevelOpacity,
  sessionLevelStroke,
  type LevelKind,
  type LevelLine,
  type LiquidationIntensity,
} from '@/components/charts/chartLevels';

type Props = {
  levels: (LevelLine & { y: number })[];
  activeKinds: Record<LevelKind, boolean>;
  hoverIndex: number | null;
  previewKind?: LevelKind | null;
  innerW: number;
};

const INTENSITIES = Object.keys(LIQ_HEAT) as LiquidationIntensity[];

/**
 * Report levels on the price chart. Liquidation levels render as a heatmap
 * (soft horizontal glow bands sized/coloured by intensity, blended additively so
 * overlapping sessions read hotter); every other kind renders as a dashed line.
 */
export function ChartLevelLayer({
  levels,
  activeKinds,
  hoverIndex,
  previewKind = null,
  innerW,
}: Props): React.ReactNode {
  const uid = useId().replace(/:/g, '');
  const presentSessions = new Set(levels.map((l) => l.session));
  const gradId = (i: LiquidationIntensity) => `liqHeat-${uid}-${i}`;

  return (
    <>
      <defs>
        {INTENSITIES.map((i) => (
          <linearGradient key={i} id={gradId(i)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LIQ_HEAT[i].color} stopOpacity={0} />
            <stop offset="50%" stopColor={LIQ_HEAT[i].color} stopOpacity={LIQ_HEAT[i].peak} />
            <stop offset="100%" stopColor={LIQ_HEAT[i].color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {activeKinds.liquidation ? (
        <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
          {levels.map((l, i) => {
            if (l.kind !== 'liquidation') return null;
            const heat = LIQ_HEAT[l.intensity ?? 'medium'];
            const active = hoverIndex === i || previewKind === 'liquidation';
            const dimmed = previewKind !== null && previewKind !== 'liquidation';
            const base = sessionLevelOpacity(l.session, presentSessions);
            const opacity = dimmed ? 0.12 : active ? 1 : Math.max(0.3, base);
            return (
              <g key={`liq-${l.price}-${i}`} opacity={opacity}>
                <rect
                  x={0}
                  y={l.y - heat.halfHeight}
                  width={innerW}
                  height={heat.halfHeight * 2}
                  fill={`url(#${gradId(l.intensity ?? 'medium')})`}
                />
                {l.magnet ? (
                  <line
                    x1={0}
                    x2={innerW}
                    y1={l.y}
                    y2={l.y}
                    stroke={heat.color}
                    strokeWidth={1}
                    strokeOpacity={0.9}
                  />
                ) : null}
              </g>
            );
          })}
        </g>
      ) : null}
      {levels.map((l, i) => {
        if (l.kind === 'liquidation' || !activeKinds[l.kind]) return null;
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
