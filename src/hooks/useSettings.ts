import { useChromeStorageSync } from 'use-chrome-storage';
import { DEFAULT_SETTINGS, type Settings, type AIProvider } from '@/types/settings';
import { normalizeApiKey } from '@/services/errors';

export function useSettings() {
  const [settings, setSettings, isPersistent, error] =
    useChromeStorageSync<Settings>('settings', DEFAULT_SETTINGS);

  return {
    settings,
    setSettings,
    isPersistent,
    error,
    updateProvider: (provider: AIProvider) =>
      setSettings({ ...settings, selectedProvider: provider }),
    // Normalized on the way in: a pasted key with surrounding whitespace or an
    // invisible zero-width character makes an illegal HTTP header value, which
    // fetch rejects before the request is ever sent.
    updateApiKey: (apiKey: string) =>
      setSettings({
        ...settings,
        apiKeys: {
          ...settings.apiKeys,
          [settings.selectedProvider]: normalizeApiKey(apiKey),
        },
      }),
    updateModel: (model: string) =>
      setSettings({
        ...settings,
        models: {
          ...DEFAULT_SETTINGS.models,
          ...settings.models,
          [settings.selectedProvider]: model,
        } as Settings['models'],
      }),
    updatePreset: (preset: Settings['selectedPreset']) =>
      setSettings({ ...settings, selectedPreset: preset }),
    updateCustomPrompt: (customPrompt: string) =>
      setSettings({ ...settings, customPrompt }),
    updateMaxCompletionTokens: (maxCompletionTokens: number) =>
      setSettings({ ...settings, maxCompletionTokens }),
    updateIsEnabled: (isEnabled: boolean) =>
      setSettings({ ...settings, isEnabled }),
  };
}
