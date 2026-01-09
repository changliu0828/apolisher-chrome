import { PROMPT_PRESETS } from '@/prompts';

export interface Settings {
  apiKey: string;
  selectedPreset: 'standard' | 'professional' | 'native' | 'simplified' | 'custom';
  customPrompt: string;
  maxCompletionTokens: number;
}

// Re-export PROMPT_PRESETS for backward compatibility
export { PROMPT_PRESETS };

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  selectedPreset: 'standard',
  customPrompt: '',
  maxCompletionTokens: 2000,
};
