import type { Report } from '@/lib/types';
import { formatPrice } from '@/lib/formatters';
import { Card } from '@/components/ui/Card';
import { Title } from '@/components/ui/Title';
import { Magnet, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  levels: Report['levels'];
};

const INTENSITY_STYLE: Record<string, string> = {
  low: 'text-ink-muted',
  medium: 'text-amber-300',
  high: 'text-amber-400',
  extreme: 'text-accent',
};

export function LevelsCard({ levels }: Props): React.ReactNode {
  const magnet = levels.liquidityMagnet ?? null;

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
          <p className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-muted">
            <Magnet className="size-3.5 text-amber-400" aria-hidden />
            Liquidation clusters
          </p>
          <ul className="space-y-1.5 text-sm">
            {levels.liquidation.map((l) => (
              <li key={l.price} className="flex items-center gap-2">
                {l.side === 'above' ? (
                  <ArrowUp className="size-3.5 shrink-0 text-bear" aria-hidden />
                ) : l.side === 'below' ? (
                  <ArrowDown className="size-3.5 shrink-0 text-bull" aria-hidden />
                ) : (
                  <span className="inline-block size-3.5 shrink-0" />
                )}
                <span
                  className={cn(
                    'font-mono tabular-nums',
                    l.magnet ? 'font-semibold text-amber-300' : 'text-ink',
                  )}
                >
                  {formatPrice(l.price)}
                </span>
                {l.intensity ? (
                  <span
                    className={cn(
                      'rounded-full border border-stroke/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
                      INTENSITY_STYLE[l.intensity] ?? 'text-ink-muted',
                    )}
                  >
                    {l.intensity}
                  </span>
                ) : null}
                {l.magnet ? (
                  <Magnet className="size-3 text-amber-300" aria-label="magnet" />
                ) : null}
                {l.note ? (
                  <span className="text-xs text-ink-muted">{l.note}</span>
                ) : null}
              </li>
            ))}
          </ul>

          {magnet && (magnet.nearestAbove != null || magnet.nearestBelow != null) ? (
            <p className="mt-2 text-[11px] text-ink-muted">
              Nearest pools —{' '}
              {magnet.nearestBelow != null ? (
                <span className="text-bull">
                  below {formatPrice(magnet.nearestBelow)}
                </span>
              ) : null}
              {magnet.nearestBelow != null && magnet.nearestAbove != null ? ' · ' : ''}
              {magnet.nearestAbove != null ? (
                <span className="text-bear">
                  above {formatPrice(magnet.nearestAbove)}
                </span>
              ) : null}
              {magnet.pull && magnet.pull !== 'balanced' ? (
                <span className="ml-1 text-amber-300">
                  · pull {magnet.pull === 'down' ? '↓' : '↑'}
                </span>
              ) : null}
            </p>
          ) : null}
          {magnet?.note ? (
            <p className="mt-1 text-[11px] italic text-ink-muted">{magnet.note}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
