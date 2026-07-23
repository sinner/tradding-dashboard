/** Simple Moving Average */
export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j]!;
    out.push(sum / period);
  }
  return out;
}

/** Exponential Moving Average */
export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += values[j]!;
      prev = sum / period;
      out.push(prev);
      continue;
    }
    prev = v * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

export function rsi(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = Array(closes.length).fill(null);
  if (closes.length < period + 1) return out;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i]! - closes[i - 1]!;
    if (diff >= 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i]! - closes[i - 1]!;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export type MacdSeries = {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
};

export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdSeries {
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const macdLine: (number | null)[] = closes.map((_, i) => {
    const f = fastEma[i];
    const s = slowEma[i];
    if (f === null || f === undefined || s === null || s === undefined) return null;
    return f - s;
  });

  const macdValues = macdLine.map((v) => v ?? 0);
  const firstValid = macdLine.findIndex((v) => v !== null);
  const signalFull = ema(
    macdValues.slice(firstValid >= 0 ? firstValid : 0),
    signalPeriod,
  );

  const signal: (number | null)[] = Array(closes.length).fill(null);
  const histogram: (number | null)[] = Array(closes.length).fill(null);
  const offset = firstValid >= 0 ? firstValid : 0;
  for (let i = 0; i < signalFull.length; i++) {
    const idx = offset + i;
    const sig = signalFull[i];
    const m = macdLine[idx];
    if (sig === null || sig === undefined || m === null) continue;
    signal[idx] = sig;
    histogram[idx] = m - sig;
  }

  return { macd: macdLine, signal, histogram };
}

export type CrossEvent = {
  index: number;
  type: 'golden' | 'death';
};

export function detectMaCrosses(
  fast: (number | null)[],
  slow: (number | null)[],
): CrossEvent[] {
  const events: CrossEvent[] = [];
  for (let i = 1; i < fast.length; i++) {
    const f0 = fast[i - 1];
    const s0 = slow[i - 1];
    const f1 = fast[i];
    const s1 = slow[i];
    if (
      f0 === null ||
      s0 === null ||
      f1 === null ||
      s1 === null ||
      f0 === undefined ||
      s0 === undefined ||
      f1 === undefined ||
      s1 === undefined
    ) {
      continue;
    }
    if (f0 <= s0 && f1 > s1) events.push({ index: i, type: 'golden' });
    if (f0 >= s0 && f1 < s1) events.push({ index: i, type: 'death' });
  }
  return events;
}
