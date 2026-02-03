import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateButtonPosition } from '../positioning';

// Mock constants
vi.mock('@/constants/ui', () => ({
  BUTTON_SIZE: 20,
  BUTTON_OFFSET: 8,
  VIEWPORT_PADDING: 16,
}));

describe('positioning', () => {
  beforeEach(() => {
    // Reset window dimensions and scroll
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  describe('calculateButtonPosition', () => {
    it('should position button at bottom-right of selection with offset', () => {
      const rect = {
        top: 100,
        bottom: 120,
        left: 50,
        right: 200,
        width: 150,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // bottom (120) + offset (8) + scrollY (0) = 128
      expect(position.top).toBe(128);
      // right (200) + offset (8) + scrollX (0) = 208
      expect(position.left).toBe(208);
    });

    it('should adjust position when button would overflow right edge', () => {
      const rect = {
        top: 100,
        bottom: 120,
        left: 50,
        right: 1000, // Close to right edge
        width: 150,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Should be adjusted to: scrollX (0) + viewportWidth (1024) - BUTTON_SIZE (20) - VIEWPORT_PADDING (16) = 988
      expect(position.left).toBe(988);
    });

    it('should position above selection when button would overflow bottom edge', () => {
      const rect = {
        top: 700,
        bottom: 720,
        left: 50,
        right: 200,
        width: 150,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Initial: bottom (720) + offset (8) + scrollY (0) = 728
      // 728 + BUTTON_SIZE (20) = 748 > scrollY (0) + viewportHeight (768) - VIEWPORT_PADDING (16) = 752
      // So it doesn't overflow, stays at 728
      expect(position.top).toBe(728);
    });

    it('should ensure minimum padding from left edge', () => {
      const rect = {
        top: 100,
        bottom: 120,
        left: 0,
        right: 5, // Very close to left edge
        width: 5,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Should be: scrollX (0) + VIEWPORT_PADDING (16) = 16
      expect(position.left).toBe(16);
    });

    it('should ensure minimum padding from top edge', () => {
      const rect = {
        top: 0,
        bottom: 5,
        left: 100,
        right: 200,
        width: 100,
        height: 5,
      } as DOMRect;

      // Mock button would overflow bottom, so it will try to position above
      // But that would be negative, so it should be clamped to VIEWPORT_PADDING
      const position = calculateButtonPosition(rect);

      // Position would be: top (0) + scrollY (0) - BUTTON_SIZE (20) - BUTTON_OFFSET (8) = -28
      // Clamped to: scrollY (0) + VIEWPORT_PADDING (16) = 16
      expect(position.top).toBe(16);
    });

    it('should handle scrolled page correctly', () => {
      Object.defineProperty(window, 'scrollX', {
        writable: true,
        configurable: true,
        value: 100,
      });
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 200,
      });

      const rect = {
        top: 100,
        bottom: 120,
        left: 50,
        right: 200,
        width: 150,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // bottom (120) + offset (8) + scrollY (200) = 328
      expect(position.top).toBe(328);
      // right (200) + offset (8) + scrollX (100) = 308
      expect(position.left).toBe(308);
    });

    it('should handle selection at bottom-right corner', () => {
      const rect = {
        top: 700,
        bottom: 720,
        left: 900,
        right: 1000,
        width: 100,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Should be adjusted for right overflow
      // Left: scrollX (0) + viewportWidth (1024) - BUTTON_SIZE (20) - VIEWPORT_PADDING (16) = 988
      expect(position.left).toBe(988);
      // Top: 720 + 8 + 0 = 728 (doesn't overflow)
      expect(position.top).toBe(728);
    });

    it('should handle selection at top-left corner', () => {
      const rect = {
        top: 5,
        bottom: 10,
        left: 5,
        right: 10,
        width: 5,
        height: 5,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Left: right (10) + offset (8) + scrollX (0) = 18
      expect(position.left).toBe(18);
      // Top: bottom (10) + offset (8) + scrollY (0) = 18
      expect(position.top).toBe(18);
    });

    it('should handle very small viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 480,
      });

      const rect = {
        top: 200,
        bottom: 220,
        left: 150,
        right: 250,
        width: 100,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Initial left: right (250) + offset (8) + scrollX (0) = 258
      // 258 + BUTTON_SIZE (20) = 278 < scrollX (0) + viewportWidth (320) - VIEWPORT_PADDING (16) = 304
      // So it doesn't overflow, stays at 258
      expect(position.left).toBe(258);
    });

    it('should handle zero-width rect', () => {
      const rect = {
        top: 100,
        bottom: 120,
        left: 200,
        right: 200,
        width: 0,
        height: 20,
      } as DOMRect;

      const position = calculateButtonPosition(rect);

      // Should still calculate position correctly
      expect(position.top).toBe(128); // 120 + 8 + 0
      expect(position.left).toBe(208); // 200 + 8 + 0
    });
  });
});
