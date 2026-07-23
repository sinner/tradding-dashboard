import { Crosshair, Layers, Timer, TrendingDown, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Report } from '@/lib/types';
import { formatPrice } from '@/lib/formatters';
import { GLOSSARY } from '@/lib/glossary';
import { ActionBadge, FuturesSideLegend } from '@/components/dashboard/ActionBadge';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';

type Operation = Report['operations'][number];
type ScalpContext = NonNullable<Report['scalpContext']>;

type Props = {
  operations: Report['operations'];
  scalpContext?: Report['scalpContext'];
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

const FIELD_SHORT: Record<'entry' | 'stop' | 'targets' | 'rr' | 'confidence', string> = {
  entry: 'Entry',
  stop: 'Stop',
  targets: 'Targets',
  rr: 'R:R',
  confidence: 'Confidence',
};

function formatHorizon(horizon: string): string {
  return horizonHelp[horizon]?.title ?? horizon.replace(/_/g, ' ');
}

function FieldLabel({
  term,
}: {
  term: 'entry' | 'stop' | 'targets' | 'rr' | 'confidence';
}): React.ReactNode {
  const g = GLOSSARY[term];
  return (
    <InfoPopover
      variant="text"
      label={`What is ${g.title}?`}
      title={g.title}
      textClassName="text-ink-muted hover:text-signal"
      text={FIELD_SHORT[term]}
    >
      {g.body.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </InfoPopover>
  );
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
            <dt>
              <FieldLabel term="entry" />
            </dt>
            <dd className="text-right font-mono tabular-nums">
              {op.entry.map((p) => formatPrice(p)).join(' · ')}
            </dd>
          </>
        ) : null}
        {op.stop != null ? (
          <>
            <dt>
              <FieldLabel term="stop" />
            </dt>
            <dd className="text-right font-mono tabular-nums">{formatPrice(op.stop)}</dd>
          </>
        ) : null}
        {op.tp && op.tp.length > 0 ? (
          <>
            <dt>
              <FieldLabel term="targets" />
            </dt>
            <dd className="text-right font-mono tabular-nums">
              {op.tp.map((p) => formatPrice(p)).join(' · ')}
            </dd>
          </>
        ) : null}
        {op.rr != null ? (
          <>
            <dt>
              <FieldLabel term="rr" />
            </dt>
            <dd className="text-right font-mono tabular-nums">{op.rr.toFixed(2)}</dd>
          </>
        ) : null}
        {op.confidence != null ? (
          <>
            <dt>
              <FieldLabel term="confidence" />
            </dt>
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

function ScalpContextBlock({ ctx }: { ctx: ScalpContext }): React.ReactNode {
  const help = horizonHelp.scalping;
  const hasLevels =
    ctx.longAbove != null || ctx.shortBelow != null || ctx.invalidates != null;
  return (
    <div className="rounded-xl border border-signal/40 bg-signal/5 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <InfoPopover
          variant="text"
          label="What is Scalp context?"
          title={help.title}
          textClassName="inline-flex items-center gap-1.5 text-ink hover:text-signal"
          text={
            <span className="inline-flex items-center gap-1.5">
              <Crosshair className="size-3.5 shrink-0" aria-hidden />
              Scalp context
            </span>
          }
        >
          <p>{help.body}</p>
          <p>
            This block is the <span className="font-medium text-ink">intraday frame</span>{' '}
            only — long-above / short-below levels to trade around. Actual entries come
            from the live chart, not this snapshot.
          </p>
          <p>
            Badge <span className="font-medium text-ink">live-driven</span> means the
            report will not invent a full scalp trade plan here.
          </p>
        </InfoPopover>
        <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-signal">
          live-driven
        </span>
      </div>
      <p className="mt-1 text-[11px] text-ink-muted">
        Fast setups (minutes–hours) come from the live chart, not this snapshot. Use these
        as the intraday frame to scalp around.
      </p>
      {hasLevels ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {ctx.intradayBias ? (
            <>
              <dt className="text-ink-muted">Intraday bias</dt>
              <dd className="text-right capitalize text-ink">{ctx.intradayBias}</dd>
            </>
          ) : null}
          {ctx.longAbove != null ? (
            <>
              <dt className="text-ink-muted">Long above</dt>
              <dd className="text-right font-mono tabular-nums text-bull">
                {formatPrice(ctx.longAbove)}
              </dd>
            </>
          ) : null}
          {ctx.shortBelow != null ? (
            <>
              <dt className="text-ink-muted">Short below</dt>
              <dd className="text-right font-mono tabular-nums text-bear">
                {formatPrice(ctx.shortBelow)}
              </dd>
            </>
          ) : null}
          {ctx.invalidates != null ? (
            <>
              <dt className="text-ink-muted">Invalidates</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatPrice(ctx.invalidates)}
              </dd>
            </>
          ) : null}
        </dl>
      ) : null}
      {ctx.note ? (
        <p className="mt-2 border-t border-stroke/60 pt-2 text-[11px] text-ink-muted">
          {ctx.note}
        </p>
      ) : null}
    </div>
  );
}

export function OperationsCard({ operations, scalpContext }: Props): React.ReactNode {
  const rows = operations.filter((o) => o.horizon !== 'scalping');
  if (rows.length === 0 && !scalpContext) return null;

  const hasFutures = rows.some((o) => o.market.toLowerCase().includes('futures'));

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
            Hover a horizon name, an action badge, or labels like R:R for plain-language
            definitions. Entry, stop, and targets tell you where to act.
          </p>
          <p>
            <span className="font-medium text-ink">Scalp context</span> is the intraday
            frame only — actual fast signals come from the live chart, not this report.
          </p>
        </InfoPopover>
      </div>

      {scalpContext ? <ScalpContextBlock ctx={scalpContext} /> : null}

      {hasFutures ? <FuturesSideLegend /> : null}

      <div className="space-y-2">
        {rows.map((op) => (
          <OperationRow key={`${op.horizon}-${op.market}-${op.action}`} op={op} />
        ))}
      </div>
    </Card>
  );
}
