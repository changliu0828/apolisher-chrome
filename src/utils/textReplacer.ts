/**
 * Text replacement utility for editable elements
 * Handles input, textarea, and contentEditable elements
 */

export function replaceText(element: HTMLElement, newText: string): boolean {
  try {
    const tagName = element.tagName.toLowerCase();

    // Handle input/textarea
    if (tagName === 'input' || tagName === 'textarea') {
      const inputElement = element as HTMLInputElement | HTMLTextAreaElement;
      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;

      // Replace selected text
      const before = inputElement.value.substring(0, start);
      const after = inputElement.value.substring(end);
      inputElement.value = before + newText + after;

      // Move cursor to end of replaced text
      const newPosition = start + newText.length;
      inputElement.setSelectionRange(newPosition, newPosition);

      // Trigger input event for frameworks (React, Vue, etc)
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));

      return true;
    }

    // Handle contentEditable
    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(newText));

      // Collapse to end
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));

      return true;
    }

    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Text replacement failed:', error);
    return false;
  }
}
