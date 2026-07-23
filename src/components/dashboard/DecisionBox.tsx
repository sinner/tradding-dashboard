import { CircleMinus, CirclePlus, ShieldAlert } from 'lucide-react';
import type { Report } from '@/lib/types';
import { formatPrice } from '@/lib/formatters';
import { GLOSSARY } from '@/lib/glossary';
import { Card } from '@/components/ui/Card';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { Title } from '@/components/ui/Title';

type Props = {
  decision: Report['decisionBox'];
};

function Blurbs({ lines }: { lines: readonly string[] }): React.ReactNode {
  return (
    <>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </>
  );
}

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
        <InfoPopover
          variant="text"
          label="What does this position mean?"
          title={GLOSSARY.position.title}
          textClassName="rounded-full bg-brand px-3 py-1 text-sm font-bold text-ink"
          text={decision.position}
        >
          <Blurbs lines={GLOSSARY.position.body} />
        </InfoPopover>
      </div>

      <dl className="grid gap-2 text-sm">
        {decision.reduceIf ? (
          <div className="flex justify-between gap-2">
            <dt>
              <InfoPopover
                variant="text"
                label="What does Reduce if mean?"
                title={GLOSSARY.reduceIf.title}
                textClassName="inline-flex items-center gap-1 text-ink-muted hover:text-accent"
                text={
                  <span className="inline-flex items-center gap-1">
                    <CircleMinus className="size-3.5 text-accent" aria-hidden />
                    Reduce if
                  </span>
                }
              >
                <Blurbs lines={GLOSSARY.reduceIf.body} />
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
                title={GLOSSARY.addIf.title}
                textClassName="inline-flex items-center gap-1 text-ink-muted hover:text-bull"
                text={
                  <span className="inline-flex items-center gap-1">
                    <CirclePlus className="size-3.5 text-bull" aria-hidden />
                    Add if
                  </span>
                }
              >
                <Blurbs lines={GLOSSARY.addIf.body} />
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
            <dt>
              <InfoPopover
                variant="text"
                label="What does Invalidates mean?"
                title={GLOSSARY.invalidates.title}
                textClassName="text-ink-muted hover:text-signal"
                text="Invalidates"
              >
                <Blurbs lines={GLOSSARY.invalidates.body} />
              </InfoPopover>
            </dt>
            <dd className="font-medium">{formatPrice(decision.invalidatesAt)}</dd>
          </div>
        ) : null}
        {decision.stopOrder?.recommended ? (
          <div className="flex justify-between gap-2">
            <dt>
              <InfoPopover
                variant="text"
                label="What is a stop?"
                title={GLOSSARY.stop.title}
                textClassName="text-ink-muted hover:text-signal"
                text="Stop"
              >
                <Blurbs lines={GLOSSARY.stop.body} />
              </InfoPopover>
            </dt>
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
