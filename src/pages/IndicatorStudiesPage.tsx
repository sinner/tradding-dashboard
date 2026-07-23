import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DivergenceControls } from '@/components/charts/DivergenceControls';
import { MACDChart } from '@/components/charts/MACDChart';
import { PriceLevelsChart } from '@/components/charts/PriceLevelsChart';
import { RSIChart } from '@/components/charts/RSIChart';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Radio, RadioGroup } from '@/components/ui/Radio';
import { Title } from '@/components/ui/Title';
import { KLINE_INTERVALS, type KlineInterval } from '@/config/constants';
import { useDayReports } from '@/hooks/useDayReports';
import { dayBoundsEt, useKlines } from '@/hooks/useKlines';
import { useLatestDay } from '@/hooks/useLatestDay';
import { useManifest } from '@/hooks/useManifest';
import {
  detectMaCrosses,
  ema,
  rsi,
  scanDivergences,
  type DivergenceType,
} from '@/indicators';
import { displayStartIndex, warmupStartTime } from '@/lib/interval';
import { formatDate } from '@/lib/formatters';
import { GLOSSARY } from '@/lib/glossary';
import type { Report } from '@/lib/types';

const defaultDivActive: Record<DivergenceType, boolean> = {
  regular_bullish: true,
  regular_bearish: true,
  hidden_bullish: false,
  hidden_bearish: false,
};

export function IndicatorStudiesPage(): React.ReactNode {
  const { date: dateParam } = useParams();
  const latest = useLatestDay();
  const manifest = useManifest();

  const date = dateParam ?? latest.day?.date ?? '';
  const day = manifest.data?.days.find((d) => d.date === date) ?? latest.day;
  const { reports } = useDayReports(day);

  const [interval, setInterval] = useState<KlineInterval>('15m');
  const [divActive, setDivActive] = useState(defaultDivActive);
  const [pivotLookback, setPivotLookback] = useState(3);

  const bounds = date ? dayBoundsEt(date) : undefined;
  const startTime = bounds
    ? warmupStartTime(bounds.startTime, interval)
    : undefined;
  const endTime = bounds?.endTime;

  const klines = useKlines({
    interval,
    startTime,
    endTime,
    enabled: Boolean(date),
  });

  const reportList = Object.values(reports).filter(Boolean) as Report[];
  const snapshotRsi = reportList[0]?.timeframes.find((t) => t.rsi != null)?.rsi;

  const study = useMemo(() => {
    const all = klines.data ?? [];
    const empty = {
      display: [] as typeof all,
      all: [] as typeof all,
      visibleFrom: 0,
      maSeries: undefined as
        | {
            ema20: (number | null)[];
            ema50: (number | null)[];
            ema100: (number | null)[];
            ema200: (number | null)[];
          }
        | undefined,
      crosses: [] as { index: number; type: 'golden' | 'death' }[],
      divergences: [] as ReturnType<typeof scanDivergences>,
    };
    if (all.length === 0 || !bounds) return empty;
    const from = displayStartIndex(all, bounds.startTime);
    const display = all.slice(from);
    const closes = all.map((c) => c.close);
    const highs = all.map((c) => c.high);
    const slice = <T,>(arr: T[]) => arr.slice(from);
    const ema50 = ema(closes, 50);
    const ema200 = ema(closes, 200);
    const crosses = detectMaCrosses(ema50, ema200)
      .filter((c) => c.index >= from)
      .map((c) => ({ ...c, index: c.index - from }));
    const osc = rsi(closes, 14);
    const divergences = scanDivergences({
      prices: highs,
      oscillator: osc,
      pivotLookback,
    }).filter((h) => h.toIndex >= from);

    return {
      display,
      all,
      visibleFrom: from,
      maSeries: {
        ema20: slice(ema(closes, 20)),
        ema50: slice(ema50),
        ema100: slice(ema(closes, 100)),
        ema200: slice(ema200),
      },
      crosses,
      divergences,
    };
  }, [klines.data, bounds, pivotLookback]);

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Indicator studies</Title>
        <p className="mt-1 text-sm text-ink-muted">
          {date ? formatDate(date) : 'Pick a day'} · RSI / MACD / MAs from live klines
          (warm-up {study.visibleFrom} bars)
        </p>
      </div>

      <RadioGroup
        name="interval"
        label="Timeframe"
        value={interval}
        onChange={(v) => setInterval(v as KlineInterval)}
      >
        {KLINE_INTERVALS.map((iv) => (
          <Radio key={iv} value={iv} label={iv} />
        ))}
      </RadioGroup>

      {study.crosses.length > 0 ? (
        <p className="text-xs text-ink-muted">
          EMA50/200 crosses in window:{' '}
          {study.crosses
            .slice(-3)
            .map((c) => `${c.type}@bar${c.index}`)
            .join(', ')}
        </p>
      ) : null}

      <Card padded={false} className="space-y-1 overflow-hidden p-3 md:p-4">
        <Title level={4} className="px-1 text-ink-muted">
          Price + levels + MAs
        </Title>
        <PriceLevelsChart
          candles={study.display}
          reports={reportList}
          height={280}
          maSeries={study.maSeries}
          maCrosses={study.crosses}
          divergences={study.divergences}
          divergenceActive={divActive}
        />
      </Card>

      <Card padded={false} className="space-y-3 overflow-hidden p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2 px-1">
          <Title level={4} className="text-ink-muted">
            RSI(14)
          </Title>
          <InfoPopover
            variant="text"
            trigger="click"
            label="What is RSI?"
            title={GLOSSARY.rsi.title}
            textClassName="text-xs font-medium text-signal hover:text-brand-light"
            text="What is RSI?"
          >
            {GLOSSARY.rsi.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              Colored divergence lines below compare RSI swings with price. Click a type
              name for the definition.
            </p>
          </InfoPopover>
          {snapshotRsi != null ? (
            <span className="text-xs font-normal text-accent">
              report snapshot {snapshotRsi.toFixed(2)}
            </span>
          ) : null}
        </div>

        <DivergenceControls
          active={divActive}
          onToggle={(t) => setDivActive((p) => ({ ...p, [t]: !p[t] }))}
          pivotLookback={pivotLookback}
          onPivotChange={setPivotLookback}
        />

        <RSIChart
          candles={study.all}
          visibleFrom={study.visibleFrom}
          snapshot={snapshotRsi != null ? { value: snapshotRsi } : null}
          divergences={study.divergences}
          divergenceActive={divActive}
        />
      </Card>

      <Card padded={false} className="overflow-hidden p-3 md:p-4">
        <Title level={4} className="mb-1 px-1 text-ink-muted">
          MACD(12,26,9)
        </Title>
        <MACDChart candles={study.all} visibleFrom={study.visibleFrom} />
      </Card>
    </div>
  );
}
