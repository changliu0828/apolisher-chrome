/**
 * Modal configuration constants
 * Single source of truth for all modal-related dimensions
 */

export const MODAL_CONFIG = {
  // Fixed dimensions (same for all states: loading, error, diff)
  WIDTH: 320, // px
  HEIGHT: 260, // px - Fixed height for consistent positioning

  // Responsive constraints (matches CSS)
  MAX_WIDTH_VW: 90, // 90vw on narrow screens

  // Spacing
  VIEWPORT_PADDING: 16, // Minimum distance from viewport edges

  // Section configuration (matches CSS)
  SECTION: {
    MAX_HEIGHT_VH: 25, // 25vh per section (matches CSS max-height)
  },
} as const;

// Derived constants for convenience
export const MODAL_WIDTH = MODAL_CONFIG.WIDTH;
export const MODAL_HEIGHT = MODAL_CONFIG.HEIGHT;
export const MODAL_VIEWPORT_PADDING = MODAL_CONFIG.VIEWPORT_PADDING;
