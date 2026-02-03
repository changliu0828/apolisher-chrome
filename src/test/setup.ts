import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockChromeStorage, mockChromeRuntime, mockChromeI18n } from './mocks/chrome';

// Setup Chrome API mocks globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).chrome = {
  storage: mockChromeStorage,
  runtime: mockChromeRuntime,
  i18n: mockChromeI18n,
};

// Mock console methods to reduce noise in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
