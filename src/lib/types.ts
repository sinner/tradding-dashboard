import { z } from 'zod';

export const SessionSchema = z.enum(['morning', 'midday', 'endday']);
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
  confirmation: z.string().optional(),
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
    source: z.string().optional(),
    asOf: z.string().nullable().optional(),
    note: z.string().optional(),
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
    hold: z.string().optional(),
    note: z.string().optional(),
  })
  .passthrough();

const ScalpContextSchema = z
  .object({
    intradayBias: z.string().optional(),
    longAbove: NullableNumber.optional(),
    shortBelow: NullableNumber.optional(),
    invalidates: NullableNumber.optional(),
    note: z.string().optional(),
  })
  .passthrough();

const LiquidationLevelSchema = z.object({
  price: z.number(),
  note: z.string().optional(),
});

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
  note: z.string().optional(),
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
    note: z.string().optional(),
  })
  .passthrough();

const IndexBiasSchema = z
  .object({
    ticker: z.string(),
    level: z.string().optional(),
    price: NullableNumber.optional(),
    changePct: NullableNumber.optional(),
    bias: z.string().optional(),
    note: z.string().optional(),
    dcaSignal: DcaSignalSchema.nullable().optional(),
    source: SourceSchema.optional(),
  })
  .passthrough();

const StockWatchItemSchema = z
  .object({
    ticker: z.string(),
    company: z.string().optional(),
    whyNow: z.string().optional(),
    keyStat: z.string().optional(),
    valuation: z.string().optional(),
    analystView: z.string().optional(),
    stance: z.string().optional(),
    risk: z.string().optional(),
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
        note: z.string().optional(),
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
    biasTilt: BiasSchema.or(z.string()).optional(),
    confidence: NullableNumber.optional(),

    priceSnapshot: z
      .object({
        value: z.number(),
        currency: z.string().default('USD'),
        changePct: NullableNumber.optional(),
        source: z.string().optional(),
        asOf: z.string().optional(),
        note: z.string().optional(),
        sessionRange: z
          .object({ low: z.number(), high: z.number() })
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

    overnightRisk: z.string().optional(),

    probabilities: z.object({
      bullish: z.number(),
      range: z.number(),
      bearish: z.number(),
    }),

    levels: z.object({
      support: z.array(z.number()).default([]),
      resistance: z.array(z.number()).default([]),
      liquidation: z.array(LiquidationLevelSchema).default([]),
    }),

    atr: z
      .object({
        value: NullableNumber,
        period: z.number().optional(),
        pct: NullableNumber.optional(),
        source: z.string().optional(),
        asOf: z.string().optional(),
        note: z.string().optional(),
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
            note: z.string().optional(),
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
            note: z.string().optional(),
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
                reaction: z.string().optional(),
                note: z.string().optional(),
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

    divergences: z.array(DivergenceSchema).default([]),

    calibration: z
      .object({
        priorReduceFired: z.boolean().nullable().optional(),
        actingHelped: z.boolean().nullable().optional(),
        rollingRecord: z.string().nullable().optional(),
        note: z.string().optional(),
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
