import { dataUrl } from '@/config/constants';
import { ManifestSchema, type Manifest } from '@/lib/types';
import { logger } from '@/services/loggerService';

export async function fetchManifest(): Promise<Manifest> {
  const url = dataUrl('data/manifest.json');
  const res = await fetch(url);
  if (!res.ok) {
    logger.error('manifest', `failed to load (${res.status})`, { url });
    throw new Error(`Failed to load manifest: ${res.status}`);
  }
  const json: unknown = await res.json();
  const parsed = ManifestSchema.safeParse(json);
  if (!parsed.success) {
    logger.error('manifest', 'schema validation failed', parsed.error.flatten());
    throw new Error('Invalid manifest.json');
  }
  logger.info('manifest', 'loaded', {
    latest: parsed.data.latest,
    days: parsed.data.days.length,
  });
  return parsed.data;
}

export const manifestService = { fetchManifest };
