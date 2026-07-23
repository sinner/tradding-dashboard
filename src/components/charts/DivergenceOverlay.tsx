import type { DivergenceHit, DivergenceType } from '@/indicators';

const COLORS: Record<DivergenceType, string> = {
  regular_bullish: '#C4B5FD',
  regular_bearish: '#F472B6',
  hidden_bullish: '#67E8F9',
  hidden_bearish: '#E879F9',
};

const LABELS: Record<DivergenceType, string> = {
  regular_bullish: 'Regular bull',
  regular_bearish: 'Regular bear',
  hidden_bullish: 'Hidden bull',
  hidden_bearish: 'Hidden bear',
};

type Point = { x: number; y: number };

type Props = {
  hits: DivergenceHit[];
  active: Record<DivergenceType, boolean>;
  /** Map candle index → plot point (price panel) or osc index → point. */
  pointAt: (index: number, price: number) => Point | null;
  /** Use oscFrom/oscTo instead of priceFrom/priceTo when true. */
  useOscillator?: boolean;
};

export function DivergenceOverlay({
  hits,
  active,
  pointAt,
  useOscillator = false,
}: Props): React.ReactNode {
  const visible = hits.filter((h) => active[h.type]);
  if (visible.length === 0) return null;

  return (
    <g aria-label="Divergences">
      {visible.map((h) => {
        const a = pointAt(
          h.fromIndex,
          useOscillator ? h.oscFrom : h.priceFrom,
        );
        const b = pointAt(h.toIndex, useOscillator ? h.oscTo : h.priceTo);
        if (!a || !b) return null;
        const color = COLORS[h.type];
        return (
          <g key={`${h.type}-${h.fromIndex}-${h.toIndex}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.85}
            />
            <circle cx={a.x} cy={a.y} r={3.5} fill={color} />
            <circle cx={b.x} cy={b.y} r={3.5} fill={color} />
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 6}
              textAnchor="middle"
              fill={color}
              fontSize={9}
              fontFamily="IBM Plex Sans, sans-serif"
            >
              {LABELS[h.type]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export const DIVERGENCE_TYPES: DivergenceType[] = [
  'regular_bullish',
  'regular_bearish',
  'hidden_bullish',
  'hidden_bearish',
];

export { COLORS as DIVERGENCE_COLORS, LABELS as DIVERGENCE_LABELS };
