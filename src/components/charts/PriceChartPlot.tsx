import type { ScaleLinear } from 'd3';
import { ChartCandleLayer, type CandleGeom } from '@/components/charts/ChartCandleLayer';
import { ChartLevelLayer } from '@/components/charts/ChartLevelLayer';
import { DivergenceOverlay } from '@/components/charts/DivergenceOverlay';
import {
  MovingAveragesOverlay,
  type MaCrossMark,
  type MaSeriesMap,
} from '@/components/charts/MovingAveragesOverlay';
import { sessionLevelStroke, type LevelKind, type LevelLine } from '@/components/charts/chartLevels';
import type { LevelHit } from '@/components/charts/chartScale';
import { CHART_MARGIN, CHART_WIDTH } from '@/components/charts/priceChartGeom';
import type { DivergenceHit, DivergenceType } from '@/indicators';
import { formatPrice } from '@/lib/formatters';

type Props = {
  height: number;
  innerW: number;
  innerH: number;
  y: ScaleLinear<number, number>;
  yTicks: { y: number; label: string }[];
  xTicks: { x: number; label: string }[];
  levelLines: (LevelLine & { y: number })[];
  candleRects: CandleGeom[];
  hits: LevelHit[];
  activeKinds: Record<LevelKind, boolean>;
  previewKind: LevelKind | null;
  hoverIndex: number | null;
  onHover: (index: number, clientX: number, clientY: number) => void;
  maSeries?: MaSeriesMap;
  maCrosses?: MaCrossMark[];
  maActive: Record<keyof MaSeriesMap, boolean>;
  divergences?: DivergenceHit[];
  divergenceActive?: Record<DivergenceType, boolean>;
};

export function PriceChartPlot({
  height,
  innerW,
  innerH,
  y,
  yTicks,
  xTicks,
  levelLines,
  candleRects,
  hits,
  activeKinds,
  previewKind,
  hoverIndex,
  onHover,
  maSeries,
  maCrosses,
  maActive,
  divergences,
  divergenceActive,
}: Props): React.ReactNode {
  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${height}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="BTC price with report levels"
    >
      <defs>
        <linearGradient id="plotFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#19103A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0E081C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x={CHART_MARGIN.left}
        y={CHART_MARGIN.top}
        width={innerW}
        height={innerH}
        fill="url(#plotFade)"
        rx={8}
      />
      <g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
        {yTicks.map((t) => (
          <g key={t.label}>
            <line
              x1={0}
              x2={innerW}
              y1={t.y}
              y2={t.y}
              stroke="#2D2450"
              strokeDasharray="2 5"
            />
            <text
              x={-10}
              y={t.y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#9B8FB8"
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
            >
              {t.label}
            </text>
          </g>
        ))}
        <ChartLevelLayer
          levels={levelLines}
          activeKinds={activeKinds}
          hoverIndex={null}
          previewKind={previewKind}
          innerW={innerW}
        />
        {maSeries ? (
          <MovingAveragesOverlay
            series={maSeries}
            candles={candleRects}
            y={y}
            crosses={maCrosses}
            active={maActive}
          />
        ) : null}
        <ChartCandleLayer
          candles={candleRects}
          hoverIndex={hoverIndex}
          innerH={innerH}
          margin={CHART_MARGIN}
          width={CHART_WIDTH}
          onHover={onHover}
        />
        {divergences && divergenceActive ? (
          <DivergenceOverlay
            hits={divergences}
            active={divergenceActive}
            pointAt={(index, price) => {
              const g = candleRects[index];
              if (!g) return null;
              return { x: g.x + g.width / 2, y: y(price) };
            }}
          />
        ) : null}
        {hits.map((h) => {
          const g = candleRects[h.index];
          if (!g) return null;
          const sessions = new Set([
            ...levelLines.map((l) => l.session),
            ...hits.map((x) => x.session),
          ]);
          const style = sessionLevelStroke(h.kind, h.session, sessions);
          return (
            <g key={`${h.kind}-${h.session}-${h.price}`} opacity={style.opacity}>
              <circle
                cx={g.x + g.width / 2}
                cy={y(h.price)}
                r={6}
                fill={style.color}
                fillOpacity={0.3}
                stroke={style.color}
                strokeWidth={1.5}
              />
              <title>
                {h.kind.toUpperCase()} hit · {h.session} · {formatPrice(h.price)}
              </title>
            </g>
          );
        })}
        {xTicks.map((t) => (
          <text
            key={t.label + t.x}
            x={t.x}
            y={innerH + 18}
            textAnchor="middle"
            fill="#9B8FB8"
            fontSize={10}
            fontFamily="IBM Plex Mono, monospace"
          >
            {t.label}
          </text>
        ))}
      </g>
    </svg>
  );
}
