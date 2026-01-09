import { FloatingButton } from './FloatingButton';
import {
  getSelectedText,
  getSelectionRect,
  isSelectionInEditableElement,
} from '@/utils/selection';
import { calculateButtonPosition } from '@/utils/positioning';
import { DEBOUNCE_DELAY } from '@/constants/ui';

// Global state
let floatingButton: FloatingButton | null = null;
let debounceTimer: number | null = null;

/**
 * Handle text selection events
 */
function handleSelection(): void {
  // Clear existing debounce timer
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }

  // Debounce to avoid rapid show/hide
  debounceTimer = window.setTimeout(() => {
    const selectedText = getSelectedText();
    const selectionRect = getSelectionRect();

    // Hide button if no selection or not in editable element
    if (!selectedText || selectedText.length === 0 || !isSelectionInEditableElement()) {
      if (floatingButton) {
        floatingButton.hide();
      }
      return;
    }

    // Show button if we have a valid selection in an editable element
    if (selectionRect) {
      const position = calculateButtonPosition(selectionRect);
      if (!floatingButton) {
        floatingButton = new FloatingButton();
      }
      floatingButton.show(position);
    }
  }, DEBOUNCE_DELAY);
}

/**
 * Handle clicks outside the button to hide it
 */
function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Node;

  // Don't hide if clicking inside the button's shadow DOM
  if (floatingButton && target !== document.body) {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      floatingButton.hide();
    }
  }
}

/**
 * Handle scroll events to hide the button
 */
function handleScroll(): void {
  if (floatingButton && floatingButton.visible) {
    floatingButton.hide();
  }
}

/**
 * Handle escape key to hide the button
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && floatingButton && floatingButton.visible) {
    floatingButton.hide();
  }
}

/**
 * Event listeners registry for easy management
 */
const eventListeners = [
  { event: 'mouseup', handler: handleSelection, options: false },
  { event: 'select', handler: handleSelection, options: true },
  { event: 'click', handler: handleClickOutside, options: false },
  { event: 'scroll', handler: handleScroll, options: true },
  { event: 'keydown', handler: handleKeyDown, options: false },
] as const;

/**
 * Initialize the content script
 */
function init(): void {
  // Register all event listeners
  eventListeners.forEach(({ event, handler, options }) => {
    document.addEventListener(event, handler as EventListener, options);
  });

  // eslint-disable-next-line no-console
  console.log('Apolisher content script initialized');
}

/**
 * Cleanup on unload
 */
function cleanup(): void {
  // Remove all event listeners
  eventListeners.forEach(({ event, handler, options }) => {
    document.removeEventListener(event, handler as EventListener, options);
  });

  if (floatingButton) {
    floatingButton.destroy();
    floatingButton = null;
  }

  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
