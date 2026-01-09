/**
 * Unified button configuration
 * Single source of truth for all button-related constants
 */
export const BUTTON_CONFIG = {
  SIZE: 20,
  OFFSET: 8,
  BORDER_RADIUS_RATIO: 0.3,
  VIEWPORT_PADDING: 16,
  DEBOUNCE_DELAY: 100,
} as const;

// Derived constants for convenience
export const BUTTON_SIZE = BUTTON_CONFIG.SIZE;
export const BUTTON_OFFSET = BUTTON_CONFIG.OFFSET;
export const BUTTON_BORDER_RADIUS = Math.round(BUTTON_CONFIG.SIZE * BUTTON_CONFIG.BORDER_RADIUS_RATIO);
export const VIEWPORT_PADDING = BUTTON_CONFIG.VIEWPORT_PADDING;
export const DEBOUNCE_DELAY = BUTTON_CONFIG.DEBOUNCE_DELAY;
