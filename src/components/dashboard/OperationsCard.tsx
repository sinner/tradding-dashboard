import { Crosshair, Layers, Timer, TrendingDown, Wallet } from 'lucide-react';
import type { Report } from '@/lib/types';
import { formatPrice } from '@/lib/formatters';
import { ActionBadge, FuturesSideLegend } from '@/components/dashboard/ActionBadge';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';
import type { LucideIcon } from 'lucide-react';

type Operation = Report['operations'][number];

type Props = {
  operations: Report['operations'];
};

const horizonHelp: Record<string, { title: string; body: string; Icon: LucideIcon }> = {
  scalping: {
    title: 'Scalping',
    body: 'Very short trades (minutes to a few hours), usually futures. Looks for quick in-and-out moves; often WAIT when the tape is choppy.',
    Icon: Crosshair,
  },
  swing: {
    title: 'Swing',
    body: 'Multi-day to multi-week futures trade. Uses entry / stop / take-profit levels from this report. Highest “active trade” detail.',
    Icon: TrendingDown,
  },
  position: {
    title: 'Position',
    body: 'Weeks-to-months spot stance. Slower than swing; usually hold/add around structure rather than scalp entries.',
    Icon: Layers,
  },
  spot_core: {
    title: 'Spot core',
    body: 'Long-term spot stack (core holding). Rarely trades around noise; action is usually HOLD unless the thesis breaks.',
    Icon: Wallet,
  },
  intraday: {
    title: 'Intraday',
    body: 'Same-day trade (hours). Closes before or at end of session; between scalping and swing in holding time.',
    Icon: Timer,
  },
};

function formatHorizon(horizon: string): string {
  return horizonHelp[horizon]?.title ?? horizon.replace(/_/g, ' ');
}

function OperationRow({ op }: { op: Operation }): React.ReactNode {
  const help = horizonHelp[op.horizon];
  const Icon = help?.Icon;

  return (
    <div className="rounded-xl border border-stroke/60 bg-bg/40 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {help && Icon ? (
            <InfoPopover
              variant="text"
              label={`What is ${help.title}?`}
              title={help.title}
              textClassName="inline-flex items-center gap-1.5 text-ink-muted hover:text-signal"
              text={
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {formatHorizon(op.horizon)}
                </span>
              }
            >
              <p>{help.body}</p>
              <p>
                Market: <span className="font-medium text-ink">{op.market}</span>
                {op.hold ? (
                  <>
                    {' '}
                    · Hold window: <span className="font-medium text-ink">{op.hold}</span>
                  </>
                ) : null}
              </p>
            </InfoPopover>
          ) : (
            <span className="capitalize text-ink-muted">{formatHorizon(op.horizon)}</span>
          )}
          <p className="mt-0.5 text-[11px] capitalize text-ink-muted">{op.market}</p>
        </div>
        <ActionBadge action={op.action} market={op.market} />
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {op.entry && op.entry.length > 0 ? (
          <>
            <dt className="text-ink-muted">Entry</dt>
            <dd className="text-right font-mono tabular-nums">
              {op.entry.map((p) => formatPrice(p)).join(' · ')}
            </dd>
          </>
        ) : null}
        {op.stop != null ? (
          <>
            <dt className="text-ink-muted">Stop</dt>
            <dd className="text-right font-mono tabular-nums">{formatPrice(op.stop)}</dd>
          </>
        ) : null}
        {op.tp && op.tp.length > 0 ? (
          <>
            <dt className="text-ink-muted">Targets</dt>
            <dd className="text-right font-mono tabular-nums">
              {op.tp.map((p) => formatPrice(p)).join(' · ')}
            </dd>
          </>
        ) : null}
        {op.rr != null ? (
          <>
            <dt className="text-ink-muted">R:R</dt>
            <dd className="text-right font-mono tabular-nums">{op.rr.toFixed(2)}</dd>
          </>
        ) : null}
        {op.confidence != null ? (
          <>
            <dt className="text-ink-muted">Confidence</dt>
            <dd className="text-right font-mono tabular-nums">
              {op.confidence.toFixed(2)}
            </dd>
          </>
        ) : null}
        {op.hold ? (
          <>
            <dt className="text-ink-muted">Hold</dt>
            <dd className="text-right text-ink">{op.hold}</dd>
          </>
        ) : null}
      </dl>
      {'note' in op && typeof op.note === 'string' && op.note ? (
        <p className="mt-2 border-t border-stroke/60 pt-2 text-[11px] text-ink-muted">
          {op.note}
        </p>
      ) : null}
    </div>
  );
}

export function OperationsCard({ operations }: Props): React.ReactNode {
  if (operations.length === 0) return null;

  const hasFutures = operations.some((o) => o.market.toLowerCase().includes('futures'));

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Title level={4} className="text-ink-muted">
          Operations
        </Title>
        <InfoPopover label="What are operations?" title="Trade horizons">
          <p>
            Each report suggests a stance per{' '}
            <span className="font-medium text-ink">time horizon</span> — how long you plan
            to hold.
          </p>
          <p>
            Hover a horizon name or an action badge (short / long / WAIT) for what it
            means. Entry, stop, and targets tell you where to act.
          </p>
        </InfoPopover>
      </div>

      {hasFutures ? <FuturesSideLegend /> : null}

      <div className="space-y-2">
        {operations.map((op) => (
          <OperationRow key={`${op.horizon}-${op.market}-${op.action}`} op={op} />
        ))}
      </div>
    </Card>
  );
}
