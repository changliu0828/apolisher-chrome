import { MessageKey, type MessageKeyString } from './types';

export function getMessage(
  key: MessageKey | MessageKeyString,
  substitutions?: string | string[]
): string {
  return chrome.i18n.getMessage(key, substitutions);
}

export function getCurrentLocale(): string {
  return chrome.i18n.getUILanguage();
}

export { MessageKey };
