export interface Settings {
  apiKey: string;
  selectedPreset: 'standard' | 'professional' | 'native' | 'simplified' | 'custom';
  customPrompt: string;
}

export const PROMPT_PRESETS = {
  standard: 'Fix grammar and flow.',
  professional: 'Make it formal and concise.',
  native: 'Rewrite to sound like a native speaker.',
  simplified: 'Make it easy to understand.',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  selectedPreset: 'standard',
  customPrompt: '',
};
