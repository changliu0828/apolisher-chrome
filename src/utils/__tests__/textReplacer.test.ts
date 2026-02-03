/* eslint-disable no-console */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { replaceText } from '../textReplacer';

describe('textReplacer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.getSelection()?.removeAllRanges();
    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('replaceText - input elements', () => {
    it('should replace selected text in input element', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      const result = replaceText(input, 'Goodbye');

      expect(result).toBe(true);
      expect(input.value).toBe('Goodbye world');
    });

    it('should position cursor after replaced text in input', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      replaceText(input, 'Hi');

      expect(input.selectionStart).toBe(2);
      expect(input.selectionEnd).toBe(2);
    });

    it('should trigger input and change events on input', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      input.addEventListener('input', inputHandler);
      input.addEventListener('change', changeHandler);

      replaceText(input, 'Hi');

      expect(inputHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalled();
    });

    it('should handle null selectionStart/End in input', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = null;
      input.selectionEnd = null;
      document.body.appendChild(input);

      const result = replaceText(input, 'Test');

      expect(result).toBe(true);
      // With null start/end, it replaces from 0 to 0, so inserts at beginning
      expect(input.value).toBe('TestHello world');
    });

    it('should insert text at cursor position when no selection', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 6;
      input.selectionEnd = 6;
      document.body.appendChild(input);

      const result = replaceText(input, 'beautiful ');

      expect(result).toBe(true);
      expect(input.value).toBe('Hello beautiful world');
    });
  });

  describe('replaceText - textarea elements', () => {
    it('should replace selected text in textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Line 1\nLine 2';
      textarea.selectionStart = 0;
      textarea.selectionEnd = 6;
      document.body.appendChild(textarea);

      const result = replaceText(textarea, 'First');

      expect(result).toBe(true);
      expect(textarea.value).toBe('First\nLine 2');
    });

    it('should handle multiline replacement in textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Line 1\nLine 2\nLine 3';
      textarea.selectionStart = 0;
      textarea.selectionEnd = 13;
      document.body.appendChild(textarea);

      const result = replaceText(textarea, 'New\nLines');

      expect(result).toBe(true);
      expect(textarea.value).toBe('New\nLines\nLine 3');
    });

    it('should trigger input and change events on textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello';
      textarea.selectionStart = 0;
      textarea.selectionEnd = 5;
      document.body.appendChild(textarea);

      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      textarea.addEventListener('input', inputHandler);
      textarea.addEventListener('change', changeHandler);

      replaceText(textarea, 'Hi');

      expect(inputHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalled();
    });
  });

  describe('replaceText - contentEditable elements', () => {
    it('should return false when no selection exists', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const result = replaceText(div, 'Goodbye');

      expect(result).toBe(false);
    });

    // Skip contentEditable tests as Range API behavior is different in happy-dom
    it.skip('should replace text using Range API', () => {
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

      document.execCommand = vi.fn().mockReturnValue(false);

      const result = replaceText(div, 'Goodbye');

      expect(result).toBe(true);
      expect(div.textContent).toContain('Goodbye');
    });

    it.skip('should trigger input events on contentEditable', () => {
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

      document.execCommand = vi.fn().mockReturnValue(false);

      const inputHandler = vi.fn();
      const changeHandler = vi.fn();
      div.addEventListener('input', inputHandler);
      div.addEventListener('change', changeHandler);

      replaceText(div, 'Hi');

      expect(inputHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalled();
    });

    it.skip('should handle collapsed selection in contentEditable', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = div.firstChild!;
      range.setStart(textNode, 5);
      range.setEnd(textNode, 5);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);

      document.execCommand = vi.fn().mockReturnValue(false);

      const result = replaceText(div, ' beautiful');

      expect(result).toBe(true);
    });
  });

  describe('replaceText - error handling', () => {
    it('should return false for non-editable element', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello world';
      document.body.appendChild(div);

      const result = replaceText(div, 'Goodbye');

      expect(result).toBe(false);
    });

    it('should handle exceptions gracefully', () => {
      const input = document.createElement('input');
      input.value = 'Hello';
      document.body.appendChild(input);

      // Mock setSelectionRange to throw error
      input.setSelectionRange = vi.fn().mockImplementation(() => {
        throw new Error('Selection error');
      });

      const result = replaceText(input, 'Hi');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should log replacement attempt details', () => {
      const input = document.createElement('input');
      input.value = 'Hello';
      input.className = 'test-class';
      input.id = 'test-id';
      document.body.appendChild(input);

      replaceText(input, 'Hi');

      expect(console.log).toHaveBeenCalledWith(
        'Attempting text replacement:',
        expect.objectContaining({
          tagName: 'INPUT',
          className: 'test-class',
          id: 'test-id',
        })
      );
    });
  });

  describe('replaceText - edge cases', () => {
    it('should handle empty replacement text', () => {
      const input = document.createElement('input');
      input.value = 'Hello world';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      const result = replaceText(input, '');

      expect(result).toBe(true);
      expect(input.value).toBe(' world');
    });

    it('should handle very long replacement text', () => {
      const input = document.createElement('input');
      input.value = 'Short';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      const longText = 'a'.repeat(1000);
      const result = replaceText(input, longText);

      expect(result).toBe(true);
      expect(input.value).toBe(longText);
    });

    it('should handle special characters in replacement text', () => {
      const input = document.createElement('input');
      input.value = 'Hello';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      const result = replaceText(input, '<script>alert("test")</script>');

      expect(result).toBe(true);
      expect(input.value).toBe('<script>alert("test")</script>');
    });

    it('should handle unicode characters', () => {
      const input = document.createElement('input');
      input.value = 'Hello';
      input.selectionStart = 0;
      input.selectionEnd = 5;
      document.body.appendChild(input);

      const result = replaceText(input, '你好世界 🌍');

      expect(result).toBe(true);
      expect(input.value).toBe('你好世界 🌍');
    });
  });
});
