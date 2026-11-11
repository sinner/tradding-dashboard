/** Scheduled agents, in relay order, with their Bogotá (COT) run time and accent colour. */
export const SESSION_ORDER = ['midnight', 'morning', 'midday', 'endday'] as const;
export type SessionKey = (typeof SESSION_ORDER)[number];

export const SESSION_META: Record<
  SessionKey,
  { schedule: string; accent: string; blurb: string }
> = {
  midnight: {
    schedule: '~02:00 COT',
    accent: '#818CF8',
    blurb:
      'First agent of the day and wallet seeder. Reads the overnight Asia/Europe tape versus yesterday’s end-day report and sets the first plan.',
  },
  morning: {
    schedule: '~06:50 COT',
    accent: '#FCD34D',
    blurb: 'Runs before the US open. Captures overnight moves and positions for the US session.',
  },
  midday: {
    schedule: '~12:40 COT',
    accent: '#2DD4BF',
    blurb: 'Updates the morning call with how the US session has actually traded and manages open trades.',
  },
  endday: {
    schedule: '~19:30 COT',
    accent: '#FB923C',
    blurb: 'Last agent of the day. Scores the day, sets overnight stops and next-session risk.',
  },
};

export function sessionMeta(session: string) {
  return SESSION_META[session as SessionKey];
}
