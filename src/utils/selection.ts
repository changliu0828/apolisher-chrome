/**
 * Check if an element is an input or textarea
 */
function isInputElement(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  const tagName = element.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea';
}

/**
 * Get selected text from input/textarea elements
 */
function getInputSelectedText(element: HTMLInputElement | HTMLTextAreaElement): string {
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;
  return element.value.substring(start, end).trim();
}

/**
 * Get the current selected text
 */
export function getSelectedText(): string {
  // Check if active element is an input/textarea
  const activeElement = document.activeElement;
  if (activeElement && isInputElement(activeElement)) {
    return getInputSelectedText(activeElement);
  }

  // Otherwise use window selection for contentEditable
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

/**
 * Get bounding rect for input/textarea selection
 */
function getInputSelectionRect(element: HTMLInputElement | HTMLTextAreaElement): DOMRect | null {
  const rect = element.getBoundingClientRect();

  // For input/textarea, create a temporary span to measure the actual text width
  // This gives us accurate positioning regardless of input styling
  const textBeforeSelection = element.value.substring(0, element.selectionEnd || 0);

  // Create a temporary measuring element
  const measuringSpan = document.createElement('span');
  measuringSpan.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: pre;
    font: ${window.getComputedStyle(element).font};
  `;
  measuringSpan.textContent = textBeforeSelection;
  document.body.appendChild(measuringSpan);

  const textWidth = measuringSpan.offsetWidth;
  document.body.removeChild(measuringSpan);

  // Position at the end of the selected text, with bounds checking
  const estimatedX = Math.min(rect.left + textWidth, rect.right - 10);

  return new DOMRect(
    estimatedX,
    rect.top,
    1,
    rect.height
  );
}

/**
 * Get the bounding rectangle of the current selection
 */
export function getSelectionRect(): DOMRect | null {
  // Check if active element is an input/textarea
  const activeElement = document.activeElement;
  if (activeElement && isInputElement(activeElement)) {
    return getInputSelectionRect(activeElement);
  }

  // Otherwise use window selection for contentEditable
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  // For multi-line selections, use the last line's rect to position button
  // near where the selection ends (instead of a large bounding box)
  const rects = range.getClientRects();
  if (rects.length > 0) {
    return rects[rects.length - 1];
  }

  return range.getBoundingClientRect();
}

/**
 * Clear the current selection
 */
export function clearSelection(): void {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}

/**
 * Check if an element is editable
 */
export function isEditableElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  // Check if it's an input or textarea
  if (isInputElement(element)) {
    return true;
  }

  // Check if it has contentEditable attribute
  const htmlElement = element as HTMLElement;
  if (htmlElement.contentEditable === 'true' || htmlElement.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Check if the current selection is within an editable element
 */
export function isSelectionInEditableElement(): boolean {
  // Check if active element is an input/textarea
  const activeElement = document.activeElement;
  if (activeElement && isInputElement(activeElement)) {
    return true;
  }

  // Otherwise check contentEditable elements
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  let container = range.commonAncestorContainer;

  // If the container is a text node, get its parent element
  if (container.nodeType === Node.TEXT_NODE) {
    container = container.parentElement as Element;
  }

  if (!container) {
    return false;
  }

  // Check the container itself
  if (isEditableElement(container as Element)) {
    return true;
  }

  // Check if any parent is editable
  let parent = (container as Element).parentElement;
  while (parent) {
    if (isEditableElement(parent)) {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}
