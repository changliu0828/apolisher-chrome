import { useMemo } from 'react';
import { getMessage, getCurrentLocale } from './index';
import { MessageKey, type MessageKeyString } from './types';

export function useTranslation() {
  const locale = useMemo(() => getCurrentLocale(), []);

  const t = useMemo(
    () => (key: MessageKey | MessageKeyString, substitutions?: string | string[]) => {
      return getMessage(key, substitutions);
    },
    []
  );

  return { t, locale };
}
