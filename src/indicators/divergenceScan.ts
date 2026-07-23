export type Pivot = { index: number; price: number; kind: 'high' | 'low' };

export function findSwingPivots(values: number[], lookback = 3): Pivot[] {
  const pivots: Pivot[] = [];
  for (let i = lookback; i < values.length - lookback; i++) {
    const v = values[i]!;
    let isHigh = true;
    let isLow = true;
    for (let j = 1; j <= lookback; j++) {
      if (v < values[i - j]! || v < values[i + j]!) isHigh = false;
      if (v > values[i - j]! || v > values[i + j]!) isLow = false;
    }
    if (isHigh) pivots.push({ index: i, price: v, kind: 'high' });
    if (isLow) pivots.push({ index: i, price: v, kind: 'low' });
  }
  return pivots;
}

export type DivergenceType =
  'regular_bullish' | 'regular_bearish' | 'hidden_bullish' | 'hidden_bearish';

export type DivergenceHit = {
  type: DivergenceType;
  fromIndex: number;
  toIndex: number;
  priceFrom: number;
  priceTo: number;
  oscFrom: number;
  oscTo: number;
};

export function scanDivergences(options: {
  prices: number[];
  oscillator: (number | null)[];
  pivotLookback?: number;
  minBars?: number;
  maxBars?: number;
}): DivergenceHit[] {
  const { prices, oscillator, pivotLookback = 3, minBars = 5, maxBars = 60 } = options;

  const pricePivots = findSwingPivots(prices, pivotLookback);
  const oscValues = oscillator.map((v, i) => v ?? prices[i] ?? 0);
  const oscPivots = findSwingPivots(oscValues, pivotLookback);

  const hits: DivergenceHit[] = [];

  const matchKind = (kind: 'high' | 'low') => {
    const pp = pricePivots.filter((p) => p.kind === kind);
    const op = oscPivots.filter((p) => p.kind === kind);
    for (let i = 1; i < pp.length; i++) {
      const a = pp[i - 1]!;
      const b = pp[i]!;
      const bars = b.index - a.index;
      if (bars < minBars || bars > maxBars) continue;

      const oa = op.find((p) => Math.abs(p.index - a.index) <= pivotLookback);
      const ob = op.find((p) => Math.abs(p.index - b.index) <= pivotLookback);
      if (!oa || !ob) continue;

      const priceUp = b.price > a.price;
      const priceDown = b.price < a.price;
      const oscUp = ob.price > oa.price;
      const oscDown = ob.price < oa.price;

      let type: DivergenceType | null = null;
      if (kind === 'low' && priceDown && oscUp) type = 'regular_bullish';
      if (kind === 'high' && priceUp && oscDown) type = 'regular_bearish';
      if (kind === 'low' && priceUp && oscDown) type = 'hidden_bullish';
      if (kind === 'high' && priceDown && oscUp) type = 'hidden_bearish';

      if (type) {
        hits.push({
          type,
          fromIndex: a.index,
          toIndex: b.index,
          priceFrom: a.price,
          priceTo: b.price,
          oscFrom: oa.price,
          oscTo: ob.price,
        });
      }
    }
  };

  matchKind('high');
  matchKind('low');
  return hits;
}
