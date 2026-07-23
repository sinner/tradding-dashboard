import { useEffect, useRef, useState } from 'react';
import type { LevelKind } from '@/components/charts/chartLevels';

/** Hover preview that stays open long enough to move onto a panel. */
export function useDelayedPreview() {
  const [previewKind, setPreviewKind] = useState<LevelKind | null>(null);
  const timer = useRef<number | null>(null);

  const clear = (): void => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const openPreview = (kind: LevelKind | null): void => {
    clear();
    setPreviewKind(kind);
  };

  const schedulePreviewClose = (): void => {
    clear();
    timer.current = window.setTimeout(() => setPreviewKind(null), 220);
  };

  useEffect(() => () => clear(), []);

  return { previewKind, openPreview, schedulePreviewClose, clearPreviewClose: clear };
}
