import { useMemo, useState } from 'react';
import { Archive, Check, ChevronDown, Minus, X } from 'lucide-react';
import { Sparkline } from '@/components/charts/Sparkline';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';
import {
  useCalibration,
  useCalibrationArchive,
  useCalibrationMonthly,
} from '@/hooks/useDayReports';
import {
  TRACK_RECORD_MIN,
  rollingRate,
  scoreSession,
  sparkValues,
  type SessionScore,
  type TriState,
} from '@/lib/calibrationMetrics';
import { formatDate, formatSession } from '@/lib/formatters';
import type { CalibrationMonth, HitCount } from '@/lib/types';
import { cn } from '@/lib/cn';

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

function monthLabel(month: string): string {
  return new Date(`${month}-01T12:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function pct(h: HitCount): string {
  return h.known > 0 ? `${Math.round((h.hits / h.known) * 100)}%` : '—';
}

function addCounts(a: HitCount, b: HitCount): HitCount {
  return { hits: a.hits + b.hits, known: a.known + b.known };
}

/** A table row, preceded by a month header row when the month changes (grouped mode). */
function MonthAwareRow({
  s,
  prev,
  grouped,
  children,
}: {
  s: SessionScore;
  prev: SessionScore | undefined;
  grouped: boolean;
  children: React.ReactNode;
}): React.ReactNode {
  const month = s.row.date.slice(0, 7);
  const showHeader = grouped && (!prev || prev.row.date.slice(0, 7) !== month);
  return (
    <>
      {showHeader ? (
        <tr className="border-t border-stroke">
          <td
            colSpan={7}
            className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-brand-light"
          >
            {monthLabel(month)}
          </td>
        </tr>
      ) : null}
      <tr className="border-t border-stroke">{children}</tr>
    </>
  );
}

/** Per-session rows (newest first). `grouped` inserts a header row per month. */
function CalibrationRowsTable({
  rows,
  grouped = false,
}: {
  rows: SessionScore[];
  grouped?: boolean;
}): React.ReactNode {
  return (
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
        {rows.map((s, idx) => (
          <MonthAwareRow
            key={`${s.row.date}-${s.row.session}`}
            s={s}
            prev={rows[idx - 1]}
            grouped={grouped}
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
          </MonthAwareRow>
        ))}
      </tbody>
    </table>
  );
}

/** One compacted month: totals across sessions, per-session chips, archived rows on demand. */
function MonthSummary({
  month,
  sessions,
}: {
  month: string;
  sessions: CalibrationMonth[];
}): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [showRows, setShowRows] = useState(false);
  const archive = useCalibrationArchive(month, showRows);
  const zero: HitCount = { hits: 0, known: 0 };
  const total = sessions.reduce(
    (acc, m) => ({
      rows: acc.rows + m.rows,
      bias: addCounts(acc.bias, m.bias),
      levels: addCounts(acc.levels, m.levels),
      acting: addCounts(acc.acting, m.acting),
    }),
    { rows: 0, bias: zero, levels: zero, acting: zero },
  );
  const archivedScores = useMemo(
    () => [...(archive.data ?? [])].map(scoreSession).reverse(),
    [archive.data],
  );

  return (
    <li className="rounded-xl border border-stroke/60 bg-bg/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <Archive className="size-4 text-brand-light" aria-hidden />
          {monthLabel(month)}
          <span className="text-[11px] font-normal text-ink-muted">
            {total.rows} reports
          </span>
        </span>
        <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-ink-muted">
          <span>
            Bias <span className="text-ink">{pct(total.bias)}</span>
          </span>
          <span>
            Levels <span className="text-ink">{pct(total.levels)}</span>
          </span>
          <span>
            Acting <span className="text-ink">{pct(total.acting)}</span>
          </span>
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-300',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-stroke/60 px-3 py-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {sessions.map((m) => (
              <div key={m.session} className="rounded-lg bg-bg/60 px-2.5 py-2 text-xs">
                <p className="font-medium text-ink">
                  {formatSession(m.session)}{' '}
                  <span className="font-normal text-ink-muted">· {m.rows}</span>
                </p>
                <p className="mt-1 font-mono tabular-nums text-ink-muted">
                  Bias {pct(m.bias)} · Levels {pct(m.levels)} · Acting {pct(m.acting)}
                </p>
              </div>
            ))}
          </div>
          {showRows ? (
            archive.isLoading ? (
              <p className="text-xs text-ink-muted">Loading archived rows…</p>
            ) : archive.isError ? (
              <p className="text-xs text-accent">
                Could not load the archive for this month.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <CalibrationRowsTable rows={archivedScores} />
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => setShowRows(true)}
              className="text-link text-xs"
            >
              Show all {total.rows} rows
            </button>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function CalibrationPage(): React.ReactNode {
  const { data, isLoading, error } = useCalibration();
  const monthly = useCalibrationMonthly();
  // Newest month first; sessions in relay order inside each month.
  const monthGroups = useMemo(() => {
    const groups = new Map<string, CalibrationMonth[]>();
    for (const m of monthly.data?.months ?? []) {
      groups.set(m.month, [...(groups.get(m.month) ?? []), m]);
    }
    return [...groups.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  }, [monthly.data]);

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
          Scoreboard of past sessions (newest first, last two months in full; older months
          summarised below). Cards = last 5 scored sessions. Newest rows often say Pending
          until the next report fills them in.
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
          <CalibrationRowsTable rows={newestFirst} grouped />
        </Card>
      ) : null}

      {monthGroups.length > 0 ? (
        <Card className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Title level={4}>Earlier months</Title>
            <InfoPopover label="About earlier months" title="Compacted months">
              <p>
                Full rows are kept for the last {monthly.data?.keepMonths ?? 2} months.
                Older months are summarised (hit counts per agent) and their rows
                archived; open a month to load them.
              </p>
            </InfoPopover>
          </div>
          <ul className="space-y-2">
            {monthGroups.map(([month, sessions]) => (
              <MonthSummary key={month} month={month} sessions={sessions} />
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
