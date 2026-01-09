import { BUTTON_SIZE, BUTTON_OFFSET, VIEWPORT_PADDING } from '@/constants/ui';

export interface Position {
  top: number;
  left: number;
}

/**
 * Calculate the position for the floating button based on the selection rectangle
 * Position at bottom-right of selection, with viewport boundary checks
 */
export function calculateButtonPosition(rect: DOMRect): Position {
  // Initial position: bottom-right of selection with offset
  let top = rect.bottom + BUTTON_OFFSET + window.scrollY;
  let left = rect.right + BUTTON_OFFSET + window.scrollX;

  // Check viewport boundaries
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust if button would overflow right edge
  if (left + BUTTON_SIZE > window.scrollX + viewportWidth - VIEWPORT_PADDING) {
    left = window.scrollX + viewportWidth - BUTTON_SIZE - VIEWPORT_PADDING;
  }

  // Adjust if button would overflow bottom edge
  if (top + BUTTON_SIZE > window.scrollY + viewportHeight - VIEWPORT_PADDING) {
    // Position above the selection instead
    top = rect.top + window.scrollY - BUTTON_SIZE - BUTTON_OFFSET;
  }

  // Ensure minimum padding from left edge
  if (left < window.scrollX + VIEWPORT_PADDING) {
    left = window.scrollX + VIEWPORT_PADDING;
  }

  // Ensure minimum padding from top edge
  if (top < window.scrollY + VIEWPORT_PADDING) {
    top = window.scrollY + VIEWPORT_PADDING;
  }

  return { top, left };
}
