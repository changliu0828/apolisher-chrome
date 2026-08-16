/** Invisible characters that copy/paste commonly smuggles into a pasted key */
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\u2060\uFEFF]/g;

/**
 * Anything an HTTP header value cannot carry: a code point above Latin-1, or a
 * control character. A visible character such as a stray CJK punctuation mark
 * lands here too, and is reported rather than silently removed - dropping a
 * character the user can see would hide a mis-pasted key.
 */
const ILLEGAL_HEADER_PATTERN = /[^\u0020-\u007E\u00A0-\u00FF]/;

/**
 * Strip whitespace and invisible characters from a pasted API key.
 */
export function normalizeApiKey(apiKey: string): string {
  return apiKey.replace(ZERO_WIDTH_PATTERN, '').trim();
}

/**
 * Reject a key that cannot be put in a header before fetch does it for us.
 *
 * HTTP header values are limited to ISO-8859-1, so a key carrying a CJK
 * character, a smart quote, or a zero-width space makes `fetch` throw a bare
 * TypeError with no hint that the key is at fault. Fail with a clear code
 * instead. Gemini passes the key in the query string rather than a header, but
 * the same check applies there so the diagnosis is consistent.
 */
export function assertUsableApiKey(apiKey: string): void {
  if (!ILLEGAL_HEADER_PATTERN.test(apiKey)) return;

  const error = new Error(
    'API key contains characters that cannot be sent in a request. Re-copy it from the provider console.'
  );
  error.name = 'INVALID_API_KEY';
  throw error;
}

/**
 * Turn a fetch-level TypeError into our NETWORK_ERROR.
 *
 * `fetch` throws a TypeError both for real connectivity failures ("Failed to
 * fetch") and for requests it refuses to send at all - most commonly an
 * illegal header value, which is what an API key pasted with a trailing
 * newline produces. Keep the original text in that second case, otherwise the
 * cause is invisible in the UI and in the service worker log.
 */
export function toNetworkError(error: TypeError): Error {
  const raw = error.message || '';
  const isConnectivity = /failed to fetch|networkerror|load failed/i.test(raw);
  const detail = !isConnectivity && raw ? ` (${raw})` : '';

  const networkError = new Error(`Network error. Please check your connection.${detail}`);
  networkError.name = 'NETWORK_ERROR';
  return networkError;
}
