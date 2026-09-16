"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioSchema = exports.PortfolioMessageSchema = exports.PortfolioLessonSchema = exports.HallOfShameEntrySchema = exports.PortfolioExpensesSchema = exports.SessionScoreSchema = exports.PortfolioSnapshotSchema = exports.PortfolioActionSchema = exports.PortfolioSideSchema = exports.CalibrationSchema = exports.CalibrationRowSchema = exports.ManifestSchema = exports.ManifestDaySchema = exports.ReportSchema = exports.PositionSchema = exports.BiasLabelSchema = exports.BiasSchema = exports.SessionSchema = void 0;
const zod_1 = require("zod");
exports.SessionSchema = zod_1.z.enum(['midnight', 'morning', 'midday', 'endday']);
exports.BiasSchema = zod_1.z.enum(['bullish', 'range', 'bearish']);
/** Free-form bias labels used in calibration rows (e.g. "range-bear"). */
exports.BiasLabelSchema = zod_1.z.string().min(1);
exports.PositionSchema = zod_1.z.enum(['HOLD', 'REDUCE', 'ADD', 'TAKE_PROFIT', 'EXIT']);
const NullableNumber = zod_1.z.number().nullable();
const TriggerSchema = zod_1.z.object({
    price: zod_1.z.number(),
    confirmation: zod_1.z.string().nullable().optional(),
});
const StopOrderSchema = zod_1.z.object({
    recommended: zod_1.z.boolean(),
    price: zod_1.z.number(),
});
const MacdSchema = zod_1.z.object({
    line: NullableNumber,
    signal: NullableNumber,
    hist: NullableNumber,
});
const EmasSchema = zod_1.z.object({
    ema20: NullableNumber,
    ema50: NullableNumber,
    ema100: NullableNumber.optional(),
    ema200: NullableNumber,
});
const TimeframeSchema = zod_1.z
    .object({
    tf: zod_1.z.string(),
    rsi: NullableNumber.optional(),
    macd: MacdSchema.optional(),
    emas: EmasSchema.optional(),
    structure: zod_1.z.string().nullable().optional(),
    bias: zod_1.z.string().nullable().optional(),
    source: zod_1.z.string().nullable().optional(),
    asOf: zod_1.z.string().nullable().optional(),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
const OperationSchema = zod_1.z
    .object({
    horizon: zod_1.z.string(),
    market: zod_1.z.string(),
    action: zod_1.z.string(),
    entry: zod_1.z.array(zod_1.z.number()).nullable().optional(),
    stop: zod_1.z.number().nullable().optional(),
    tp: zod_1.z.array(zod_1.z.number()).optional(),
    rr: zod_1.z.number().nullable().optional(),
    confidence: zod_1.z.number().nullable().optional(),
    hold: zod_1.z.string().nullable().optional(),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
const ScalpContextSchema = zod_1.z
    .object({
    intradayBias: zod_1.z.string().nullable().optional(),
    longAbove: NullableNumber.optional(),
    shortBelow: NullableNumber.optional(),
    invalidates: NullableNumber.optional(),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
const LiquidationLevelSchema = zod_1.z
    .object({
    price: zod_1.z.number(),
    // Where the cluster sits relative to spot when the report was written.
    side: zod_1.z.enum(['above', 'below']).nullable().optional(),
    // Relative size of the liquidity pool on the CoinGlass heatmap.
    intensity: zod_1.z.enum(['low', 'medium', 'high', 'extreme']).nullable().optional(),
    // True when this pool is the dominant magnet price is likely drawn toward.
    magnet: zod_1.z.boolean().nullable().optional(),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
/** Actionable summary of the liquidation heatmap — the nearest magnets and the pull. */
const LiquidityMagnetSchema = zod_1.z
    .object({
    nearestAbove: NullableNumber.optional(),
    nearestBelow: NullableNumber.optional(),
    // Which way the dominant pool tends to pull price next.
    pull: zod_1.z.enum(['up', 'down', 'balanced']).nullable().optional(),
    source: zod_1.z.string().nullable().optional(),
    asOf: zod_1.z.string().nullable().optional(),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
const DivergenceSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'regular_bullish',
        'regular_bearish',
        'hidden_bullish',
        'hidden_bearish',
    ]),
    oscillator: zod_1.z.enum(['rsi', 'macd']),
    tf: zod_1.z.string(),
    priceFrom: zod_1.z.object({ t: zod_1.z.string(), price: zod_1.z.number() }),
    priceTo: zod_1.z.object({ t: zod_1.z.string(), price: zod_1.z.number() }),
    oscFrom: zod_1.z.number(),
    oscTo: zod_1.z.number(),
    note: zod_1.z.string().nullable().optional(),
});
const SourceSchema = zod_1.z.object({
    title: zod_1.z.string(),
    url: zod_1.z.string(),
});
const DcaSignalSchema = zod_1.z
    .object({
    percentileInMonth: zod_1.z.number(),
    pctVs20dAvg: NullableNumber.optional(),
    pctFromHigh: NullableNumber.optional(),
    rsi14: NullableNumber.optional(),
    zone: zod_1.z.enum(['very-cheap', 'cheap', 'fair', 'rich']),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
const IndexBiasSchema = zod_1.z
    .object({
    ticker: zod_1.z.string(),
    level: zod_1.z.string().nullable().optional(),
    price: NullableNumber.optional(),
    changePct: NullableNumber.optional(),
    bias: zod_1.z.string().nullable().optional(),
    note: zod_1.z.string().nullable().optional(),
    dcaSignal: DcaSignalSchema.nullable().optional(),
    source: SourceSchema.optional(),
})
    .passthrough();
const StockWatchItemSchema = zod_1.z
    .object({
    ticker: zod_1.z.string(),
    company: zod_1.z.string().nullable().optional(),
    whyNow: zod_1.z.string().nullable().optional(),
    keyStat: zod_1.z.string().nullable().optional(),
    valuation: zod_1.z.string().nullable().optional(),
    analystView: zod_1.z.string().nullable().optional(),
    stance: zod_1.z.string().nullable().optional(),
    risk: zod_1.z.string().nullable().optional(),
    source: SourceSchema.optional(),
})
    .passthrough();
/** Macro scalar that may be a bare number or `{ value, … }`. */
const MacroScalarSchema = zod_1.z
    .union([
    zod_1.z.number(),
    zod_1.z
        .object({
        value: zod_1.z.number(),
        changePct: NullableNumber.optional(),
        note: zod_1.z.string().nullable().optional(),
    })
        .passthrough(),
])
    .nullable();
exports.ReportSchema = zod_1.z
    .object({
    schemaVersion: zod_1.z.string(),
    id: zod_1.z.string(),
    date: zod_1.z.string(),
    session: exports.SessionSchema,
    generatedAt: zod_1.z.string(),
    asset: zod_1.z.string().default('BTC-USDT'),
    overallBias: exports.BiasSchema,
    biasTilt: exports.BiasSchema.or(zod_1.z.string()).nullable().optional(),
    confidence: NullableNumber.optional(),
    priceSnapshot: zod_1.z
        .object({
        value: zod_1.z.number(),
        currency: zod_1.z.string().default('USD'),
        changePct: NullableNumber.optional(),
        source: zod_1.z.string().nullable().optional(),
        asOf: zod_1.z.string().nullable().optional(),
        note: zod_1.z.string().nullable().optional(),
        sessionRange: zod_1.z
            .object({ low: NullableNumber, high: NullableNumber })
            .nullable()
            .optional(),
    })
        .passthrough(),
    decisionBox: zod_1.z
        .object({
        position: exports.PositionSchema,
        reduceIf: TriggerSchema.nullable().optional(),
        addIf: TriggerSchema.nullable().optional(),
        invalidatesAt: NullableNumber.optional(),
        stopOrder: StopOrderSchema.nullable().optional(),
        changed: zod_1.z.string().nullable().optional(),
    })
        .passthrough(),
    overnightRisk: zod_1.z.string().nullable().optional(),
    probabilities: zod_1.z.object({
        bullish: zod_1.z.number(),
        range: zod_1.z.number(),
        bearish: zod_1.z.number(),
    }),
    levels: zod_1.z.object({
        support: zod_1.z.array(zod_1.z.number()).default([]),
        resistance: zod_1.z.array(zod_1.z.number()).default([]),
        liquidation: zod_1.z.array(LiquidationLevelSchema).default([]),
        liquidityMagnet: LiquidityMagnetSchema.nullable().optional(),
    }),
    atr: zod_1.z
        .object({
        value: NullableNumber,
        period: zod_1.z.number().optional(),
        pct: NullableNumber.optional(),
        source: zod_1.z.string().nullable().optional(),
        asOf: zod_1.z.string().nullable().optional(),
        note: zod_1.z.string().nullable().optional(),
    })
        .passthrough()
        .nullable()
        .optional(),
    timeframes: zod_1.z.array(TimeframeSchema).default([]),
    operations: zod_1.z.array(OperationSchema).default([]),
    scalpContext: ScalpContextSchema.nullable().optional(),
    macro: zod_1.z
        .object({
        brent: MacroScalarSchema.optional(),
        dxy: MacroScalarSchema.optional(),
        us10y: MacroScalarSchema.optional(),
        etfFlows: zod_1.z
            .object({
            streakDays: zod_1.z.number().optional(),
            note: zod_1.z.string().nullable().optional(),
        })
            .passthrough()
            .nullable()
            .optional(),
        liquidations: zod_1.z
            .object({
            longsUsd: NullableNumber.optional(),
            shortsUsd: NullableNumber.optional(),
            totalUsd: NullableNumber.optional(),
            skew: NullableNumber.optional(),
            traders: NullableNumber.optional(),
            openInterestUsd: NullableNumber.optional(),
            note: zod_1.z.string().nullable().optional(),
        })
            .passthrough()
            .nullable()
            .optional(),
        fearGreed: NullableNumber.optional(),
        earnings: zod_1.z
            .array(zod_1.z
            .object({
            ticker: zod_1.z.string(),
            reaction: zod_1.z.string().nullable().optional(),
            note: zod_1.z.string().nullable().optional(),
        })
            .passthrough())
            .optional(),
    })
        .passthrough()
        .optional(),
    nonCrypto: zod_1.z
        .object({
        indices: zod_1.z.array(IndexBiasSchema).default([]),
        stockWatchlist: zod_1.z.array(StockWatchItemSchema).default([]),
    })
        .passthrough()
        .optional(),
    // Resilient: a malformed/free-text `divergences` (e.g. a report that wrote
    // prose instead of the structured shape) falls back to [] instead of
    // failing the whole report's validation and blanking the session.
    divergences: zod_1.z.array(DivergenceSchema).catch([]).default([]),
    calibration: zod_1.z
        .object({
        priorReduceFired: zod_1.z.boolean().nullable().optional(),
        actingHelped: zod_1.z.boolean().nullable().optional(),
        rollingRecord: zod_1.z.string().nullable().optional(),
        note: zod_1.z.string().nullable().optional(),
    })
        .passthrough()
        .optional(),
    sources: zod_1.z.array(SourceSchema).default([]),
})
    .passthrough();
// Session pointers are resilient: a missing key is treated as `null` (session
// not run yet) instead of failing validation. This keeps one partially-written
// day from blanking the entire dashboard. Every key resolves to `string | null`.
exports.ManifestDaySchema = zod_1.z.object({
    date: zod_1.z.string(),
    sessions: zod_1.z
        .object({
        midnight: zod_1.z.string().nullable().default(null),
        morning: zod_1.z.string().nullable().default(null),
        midday: zod_1.z.string().nullable().default(null),
        endday: zod_1.z.string().nullable().default(null),
    })
        .default({ midnight: null, morning: null, midday: null, endday: null }),
});
exports.ManifestSchema = zod_1.z.object({
    schemaVersion: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    latest: zod_1.z.string(),
    days: zod_1.z.array(exports.ManifestDaySchema),
});
exports.CalibrationRowSchema = zod_1.z
    .object({
    date: zod_1.z.string(),
    session: exports.SessionSchema,
    bias: exports.BiasLabelSchema,
    bull_pct: zod_1.z.number(),
    range_pct: zod_1.z.number(),
    bear_pct: zod_1.z.number(),
    reduce_level: NullableNumber,
    reduce_fired: zod_1.z.boolean().nullable(),
    add_level: NullableNumber,
    add_fired: zod_1.z.boolean().nullable(),
    price_at_report: NullableNumber,
    price_next_report: NullableNumber,
    acting_helped: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]).nullable(),
})
    .passthrough();
exports.CalibrationSchema = zod_1.z.array(exports.CalibrationRowSchema);
// ─────────────────────────────────────────────────────────────────────────────
// Portfolio game — the 4 sessions relay ONE paper wallet (100 USDT), spot + shorts
// /leverage allowed. Each run marks the inherited position to market, applies its
// decision, and appends a snapshot. `scoreboard` ranks each session's contribution.
// ─────────────────────────────────────────────────────────────────────────────
exports.PortfolioSideSchema = zod_1.z.enum(['flat', 'long', 'short']);
exports.PortfolioActionSchema = zod_1.z.enum([
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
    'FROZEN',
]);
const PortfolioPositionSchema = zod_1.z
    .object({
    side: exports.PortfolioSideSchema,
    /** Notional exposure marked to market (USD). 0 when flat. */
    sizeUsd: zod_1.z.number().default(0),
    /** Signed coin quantity (+long / −short); null when flat. */
    btc: NullableNumber.optional(),
    /** 1 = spot, >1 = leveraged. */
    leverage: zod_1.z.number().default(1),
    entryPrice: NullableNumber,
    stopPrice: NullableNumber.optional(),
    liquidationPrice: NullableNumber.optional(),
    takeProfit: zod_1.z.array(zod_1.z.number()).default([]),
})
    .passthrough();
/** SPOT book — BTC held outright (long-only, no liquidation). The gifted core lives here. */
const PortfolioSpotSchema = zod_1.z
    .object({
    btc: zod_1.z.number().default(0),
    avgEntry: NullableNumber.optional(),
    costBasisUsd: zod_1.z.number().default(0),
    valueUsd: zod_1.z.number().default(0),
    lots: zod_1.z
        .array(zod_1.z
        .object({
        btc: zod_1.z.number(),
        entryPrice: zod_1.z.number(),
        costUsd: NullableNumber.optional(),
    })
        .passthrough())
        .optional(),
})
    .passthrough();
/** FUTURES book — perp position (long/short, leverage, liquidation), margined by cash. */
const PortfolioFuturesSchema = zod_1.z
    .object({
    side: exports.PortfolioSideSchema.default('flat'),
    sizeUsd: zod_1.z.number().default(0),
    btc: NullableNumber.optional(),
    leverage: zod_1.z.number().default(1),
    entryPrice: NullableNumber,
    marginUsd: zod_1.z.number().default(0),
    stopPrice: NullableNumber.optional(),
    liquidationPrice: NullableNumber.optional(),
    takeProfit: zod_1.z.array(zod_1.z.number()).default([]),
    unrealizedPnlUsd: zod_1.z.number().default(0),
})
    .passthrough();
exports.PortfolioSnapshotSchema = zod_1.z
    .object({
    ts: zod_1.z.string(),
    session: exports.SessionSchema,
    reportId: zod_1.z.string().nullable().optional(),
    /** Verified spot used to mark the wallet this run. */
    markPrice: zod_1.z.number(),
    action: exports.PortfolioActionSchema.or(zod_1.z.string()),
    // Legacy single-position (kept optional for back-compat).
    position: PortfolioPositionSchema.optional(),
    spot: PortfolioSpotSchema.optional(),
    futures: PortfolioFuturesSchema.optional(),
    /** Free collateral not committed to the open position. */
    cashUsd: zod_1.z.number(),
    /** Cumulative realized PnL since inception. */
    realizedPnlUsd: zod_1.z.number().default(0),
    /** Mark-to-market PnL of the open position. */
    unrealizedPnlUsd: zod_1.z.number().default(0),
    /** Total account value = cash + margin + unrealized (trading + free cash). */
    equityUsd: zod_1.z.number(),
    /** Untouchable savings bucket (not tradeable). Pays expenses first. */
    savingsUsd: zod_1.z.number().default(0).optional(),
    /** Amount swept into savings this snapshot (20% of realized gains). */
    sweptToSavingsUsd: NullableNumber.optional(),
    /** Consecutive skipped sessions ending at this snapshot (max 2 allowed). */
    consecutiveSkips: zod_1.z.number().default(0).optional(),
    /** Net worth = equity + savings. */
    netWorthUsd: NullableNumber.optional(),
    rationale: zod_1.z.string().nullable().optional(),
    /**
     * Auto-resolved SL/TP/liquidation fills the ledger applied this snapshot,
     * BEFORE any discretionary trade — the exact exit level and side of the
     * position that closed. Empty when nothing auto-filled.
     */
    autoExits: zod_1.z
        .array(zod_1.z.object({
        reason: zod_1.z.enum(['TP', 'STOPPED_OUT', 'LIQUIDATED']).or(zod_1.z.string()),
        price: zod_1.z.number(),
        side: zod_1.z.enum(['long', 'short']).or(zod_1.z.string()).nullable().optional(),
    }))
        .default([])
        .optional(),
})
    .passthrough();
exports.SessionScoreSchema = zod_1.z
    .object({
    session: exports.SessionSchema,
    decisions: zod_1.z.number().default(0),
    /** Equity change (USD) attributed to this session's decisions. */
    attributedPnlUsd: zod_1.z.number().default(0),
    wins: zod_1.z.number().default(0),
    losses: zod_1.z.number().default(0),
    /** This session's monthly cost-of-living quota (30 / 4 = 7.5 USD). */
    quotaUsd: zod_1.z.number().default(7.5).optional(),
    /** How much of its cumulative quota this session has covered via attributed PnL. */
    quotaCoveredUsd: zod_1.z.number().default(0).optional(),
    /** Times this session chose not to trade. */
    skips: zod_1.z.number().default(0).optional(),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
/** Cost-of-living: 30 USDT/month, charged on the 1st, first month is grace. */
exports.PortfolioExpensesSchema = zod_1.z
    .object({
    monthlyUsd: zod_1.z.number().default(30),
    cadence: zod_1.z.string().default('monthly'),
    perSessionQuotaUsd: zod_1.z.number().default(7.5),
    /** No charge on/before this date (first-month grace). */
    graceUntil: zod_1.z.string().nullable().optional(),
    nextChargeAt: zod_1.z.string().nullable().optional(),
    lastChargeAt: zod_1.z.string().nullable().optional(),
    totalPaidUsd: zod_1.z.number().default(0),
    note: zod_1.z.string().nullable().optional(),
})
    .passthrough();
/** A bankruptcy post-mortem — the "hall of shame" the game learns from. */
exports.HallOfShameEntrySchema = zod_1.z
    .object({
    ts: zod_1.z.string(),
    round: zod_1.z.number(),
    session: exports.SessionSchema.nullable().optional(),
    equityBefore: NullableNumber.optional(),
    shortfallUsd: NullableNumber.optional(),
    reason: zod_1.z.string(),
    lesson: zod_1.z.string(),
})
    .passthrough();
/** A learned pattern that feeds the next round (and later the skill). */
exports.PortfolioLessonSchema = zod_1.z
    .object({
    ts: zod_1.z.string(),
    session: exports.SessionSchema.nullable().optional(),
    pattern: zod_1.z.string(),
    insight: zod_1.z.string(),
})
    .passthrough();
/** A note one session leaves for the next (the relay hand-off channel). */
exports.PortfolioMessageSchema = zod_1.z
    .object({
    ts: zod_1.z.string(),
    from: exports.SessionSchema,
    to: exports.SessionSchema.or(zod_1.z.literal('all')).nullable().optional(),
    text: zod_1.z.string(),
})
    .passthrough();
exports.PortfolioSchema = zod_1.z
    .object({
    schemaVersion: zod_1.z.string(),
    baseCurrency: zod_1.z.string().default('USDT'),
    initialCapitalUsd: zod_1.z.number().default(100),
    startedAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    /** Untouchable savings bucket in USD. */
    savingsUsd: zod_1.z.number().default(0),
    /** Game round; increments on each bankruptcy reset. */
    round: zod_1.z.number().default(1),
    /** Number of bankruptcies so far. */
    bankruptcies: zod_1.z.number().default(0),
    /** 'active' normally; 'bankrupt' freezes trading until the next midnight restart. */
    status: zod_1.z.enum(['active', 'bankrupt']).default('active').optional(),
    bankruptSince: zod_1.z.string().nullable().optional(),
    expenses: exports.PortfolioExpensesSchema.nullable().optional(),
    /** Current wallet state (the newest snapshot). */
    latest: exports.PortfolioSnapshotSchema.nullable(),
    history: zod_1.z.array(exports.PortfolioSnapshotSchema).default([]),
    scoreboard: zod_1.z.array(exports.SessionScoreSchema).default([]),
    /** Bankruptcy post-mortems — why the wallet blew up, and the lesson. */
    hallOfShame: zod_1.z.array(exports.HallOfShameEntrySchema).default([]),
    /** Accumulated learned patterns that improve the next round. */
    lessons: zod_1.z.array(exports.PortfolioLessonSchema).default([]),
    /** Hand-off notes between sessions (keep the most recent ~20). */
    messages: zod_1.z.array(exports.PortfolioMessageSchema).default([]),
})
    .passthrough();
