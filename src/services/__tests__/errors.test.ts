import { describe, it, expect } from 'vitest';
import { assertUsableApiKey, normalizeApiKey, toNetworkError } from '../errors';

describe('errors', () => {
  describe('normalizeApiKey', () => {
    it('should trim surrounding whitespace and newlines', () => {
      expect(normalizeApiKey('  sk-ant-abc123\n')).toBe('sk-ant-abc123');
    });

    it('should strip invisible characters that paste smuggles in', () => {
      expect(normalizeApiKey('sk-ant-​abc﻿123')).toBe('sk-ant-abc123');
    });

    it('should leave a clean key untouched', () => {
      expect(normalizeApiKey('sk-ant-abc123')).toBe('sk-ant-abc123');
    });

    it('should keep visible characters, including ones a header cannot carry', () => {
      // A stray CJK punctuation mark is reported by assertUsableApiKey rather
      // than silently dropped here - removing it would hide a mis-pasted key.
      expect(normalizeApiKey('sk-ant-abc123、')).toBe('sk-ant-abc123、');
    });
  });

  describe('assertUsableApiKey', () => {
    it('should accept a normal key', () => {
      expect(() => assertUsableApiKey('sk-ant-api03-AbC_123-xyz')).not.toThrow();
    });

    it('should reject a key with CJK punctuation', () => {
      try {
        assertUsableApiKey('sk-ant-abc123、');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_API_KEY');
        expect((error as Error).message).toContain('Re-copy it');
      }
    });

    it('should reject a key with a zero-width space or a smart quote', () => {
      expect(() => assertUsableApiKey('sk-ant​abc')).toThrow();
      expect(() => assertUsableApiKey('sk-ant’abc')).toThrow();
    });

    it('should reject a key with a control character', () => {
      expect(() => assertUsableApiKey('sk-ant\nabc')).toThrow();
    });
  });

  describe('toNetworkError', () => {
    it('should keep the friendly message for a connectivity failure', () => {
      const error = toNetworkError(new TypeError('Failed to fetch'));

      expect(error.name).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Network error. Please check your connection.');
    });

    it('should append the original cause for a request fetch refused to send', () => {
      const error = toNetworkError(
        new TypeError('String contains non ISO-8859-1 code point.')
      );

      expect(error.name).toBe('NETWORK_ERROR');
      expect(error.message).toContain('non ISO-8859-1');
    });
  });
});
