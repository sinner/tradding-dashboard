import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MACDChart } from '@/components/charts/MACDChart';
import { PriceLevelsChart } from '@/components/charts/PriceLevelsChart';
import { RSIChart } from '@/components/charts/RSIChart';
import { Card } from '@/components/ui/Card';
import { Radio, RadioGroup } from '@/components/ui/Radio';
import { Title } from '@/components/ui/Title';
import { KLINE_INTERVALS, type KlineInterval } from '@/config/constants';
import { useDayReports } from '@/hooks/useDayReports';
import { dayBoundsEt, useKlines } from '@/hooks/useKlines';
import { useLatestDay } from '@/hooks/useLatestDay';
import { useManifest } from '@/hooks/useManifest';
import { ema, detectMaCrosses } from '@/indicators';
import { formatDate } from '@/lib/formatters';
import type { Report } from '@/lib/types';

export function IndicatorStudiesPage(): React.ReactNode {
  const { date: dateParam } = useParams();
  const latest = useLatestDay();
  const manifest = useManifest();

  const date = dateParam ?? latest.day?.date ?? '';
  const day = manifest.data?.days.find((d) => d.date === date) ?? latest.day;
  const { reports } = useDayReports(day);

  const [interval, setInterval] = useState<KlineInterval>('1h');

  const bounds = date ? dayBoundsEt(date) : undefined;
  // For daily TF, widen the window a bit
  const startTime =
    interval === '1d' && bounds
      ? bounds.startTime - 90 * 24 * 60 * 60 * 1000
      : bounds?.startTime;
  const endTime = bounds?.endTime;

  const klines = useKlines({
    interval,
    startTime,
    endTime,
    enabled: Boolean(date),
  });

  const reportList = Object.values(reports).filter(Boolean) as Report[];
  const snapshotRsi = reportList[0]?.timeframes.find((t) => t.rsi != null)?.rsi;

  const crosses = useMemo(() => {
    const candles = klines.data ?? [];
    if (candles.length === 0) return [];
    const closes = candles.map((c) => c.close);
    const ema50 = ema(closes, 50);
    const ema200 = ema(closes, 200);
    return detectMaCrosses(ema50, ema200);
  }, [klines.data]);

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Indicator studies</Title>
        <p className="mt-1 text-sm text-ink-muted">
          {date ? formatDate(date) : 'Pick a day'} · RSI / MACD / MAs from live klines
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

      {crosses.length > 0 ? (
        <p className="text-xs text-ink-muted">
          MA cross markers (EMA50/200):{' '}
          {crosses
            .slice(-3)
            .map((c) => `${c.type}@${c.index}`)
            .join(', ')}
        </p>
      ) : null}

      <Card padded={false} className="space-y-1 overflow-hidden p-3 md:p-4">
        <Title level={4} className="px-1 text-ink-muted">
          Price + levels
        </Title>
        <PriceLevelsChart candles={klines.data ?? []} reports={reportList} height={280} />
      </Card>

      <Card padded={false} className="overflow-hidden p-3 md:p-4">
        <Title level={4} className="mb-1 px-1 text-ink-muted">
          RSI(14)
          {snapshotRsi != null ? (
            <span className="ml-2 font-normal text-accent">
              report snapshot {snapshotRsi.toFixed(2)}
            </span>
          ) : null}
        </Title>
        <RSIChart
          candles={klines.data ?? []}
          snapshot={snapshotRsi != null ? { value: snapshotRsi } : null}
        />
      </Card>

      <Card padded={false} className="overflow-hidden p-3 md:p-4">
        <Title level={4} className="mb-1 px-1 text-ink-muted">
          MACD(12,26,9)
        </Title>
        <MACDChart candles={klines.data ?? []} />
      </Card>
    </div>
  );
}
