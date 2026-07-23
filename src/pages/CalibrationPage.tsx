import { useMemo } from 'react';
import { Sparkline } from '@/components/charts/Sparkline';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';
import { useCalibration } from '@/hooks/useDayReports';
import {
  TRACK_RECORD_MIN,
  rollingRate,
  scoreSession,
  sparkValues,
  type TriState,
} from '@/lib/calibrationMetrics';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/cn';

function mark(v: TriState): string {
  if (v === true) return '✓';
  if (v === false) return '✗';
  return '—';
}

function MetricCard({
  title,
  blurb,
  rate,
  known,
  spark,
  color,
}: {
  title: string;
  blurb: string;
  rate: number | null;
  known: number;
  spark: (number | null)[];
  color: string;
}): React.ReactNode {
  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Title level={4}>{title}</Title>
        <InfoPopover label={`About ${title}`} title={title}>
          <p>{blurb}</p>
        </InfoPopover>
      </div>
      <p className="font-mono text-3xl font-semibold tabular-nums text-brand-light">
        {rate === null ? '—' : `${Math.round(rate * 100)}%`}
      </p>
      <p className="text-[11px] text-ink-muted">{known} scored · last 5 sessions</p>
      <Sparkline values={spark} color={color} />
    </Card>
  );
}

export function CalibrationPage(): React.ReactNode {
  const { data, isLoading, error } = useCalibration();

  const scores = useMemo(() => (data ?? []).map(scoreSession), [data]);
  const bias = rollingRate(scores, 'bias');
  const levels = rollingRate(scores, 'levels');
  const acting = rollingRate(scores, 'acting');
  const building = scores.length < TRACK_RECORD_MIN;

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Calibration</Title>
        <p className="mt-1 text-sm text-ink-muted">
          Should you trust today&apos;s call? Track record of bias, levels, and whether
          acting beat holding.
        </p>
      </div>

      {isLoading ? <p className="text-ink-muted">Loading calibration…</p> : null}
      {error ? (
        <p className="text-sm text-accent">Failed to load calibration.json</p>
      ) : null}

      {building ? (
        <Card>
          <p className="text-sm text-ink-muted">
            Building track record —{' '}
            <span className="font-medium text-ink">
              {scores.length} of {TRACK_RECORD_MIN}
            </span>{' '}
            sessions logged. Metrics below still update as each session is scored.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Direction hit-rate"
          blurb="Did the session bias match the actual move to the next report? Bull + price up = hit. Range + tiny move = hit."
          rate={bias.rate}
          known={bias.known}
          spark={sparkValues(scores, 'bias')}
          color="#C4B5FD"
        />
        <MetricCard
          title="Level accuracy"
          blurb="Of the REDUCE / ADD prices named, how many did the tape actually reach before the next report?"
          rate={levels.rate}
          known={levels.known}
          spark={sparkValues(scores, 'levels')}
          color="#A78BFA"
        />
        <MetricCard
          title="Acting beat holding?"
          blurb="On sessions where a REDUCE/ADD fired, did following the call beat sitting still by the next report?"
          rate={acting.rate}
          known={acting.known}
          spark={sparkValues(scores, 'acting')}
          color="#E879F9"
        />
      </div>

      {scores.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-ink-muted">
              <tr>
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Session</th>
                <th className="pb-2 pr-3">Bias</th>
                <th className="pb-2 pr-3">
                  <span title="Did bias match the next-report move?">Bias correct?</span>
                </th>
                <th className="pb-2 pr-3">
                  <span title="Did price trade at/through the REDUCE level?">
                    Reduce level hit?
                  </span>
                </th>
                <th className="pb-2 pr-3">
                  <span title="Did price trade at/through the ADD level?">
                    Add level hit?
                  </span>
                </th>
                <th className="pb-2">
                  <span title="Would acting have beaten holding?">Acting beat holding?</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr
                  key={`${s.row.date}-${s.row.session}`}
                  className="border-t border-stroke"
                >
                  <td className="py-2 pr-3">{formatDate(s.row.date)}</td>
                  <td className="py-2 pr-3 capitalize">{s.row.session}</td>
                  <td className="py-2 pr-3 capitalize">{s.row.bias}</td>
                  <td
                    className={cn(
                      'py-2 pr-3 font-mono',
                      s.biasCorrect === true && 'text-bull',
                      s.biasCorrect === false && 'text-bear',
                    )}
                  >
                    {mark(s.biasCorrect)}
                  </td>
                  <td
                    className={cn(
                      'py-2 pr-3 font-mono',
                      s.reduceHit === true && 'text-bull',
                      s.reduceHit === false && 'text-bear',
                    )}
                  >
                    {mark(s.reduceHit)}
                  </td>
                  <td
                    className={cn(
                      'py-2 pr-3 font-mono',
                      s.addHit === true && 'text-bull',
                      s.addHit === false && 'text-bear',
                    )}
                  >
                    {mark(s.addHit)}
                  </td>
                  <td
                    className={cn(
                      'py-2 font-mono',
                      s.actingHelped === true && 'text-bull',
                      s.actingHelped === false && 'text-bear',
                    )}
                  >
                    {s.actingHelped === null ? s.actingLabel : mark(s.actingHelped)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
