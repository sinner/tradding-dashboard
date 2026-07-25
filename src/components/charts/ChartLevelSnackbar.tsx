import { useEffect } from 'react';
import { LEVEL_COLORS, type LevelKind } from '@/components/charts/chartLevels';
import type { LevelTouchAlert } from '@/components/charts/useLevelTouchAlerts';
import { formatPrice, formatSession } from '@/lib/formatters';
import { cn } from '@/lib/cn';

const KIND_COPY: Record<LevelKind, string> = {
  support: 'Support',
  resistance: 'Resistance',
  reduce: 'Reduce if',
  add: 'Add if',
  liquidation: 'Liquidation',
};

type Props = Readonly<{
  alerts: LevelTouchAlert[];
  onDismiss: (id: string) => void;
  autoDismissMs?: number;
}>;

function SnackbarItem({
  alert,
  onDismiss,
  autoDismissMs,
}: {
  alert: LevelTouchAlert;
  onDismiss: (id: string) => void;
  autoDismissMs: number;
}): React.ReactNode {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(alert.id), autoDismissMs);
    return () => window.clearTimeout(t);
  }, [alert.id, autoDismissMs, onDismiss]);

  const color = LEVEL_COLORS[alert.kind];

  return (
    <output
      className={cn(
        'flex min-w-[240px] max-w-sm items-start gap-3 rounded-xl border border-stroke/80',
        'bg-bg-deep/95 px-3 py-2.5 text-left shadow-glow animate-fade-up backdrop-blur-sm',
      )}
      style={{ borderColor: `${color}55` }}
    >
      <span
        className="mt-1 size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">
          Candle touched {KIND_COPY[alert.kind]}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {formatSession(alert.session)} · {formatPrice(alert.price)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(alert.id)}
        className="shrink-0 text-xs text-ink-muted transition hover:text-ink"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </output>
  );
}

/** Snackbars anchored to the price chart when candles touch report levels. */
export function ChartLevelSnackbar({
  alerts,
  onDismiss,
  autoDismissMs = 5500,
}: Props): React.ReactNode {
  if (alerts.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex w-[min(100%-1.5rem,24rem)] -translate-x-1/2 flex-col gap-2"
      aria-live="polite"
    >
      {alerts.map((a) => (
        <div key={a.id} className="pointer-events-auto">
          <SnackbarItem
            alert={a}
            onDismiss={onDismiss}
            autoDismissMs={autoDismissMs}
          />
        </div>
      ))}
    </div>
  );
}
