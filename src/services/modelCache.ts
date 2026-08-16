import type { ModelOption } from '@/types/api';
import type { AIProvider } from '@/types/settings';

/** chrome.storage.local key holding the whole cache */
export const MODEL_CACHE_KEY = 'modelCache';

/** How long a fetched model list stays fresh */
export const MODEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface ModelCacheEntry {
  models: ModelOption[];
  fetchedAt: number;
  /** Non-reversible marker so a changed API key invalidates the entry */
  keyFingerprint: string;
}

export type ModelCache = Partial<Record<AIProvider, ModelCacheEntry>>;

/**
 * Build a short marker for an API key. Only the length and the last four
 * characters are stored, never the key itself.
 */
export function fingerprintApiKey(apiKey: string): string {
  return `${apiKey.length}:${apiKey.slice(-4)}`;
}

/**
 * True when the entry was fetched with the same key and is within the TTL.
 */
export function isFresh(
  entry: ModelCacheEntry | undefined,
  keyFingerprint: string,
  now: number = Date.now()
): boolean {
  if (!entry) return false;
  if (entry.keyFingerprint !== keyFingerprint) return false;
  if (!Array.isArray(entry.models) || entry.models.length === 0) return false;
  return now - entry.fetchedAt < MODEL_CACHE_TTL_MS;
}

/**
 * Read one provider's cached model list. Returns undefined when the entry is
 * missing or was written with a different API key (stale-by-TTL entries are
 * still returned, so callers can fall back to them when a fetch fails).
 */
export async function readCache(
  provider: AIProvider,
  keyFingerprint: string
): Promise<ModelCacheEntry | undefined> {
  const result = await chrome.storage.local.get(MODEL_CACHE_KEY);
  const cache = (result[MODEL_CACHE_KEY] || {}) as ModelCache;
  const entry = cache[provider];
  if (!entry || entry.keyFingerprint !== keyFingerprint) return undefined;
  return entry;
}

/**
 * Write one provider's model list, leaving the other providers untouched.
 */
export async function writeCache(
  provider: AIProvider,
  models: ModelOption[],
  keyFingerprint: string,
  now: number = Date.now()
): Promise<void> {
  const result = await chrome.storage.local.get(MODEL_CACHE_KEY);
  const cache = (result[MODEL_CACHE_KEY] || {}) as ModelCache;
  cache[provider] = { models, fetchedAt: now, keyFingerprint };
  await chrome.storage.local.set({ [MODEL_CACHE_KEY]: cache });
}
