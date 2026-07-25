import { Skull } from 'lucide-react';
import { PortfolioPanel } from '@/components/dashboard/PortfolioPanel';
import { HandoffNotes } from '@/components/dashboard/HandoffNotes';
import { HallOfShame } from '@/components/dashboard/HallOfShame';
import { LearnedPatterns } from '@/components/dashboard/LearnedPatterns';
import { RecentSnapshots } from '@/components/dashboard/RecentSnapshots';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { usePortfolio } from '@/hooks/useDayReports';
import { REPORT_DEPLOY_POLL_MS } from '@/config/constants';
import { formatPrice } from '@/lib/formatters';

export function PaperWalletPage(): React.ReactNode {
  const { data: portfolio, isLoading } = usePortfolio({
    refetchInterval: REPORT_DEPLOY_POLL_MS,
  });
  const p = portfolio ?? null;
  const hasData = Boolean(p && p.latest);

  return (
    <div className="space-y-6">
      <div>
        <Title level={1}>Paper wallet</Title>
        <p className="mt-1 text-sm text-ink-muted">
          The four sessions relay ONE paper wallet of {formatPrice(100)} (not real money),
          must cover a monthly cost of living, and learn from every bankruptcy. Spot,
          shorts and leverage allowed.
        </p>
      </div>

      {p?.status === 'bankrupt' ? (
        <Card className="border-bear/50 bg-bear/10">
          <p className="flex items-center gap-2 text-sm font-medium text-bear">
            <Skull className="size-4" aria-hidden />
            Bankrupt — the wallet is frozen (no trading) and will restart at the next
            midnight session.
          </p>
        </Card>
      ) : null}

      <PortfolioPanel portfolio={p} isLoading={isLoading} />

      {hasData ? (
        <>
          <HandoffNotes portfolio={p!} />
          <div className="grid gap-4 md:grid-cols-2">
            <HallOfShame portfolio={p!} />
            <LearnedPatterns portfolio={p!} />
          </div>
          <RecentSnapshots portfolio={p!} />
        </>
      ) : null}
    </div>
  );
}
