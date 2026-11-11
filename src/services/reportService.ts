import { dataUrl } from '@/config/constants';
import {
  CalibrationMonthlySchema,
  CalibrationSchema,
  PortfolioSchema,
  ReportSchema,
  type CalibrationMonthly,
  type CalibrationRow,
  type Portfolio,
  type Report,
} from '@/lib/types';
import { logger } from '@/services/loggerService';

export async function fetchReportByPath(path: string): Promise<Report> {
  const url = dataUrl(path);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    logger.error('report', `failed to load (${res.status})`, { path });
    throw new Error(`Failed to load report: ${path}`);
  }
  const json: unknown = await res.json();
  const parsed = ReportSchema.safeParse(json);
  if (!parsed.success) {
    logger.error('report', 'schema validation failed', {
      path,
      issues: parsed.error.issues,
    });
    throw new Error(`Invalid report JSON: ${path}`);
  }
  logger.info('report', 'loaded', { id: parsed.data.id });
  return parsed.data;
}

export async function fetchCalibration(): Promise<CalibrationRow[]> {
  const url = dataUrl('data/calibration.json');
  const res = await fetch(url);
  if (!res.ok) {
    logger.warn('calibration', `not available (${res.status})`);
    return [];
  }
  const json: unknown = await res.json();
  const parsed = CalibrationSchema.safeParse(json);
  if (!parsed.success) {
    logger.error('calibration', 'schema validation failed', parsed.error.issues);
    throw new Error('Invalid calibration.json');
  }
  return parsed.data;
}

/** Monthly summaries of compacted calibration months (missing file → empty). */
export async function fetchCalibrationMonthly(): Promise<CalibrationMonthly> {
  const res = await fetch(dataUrl('data/calibration-monthly.json'));
  if (!res.ok) return { schemaVersion: '1.0.0', months: [] };
  const parsed = CalibrationMonthlySchema.safeParse(await res.json());
  if (!parsed.success) {
    logger.error('calibration', 'monthly schema validation failed', parsed.error.issues);
    throw new Error('Invalid calibration-monthly.json');
  }
  return parsed.data;
}

/** Full rows of one archived month, loaded on demand. */
export async function fetchCalibrationArchive(month: string): Promise<CalibrationRow[]> {
  const res = await fetch(dataUrl(`data/calibration/archive/${month}.json`));
  if (!res.ok) throw new Error(`Archive ${month} not available (${res.status})`);
  const parsed = CalibrationSchema.safeParse(await res.json());
  if (!parsed.success) throw new Error(`Invalid calibration archive ${month}`);
  return parsed.data;
}

export async function fetchPortfolio(): Promise<Portfolio | null> {
  const url = dataUrl('data/portfolio.json');
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    logger.warn('portfolio', `not available (${res.status})`);
    return null;
  }
  const json: unknown = await res.json();
  const parsed = PortfolioSchema.safeParse(json);
  if (!parsed.success) {
    logger.error('portfolio', 'schema validation failed', parsed.error.issues);
    return null;
  }
  return parsed.data;
}

function looksLikeHtml(text: string, contentType: string | null): boolean {
  const type = (contentType ?? '').toLowerCase();
  if (type.includes('text/html')) return true;
  const head = text.trimStart().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html');
}

export async function fetchReportMarkdown(path: string): Promise<string> {
  const url = dataUrl(path);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load markdown: ${path}`);
  }
  const text = await res.text();
  // Vite SPA fallback serves index.html (200) for missing static files.
  if (!text.trim() || looksLikeHtml(text, res.headers.get('content-type'))) {
    throw new Error(`Markdown missing: ${path}`);
  }
  return text;
}

/** Derive markdown path from a report id like `2026-07-22-midday`. */
export function markdownPathFromId(id: string): string {
  const [year, month] = id.split('-');
  return `data/reports/${year}/${month}/${id}.md`;
}

export const reportService = {
  fetchReportByPath,
  fetchCalibration,
  fetchCalibrationMonthly,
  fetchCalibrationArchive,
  fetchPortfolio,
  fetchReportMarkdown,
  markdownPathFromId,
};
