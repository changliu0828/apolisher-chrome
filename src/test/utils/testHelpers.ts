/* eslint-disable no-undef */
import { vi } from 'vitest';

/**
 * Mock a successful fetch response
 */
export function mockFetchSuccess<T>(data: T, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  });
}

/**
 * Mock a failed fetch response
 */
export function mockFetchError(status: number, message: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: { message } }),
    text: async () => JSON.stringify({ error: { message } }),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  });
}

/**
 * Mock a network error (no response)
 */
export function mockFetchNetworkError(message = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message));
}

/**
 * Create a mock DOM element for testing
 */
export function createMockElement(
  tag: string,
  attributes: Record<string, string> = {},
  content = ''
): HTMLElement {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  if (content) {
    element.textContent = content;
  }
  return element;
}

/**
 * Create a mock text selection
 */
export function createMockSelection(
  text: string,
  anchorNode: Node,
  anchorOffset = 0,
  focusNode: Node | null = null,
  focusOffset = 0
): Selection {
  const selection = {
    toString: () => text,
    anchorNode,
    anchorOffset,
    focusNode: focusNode || anchorNode,
    focusOffset: focusOffset || text.length,
    rangeCount: 1,
    getRangeAt: () => ({
      getBoundingClientRect: () => ({
        top: 100,
        left: 100,
        bottom: 120,
        right: 200,
        width: 100,
        height: 20,
        x: 100,
        y: 100,
      }),
      getClientRects: () => [
        {
          top: 100,
          left: 100,
          bottom: 120,
          right: 200,
          width: 100,
          height: 20,
          x: 100,
          y: 100,
        },
      ],
    }),
  } as unknown as Selection;
  return selection;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
