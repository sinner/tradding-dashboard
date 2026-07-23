import type { Report } from '@/lib/types';
import { formatPrice } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';

type Props = {
  levels: Report['levels'];
};

export function LevelsCard({ levels }: Props): React.ReactNode {
  return (
    <Card className="space-y-3">
      <Title level={4} className="text-ink-muted">
        Key levels
      </Title>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-muted">Support</p>
          <ul className="space-y-1">
            {levels.support.length === 0 ? (
              <li className="text-ink-muted">—</li>
            ) : (
              levels.support.map((p) => (
                <li key={p} className="font-mono tabular-nums text-bull">
                  {formatPrice(p)}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-muted">
            Resistance
          </p>
          <ul className="space-y-1">
            {levels.resistance.length === 0 ? (
              <li className="text-ink-muted">—</li>
            ) : (
              levels.resistance.map((p) => (
                <li key={p} className="font-mono tabular-nums text-bear">
                  {formatPrice(p)}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {levels.liquidation.length > 0 ? (
        <div className="border-t border-stroke pt-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-ink-muted">
            Liquidation
          </p>
          <ul className="space-y-1 text-sm">
            {levels.liquidation.map((l) => (
              <li key={l.price} className="text-accent">
                <span className="tabular-nums">{formatPrice(l.price)}</span>
                {l.note ? (
                  <span className="ml-2 text-xs text-ink-muted">{l.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
