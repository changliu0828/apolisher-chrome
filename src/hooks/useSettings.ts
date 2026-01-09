import { useChromeStorageSync } from 'use-chrome-storage';
import { DEFAULT_SETTINGS, type Settings } from '@/types/settings';

export function useSettings() {
  const [settings, setSettings, isPersistent, error] =
    useChromeStorageSync<Settings>('settings', DEFAULT_SETTINGS);

  return {
    settings,
    setSettings,
    isPersistent,
    error,
    updateApiKey: (apiKey: string) => setSettings({ ...settings, apiKey }),
    updatePreset: (preset: Settings['selectedPreset']) =>
      setSettings({ ...settings, selectedPreset: preset }),
    updateCustomPrompt: (customPrompt: string) =>
      setSettings({ ...settings, customPrompt }),
    updateMaxCompletionTokens: (maxCompletionTokens: number) =>
      setSettings({ ...settings, maxCompletionTokens }),
  };
}
