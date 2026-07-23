import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/TextInput';
import { Title } from '@/components/ui/Title';
import { routeDay, routeStudies } from '@/config/constants';
import { useManifest } from '@/hooks/useManifest';
import { formatDate } from '@/lib/formatters';
import type { Session } from '@/lib/types';

export function HistoryPage(): React.ReactNode {
  const { data, isLoading, error } = useManifest();
  const [query, setQuery] = useState('');

  const days = useMemo(() => {
    if (!data) return [];
    return data.days.filter((d) => {
      if (query && !d.date.includes(query)) return false;
      return true;
    });
  }, [data, query]);

  if (isLoading) return <p className="text-ink-muted">Loading history…</p>;
  if (error) {
    return (
      <Card>
        <p className="text-sm text-accent">Failed to load manifest.</p>
      </Card>
    );
  }

  return (
    <div className="stagger-children space-y-6">
      <div>
        <Title level={1}>History</Title>
        <p className="mt-1 text-sm text-ink-muted">
          Browse every day with available morning / midday / end-day reports.
        </p>
      </div>

      <div className="sm:max-w-xs">
        <TextInput
          label="Filter by date"
          placeholder="2026-07-22"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="space-y-3">
        {days.map((day) => {
          const sessions = (
            Object.entries(day.sessions) as [Session, string | null][]
          ).filter(([, path]) => path !== null);

          return (
            <li key={day.date}>
              <Card
                interactive
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{formatDate(day.date)}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {sessions.length} session{sessions.length === 1 ? '' : 's'}
                    {sessions.map(([s]) => (
                      <span key={s} className="ml-2 capitalize">
                        {s}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link
                    to={routeDay(day.date)}
                    className="rounded-full bg-brand/10 px-3 py-1.5 text-brand ring-1 ring-brand/25 transition hover:bg-brand/20"
                  >
                    Contrast
                  </Link>
                  <Link
                    to={routeStudies(day.date)}
                    className="rounded-full bg-signal/10 px-3 py-1.5 text-signal ring-1 ring-signal/25 transition hover:bg-signal/20"
                  >
                    Studies
                  </Link>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      {days.length === 0 ? (
        <p className="text-sm text-ink-muted">No days match this filter.</p>
      ) : null}
    </div>
  );
}
