import type { AIProvider } from '@/types/settings';
import type { AIPolishResult, ModelOption } from '@/types/api';
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
  maxTokens: number,
  model?: string
): Promise<AIPolishResult> {
  switch (provider) {
    case 'openai':
      return openaiService.polishText(apiKey, text, promptInstruction, maxTokens, model);
    case 'claude':
      return claudeService.polishText(apiKey, text, promptInstruction, maxTokens, model);
    case 'gemini':
      return geminiService.polishText(apiKey, text, promptInstruction, maxTokens, model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Route list-models request to appropriate provider
 */
export async function listModelsForProvider(
  provider: AIProvider,
  apiKey: string
): Promise<ModelOption[]> {
  switch (provider) {
    case 'openai':
      return openaiService.listModels(apiKey);
    case 'claude':
      return claudeService.listModels(apiKey);
    case 'gemini':
      return geminiService.listModels(apiKey);
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
