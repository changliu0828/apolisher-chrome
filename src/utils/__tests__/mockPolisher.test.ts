import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPolish } from '../mockPolisher';

describe('mockPolisher', () => {
  beforeEach(() => {
    // Reset Math.random mock before each test
    vi.restoreAllMocks();
  });

  describe('empty and invalid inputs', () => {
    it('should return empty string as is', () => {
      expect(mockPolish('')).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      const result = mockPolish('   ');
      expect(result).toBe('   '); // No non-space characters to replace
    });
  });

  describe('English text case toggling', () => {
    it('should toggle case of one letter', () => {
      // Mock Math.random to select first letter
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const result = mockPolish('hello');
      expect(result).toBe('Hello'); // 'h' -> 'H'
    });

    it('should toggle uppercase to lowercase', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const result = mockPolish('HELLO');
      expect(result).toBe('hELLO'); // 'H' -> 'h'
    });

    it('should only change one letter', () => {
      const original = 'hello world';
      const result = mockPolish(original);

      // Count differences
      let differences = 0;
      for (let i = 0; i < original.length; i++) {
        if (original[i] !== result[i]) {
          differences++;
        }
      }

      expect(differences).toBe(1);
    });

    it('should handle mixed case text', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const original = 'HeLLo WoRLd';
      const result = mockPolish(original);

      // Should be different from original
      expect(result).not.toBe(original);
      // Should have same length
      expect(result.length).toBe(original.length);
    });

    it('should handle text with numbers and letters', () => {
      const original = 'test123';
      const result = mockPolish(original);

      // Only letters should be toggled, numbers preserved
      expect(result).toMatch(/^[tT][eE][sS][tT]123$/);
    });

    it('should handle single letter', () => {
      const result = mockPolish('a');
      expect(result).toBe('A');
    });

    it('should handle text with punctuation', () => {
      const original = 'Hello, world!';
      const result = mockPolish(original);

      // Punctuation should be preserved
      expect(result).toContain(',');
      expect(result).toContain('!');
      // But one letter should change
      expect(result).not.toBe(original);
    });
  });

  describe('non-English text replacement', () => {
    it('should replace one character with ✱ in Japanese text', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const result = mockPolish('こんにちは');
      expect(result).toBe('✱んにちは'); // First character replaced
    });

    it('should replace one character in Chinese text', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const result = mockPolish('你好世界');
      expect(result).toBe('✱好世界'); // First character replaced
    });

    it('should preserve spaces in non-English text', () => {
      const original = '你好 世界';
      const result = mockPolish(original);

      // Should still have space
      expect(result).toContain(' ');
      // Should have ✱ somewhere
      expect(result).toContain('✱');
    });

    it('should only replace one character in non-English text', () => {
      const original = 'こんにちは世界';
      const result = mockPolish(original);

      // Count ✱ occurrences
      const starCount = (result.match(/✱/g) || []).length;
      expect(starCount).toBe(1);
    });
  });

  describe('mixed text handling', () => {
    it('should toggle English letter even in mixed text', () => {
      const original = 'Hello 世界';
      const result = mockPolish(original);

      // Should toggle one of the English letters
      // Should not contain ✱ since English letters are present
      expect(result).not.toContain('✱');
      // Should still have the non-English part
      expect(result).toContain('世界');
    });

    it('should prefer English letters when both are present', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const original = 'aこんにちは';
      const result = mockPolish(original);

      // Should toggle the 'a' not replace with ✱
      expect(result).toBe('Aこんにちは');
    });
  });

  describe('edge cases', () => {
    it('should handle text with only numbers', () => {
      const result = mockPolish('12345');
      // No letters to toggle, no non-space characters would be replaced with ✱
      // Actually numbers are non-space, so one would be replaced
      expect(result).toContain('✱');
    });

    it('should handle text with only special characters', () => {
      const result = mockPolish('!@#$%');
      expect(result).toContain('✱');
    });

    it('should handle newlines and tabs', () => {
      const original = 'hello\nworld';
      const result = mockPolish(original);

      // Should preserve newline
      expect(result).toContain('\n');
      // Should change one letter
      expect(result).not.toBe(original);
    });

    it('should be deterministic with same random seed', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result1 = mockPolish('hello world');

      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const result2 = mockPolish('hello world');

      expect(result1).toBe(result2);
    });

    it('should handle emojis', () => {
      const original = '😀😁😂';
      const result = mockPolish(original);

      // Should replace one emoji with ✱
      expect(result).toContain('✱');
    });
  });

  describe('length preservation', () => {
    it('should maintain the same length for English text', () => {
      const original = 'The quick brown fox jumps over the lazy dog';
      const result = mockPolish(original);
      expect(result.length).toBe(original.length);
    });

    it('should maintain the same length for non-English text', () => {
      const original = 'これはテストです';
      const result = mockPolish(original);
      expect(result.length).toBe(original.length);
    });
  });
});
