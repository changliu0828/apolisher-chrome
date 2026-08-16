import { PROMPT_PRESETS } from '@/prompts';

export type AIProvider = 'openai' | 'claude' | 'gemini';

export interface ProviderApiKeys {
  openai: string;
  claude: string;
  gemini: string;
}

/**
 * Selected model id per provider.
 * An empty string means "use the provider's default model".
 */
export interface ProviderModels {
  openai: string;
  claude: string;
  gemini: string;
}

export interface Settings {
  selectedProvider: AIProvider;
  apiKeys: ProviderApiKeys;
  /** Optional: settings stored before v1.0 do not have this field. */
  models?: ProviderModels;
  selectedPreset: 'standard' | 'professional' | 'native' | 'simplified' | 'emotionalIntelligence' | 'custom';
  customPrompt: string;
  maxCompletionTokens: number;
  isEnabled: boolean;
}

// Re-export PROMPT_PRESETS for backward compatibility
export { PROMPT_PRESETS };

export const DEFAULT_SETTINGS: Settings = {
  selectedProvider: 'openai',
  apiKeys: {
    openai: '',
    claude: '',
    gemini: '',
  },
  models: {
    openai: '',
    claude: '',
    gemini: '',
  },
  selectedPreset: 'standard',
  customPrompt: '',
  maxCompletionTokens: 2000,
  isEnabled: true,
};
