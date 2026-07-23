import { CircleMinus, CirclePlus, ShieldAlert } from 'lucide-react';
import type { Report } from '@/lib/types';
import { formatPrice } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';

type Props = {
  decision: Report['decisionBox'];
};

export function DecisionBox({ decision }: Props): React.ReactNode {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-ink-muted" aria-hidden />
          <Title level={4} className="text-ink-muted">
            Decision
          </Title>
        </div>
        <span className="rounded-full bg-brand px-3 py-1 text-sm font-bold text-ink">
          {decision.position}
        </span>
      </div>

      <dl className="grid gap-2 text-sm">
        {decision.reduceIf ? (
          <div className="flex justify-between gap-2">
            <dt>
              <InfoPopover
                variant="text"
                label="What does Reduce if mean?"
                title="Reduce if"
                textClassName="inline-flex items-center gap-1 text-ink-muted hover:text-accent"
                text={
                  <span className="inline-flex items-center gap-1">
                    <CircleMinus className="size-3.5 text-accent" aria-hidden />
                    Reduce if
                  </span>
                }
              >
                <p>
                  A <span className="font-medium text-ink">defensive trigger</span> — not
                  an order yet.
                </p>
                <p>
                  If price hits this level with the confirmation below,{' '}
                  <span className="font-medium text-ink">cut size</span>: sell some of a
                  long, or cover some of a short. Goal: take risk off.
                </p>
              </InfoPopover>
            </dt>
            <dd className="text-right font-medium">
              {formatPrice(decision.reduceIf.price)}
              {decision.reduceIf.confirmation ? (
                <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                  {decision.reduceIf.confirmation}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {decision.addIf ? (
          <div className="flex justify-between gap-2">
            <dt>
              <InfoPopover
                variant="text"
                label="What does Add if mean?"
                title="Add if"
                textClassName="inline-flex items-center gap-1 text-ink-muted hover:text-bull"
                text={
                  <span className="inline-flex items-center gap-1">
                    <CirclePlus className="size-3.5 text-bull" aria-hidden />
                    Add if
                  </span>
                }
              >
                <p>
                  An <span className="font-medium text-ink">offensive trigger</span> — not
                  an order yet.
                </p>
                <p>
                  If price holds this level with the confirmation below,{' '}
                  <span className="font-medium text-ink">increase size</span> in the
                  planned direction. Goal: scale in when strength confirms.
                </p>
              </InfoPopover>
            </dt>
            <dd className="text-right font-medium">
              {formatPrice(decision.addIf.price)}
              {decision.addIf.confirmation ? (
                <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                  {decision.addIf.confirmation}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {decision.invalidatesAt != null ? (
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">Invalidates</dt>
            <dd className="font-medium">{formatPrice(decision.invalidatesAt)}</dd>
          </div>
        ) : null}
        {decision.stopOrder?.recommended ? (
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">Stop</dt>
            <dd className="font-medium">{formatPrice(decision.stopOrder.price)}</dd>
          </div>
        ) : null}
      </dl>

      {decision.changed ? (
        <p className="border-t border-stroke pt-3 text-xs text-ink-muted">
          {decision.changed}
        </p>
      ) : null}
    </Card>
  );
}
