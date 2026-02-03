import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTranslation } from '../useTranslation';
import { MessageKey } from '../types';
import { mockChromeI18n } from '@/test/mocks/chrome';

describe('i18n/useTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChromeI18n.getUILanguage.mockReturnValue('en');
  });

  it('should return t function and locale', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.t).toBeInstanceOf(Function);
    expect(result.current.locale).toBe('en');
  });

  it('should get current locale on mount', () => {
    mockChromeI18n.getUILanguage.mockReturnValue('zh-CN');

    const { result } = renderHook(() => useTranslation());

    expect(result.current.locale).toBe('zh-CN');
    expect(mockChromeI18n.getUILanguage).toHaveBeenCalled();
  });

  it('should translate message with t function', () => {
    mockChromeI18n.getMessage.mockReturnValue('Test Message');

    const { result } = renderHook(() => useTranslation());
    const message = result.current.t(MessageKey.APP_NAME);

    expect(message).toBe('Test Message');
    expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, undefined);
  });

  it('should translate message with substitutions', () => {
    mockChromeI18n.getMessage.mockReturnValue('Hello, John');

    const { result } = renderHook(() => useTranslation());
    const message = result.current.t(MessageKey.APP_NAME, 'John');

    expect(message).toBe('Hello, John');
    expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, 'John');
  });

  it('should translate message with array substitutions', () => {
    mockChromeI18n.getMessage.mockReturnValue('Hello, John Doe');

    const { result } = renderHook(() => useTranslation());
    const message = result.current.t(MessageKey.APP_NAME, ['John', 'Doe']);

    expect(message).toBe('Hello, John Doe');
    expect(mockChromeI18n.getMessage).toHaveBeenCalledWith(MessageKey.APP_NAME, ['John', 'Doe']);
  });

  it('should memoize t function', () => {
    const { result, rerender } = renderHook(() => useTranslation());
    const firstT = result.current.t;

    rerender();

    const secondT = result.current.t;
    expect(firstT).toBe(secondT);
  });

  it('should memoize locale', () => {
    mockChromeI18n.getUILanguage.mockReturnValue('en');

    const { result, rerender } = renderHook(() => useTranslation());
    const firstLocale = result.current.locale;

    rerender();

    const secondLocale = result.current.locale;
    expect(firstLocale).toBe(secondLocale);
    expect(mockChromeI18n.getUILanguage).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple translations in sequence', () => {
    mockChromeI18n.getMessage
      .mockReturnValueOnce('Message 1')
      .mockReturnValueOnce('Message 2')
      .mockReturnValueOnce('Message 3');

    const { result } = renderHook(() => useTranslation());

    expect(result.current.t(MessageKey.APP_NAME)).toBe('Message 1');
    expect(result.current.t(MessageKey.DIFF_VIEW_ORIGINAL)).toBe('Message 2');
    expect(result.current.t(MessageKey.DIFF_VIEW_POLISHED)).toBe('Message 3');

    expect(mockChromeI18n.getMessage).toHaveBeenCalledTimes(3);
  });

  it('should work with different locales', () => {
    mockChromeI18n.getUILanguage.mockReturnValue('ja');
    mockChromeI18n.getMessage.mockReturnValue('日本語メッセージ');

    const { result } = renderHook(() => useTranslation());

    expect(result.current.locale).toBe('ja');
    expect(result.current.t(MessageKey.APP_NAME)).toBe('日本語メッセージ');
  });

  it('should handle message key as string', () => {
    mockChromeI18n.getMessage.mockReturnValue('Custom Message');

    const { result } = renderHook(() => useTranslation());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = result.current.t('customKey' as any);

    expect(message).toBe('Custom Message');
    expect(mockChromeI18n.getMessage).toHaveBeenCalledWith('customKey', undefined);
  });
});
