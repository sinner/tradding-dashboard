export const formatPrice = (value: number, decimals = 2): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

export const formatPct = (value: number, decimals = 2): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals = 2): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/** Trim a BTC amount to a readable, non-scientific string (up to 6 dp, no trailing zeros). */
export const formatBtc = (value: number): string => `${parseFloat(value.toFixed(6))}`;

export const formatCompact = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const formatDate = (iso: string): string => {
  // Date-only (YYYY-MM-DD) must not be parsed as UTC midnight — that shifts the
  // calendar day west of UTC. Use local noon for stable display.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = dateOnly ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const formatSession = (session: string): string => {
  const map: Record<string, string> = {
    midnight: 'Midnight',
    morning: 'Morning',
    midday: 'Midday',
    endday: 'End of day',
  };
  return map[session] ?? session;
};
