import { z } from 'zod';

export const SessionSchema = z.enum(['midnight', 'morning', 'midday', 'endday']);
export type Session = z.infer<typeof SessionSchema>;

export const BiasSchema = z.enum(['bullish', 'range', 'bearish']);
export type Bias = z.infer<typeof BiasSchema>;

/** Free-form bias labels used in calibration rows (e.g. "range-bear"). */
export const BiasLabelSchema = z.string().min(1);

export const PositionSchema = z.enum(['HOLD', 'REDUCE', 'ADD', 'TAKE_PROFIT', 'EXIT']);
export type Position = z.infer<typeof PositionSchema>;

const NullableNumber = z.number().nullable();

const TriggerSchema = z.object({
  price: z.number(),
  confirmation: z.string().nullable().optional(),
});

const StopOrderSchema = z.object({
  recommended: z.boolean(),
  price: z.number(),
});

const MacdSchema = z.object({
  line: NullableNumber,
  signal: NullableNumber,
  hist: NullableNumber,
});

const EmasSchema = z.object({
  ema20: NullableNumber,
  ema50: NullableNumber,
  ema100: NullableNumber.optional(),
  ema200: NullableNumber,
});

const TimeframeSchema = z
  .object({
    tf: z.string(),
    rsi: NullableNumber.optional(),
    macd: MacdSchema.optional(),
    emas: EmasSchema.optional(),
    structure: z.string().nullable().optional(),
    bias: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    asOf: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();

const OperationSchema = z
  .object({
    horizon: z.string(),
    market: z.string(),
    action: z.string(),
    entry: z.array(z.number()).nullable().optional(),
    stop: z.number().nullable().optional(),
    tp: z.array(z.number()).optional(),
    rr: z.number().nullable().optional(),
    confidence: z.number().nullable().optional(),
    hold: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();

const ScalpContextSchema = z
  .object({
    intradayBias: z.string().nullable().optional(),
    longAbove: NullableNumber.optional(),
    shortBelow: NullableNumber.optional(),
    invalidates: NullableNumber.optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();

const LiquidationLevelSchema = z
  .object({
    price: z.number(),
    // Where the cluster sits relative to spot when the report was written.
    side: z.enum(['above', 'below']).nullable().optional(),
    // Relative size of the liquidity pool on the CoinGlass heatmap.
    intensity: z.enum(['low', 'medium', 'high', 'extreme']).nullable().optional(),
    // True when this pool is the dominant magnet price is likely drawn toward.
    magnet: z.boolean().nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();

/** Actionable summary of the liquidation heatmap — the nearest magnets and the pull. */
const LiquidityMagnetSchema = z
  .object({
    nearestAbove: NullableNumber.optional(),
    nearestBelow: NullableNumber.optional(),
    // Which way the dominant pool tends to pull price next.
    pull: z.enum(['up', 'down', 'balanced']).nullable().optional(),
    source: z.string().nullable().optional(),
    asOf: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();

const DivergenceSchema = z.object({
  type: z.enum([
    'regular_bullish',
    'regular_bearish',
    'hidden_bullish',
    'hidden_bearish',
  ]),
  oscillator: z.enum(['rsi', 'macd']),
  tf: z.string(),
  priceFrom: z.object({ t: z.string(), price: z.number() }),
  priceTo: z.object({ t: z.string(), price: z.number() }),
  oscFrom: z.number(),
  oscTo: z.number(),
  note: z.string().nullable().optional(),
});

const SourceSchema = z.object({
  title: z.string(),
  url: z.string(),
});

const DcaSignalSchema = z
  .object({
    percentileInMonth: z.number(),
    pctVs20dAvg: NullableNumber.optional(),
    pctFromHigh: NullableNumber.optional(),
    rsi14: NullableNumber.optional(),
    zone: z.enum(['very-cheap', 'cheap', 'fair', 'rich']),
    note: z.string().nullable().optional(),
  })
  .passthrough();

const IndexBiasSchema = z
  .object({
    ticker: z.string(),
    level: z.string().nullable().optional(),
    price: NullableNumber.optional(),
    changePct: NullableNumber.optional(),
    bias: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    dcaSignal: DcaSignalSchema.nullable().optional(),
    source: SourceSchema.optional(),
  })
  .passthrough();

const StockWatchItemSchema = z
  .object({
    ticker: z.string(),
    company: z.string().nullable().optional(),
    whyNow: z.string().nullable().optional(),
    keyStat: z.string().nullable().optional(),
    valuation: z.string().nullable().optional(),
    analystView: z.string().nullable().optional(),
    stance: z.string().nullable().optional(),
    risk: z.string().nullable().optional(),
    source: SourceSchema.optional(),
  })
  .passthrough();

/** Macro scalar that may be a bare number or `{ value, … }`. */
const MacroScalarSchema = z
  .union([
    z.number(),
    z
      .object({
        value: z.number(),
        changePct: NullableNumber.optional(),
        note: z.string().nullable().optional(),
      })
      .passthrough(),
  ])
  .nullable();

export const ReportSchema = z
  .object({
    schemaVersion: z.string(),
    id: z.string(),
    date: z.string(),
    session: SessionSchema,
    generatedAt: z.string(),
    asset: z.string().default('BTC-USDT'),

    overallBias: BiasSchema,
    biasTilt: BiasSchema.or(z.string()).nullable().optional(),
    confidence: NullableNumber.optional(),

    priceSnapshot: z
      .object({
        value: z.number(),
        currency: z.string().default('USD'),
        changePct: NullableNumber.optional(),
        source: z.string().nullable().optional(),
        asOf: z.string().nullable().optional(),
        note: z.string().nullable().optional(),
        sessionRange: z
          .object({ low: NullableNumber, high: NullableNumber })
          .nullable()
          .optional(),
      })
      .passthrough(),

    decisionBox: z
      .object({
        position: PositionSchema,
        reduceIf: TriggerSchema.nullable().optional(),
        addIf: TriggerSchema.nullable().optional(),
        invalidatesAt: NullableNumber.optional(),
        stopOrder: StopOrderSchema.nullable().optional(),
        changed: z.string().nullable().optional(),
      })
      .passthrough(),

    overnightRisk: z.string().nullable().optional(),

    probabilities: z.object({
      bullish: z.number(),
      range: z.number(),
      bearish: z.number(),
    }),

    levels: z.object({
      support: z.array(z.number()).default([]),
      resistance: z.array(z.number()).default([]),
      liquidation: z.array(LiquidationLevelSchema).default([]),
      liquidityMagnet: LiquidityMagnetSchema.nullable().optional(),
    }),

    atr: z
      .object({
        value: NullableNumber,
        period: z.number().optional(),
        pct: NullableNumber.optional(),
        source: z.string().nullable().optional(),
        asOf: z.string().nullable().optional(),
        note: z.string().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),

    timeframes: z.array(TimeframeSchema).default([]),
    operations: z.array(OperationSchema).default([]),
    scalpContext: ScalpContextSchema.nullable().optional(),

    macro: z
      .object({
        brent: MacroScalarSchema.optional(),
        dxy: MacroScalarSchema.optional(),
        us10y: MacroScalarSchema.optional(),
        etfFlows: z
          .object({
            streakDays: z.number().optional(),
            note: z.string().nullable().optional(),
          })
          .passthrough()
          .nullable()
          .optional(),
        liquidations: z
          .object({
            longsUsd: NullableNumber.optional(),
            shortsUsd: NullableNumber.optional(),
            totalUsd: NullableNumber.optional(),
            skew: NullableNumber.optional(),
            traders: NullableNumber.optional(),
            openInterestUsd: NullableNumber.optional(),
            note: z.string().nullable().optional(),
          })
          .passthrough()
          .nullable()
          .optional(),
        fearGreed: NullableNumber.optional(),
        earnings: z
          .array(
            z
              .object({
                ticker: z.string(),
                reaction: z.string().nullable().optional(),
                note: z.string().nullable().optional(),
              })
              .passthrough(),
          )
          .optional(),
      })
      .passthrough()
      .optional(),

    nonCrypto: z
      .object({
        indices: z.array(IndexBiasSchema).default([]),
        stockWatchlist: z.array(StockWatchItemSchema).default([]),
      })
      .passthrough()
      .optional(),

    // Resilient: a malformed/free-text `divergences` (e.g. a report that wrote
    // prose instead of the structured shape) falls back to [] instead of
    // failing the whole report's validation and blanking the session.
    divergences: z.array(DivergenceSchema).catch([]).default([]),

    calibration: z
      .object({
        priorReduceFired: z.boolean().nullable().optional(),
        actingHelped: z.boolean().nullable().optional(),
        rollingRecord: z.string().nullable().optional(),
        note: z.string().nullable().optional(),
      })
      .passthrough()
      .optional(),

    sources: z.array(SourceSchema).default([]),
  })
  .passthrough();

export type Report = z.infer<typeof ReportSchema>;

export const ManifestDaySchema = z.object({
  date: z.string(),
  sessions: z.object({
    midnight: z.string().nullable().optional(),
    morning: z.string().nullable(),
    midday: z.string().nullable(),
    endday: z.string().nullable(),
  }),
});

export const ManifestSchema = z.object({
  schemaVersion: z.string(),
  updatedAt: z.string(),
  latest: z.string(),
  days: z.array(ManifestDaySchema),
});

export type Manifest = z.infer<typeof ManifestSchema>;
export type ManifestDay = z.infer<typeof ManifestDaySchema>;

export const CalibrationRowSchema = z
  .object({
    date: z.string(),
    session: SessionSchema,
    bias: BiasLabelSchema,
    bull_pct: z.number(),
    range_pct: z.number(),
    bear_pct: z.number(),
    reduce_level: NullableNumber,
    reduce_fired: z.boolean().nullable(),
    add_level: NullableNumber,
    add_fired: z.boolean().nullable(),
    price_at_report: NullableNumber,
    price_next_report: NullableNumber,
    acting_helped: z.union([z.boolean(), z.string()]).nullable(),
  })
  .passthrough();

export const CalibrationSchema = z.array(CalibrationRowSchema);
export type CalibrationRow = z.infer<typeof CalibrationRowSchema>;

export type Candle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio game — the 4 sessions relay ONE paper wallet (100 USDT), spot + shorts
// /leverage allowed. Each run marks the inherited position to market, applies its
// decision, and appends a snapshot. `scoreboard` ranks each session's contribution.
// ─────────────────────────────────────────────────────────────────────────────

export const PortfolioSideSchema = z.enum(['flat', 'long', 'short']);
export type PortfolioSide = z.infer<typeof PortfolioSideSchema>;

export const PortfolioActionSchema = z.enum([
  'INIT',
  'HOLD',
  'OPEN_LONG',
  'OPEN_SHORT',
  'ADD',
  'REDUCE',
  'CLOSE',
  'FLIP',
  'STOPPED_OUT',
  'LIQUIDATED',
  'SKIP',
  'EXPENSE',
  'BANKRUPTCY',
  'RESET',
]);
export type PortfolioAction = z.infer<typeof PortfolioActionSchema>;

const PortfolioPositionSchema = z
  .object({
    side: PortfolioSideSchema,
    /** Notional exposure marked to market (USD). 0 when flat. */
    sizeUsd: z.number().default(0),
    /** Signed coin quantity (+long / −short); null when flat. */
    btc: NullableNumber.optional(),
    /** 1 = spot, >1 = leveraged. */
    leverage: z.number().default(1),
    entryPrice: NullableNumber,
    stopPrice: NullableNumber.optional(),
    liquidationPrice: NullableNumber.optional(),
    takeProfit: z.array(z.number()).default([]),
  })
  .passthrough();

/** SPOT book — BTC held outright (long-only, no liquidation). The gifted core lives here. */
const PortfolioSpotSchema = z
  .object({
    btc: z.number().default(0),
    avgEntry: NullableNumber.optional(),
    costBasisUsd: z.number().default(0),
    valueUsd: z.number().default(0),
    lots: z
      .array(
        z
          .object({
            btc: z.number(),
            entryPrice: z.number(),
            costUsd: NullableNumber.optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

/** FUTURES book — perp position (long/short, leverage, liquidation), margined by cash. */
const PortfolioFuturesSchema = z
  .object({
    side: PortfolioSideSchema.default('flat'),
    sizeUsd: z.number().default(0),
    btc: NullableNumber.optional(),
    leverage: z.number().default(1),
    entryPrice: NullableNumber,
    marginUsd: z.number().default(0),
    stopPrice: NullableNumber.optional(),
    liquidationPrice: NullableNumber.optional(),
    takeProfit: z.array(z.number()).default([]),
    unrealizedPnlUsd: z.number().default(0),
  })
  .passthrough();

export const PortfolioSnapshotSchema = z
  .object({
    ts: z.string(),
    session: SessionSchema,
    reportId: z.string().nullable().optional(),
    /** Verified spot used to mark the wallet this run. */
    markPrice: z.number(),
    action: PortfolioActionSchema.or(z.string()),
    // Legacy single-position (kept optional for back-compat).
    position: PortfolioPositionSchema.optional(),
    spot: PortfolioSpotSchema.optional(),
    futures: PortfolioFuturesSchema.optional(),
    /** Free collateral not committed to the open position. */
    cashUsd: z.number(),
    /** Cumulative realized PnL since inception. */
    realizedPnlUsd: z.number().default(0),
    /** Mark-to-market PnL of the open position. */
    unrealizedPnlUsd: z.number().default(0),
    /** Total account value = cash + margin + unrealized (trading + free cash). */
    equityUsd: z.number(),
    /** Untouchable savings bucket (not tradeable). Pays expenses first. */
    savingsUsd: z.number().default(0).optional(),
    /** Amount swept into savings this snapshot (20% of realized gains). */
    sweptToSavingsUsd: NullableNumber.optional(),
    /** Consecutive skipped sessions ending at this snapshot (max 2 allowed). */
    consecutiveSkips: z.number().default(0).optional(),
    /** Net worth = equity + savings. */
    netWorthUsd: NullableNumber.optional(),
    rationale: z.string().nullable().optional(),
  })
  .passthrough();
export type PortfolioSnapshot = z.infer<typeof PortfolioSnapshotSchema>;

export const SessionScoreSchema = z
  .object({
    session: SessionSchema,
    decisions: z.number().default(0),
    /** Equity change (USD) attributed to this session's decisions. */
    attributedPnlUsd: z.number().default(0),
    wins: z.number().default(0),
    losses: z.number().default(0),
    /** This session's monthly cost-of-living quota (30 / 4 = 7.5 USD). */
    quotaUsd: z.number().default(7.5).optional(),
    /** How much of its cumulative quota this session has covered via attributed PnL. */
    quotaCoveredUsd: z.number().default(0).optional(),
    /** Times this session chose not to trade. */
    skips: z.number().default(0).optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();
export type SessionScore = z.infer<typeof SessionScoreSchema>;

/** Cost-of-living: 30 USDT/month, charged on the 1st, first month is grace. */
export const PortfolioExpensesSchema = z
  .object({
    monthlyUsd: z.number().default(30),
    cadence: z.string().default('monthly'),
    perSessionQuotaUsd: z.number().default(7.5),
    /** No charge on/before this date (first-month grace). */
    graceUntil: z.string().nullable().optional(),
    nextChargeAt: z.string().nullable().optional(),
    lastChargeAt: z.string().nullable().optional(),
    totalPaidUsd: z.number().default(0),
    note: z.string().nullable().optional(),
  })
  .passthrough();
export type PortfolioExpenses = z.infer<typeof PortfolioExpensesSchema>;

/** A bankruptcy post-mortem — the "hall of shame" the game learns from. */
export const HallOfShameEntrySchema = z
  .object({
    ts: z.string(),
    round: z.number(),
    session: SessionSchema.nullable().optional(),
    equityBefore: NullableNumber.optional(),
    shortfallUsd: NullableNumber.optional(),
    reason: z.string(),
    lesson: z.string(),
  })
  .passthrough();
export type HallOfShameEntry = z.infer<typeof HallOfShameEntrySchema>;

/** A learned pattern that feeds the next round (and later the skill). */
export const PortfolioLessonSchema = z
  .object({
    ts: z.string(),
    session: SessionSchema.nullable().optional(),
    pattern: z.string(),
    insight: z.string(),
  })
  .passthrough();
export type PortfolioLesson = z.infer<typeof PortfolioLessonSchema>;

/** A note one session leaves for the next (the relay hand-off channel). */
export const PortfolioMessageSchema = z
  .object({
    ts: z.string(),
    from: SessionSchema,
    to: SessionSchema.or(z.literal('all')).nullable().optional(),
    text: z.string(),
  })
  .passthrough();
export type PortfolioMessage = z.infer<typeof PortfolioMessageSchema>;

export const PortfolioSchema = z
  .object({
    schemaVersion: z.string(),
    baseCurrency: z.string().default('USDT'),
    initialCapitalUsd: z.number().default(100),
    startedAt: z.string(),
    updatedAt: z.string(),
    /** Untouchable savings bucket in USD. */
    savingsUsd: z.number().default(0),
    /** Game round; increments on each bankruptcy reset. */
    round: z.number().default(1),
    /** Number of bankruptcies so far. */
    bankruptcies: z.number().default(0),
    expenses: PortfolioExpensesSchema.nullable().optional(),
    /** Current wallet state (the newest snapshot). */
    latest: PortfolioSnapshotSchema.nullable(),
    history: z.array(PortfolioSnapshotSchema).default([]),
    scoreboard: z.array(SessionScoreSchema).default([]),
    /** Bankruptcy post-mortems — why the wallet blew up, and the lesson. */
    hallOfShame: z.array(HallOfShameEntrySchema).default([]),
    /** Accumulated learned patterns that improve the next round. */
    lessons: z.array(PortfolioLessonSchema).default([]),
    /** Hand-off notes between sessions (keep the most recent ~20). */
    messages: z.array(PortfolioMessageSchema).default([]),
  })
  .passthrough();
export type Portfolio = z.infer<typeof PortfolioSchema>;
