export type LevelKind = 'support' | 'resistance' | 'reduce' | 'add';

export type LevelLine = {
  price: number;
  label: string;
  kind: LevelKind;
  session: string;
};

export const LEVEL_COLORS: Record<LevelKind, string> = {
  support: '#C4B5FD',
  resistance: '#F472B6',
  reduce: '#FB7185',
  add: '#67E8F9',
};

/** Mix a hex color toward a mute target (0 = original, 1 = fully muted). */
export function muteLevelColor(hex: string, amount: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const tr = 0x2d;
  const tg = 0x24;
  const tb = 0x50;
  const t = Math.min(1, Math.max(0, amount));
  const to = (a: number, m: number) => Math.round(a + (m - a) * t);
  return `#${[to(r, tr), to(g, tg), to(b, tb)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const CANDLE = {
  up: '#C4B5FD',
  down: '#F472B6',
  wickUp: '#DDD6FE',
  wickDown: '#F9A8D4',
} as const;

const SESSION_RANK = ['morning', 'midday', 'endday'] as const;

/**
 * Fade older session levels when newer sessions exist.
 * Newest present session → 1; each older step fades further.
 * Alone → full opacity.
 */
export function sessionLevelOpacity(
  session: string,
  presentSessions: Iterable<string>,
): number {
  const present = SESSION_RANK.filter((s) =>
    [...presentSessions].includes(s),
  );
  if (present.length <= 1) return 1;

  const idx = present.indexOf(session as (typeof SESSION_RANK)[number]);
  if (idx < 0) return 0.4;

  const fromNewest = present.length - 1 - idx;
  if (fromNewest === 0) return 1;
  if (fromNewest === 1) return 0.42;
  return 0.22;
}

/** Stroke style for a level line on the price chart. */
export function sessionLevelStroke(
  kind: LevelKind,
  session: string,
  presentSessions: Iterable<string>,
): { color: string; opacity: number; strokeWidth: number } {
  const opacity = sessionLevelOpacity(session, presentSessions);
  if (opacity >= 0.95) {
    return { color: LEVEL_COLORS[kind], opacity: 0.95, strokeWidth: 1.7 };
  }
  if (opacity >= 0.35) {
    return {
      color: muteLevelColor(LEVEL_COLORS[kind], 0.4),
      opacity: 0.55,
      strokeWidth: 1.25,
    };
  }
  return {
    color: muteLevelColor(LEVEL_COLORS[kind], 0.65),
    opacity: 0.32,
    strokeWidth: 1.1,
  };
}

export function collectLevels(
  reports: {
    session: string;
    levels: {
      support: number[];
      resistance: number[];
    };
    decisionBox: {
      reduceIf?: { price: number } | null;
      addIf?: { price: number } | null;
    };
  }[],
): LevelLine[] {
  const lines: LevelLine[] = [];
  for (const r of reports) {
    for (const p of r.levels.support) {
      lines.push({
        price: p,
        label: `${r.session} support`,
        kind: 'support',
        session: r.session,
      });
    }
    for (const p of r.levels.resistance) {
      lines.push({
        price: p,
        label: `${r.session} resistance`,
        kind: 'resistance',
        session: r.session,
      });
    }
    if (r.decisionBox.reduceIf) {
      lines.push({
        price: r.decisionBox.reduceIf.price,
        label: `${r.session} REDUCE`,
        kind: 'reduce',
        session: r.session,
      });
    }
    if (r.decisionBox.addIf) {
      lines.push({
        price: r.decisionBox.addIf.price,
        label: `${r.session} ADD`,
        kind: 'add',
        session: r.session,
      });
    }
  }
  return lines;
}
