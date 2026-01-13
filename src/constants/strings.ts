/**
 * User-facing strings for the extension
 * Centralized for easy translation/i18n in the future
 */

export const BRAND = {
  NAME: 'Apolisher',
  SLOGAN: 'A polish for your text with AI',
} as const;

export const MODAL = {
  LOADING_TEXT: 'Polishing text...',
  ACCEPT_LABEL: 'Accept',
  REGENERATE_LABEL: 'Regenerate',
  CLOSE_LABEL: 'Close',
  RETRY_LABEL: 'Retry',
  SETTINGS_LABEL: 'Open Settings',
} as const;

export const ERRORS = {
  API_KEY_MISSING: 'API key not configured. Please set your OpenAI API key in the extension settings.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  API_ERROR: 'Failed to polish text. Please try again.',
} as const;
