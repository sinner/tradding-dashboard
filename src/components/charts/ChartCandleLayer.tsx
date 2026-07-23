import type { PointerEvent } from 'react';
import { CANDLE } from '@/components/charts/chartLevels';
import type { Candle } from '@/lib/types';

export type CandleGeom = {
  x: number;
  width: number;
  yHigh: number;
  yLow: number;
  yOpen: number;
  yClose: number;
  up: boolean;
  candle: Candle;
};

type Props = {
  candles: CandleGeom[];
  hoverIndex: number | null;
  innerH: number;
  onHover: (index: number, clientX: number, clientY: number) => void;
  margin: { top: number; left: number };
  width: number;
};

export function ChartCandleLayer({
  candles,
  hoverIndex,
  innerH,
  onHover,
  margin,
  width,
}: Props): React.ReactNode {
  return (
    <>
      {candles.map((c, i) => {
        const dim = hoverIndex !== null && hoverIndex !== i ? 0.28 : 1;
        const hitW = Math.max(c.width, 6);
        const onMove = (e: PointerEvent<SVGRectElement>): void => {
          const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
          const rect = svg.getBoundingClientRect();
          const scaleX = rect.width / width;
          onHover(
            i,
            (c.x + c.width / 2 + margin.left) * scaleX,
            e.clientY - rect.top,
          );
        };
        return (
          <g key={i} opacity={dim} className="transition-opacity duration-150">
            <line
              x1={c.x + c.width / 2}
              x2={c.x + c.width / 2}
              y1={c.yHigh}
              y2={c.yLow}
              stroke={c.up ? CANDLE.wickUp : CANDLE.wickDown}
              strokeWidth={1.25}
            />
            <rect
              x={c.x}
              y={Math.min(c.yOpen, c.yClose)}
              width={Math.max(1.5, c.width)}
              height={Math.max(1.5, Math.abs(c.yClose - c.yOpen))}
              fill={c.up ? CANDLE.up : CANDLE.down}
              rx={1}
            />
            <rect
              x={c.x + c.width / 2 - hitW / 2}
              y={0}
              width={hitW}
              height={innerH}
              fill="transparent"
              className="cursor-crosshair"
              onPointerMove={onMove}
              onPointerEnter={onMove}
            />
          </g>
        );
      })}
      {hoverIndex !== null && candles[hoverIndex] ? (
        <line
          x1={candles[hoverIndex].x + candles[hoverIndex].width / 2}
          x2={candles[hoverIndex].x + candles[hoverIndex].width / 2}
          y1={0}
          y2={innerH}
          stroke="#A78BFA"
          strokeOpacity={0.35}
          strokeWidth={1}
          pointerEvents="none"
        />
      ) : null}
    </>
  );
}
