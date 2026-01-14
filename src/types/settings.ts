import { PROMPT_PRESETS } from '@/prompts';

export type AIProvider = 'openai' | 'claude';

export interface ProviderApiKeys {
  openai: string;
  claude: string;
}

export interface Settings {
  selectedProvider: AIProvider;
  apiKeys: ProviderApiKeys;
  selectedPreset: 'standard' | 'professional' | 'native' | 'simplified' | 'custom';
  customPrompt: string;
  maxCompletionTokens: number;
}

// Re-export PROMPT_PRESETS for backward compatibility
export { PROMPT_PRESETS };

export const DEFAULT_SETTINGS: Settings = {
  selectedProvider: 'openai',
  apiKeys: {
    openai: '',
    claude: '',
  },
  selectedPreset: 'standard',
  customPrompt: '',
  maxCompletionTokens: 2000,
};
