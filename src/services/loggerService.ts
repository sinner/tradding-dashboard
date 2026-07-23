type Level = 'debug' | 'info' | 'warn' | 'error';

const enabled = import.meta.env.DEV || import.meta.env.VITE_LOG === 'on';

const emit = (level: Level, scope: string, message: string, data?: unknown): void => {
  if (level === 'debug' && !enabled) return;
  const tag = `[${new Date().toISOString()}] ${level.toUpperCase()} (${scope})`;
  const fn = level === 'debug' ? console.log : console[level];
  if (data === undefined) {
    fn(`${tag} ${message}`);
    return;
  }
  fn(`${tag} ${message}`, data);
};

export const logger = {
  debug: (scope: string, message: string, data?: unknown): void =>
    emit('debug', scope, message, data),
  info: (scope: string, message: string, data?: unknown): void =>
    emit('info', scope, message, data),
  warn: (scope: string, message: string, data?: unknown): void =>
    emit('warn', scope, message, data),
  error: (scope: string, message: string, data?: unknown): void =>
    emit('error', scope, message, data),
};
