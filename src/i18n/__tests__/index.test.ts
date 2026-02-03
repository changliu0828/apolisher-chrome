import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMessage, getCurrentLocale, MessageKey } from '../index';
import { mockChromeI18n } from '@/test/mocks/chrome';

describe('i18n/index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMessage', () => {
    it('should call chrome.i18n.getMessage with key', () => {
      mockChromeI18n.getMessage.mockReturnValue('Test Message');

      const result = getMessage(MessageKey.APP_NAME);

      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, undefined);
      expect(result).toBe('Test Message');
    });

    it('should call chrome.i18n.getMessage with key and string substitution', () => {
      mockChromeI18n.getMessage.mockReturnValue('Hello, John');

      const result = getMessage(MessageKey.APP_NAME, 'John');

      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, 'John');
      expect(result).toBe('Hello, John');
    });

    it('should call chrome.i18n.getMessage with key and array substitutions', () => {
      mockChromeI18n.getMessage.mockReturnValue('Hello, John Doe');

      const result = getMessage(MessageKey.APP_NAME, ['John', 'Doe']);

      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, ['John', 'Doe']);
      expect(result).toBe('Hello, John Doe');
    });

    it('should handle message key as string', () => {
      mockChromeI18n.getMessage.mockReturnValue('Message');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getMessage('customKey' as any);

      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith('customKey', undefined);
      expect(result).toBe('Message');
    });

    it('should handle empty substitutions array', () => {
      mockChromeI18n.getMessage.mockReturnValue('Message');

      const result = getMessage(MessageKey.APP_NAME, []);

      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, []);
      expect(result).toBe('Message');
    });

    it('should work with different MessageKey enum values', () => {
      mockChromeI18n.getMessage.mockReturnValue('Polished Text');

      getMessage(MessageKey.DIFF_VIEW_ORIGINAL);
      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.DIFF_VIEW_ORIGINAL, undefined);

      mockChromeI18n.getMessage.mockReturnValue('Accept');
      getMessage(MessageKey.DIFF_VIEW_ACCEPT);
      expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.DIFF_VIEW_ACCEPT, undefined);
    });
  });

  describe('getCurrentLocale', () => {
    it('should call chrome.i18n.getUILanguage', () => {
      mockChromeI18n.getUILanguage.mockReturnValue('en');

      const result = getCurrentLocale();

      expect(mockChromeI18n.getUILanguage).toHaveBeenCalled();
      expect(result).toBe('en');
    });

    it('should return different locales', () => {
      mockChromeI18n.getUILanguage.mockReturnValue('zh-CN');
      expect(getCurrentLocale()).toBe('zh-CN');

      mockChromeI18n.getUILanguage.mockReturnValue('ja');
      expect(getCurrentLocale()).toBe('ja');

      mockChromeI18n.getUILanguage.mockReturnValue('zh-TW');
      expect(getCurrentLocale()).toBe('zh-TW');
    });

    it('should be called only once per context', () => {
      mockChromeI18n.getUILanguage.mockReturnValue('en');

      getCurrentLocale();
      getCurrentLocale();

      expect(mockChromeI18n.getUILanguage).toHaveBeenCalledTimes(2);
    });
  });
});
