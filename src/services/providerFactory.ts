import type { AIProvider } from '@/types/settings';
import type { AIPolishResult } from '@/types/api';
import * as openaiService from './openai';
import * as claudeService from './claude';
import * as geminiService from './gemini';

/**
 * Route polishing request to appropriate provider
 */
export async function polishTextWithProvider(
  provider: AIProvider,
  apiKey: string,
  text: string,
  promptInstruction: string,
  maxTokens: number
): Promise<AIPolishResult> {
  switch (provider) {
    case 'openai':
      return openaiService.polishText(apiKey, text, promptInstruction, maxTokens);
    case 'claude':
      return claudeService.polishText(apiKey, text, promptInstruction, maxTokens);
    case 'gemini':
      return geminiService.polishText(apiKey, text, promptInstruction, maxTokens);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'claude':
      return 'Claude';
    case 'gemini':
      return 'Gemini';
    default:
      return provider;
  }
}
