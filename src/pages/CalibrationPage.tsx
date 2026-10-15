import { useMemo } from 'react';
import { Check, X, Minus } from 'lucide-react';
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

function TriCell({
  v,
  pendingLabel = 'Pending',
}: {
  v: TriState;
  pendingLabel?: string;
}): React.ReactNode {
  if (v === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-bull">
        <Check className="size-4 shrink-0" aria-hidden />
        Yes
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-bear">
        <X className="size-4 shrink-0" aria-hidden />
        No
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-muted">
      <Minus className="size-3.5 shrink-0" aria-hidden />
      {pendingLabel}
    </span>
  );
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
  // Metrics need chronological order; table shows newest first.
  const newestFirst = useMemo(() => [...scores].reverse(), [scores]);
  const bias = rollingRate(scores, 'bias');
  const levels = rollingRate(scores, 'levels');
  const acting = rollingRate(scores, 'acting');
  const building = scores.length < TRACK_RECORD_MIN;

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Calibration</Title>
        <p className="mt-1 text-sm text-ink-muted">
          Scoreboard of past sessions (newest first). Cards = last 5 scored sessions.
          Newest rows often say Pending until the next report fills them in.
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

      {newestFirst.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-ink-muted">
              <tr>
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Session</th>
                <th className="pb-2 pr-3">Bias</th>
                <th className="pb-2 pr-3">
                  <span title="Did the bias match the price move to the next report?">
                    Bias OK?
                  </span>
                </th>
                <th className="pb-2 pr-3">
                  <span title="Did price reach the Reduce-if level before the next report?">
                    Reduce hit?
                  </span>
                </th>
                <th className="pb-2 pr-3">
                  <span title="Did price reach the Add-if level before the next report?">
                    Add hit?
                  </span>
                </th>
                <th className="pb-2">
                  <span title="Did acting on the call beat doing nothing?">Acting helped?</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {newestFirst.map((s) => (
                <tr
                  key={`${s.row.date}-${s.row.session}`}
                  className="border-t border-stroke"
                >
                  <td className="py-2 pr-3 tabular-nums">{formatDate(s.row.date)}</td>
                  <td className="py-2 pr-3 capitalize">{s.row.session}</td>
                  <td className="py-2 pr-3 capitalize">{s.row.bias}</td>
                  <td className="py-2 pr-3 text-xs">
                    <TriCell v={s.biasCorrect} />
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    <TriCell
                      v={s.reduceHit}
                      pendingLabel={s.row.reduce_level == null ? 'None' : 'Pending'}
                    />
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    <TriCell
                      v={s.addHit}
                      pendingLabel={s.row.add_level == null ? 'None' : 'Pending'}
                    />
                  </td>
                  <td className="py-2 text-xs">
                    {s.actingHelped === null ? (
                      <span
                        className="line-clamp-2 max-w-[28rem] text-ink-muted"
                        title={s.actingLabel}
                      >
                        {s.actingLabel === '—' ? 'Pending' : s.actingLabel}
                      </span>
                    ) : (
                      <TriCell v={s.actingHelped} />
                    )}
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
