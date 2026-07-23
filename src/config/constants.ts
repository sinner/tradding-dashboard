export const ROUTES = {
  dashboard: '/',
  history: '/history',
  day: '/day/:date',
  markets: '/markets',
  studies: '/studies',
  studiesDay: '/studies/:date',
  calibration: '/calibration',
  report: '/report/:id',
} as const;

export const routeDay = (date: string): string => `/day/${date}`;
export const routeStudies = (date?: string): string =>
  date ? `/studies/${date}` : '/studies';
export const routeReport = (id: string): string => `/report/${id}`;

export const BINANCE = {
  baseUrl: 'https://api.binance.com/api/v3',
  symbol: 'BTCUSDT',
  pricePollMs: 30_000,
  klinesLimit: 500,
} as const;

export const QUERY_KEYS = {
  manifest: ['manifest'] as const,
  report: (id: string) => ['report', id] as const,
  reportPath: (path: string) => ['reportPath', path] as const,
  calibration: ['calibration'] as const,
  livePrice: (symbol: string) => ['livePrice', symbol] as const,
  klines: (symbol: string, interval: string, start?: number, end?: number) =>
    ['klines', symbol, interval, start ?? null, end ?? null] as const,
  markdown: (path: string) => ['markdown', path] as const,
} as const;

export const KLINE_INTERVALS = ['15m', '1h', '4h', '1d'] as const;
export type KlineInterval = (typeof KLINE_INTERVALS)[number];

/** Resolve a data path relative to Vite `base` (GitHub Pages subpath). */
export const dataUrl = (path: string): string => {
  const cleaned = path.replace(/^\//, '');
  const base = import.meta.env.BASE_URL;
  return `${base}${cleaned}`;
};
