import { useMemo } from 'react';
import * as d3 from 'd3';
import type { CandleGeom } from '@/components/charts/ChartCandleLayer';

export type MaSeriesMap = {
  ema20?: (number | null)[];
  ema50?: (number | null)[];
  ema100?: (number | null)[];
  ema200?: (number | null)[];
};

export type MaCrossMark = {
  index: number;
  type: 'golden' | 'death';
};

const MA_COLORS: Record<keyof MaSeriesMap, string> = {
  ema20: '#67E8F9',
  ema50: '#A78BFA',
  ema100: '#F0ABFC',
  ema200: '#FBBF24',
};

type Props = {
  series: MaSeriesMap;
  candles: CandleGeom[];
  y: d3.ScaleLinear<number, number>;
  crosses?: MaCrossMark[];
  active: Record<keyof MaSeriesMap, boolean>;
};

export function MovingAveragesOverlay({
  series,
  candles,
  y,
  crosses = [],
  active,
}: Props): React.ReactNode {
  const paths = useMemo(() => {
    const keys = (Object.keys(MA_COLORS) as (keyof MaSeriesMap)[]).filter(
      (k) => active[k] && series[k],
    );
    return keys.map((key) => {
      const values = series[key]!;
      const line = d3
        .line<number | null>()
        .defined((d, i) => d !== null && Boolean(candles[i]))
        .x((_, i) => candles[i]!.x + candles[i]!.width / 2)
        .y((d) => y(d as number));
      return { key, color: MA_COLORS[key], d: line(values) ?? '' };
    });
  }, [series, candles, y, active]);

  return (
    <g aria-hidden>
      {paths.map((p) => (
        <path key={p.key} d={p.d} fill="none" stroke={p.color} strokeWidth={1.25} opacity={0.9} />
      ))}
      {crosses.map((c) => {
        const g = candles[c.index];
        if (!g) return null;
        const cx = g.x + g.width / 2;
        const cy = Math.min(g.yOpen, g.yClose);
        return (
          <g key={`${c.type}-${c.index}`}>
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill={c.type === 'golden' ? '#FBBF24' : '#F472B6'}
              stroke="#0E081C"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
}

export const MA_LEGEND = [
  { key: 'ema20' as const, label: 'EMA20', color: MA_COLORS.ema20 },
  { key: 'ema50' as const, label: 'EMA50', color: MA_COLORS.ema50 },
  { key: 'ema100' as const, label: 'EMA100', color: MA_COLORS.ema100 },
  { key: 'ema200' as const, label: 'EMA200', color: MA_COLORS.ema200 },
];
