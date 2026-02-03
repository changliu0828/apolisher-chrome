import { Settings, AIProvider, ProviderApiKeys } from '@/types/settings';

export const mockApiKeys: ProviderApiKeys = {
  openai: 'sk-test-openai-key-123456789',
  claude: 'sk-ant-test-claude-key-123456789',
  gemini: 'test-gemini-key-123456789',
};

export const defaultSettings: Settings = {
  selectedProvider: 'openai',
  apiKeys: {
    openai: '',
    claude: '',
    gemini: '',
  },
  selectedPreset: 'standard',
  customPrompt: '',
  maxCompletionTokens: 2000,
};

export const settingsWithOpenAI: Settings = {
  selectedProvider: 'openai',
  apiKeys: mockApiKeys,
  selectedPreset: 'professional',
  customPrompt: '',
  maxCompletionTokens: 1500,
};

export const settingsWithClaude: Settings = {
  selectedProvider: 'claude',
  apiKeys: mockApiKeys,
  selectedPreset: 'native',
  customPrompt: '',
  maxCompletionTokens: 2500,
};

export const settingsWithGemini: Settings = {
  selectedProvider: 'gemini',
  apiKeys: mockApiKeys,
  selectedPreset: 'simplified',
  customPrompt: '',
  maxCompletionTokens: 3000,
};

export const settingsWithCustomPrompt: Settings = {
  selectedProvider: 'openai',
  apiKeys: mockApiKeys,
  selectedPreset: 'custom',
  customPrompt: 'Make the text more formal and professional.',
  maxCompletionTokens: 2000,
};

export const settingsWithEmotionalIntelligence: Settings = {
  selectedProvider: 'openai',
  apiKeys: mockApiKeys,
  selectedPreset: 'emotionalIntelligence',
  customPrompt: '',
  maxCompletionTokens: 2000,
};

export function createMockSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    ...defaultSettings,
    ...overrides,
  };
}

export function createMockProvider(provider: AIProvider): Settings {
  return {
    ...defaultSettings,
    selectedProvider: provider,
    apiKeys: mockApiKeys,
  };
}
