import { FloatingButton, type SelectionContext } from './FloatingButton';
import { DiffModal } from './DiffModal';
import {
  getSelectedText,
  getSelectionRect,
  isSelectionInEditableElement,
} from '@/utils/selection';
import { calculateButtonPosition } from '@/utils/positioning';
import { replaceText } from '@/utils/textReplacer';
import { DEBOUNCE_DELAY } from '@/constants/ui';
import { MESSAGE_TYPES, type PolishResponse, type PolishError } from '@/types/messages';

// Global state
let floatingButton: FloatingButton | null = null;
let diffModal: DiffModal | null = null;
let currentSelectionContext: SelectionContext | null = null;
let debounceTimer: number | null = null;

/**
 * Handle polish button click - send request to background worker
 */
function handlePolishClick(context: SelectionContext): void {
  // Store context for regenerate/accept
  currentSelectionContext = context;

  // Hide button
  if (floatingButton) {
    floatingButton.hide();
  }

  // Initialize modal if needed
  if (!diffModal) {
    diffModal = new DiffModal();
  }

  // Show loading state with position
  diffModal.showLoading(context.buttonPosition);

  // Send message to background worker
  try {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.POLISH_REQUEST,
      payload: {
        text: context.selectedText,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send message:', error);
    diffModal.showError('Failed to communicate with extension. Please try again.', {
      onRetry: () => handlePolishClick(context),
      showSettings: false,
    });
  }
}

/**
 * Handle accept button - replace text in DOM
 */
function handleAccept(polishedText: string): void {
  if (!currentSelectionContext) return;

  // Replace text in the original element
  const success = replaceText(currentSelectionContext.element, polishedText);

  if (success) {
    // Hide modal
    if (diffModal) {
      diffModal.hide();
    }
    // Clear selection context
    currentSelectionContext = null;
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard
      .writeText(polishedText)
      .then(() => {
        alert('Text copied to clipboard (direct replacement not supported)');
        if (diffModal) {
          diffModal.hide();
        }
        currentSelectionContext = null;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to copy to clipboard:', error);
        alert('Failed to replace text. Please try again.');
      });
  }
}

/**
 * Handle regenerate button - send new request to background worker
 */
function handleRegenerate(): void {
  if (!currentSelectionContext || !diffModal) return;

  // Show loading state (position already stored in modal)
  diffModal.showLoading();

  // Send new request to background worker
  try {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.POLISH_REQUEST,
      payload: {
        text: currentSelectionContext.selectedText,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send message:', error);
    diffModal.showError('Failed to communicate with extension. Please try again.', {
      onRetry: handleRegenerate,
      showSettings: false,
    });
  }
}

/**
 * Handle polish response from background worker
 */
function handlePolishResponse(payload: PolishResponse['payload']): void {
  if (!diffModal || !currentSelectionContext) return;

  diffModal.show({
    originalText: currentSelectionContext.selectedText,
    polishedText: payload.polishedText,
    position: currentSelectionContext.buttonPosition,
    targetElement: currentSelectionContext.element,
    onAccept: handleAccept,
    onRegenerate: handleRegenerate,
  });
}

/**
 * Handle polish error from background worker
 */
function handlePolishError(payload: PolishError['payload']): void {
  if (!diffModal) return;

  let errorMessage = payload.error;
  let showSettings = false;

  // Customize error message based on error code
  if (payload.code === 'NO_API_KEY') {
    errorMessage = 'Please add your OpenAI API key in the extension settings.';
    showSettings = true;
  } else if (payload.code === 'NETWORK_ERROR') {
    errorMessage = 'Network error. Please check your connection and try again.';
  } else if (payload.code === 'INVALID_RESPONSE') {
    errorMessage = 'Received invalid response from API. Please try again.';
  } else if (payload.code === 'API_ERROR') {
    errorMessage = `API Error: ${payload.error}`;
  }

  diffModal.showError(errorMessage, {
    onRetry: () => {
      if (currentSelectionContext) {
        handlePolishClick(currentSelectionContext);
      }
    },
    showSettings,
  });
}

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

    // Get the active element (where selection is)
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) {
      return;
    }

    // Show button if we have a valid selection in an editable element
    if (selectionRect) {
      const position = calculateButtonPosition(selectionRect);

      // Initialize button with callback if not created yet
      if (!floatingButton) {
        floatingButton = new FloatingButton({
          onPolishClick: handlePolishClick,
        });
      }

      // Create selection context
      const context: SelectionContext = {
        selectedText,
        element: activeElement,
        buttonPosition: position,
      };

      floatingButton.show(position, context);
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

  // Add message listener for background worker responses
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MESSAGE_TYPES.POLISH_RESPONSE) {
      handlePolishResponse(message.payload);
    } else if (message.type === MESSAGE_TYPES.POLISH_ERROR) {
      handlePolishError(message.payload);
    }
    // Return false - we're not sending a response back
    return false;
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

  if (diffModal) {
    diffModal.destroy();
    diffModal = null;
  }

  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  currentSelectionContext = null;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
