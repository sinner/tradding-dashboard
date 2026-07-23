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
  reduce: '#E879F9',
  add: '#A78BFA',
};

export const CANDLE = {
  up: '#C4B5FD',
  down: '#F472B6',
  wickUp: '#DDD6FE',
  wickDown: '#F9A8D4',
} as const;

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
