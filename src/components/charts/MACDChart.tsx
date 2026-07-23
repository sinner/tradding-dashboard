import { useMemo } from 'react';
import * as d3 from 'd3';
import { macd } from '@/indicators';
import type { Candle } from '@/lib/types';

type Props = {
  candles: Candle[];
  height?: number;
};

export function MACDChart({ candles, height = 140 }: Props): React.ReactNode {
  const width = 800;
  const margin = { top: 12, right: 16, bottom: 20, left: 40 };

  const { macdPath, signalPath, bars, zeroY } = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const series = macd(closes);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const values = [...series.macd, ...series.signal, ...series.histogram].filter(
      (v): v is number => v !== null,
    );

    const ext = d3.extent(values) as [number, number];
    const x = d3
      .scaleLinear()
      .domain([0, Math.max(1, candles.length - 1)])
      .range([0, innerW]);
    const y = d3
      .scaleLinear()
      .domain(ext[0] === undefined ? [-1, 1] : ext)
      .nice()
      .range([innerH, 0]);

    const line = (data: (number | null)[]) =>
      d3
        .line<number | null>()
        .defined((d) => d !== null)
        .x((_, i) => x(i))
        .y((d) => y(d as number))(data) ?? '';

    const barW = Math.max(1, innerW / Math.max(1, candles.length) - 0.5);

    return {
      macdPath: line(series.macd),
      signalPath: line(series.signal),
      zeroY: y(0),
      bars: series.histogram.map((h, i) =>
        h === null
          ? null
          : {
              x: x(i) - barW / 2,
              y: h >= 0 ? y(h) : y(0),
              height: Math.abs(y(h) - y(0)),
              up: h >= 0,
            },
      ),
    };
  }, [candles, height, margin.left, margin.right, margin.top, margin.bottom]);

  if (candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-ink-muted"
        style={{ height }}
      >
        No MACD data
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      <g transform={`translate(${margin.left},${margin.top})`}>
        <line
          x1={0}
          x2={width - margin.left - margin.right}
          y1={zeroY}
          y2={zeroY}
          stroke="#24393E"
        />
        {bars.map((b, i) =>
          b ? (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={2}
              height={b.height}
              fill={b.up ? '#C4B5FD' : '#F472B6'}
              opacity={0.7}
            />
          ) : null,
        )}
        <path d={macdPath} fill="none" stroke="#A78BFA" strokeWidth={1.5} />
        <path d={signalPath} fill="none" stroke="#E879F9" strokeWidth={1.25} />
      </g>
    </svg>
  );
}
