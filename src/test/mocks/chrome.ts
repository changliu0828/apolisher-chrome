import { vi } from 'vitest';

// Mock chrome.storage.sync
export const mockChromeStorage = {
  sync: {
    get: vi.fn((keys, callback) => {
      const result = {};
      if (callback) {
        callback(result);
      }
      return Promise.resolve(result);
    }),
    set: vi.fn((items, callback) => {
      if (callback) {
        callback();
      }
      return Promise.resolve();
    }),
    remove: vi.fn((keys, callback) => {
      if (callback) {
        callback();
      }
      return Promise.resolve();
    }),
    clear: vi.fn((callback) => {
      if (callback) {
        callback();
      }
      return Promise.resolve();
    }),
  },
  local: {
    get: vi.fn((keys, callback) => {
      const result = {};
      if (callback) {
        callback(result);
      }
      return Promise.resolve(result);
    }),
    set: vi.fn((items, callback) => {
      if (callback) {
        callback();
      }
      return Promise.resolve();
    }),
  },
};

// Mock chrome.runtime
export const mockChromeRuntime = {
  getURL: vi.fn((path: string) => `chrome-extension://mock-extension-id/${path}`),
  sendMessage: vi.fn((message, callback) => {
    if (callback) {
      callback({ success: true });
    }
    return Promise.resolve({ success: true });
  }),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  lastError: undefined,
};

// Mock chrome.i18n
export const mockChromeI18n = {
  getMessage: vi.fn((key: string, substitutions?: string | string[]) => {
    // Return the key as the message for testing
    if (substitutions) {
      return `${key}_with_substitutions`;
    }
    return key;
  }),
  getUILanguage: vi.fn(() => 'en'),
  getAcceptLanguages: vi.fn((callback) => {
    callback(['en', 'zh-CN']);
  }),
};

// Helper to reset all mocks
export function resetChromeMocks() {
  vi.clearAllMocks();
}
