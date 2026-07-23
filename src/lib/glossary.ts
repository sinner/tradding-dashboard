/** Shared plain-language blurbs for UI labels (InfoPopover bodies). */

export const GLOSSARY = {
  reduceIf: {
    title: 'Reduce if',
    body: [
      'A “cut risk” price — not an order sitting on the exchange.',
      'If BTC reaches this level (and any confirmation note is true), sell some of a long or buy back some of a short. You keep a smaller position.',
      'Example: you hold BTC, Reduce if $65,380 → if price falls there, take some profit / cut size so a deeper drop hurts less.',
    ],
  },
  addIf: {
    title: 'Add if',
    body: [
      'A “add size” price — again, a trigger, not a live order.',
      'If BTC reaches this level with confirmation, buy more (long) or short more in the planned direction.',
      'Example: Add if $66,000 → only increase size if price gets there and the setup still looks valid.',
    ],
  },
  invalidates: {
    title: 'Invalidates',
    body: [
      'The “thesis is broken” price. If BTC trades through this level, the report’s plan no longer applies — flatten or reassess instead of hoping.',
    ],
  },
  stop: {
    title: 'Stop',
    body: [
      'A hard exit level to cap losses. If price hits the stop, close the trade — do not move it further away “just this once.”',
    ],
  },
  position: {
    title: 'Position (Decision)',
    body: [
      'HOLD = keep what you have; do not chase a new big trade.',
      'REDUCE = bias toward cutting size if triggers fire.',
      'ADD = bias toward increasing size if triggers fire.',
      'TAKE_PROFIT / EXIT = prioritize getting flat or banking gains.',
    ],
  },
  entry: {
    title: 'Entry',
    body: [
      'Price(s) where the report suggests opening (or adding to) the trade for this horizon.',
    ],
  },
  targets: {
    title: 'Targets (TP)',
    body: [
      'Take-profit levels — prices where the report suggests locking in gains (partially or fully).',
    ],
  },
  rr: {
    title: 'R:R (risk : reward)',
    body: [
      'How much you stand to make vs how much you risk on this setup.',
      'R:R 2.0 means ~$2 potential profit for every $1 you’d lose if the stop hits (roughly: distance to target ÷ distance to stop).',
      'Higher is usually better; below ~1.0 means you risk more than you aim to make.',
    ],
  },
  confidence: {
    title: 'Confidence',
    body: [
      'How strongly the analyst stands behind this call (higher = more conviction). It is a judgment score, not a probability guarantee.',
    ],
  },
  bias: {
    title: 'Bias',
    body: [
      'Bullish = expects upside. Bearish = expects downside. Range = expects sideways / chop between levels.',
      'Labels like range-bear mean mostly range with a slight bearish lean.',
    ],
  },
  supportResistance: {
    title: 'Support & resistance',
    body: [
      'Support = a price area where buying often shows up (floor). Resistance = where selling often shows up (ceiling).',
    ],
  },
  snapshot: {
    title: 'Snapshot vs live',
    body: [
      'Snapshot = BTC price when the report was written. Live Δ = how far today’s live price has moved since then.',
    ],
  },
  futuresVsSpot: {
    title: 'Futures vs spot',
    body: [
      'Spot = owning actual BTC (or an ETF/share). You profit mainly if price rises.',
      'Futures = a contract that can go long or short. You can profit from rises or falls, but leverage and liquidations add risk.',
    ],
  },
  rsi: {
    title: 'RSI',
    body: [
      'Relative Strength Index (0–100). Above ~70 often means “stretched high”; below ~30 “stretched low.” Not a buy/sell by itself.',
    ],
  },
  macd: {
    title: 'MACD',
    body: [
      'Moving Average Convergence Divergence — trend/momentum. Histogram and line crosses hint at momentum shifts; confirm with price structure.',
    ],
  },
  ema: {
    title: 'EMA',
    body: [
      'Exponential Moving Average — a smoothed average of recent prices that reacts faster than a simple average. EMA50/200 crosses are classic trend signals.',
    ],
  },
} as const;
