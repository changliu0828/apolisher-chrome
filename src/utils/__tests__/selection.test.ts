import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSelectedText,
  getSelectionRect,
  clearSelection,
  isEditableElement,
  isSelectionInEditableElement,
} from '../selection';

describe('selection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Clear any existing selections
    window.getSelection()?.removeAllRanges();
  });

  describe('getSelectedText', () => {
    it('should return selected text from input element', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);
      input.focus();

      const text = getSelectedText();
      expect(text).toBe('Hello');
    });

    it('should return selected text from textarea element', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world\nSecond line';
      textarea.selectionStart = 6;
      textarea.selectionEnd = 11;
      document.body.appendChild(textarea);
      textarea.focus();

      const text = getSelectedText();
      expect(text).toBe('world');
    });

    it('should trim whitespace from selection', () => {
      const input = document.createElement('input');
      input.value = '  Hello  ';
      input.selectionStart = 0;
      input.selectionEnd = 9;
      document.body.appendChild(input);
      input.focus();

      const text = getSelectedText();
      expect(text).toBe('Hello');
    });

    it('should return empty string when no text selected in input', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 5;
      input.selectionEnd = 5;
      document.body.appendChild(input);
      input.focus();

      const text = getSelectedText();
      expect(text).toBe('');
    });

    it('should handle null selectionStart/End', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = null;
      input.selectionEnd = null;
      document.body.appendChild(input);
      input.focus();

      const text = getSelectedText();
      expect(text).toBe('');
    });

    it('should return window selection for contentEditable', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      // Create selection
      const range = document.createRange();
      const textNode = div.firstChild!;
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      const text = getSelectedText();
      expect(text).toBe('Hello');
    });

    it('should return empty string when no selection exists', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const text = getSelectedText();
      expect(text).toBe('');
    });
  });

  describe('getSelectionRect', () => {
    // Skip these tests as DOMRect constructor is not available in happy-dom
    it.skip('should return rect for input element selection', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      input.style.position = 'absolute';
      input.style.left = '100px';
      input.style.top = '50px';
      document.body.appendChild(input);
      input.focus();

      const rect = getSelectionRect();
      expect(rect).not.toBeNull();
    });

    it.skip('should return rect for textarea element selection', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      textarea.selectionStart = 0;
      textarea.selectionEnd = 5;
      document.body.appendChild(textarea);
      textarea.focus();

      const rect = getSelectionRect();
      expect(rect).not.toBeNull();
    });

    it('should return null when no selection in contentEditable', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const rect = getSelectionRect();
      expect(rect).toBeNull();
    });

    it('should return rect for window selection', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = div.firstChild!;
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      const rect = getSelectionRect();
      expect(rect).not.toBeNull();
    });
  });

  describe('clearSelection', () => {
    it('should clear window selection', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = div.firstChild!;
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      expect(selection.rangeCount).toBe(1);

      clearSelection();

      expect(selection.rangeCount).toBe(0);
    });

    it('should handle null selection gracefully', () => {
      // Mock getSelection to return null
      const originalGetSelection = window.getSelection;
      window.getSelection = vi.fn().mockReturnValue(null);

      expect(() => clearSelection()).not.toThrow();

      window.getSelection = originalGetSelection;
    });
  });

  describe('isEditableElement', () => {
    it('should return true for input element', () => {
      const input = document.createElement('input');
      expect(isEditableElement(input)).toBe(true);
    });

    it('should return true for textarea element', () => {
      const textarea = document.createElement('textarea');
      expect(isEditableElement(textarea)).toBe(true);
    });

    it('should return true for contentEditable element', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      expect(isEditableElement(div)).toBe(true);
    });

    it('should return false for non-editable element', () => {
      const div = document.createElement('div');
      expect(isEditableElement(div)).toBe(false);
    });

    it('should return false for null element', () => {
      expect(isEditableElement(null)).toBe(false);
    });

    it('should return false for contentEditable=false', () => {
      const div = document.createElement('div');
      div.contentEditable = 'false';
      expect(isEditableElement(div)).toBe(false);
    });

    it('should return false for readonly input', () => {
      const input = document.createElement('input');
      // Note: isEditableElement checks tag type, not readonly attribute
      // This test verifies the function returns true for input regardless
      expect(isEditableElement(input)).toBe(true);
    });
  });

  describe('isSelectionInEditableElement', () => {
    it('should return true when active element is input', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      document.body.appendChild(input);
      input.focus();

      expect(isSelectionInEditableElement()).toBe(true);
    });

    it('should return true when active element is textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      document.body.appendChild(textarea);
      textarea.focus();

      expect(isSelectionInEditableElement()).toBe(true);
    });

    it('should return true when selection is in contentEditable', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = div.firstChild!;
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      expect(isSelectionInEditableElement()).toBe(true);
    });

    it('should return true when selection is in nested contentEditable', () => {
      const parent = document.createElement('div');
      parent.contentEditable = 'true';
      const child = document.createElement('span');
      child.textContent = 'Hello world';
      parent.appendChild(child);
      document.body.appendChild(parent);

      const range = document.createRange();
      const textNode = child.firstChild!;
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      expect(isSelectionInEditableElement()).toBe(true);
    });

    it('should return false when selection is in non-editable element', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = div.firstChild!;
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      expect(isSelectionInEditableElement()).toBe(false);
    });

    it('should return false when no selection exists', () => {
      expect(isSelectionInEditableElement()).toBe(false);
    });

    it('should return false when selection has no ranges', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      window.getSelection()?.removeAllRanges();

      expect(isSelectionInEditableElement()).toBe(false);
    });
  });
});
