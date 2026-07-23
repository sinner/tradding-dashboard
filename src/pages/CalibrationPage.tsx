import { CalibrationTrend } from '@/components/charts/CalibrationTrend';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { useCalibration } from '@/hooks/useDayReports';
import { formatDate } from '@/lib/formatters';

export function CalibrationPage(): React.ReactNode {
  const { data, isLoading, error } = useCalibration();

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Calibration</Title>
        <p className="mt-1 text-sm text-ink-muted">
          Track record of calls and whether REDUCE / ADD levels fired.
        </p>
      </div>

      {isLoading ? <p className="text-ink-muted">Loading calibration…</p> : null}
      {error ? (
        <p className="text-sm text-accent">Failed to load calibration.json</p>
      ) : null}

      <Card padded={false} className="overflow-hidden p-3 md:p-4">
        <CalibrationTrend rows={data ?? []} />
      </Card>

      {(data?.length ?? 0) > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-ink-muted">
              <tr>
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Session</th>
                <th className="pb-2 pr-3">Bias</th>
                <th className="pb-2 pr-3">Reduce fired</th>
                <th className="pb-2 pr-3">Add fired</th>
                <th className="pb-2">Helped</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr key={`${row.date}-${row.session}`} className="border-t border-stroke">
                  <td className="py-2 pr-3">{formatDate(row.date)}</td>
                  <td className="py-2 pr-3 capitalize">{row.session}</td>
                  <td className="py-2 pr-3 capitalize">{row.bias}</td>
                  <td className="py-2 pr-3">
                    {row.reduce_fired === null ? '—' : row.reduce_fired ? 'yes' : 'no'}
                  </td>
                  <td className="py-2 pr-3">
                    {row.add_fired === null ? '—' : row.add_fired ? 'yes' : 'no'}
                  </td>
                  <td className="py-2">
                    {row.acting_helped === null
                      ? '—'
                      : typeof row.acting_helped === 'boolean'
                        ? row.acting_helped
                          ? 'yes'
                          : 'no'
                        : row.acting_helped}
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
