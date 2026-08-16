import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MODEL_CACHE_KEY,
  MODEL_CACHE_TTL_MS,
  fingerprintApiKey,
  isFresh,
  readCache,
  writeCache,
  type ModelCacheEntry,
} from '../modelCache';
import { mockChromeStorage } from '@/test/mocks/chrome';

describe('modelCache', () => {
  const apiKey = 'sk-test-key-abcd';
  const fingerprint = fingerprintApiKey(apiKey);
  const models = [{ id: 'gpt-4o', label: 'gpt-4o' }];
  const now = 1_700_000_000_000;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fingerprintApiKey', () => {
    it('should only expose the length and the last four characters', () => {
      expect(fingerprintApiKey('sk-test-key-abcd')).toBe('16:abcd');
    });

    it('should differ when the key changes', () => {
      expect(fingerprintApiKey('sk-aaaa')).not.toBe(fingerprintApiKey('sk-bbbb'));
    });
  });

  describe('isFresh', () => {
    const entry: ModelCacheEntry = { models, fetchedAt: now, keyFingerprint: fingerprint };

    it('should be false for a missing entry', () => {
      expect(isFresh(undefined, fingerprint, now)).toBe(false);
    });

    it('should be true within the TTL', () => {
      expect(isFresh(entry, fingerprint, now + MODEL_CACHE_TTL_MS - 1)).toBe(true);
    });

    it('should be false once the TTL has passed', () => {
      expect(isFresh(entry, fingerprint, now + MODEL_CACHE_TTL_MS)).toBe(false);
    });

    it('should be false when the API key changed', () => {
      expect(isFresh(entry, fingerprintApiKey('sk-other-key-wxyz'), now)).toBe(false);
    });

    it('should be false for an empty model list', () => {
      const empty: ModelCacheEntry = { ...entry, models: [] };
      expect(isFresh(empty, fingerprint, now)).toBe(false);
    });
  });

  describe('readCache', () => {
    it('should return the entry for the provider', async () => {
      mockChromeStorage.local.get.mockResolvedValueOnce({
        [MODEL_CACHE_KEY]: {
          openai: { models, fetchedAt: now, keyFingerprint: fingerprint },
        },
      });

      const entry = await readCache('openai', fingerprint);

      expect(entry?.models).toEqual(models);
    });

    it('should return undefined when nothing is cached', async () => {
      mockChromeStorage.local.get.mockResolvedValueOnce({});

      expect(await readCache('openai', fingerprint)).toBeUndefined();
    });

    it('should return undefined when the entry was written with another key', async () => {
      mockChromeStorage.local.get.mockResolvedValueOnce({
        [MODEL_CACHE_KEY]: {
          openai: { models, fetchedAt: now, keyFingerprint: '16:zzzz' },
        },
      });

      expect(await readCache('openai', fingerprint)).toBeUndefined();
    });
  });

  describe('writeCache', () => {
    it('should write the provider entry without touching other providers', async () => {
      mockChromeStorage.local.get.mockResolvedValueOnce({
        [MODEL_CACHE_KEY]: {
          claude: { models: [], fetchedAt: 1, keyFingerprint: '1:x' },
        },
      });

      await writeCache('openai', models, fingerprint, now);

      const written = mockChromeStorage.local.set.mock.calls[0][0][MODEL_CACHE_KEY];
      expect(written.openai).toEqual({ models, fetchedAt: now, keyFingerprint: fingerprint });
      expect(written.claude).toEqual({ models: [], fetchedAt: 1, keyFingerprint: '1:x' });
    });
  });
});
