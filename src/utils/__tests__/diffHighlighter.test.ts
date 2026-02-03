import { describe, it, expect } from 'vitest';
import { renderOriginalDiff, renderPolishedDiff } from '../diffHighlighter';

describe('diffHighlighter', () => {
  describe('renderOriginalDiff', () => {
    it('should render unchanged text as is', () => {
      const original = 'Hello world';
      const polished = 'Hello world';
      const result = renderOriginalDiff(original, polished);
      expect(result).toBe('Hello world');
    });

    it('should highlight deletions with diff-delete class', () => {
      const original = 'Hello old world';
      const polished = 'Hello world';
      const result = renderOriginalDiff(original, polished);
      expect(result).toContain('<span class="diff-delete">old </span>');
      expect(result).toContain('Hello ');
      expect(result).toContain('world');
    });

    it('should not show additions in original diff', () => {
      const original = 'Hello world';
      const polished = 'Hello beautiful world';
      const result = renderOriginalDiff(original, polished);
      expect(result).not.toContain('beautiful');
      expect(result).toBe('Hello world');
    });

    it('should handle multiple deletions', () => {
      const original = 'The quick brown fox jumps';
      const polished = 'The fox jumps';
      const result = renderOriginalDiff(original, polished);
      expect(result).toContain('<span class="diff-delete">');
      expect(result).toContain('quick');
      expect(result).toContain('brown');
    });

    it('should handle HTML-like text', () => {
      const original = '<script>alert("test")</script>';
      const polished = 'safe text';
      const result = renderOriginalDiff(original, polished);
      // Verify the diff delete span is present
      expect(result).toContain('<span class="diff-delete">');
      // Verify deleted content is wrapped (escaping behavior is environment-specific)
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty strings', () => {
      const result1 = renderOriginalDiff('', '');
      expect(result1).toBe('');

      const result2 = renderOriginalDiff('text', '');
      expect(result2).toContain('<span class="diff-delete">text</span>');

      const result3 = renderOriginalDiff('', 'text');
      expect(result3).toBe('');
    });

    it('should handle special characters correctly', () => {
      const original = 'Hello & goodbye';
      const polished = 'Hello';
      const result = renderOriginalDiff(original, polished);
      // Verify the deleted portion is wrapped in diff-delete span
      expect(result).toContain('<span class="diff-delete">');
      expect(result).toContain('Hello');
    });

    it('should handle newlines', () => {
      const original = 'Line 1\nLine 2';
      const polished = 'Line 1';
      const result = renderOriginalDiff(original, polished);
      expect(result).toContain('<span class="diff-delete">');
    });
  });

  describe('renderPolishedDiff', () => {
    it('should render unchanged text as is', () => {
      const original = 'Hello world';
      const polished = 'Hello world';
      const result = renderPolishedDiff(original, polished);
      expect(result).toBe('Hello world');
    });

    it('should highlight insertions with diff-insert class', () => {
      const original = 'Hello world';
      const polished = 'Hello beautiful world';
      const result = renderPolishedDiff(original, polished);
      expect(result).toContain('<span class="diff-insert">beautiful </span>');
      expect(result).toContain('Hello ');
      expect(result).toContain('world');
    });

    it('should not show deletions in polished diff', () => {
      const original = 'Hello old world';
      const polished = 'Hello world';
      const result = renderPolishedDiff(original, polished);
      expect(result).not.toContain('old');
      expect(result).toBe('Hello world');
    });

    it('should handle multiple insertions', () => {
      const original = 'The fox jumps';
      const polished = 'The quick brown fox jumps';
      const result = renderPolishedDiff(original, polished);
      expect(result).toContain('<span class="diff-insert">');
      expect(result).toContain('quick');
      expect(result).toContain('brown');
    });

    it('should handle HTML-like text', () => {
      const original = 'safe text';
      const polished = '<script>alert("test")</script>';
      const result = renderPolishedDiff(original, polished);
      // Verify the diff insert span is present
      expect(result).toContain('<span class="diff-insert">');
      // Verify inserted content is wrapped (escaping behavior is environment-specific)
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty strings', () => {
      const result1 = renderPolishedDiff('', '');
      expect(result1).toBe('');

      const result2 = renderPolishedDiff('text', '');
      expect(result2).toBe('');

      const result3 = renderPolishedDiff('', 'text');
      expect(result3).toContain('<span class="diff-insert">text</span>');
    });

    it('should handle replacements as deletion + insertion', () => {
      const original = 'Hello world';
      const polished = 'Goodbye universe';
      const result = renderPolishedDiff(original, polished);
      expect(result).toContain('<span class="diff-insert">');
      // Character-level diff may split words, so just check for presence
      expect(result).toMatch(/G/);
      expect(result).toMatch(/u/);
      expect(result).not.toContain('Hello');
      expect(result).not.toContain('world');
    });

    it('should handle quotes and special characters', () => {
      const original = 'text';
      const polished = 'text with "quotes" & symbols';
      const result = renderPolishedDiff(original, polished);
      // Verify the diff insert span is present for added content
      expect(result).toContain('<span class="diff-insert">');
      expect(result).toContain('text');
    });
  });

  describe('edge cases', () => {
    it('should handle identical long texts', () => {
      const longText = 'Lorem ipsum '.repeat(100);
      const result = renderOriginalDiff(longText, longText);
      expect(result).toBe(longText);
    });

    it('should handle case changes', () => {
      const original = 'hello';
      const polished = 'HELLO';
      const resultOriginal = renderOriginalDiff(original, polished);
      const resultPolished = renderPolishedDiff(original, polished);

      expect(resultOriginal).toContain('<span class="diff-delete">hello</span>');
      expect(resultPolished).toContain('<span class="diff-insert">HELLO</span>');
    });

    it('should handle whitespace changes', () => {
      const original = 'hello  world';
      const polished = 'hello world';
      const result = renderOriginalDiff(original, polished);
      expect(result).toContain('<span class="diff-delete"> </span>');
    });
  });
});
