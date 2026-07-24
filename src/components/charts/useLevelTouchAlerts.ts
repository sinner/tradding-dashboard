import { useCallback, useEffect, useRef, useState } from 'react';
import type { LevelLine } from '@/components/charts/chartLevels';
import {
  findLevelTouches,
  levelTouchKey,
  type LevelTouch,
} from '@/components/charts/chartScale';
import type { Candle } from '@/lib/types';

export type LevelTouchAlert = LevelTouch & { id: string };

type Options = Readonly<{
  candles: Candle[];
  levels: LevelLine[];
  /** Only alert for touches on the last N candles (forming + recent). */
  recentBars?: number;
  enabled?: boolean;
}>;

/**
 * Seeds historical touches silently, then surfaces new touches on recent bars
 * as snackbar alerts (e.g. when a live candle expands into a level).
 */
export function useLevelTouchAlerts({
  candles,
  levels,
  recentBars = 3,
  enabled = true,
}: Options): {
  alerts: LevelTouchAlert[];
  dismiss: (id: string) => void;
} {
  const [alerts, setAlerts] = useState<LevelTouchAlert[]>([]);
  const seen = useRef(new Set<string>());
  const bootstrapped = useRef(false);
  const firstOpen = useRef<number | null>(null);

  const dismiss = useCallback((id: string): void => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled || candles.length === 0 || levels.length === 0) return;

    const open0 = candles[0]?.openTime ?? 0;
    if (firstOpen.current != null && firstOpen.current !== open0) {
      seen.current = new Set();
      bootstrapped.current = false;
    }
    firstOpen.current = open0;

    const touches = findLevelTouches(candles, levels);

    if (!bootstrapped.current) {
      seen.current = new Set(touches.map(levelTouchKey));
      bootstrapped.current = true;
      return;
    }

    const cutoff = candles.length - recentBars;
    const fresh = touches.filter((t) => {
      const key = levelTouchKey(t);
      if (seen.current.has(key)) return false;
      seen.current.add(key);
      return t.index >= cutoff;
    });

    if (fresh.length === 0) return;

    setAlerts((prev) =>
      [
        ...fresh.map((t) => ({
          ...t,
          id: `${levelTouchKey(t)}-${Date.now()}`,
        })),
        ...prev,
      ].slice(0, 4),
    );
  }, [candles, levels, recentBars, enabled]);

  return { alerts, dismiss };
}
