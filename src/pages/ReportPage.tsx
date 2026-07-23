import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BiasBadge } from '@/components/dashboard/BiasBadge';
import { DecisionBox } from '@/components/dashboard/DecisionBox';
import { OperationsCard } from '@/components/dashboard/OperationsCard';
import { ReportMarkdown } from '@/components/report/ReportMarkdown';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { QUERY_KEYS, routeDay } from '@/config/constants';
import { useManifest } from '@/hooks/useManifest';
import { useReport } from '@/hooks/useDayReports';
import { formatDateTime, formatSession } from '@/lib/formatters';
import { reportService } from '@/services/reportService';

type NarrativeBodyProps = Readonly<{
  loading: boolean;
  error: boolean;
  mdPath: string;
  content: string;
}>;

function NarrativeBody({
  loading,
  error,
  mdPath,
  content,
}: NarrativeBodyProps): React.ReactNode {
  if (loading) {
    return <p className="text-sm text-ink-muted">Loading narrative…</p>;
  }
  if (error) {
    return (
      <div className="space-y-2">
        <Title level={3}>Narrative unavailable</Title>
        <p className="text-sm text-ink-muted">
          No markdown report yet. Add{' '}
          <code className="text-brand">{mdPath}</code> to show the full write-up
          here. Decision and operations still come from the JSON.
        </p>
      </div>
    );
  }
  return <ReportMarkdown content={content} />;
}

export function ReportPage(): React.ReactNode {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const manifest = useManifest();

  const path = manifest.data?.days
    .flatMap((d) => Object.values(d.sessions))
    .find((p) => p !== null && p.includes(id));

  const report = useReport(path);

  const mdPath = reportService.markdownPathFromId(id);
  const markdown = useQuery({
    queryKey: QUERY_KEYS.markdown(mdPath),
    queryFn: () => reportService.fetchReportMarkdown(mdPath),
    enabled: Boolean(id),
    retry: false,
  });

  const goBack = (): void => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const date = report.data?.date;
    navigate(date ? routeDay(date) : '/');
  };

  if (manifest.isLoading || report.isLoading) {
    return <p className="text-ink-muted">Loading report…</p>;
  }

  if (!report.data) {
    return (
      <Card>
        <Title level={2}>Report not found</Title>
        <p className="mt-2 text-sm text-ink-muted">
          No JSON for <code className="text-brand">{id}</code>.
        </p>
        <Link to="/" className="text-link mt-4 text-sm">
          ← Dashboard
        </Link>
      </Card>
    );
  }

  const r = report.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={goBack} className="text-link text-sm">
          ← Back
        </button>
        <Link to={routeDay(r.date)} className="text-sm text-ink-muted hover:text-ink">
          Day contrast
        </Link>
        <Link to="/" className="text-sm text-ink-muted hover:text-ink">
          Dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Title level={1}>
            {formatSession(r.session)} · {r.date}
          </Title>
          <p className="mt-1 text-sm text-ink-muted">
            Generated {formatDateTime(r.generatedAt)}
          </p>
        </div>
        <BiasBadge bias={r.overallBias} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden p-5 md:p-7">
          <NarrativeBody
            loading={markdown.isLoading}
            error={markdown.isError || !markdown.data?.trim()}
            mdPath={mdPath}
            content={markdown.data ?? ''}
          />
        </Card>
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <DecisionBox decision={r.decisionBox} />
          <OperationsCard operations={r.operations} scalpContext={r.scalpContext} />
        </div>
      </div>
    </div>
  );
}
