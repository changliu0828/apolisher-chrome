/**
 * Text replacement utility for editable elements
 * Handles input, textarea, and contentEditable elements
 */

export function replaceText(element: HTMLElement, newText: string): boolean {
  try {
    // eslint-disable-next-line no-console
    console.log('Attempting text replacement:', {
      element,
      tagName: element.tagName,
      isContentEditable: element.isContentEditable,
      className: element.className,
      id: element.id,
    });

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

      // Try execCommand first (works better for Gmail, Google Docs, etc.)
      try {
        // Focus the element first
        element.focus();

        // Delete the selected text
        if (!selection.isCollapsed) {
          document.execCommand('delete', false);
        }

        // Insert the new text using execCommand
        const success = document.execCommand('insertText', false, newText);

        // eslint-disable-next-line no-console
        console.log('execCommand insertText result:', success);

        if (success) {
          // Trigger input events for React/Vue frameworks
          // eslint-disable-next-line no-undef
          element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: newText, cancelable: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));

          // Gmail-specific: trigger additional events
          element.dispatchEvent(new Event('textInput', { bubbles: true }));
          element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

          // eslint-disable-next-line no-console
          console.log('Text replacement successful via execCommand');
          return true;
        }
      } catch (execError) {
        // eslint-disable-next-line no-console
        console.warn('execCommand failed, trying fallback:', execError);
      }

      // Fallback: Try the range API method
      try {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a text node and insert it
        const textNode = document.createTextNode(newText);
        range.insertNode(textNode);

        // Collapse to end
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger input events
        // eslint-disable-next-line no-undef
        element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: newText, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('textInput', { bubbles: true }));

        // eslint-disable-next-line no-console
        console.log('Text replacement successful via Range API');
        return true;
      } catch (rangeError) {
        // eslint-disable-next-line no-console
        console.error('Range API failed:', rangeError);
        return false;
      }
    }

    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Text replacement failed:', error);
    return false;
  }
}
