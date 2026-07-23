import type { CalibrationRow } from '@/lib/types';

export type TriState = boolean | null;

export type SessionScore = {
  row: CalibrationRow;
  biasCorrect: TriState;
  reduceHit: TriState;
  addHit: TriState;
  actingHelped: TriState;
  actingLabel: string;
};

function biasDirection(bias: string): 'bull' | 'bear' | 'range' | null {
  const b = bias.toLowerCase();
  if (b.includes('bull')) return 'bull';
  if (b.includes('bear')) return 'bear';
  if (b.includes('range') || b.includes('neutral')) return 'range';
  return null;
}

/** Did bias match close-to-close move between reports? */
export function scoreBiasCorrect(row: CalibrationRow): TriState {
  if (row.price_at_report == null || row.price_next_report == null) return null;
  const move = row.price_next_report - row.price_at_report;
  const dir = biasDirection(row.bias);
  if (!dir) return null;
  if (dir === 'range') return Math.abs(move / row.price_at_report) < 0.005;
  if (dir === 'bull') return move > 0;
  return move < 0;
}

export function scoreActingHelped(row: CalibrationRow): {
  value: TriState;
  label: string;
} {
  if (row.acting_helped === true) return { value: true, label: 'Yes' };
  if (row.acting_helped === false) return { value: false, label: 'No' };
  if (typeof row.acting_helped === 'string') {
    const s = row.acting_helped.toLowerCase();
    if (s.includes('no-move') || s.includes('nomove')) {
      return { value: null, label: 'No move' };
    }
    return { value: null, label: row.acting_helped };
  }
  return { value: null, label: '—' };
}

export function scoreSession(row: CalibrationRow): SessionScore {
  const acting = scoreActingHelped(row);
  return {
    row,
    biasCorrect: scoreBiasCorrect(row),
    reduceHit: row.reduce_level == null ? null : row.reduce_fired,
    addHit: row.add_level == null ? null : row.add_fired,
    actingHelped: acting.value,
    actingLabel: acting.label,
  };
}

export type MetricKey = 'bias' | 'levels' | 'acting';

export function rollingRate(
  scores: SessionScore[],
  key: MetricKey,
  window = 5,
): { rate: number | null; n: number; known: number } {
  const slice = scores.slice(-window);
  let hits = 0;
  let known = 0;
  for (const s of slice) {
    if (key === 'bias') {
      if (s.biasCorrect === null) continue;
      known += 1;
      if (s.biasCorrect) hits += 1;
    } else if (key === 'levels') {
      for (const v of [s.reduceHit, s.addHit]) {
        if (v === null) continue;
        known += 1;
        if (v) hits += 1;
      }
    } else if (s.actingHelped !== null) {
      known += 1;
      if (s.actingHelped) hits += 1;
    }
  }
  return {
    rate: known > 0 ? hits / known : null,
    n: slice.length,
    known,
  };
}

export function sparkValues(
  scores: SessionScore[],
  key: MetricKey,
): (number | null)[] {
  return scores.map((_, i) => {
    const { rate } = rollingRate(scores.slice(0, i + 1), key, 5);
    return rate;
  });
}

export const TRACK_RECORD_MIN = 5;
