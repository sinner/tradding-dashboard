import { dataUrl } from '@/config/constants';
import {
  CalibrationSchema,
  ReportSchema,
  type CalibrationRow,
  type Report,
} from '@/lib/types';
import { logger } from '@/services/loggerService';

export async function fetchReportByPath(path: string): Promise<Report> {
  const url = dataUrl(path);
  const res = await fetch(url);
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
  fetchReportMarkdown,
  markdownPathFromId,
};
