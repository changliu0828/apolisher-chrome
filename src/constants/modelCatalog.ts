import { OPENAI_CONFIG, CLAUDE_CONFIG, GEMINI_CONFIG, type ModelOption } from '@/types/api';
import type { AIProvider } from '@/types/settings';

/**
 * The first entry of each list is that provider's default, chosen as the
 * cheapest model that still does a good job of polishing: gpt-5.6-luna
 * ($0.20/$1.20 per MTok), claude-haiku-4-5 ($1/$5), gemini-3.1-flash-lite
 * ($0.25/$1.50). Thinking overhead matters as much as the sticker price - a
 * model that spends hundreds of thinking tokens per call is not cheap.
 *
 * These lists are shown when the live list cannot be fetched (no API key yet,
 * network failure, or an API error), so the dropdown is never empty.
 */
export const FALLBACK_MODELS: Record<AIProvider, ModelOption[]> = {
  openai: [
    { id: OPENAI_CONFIG.model, label: OPENAI_CONFIG.model },
    { id: 'gpt-5.6-terra', label: 'gpt-5.6-terra' },
    { id: 'gpt-5.6-sol', label: 'gpt-5.6-sol' },
  ],
  claude: [
    { id: CLAUDE_CONFIG.model, label: 'Claude Haiku 4.5' },
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  ],
  gemini: [
    { id: GEMINI_CONFIG.model, label: 'Gemini 3.1 Flash Lite' },
    { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
};

/**
 * Default model id for a provider (used when the user has not chosen one).
 */
export function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return OPENAI_CONFIG.model;
    case 'claude':
      return CLAUDE_CONFIG.model;
    case 'gemini':
      return GEMINI_CONFIG.model;
    default:
      return OPENAI_CONFIG.model;
  }
}
