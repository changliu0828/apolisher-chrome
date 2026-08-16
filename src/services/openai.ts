import {
  OPENAI_CONFIG,
  OPENAI_MODELS_URL,
  type OpenAIRequest,
  type OpenAIResponse,
  type OpenAIError,
  type OpenAIModelsResponse,
  type AIPolishResult,
  type ModelOption,
} from '@/types/api';
import { assertUsableApiKey, normalizeApiKey, toNetworkError } from './errors';

const SYSTEM_PROMPT =
  'You are a professional text polishing assistant. Polish the user\'s text according to their instructions. CRITICAL RULES: 1) DO NOT change the format or structure - if input is a casual sentence, output a casual sentence; if input is a paragraph, output a paragraph; DO NOT add greetings, signatures, or restructure into emails/letters. 2) Keep the output length similar to the input. 3) Use the same language as the input text. Return ONLY the polished text, no explanations or metadata.';

/**
 * OpenAI's list endpoint returns every model the account can see (135+ on a
 * typical account) with no capability metadata, so the list is narrowed by
 * naming convention to the models that suit one-shot text polishing.
 */

/** Cannot do chat completions at all */
const NON_CHAT_PATTERN =
  /embedding|whisper|tts|dall-e|moderation|audio|realtime|transcribe|image|instruct|similarity|davinci|babbage|ada|curie|live|cyber|daybreak/;

/** Chat-capable, but a poor fit here: coding agents, research loops, slow reasoning tiers */
const NOT_FOR_POLISH_PATTERN = /codex|deep-research|search|-pro$|-pro-/;

/** A pinned snapshot of an alias that is already in the list */
const DATED_SNAPSHOT_PATTERN = /-\d{4}-\d{2}-\d{2}$/;

/** Superseded families and fine-tunes */
const LEGACY_PATTERN = /^gpt-3\.5|^gpt-4($|-)|^o\d|^ft:/;

/** Only models released within this window of the newest one are offered */
export const MODEL_RECENCY_WINDOW_SECONDS = 180 * 24 * 60 * 60;

export function isChatModelId(id: string): boolean {
  const lower = id.toLowerCase();
  if (NON_CHAT_PATTERN.test(lower)) return false;
  if (NOT_FOR_POLISH_PATTERN.test(lower)) return false;
  if (DATED_SNAPSHOT_PATTERN.test(lower)) return false;
  if (LEGACY_PATTERN.test(lower)) return false;
  return lower.startsWith('gpt-') || lower.startsWith('chatgpt-');
}

/**
 * Narrow a raw list to the models worth offering: chat-capable, suited to
 * polishing, and from roughly the last year of releases (so new models appear
 * on their own and superseded ones drop off without a code change).
 */
export function selectPolishModels(
  entries: OpenAIModelsResponse['data']
): OpenAIModelsResponse['data'] {
  const candidates = entries.filter((entry) => entry?.id && isChatModelId(entry.id));
  if (candidates.length === 0) return [];

  const newest = Math.max(...candidates.map((entry) => entry.created ?? 0));
  const cutoff = newest - MODEL_RECENCY_WINDOW_SECONDS;

  return candidates
    .filter((entry) => (entry.created ?? 0) >= cutoff)
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
}

function isInvalidModelError(errorData?: OpenAIError): boolean {
  if (!errorData?.error) return false;
  // Keyed off the machine-readable fields only. Matching the message for the
  // word "model" also catches unrelated failures such as "temperature does not
  // support 0.7 with this model".
  return errorData.error.code === 'model_not_found' || errorData.error.param === 'model';
}

/**
 * List the chat models available to this API key
 * @param apiKey OpenAI API key
 * @returns Selectable models, newest first
 * @throws Error with code for different error types
 */
export async function listModels(apiKey: string): Promise<ModelOption[]> {
  if (!apiKey || normalizeApiKey(apiKey).length === 0) {
    const error = new Error('NO_API_KEY');
    error.name = 'NO_API_KEY';
    throw error;
  }
  assertUsableApiKey(apiKey);

  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(OPENAI_MODELS_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${normalizeApiKey(apiKey)}`,
      },
    });

    if (!response.ok) {
      let errorData: OpenAIError | undefined;
      try {
        errorData = (await response.json()) as OpenAIError;
      } catch {
        // Failed to parse error response
      }

      const errorMessage = errorData?.error?.message || response.statusText || 'Unknown API error';
      const error = new Error(errorMessage);
      error.name = response.status === 401 ? 'NO_API_KEY' : 'API_ERROR';
      throw error;
    }

    const data = (await response.json()) as OpenAIModelsResponse;
    const models = data.data;

    if (!Array.isArray(models)) {
      const error = new Error('Invalid response from API: no model list returned');
      error.name = 'INVALID_RESPONSE';
      throw error;
    }

    return selectPolishModels(models).map((entry) => ({ id: entry.id, label: entry.id }));
  } catch (error) {
    if (error instanceof TypeError) {
      throw toNetworkError(error);
    }

    if (
      error instanceof Error &&
      (error.name === 'NO_API_KEY' ||
        error.name === 'INVALID_API_KEY' ||
        error.name === 'API_ERROR' ||
        error.name === 'NETWORK_ERROR' ||
        error.name === 'INVALID_RESPONSE')
    ) {
      throw error;
    }

    const unknownError = new Error(`Unexpected error: ${error}`);
    unknownError.name = 'API_ERROR';
    throw unknownError;
  }
}

/**
 * Polish text using OpenAI API
 * @param apiKey OpenAI API key
 * @param text Text to polish
 * @param promptInstruction Instructions for polishing (from preset or custom)
 * @param maxTokens Maximum completion tokens
 * @param model Model id to use (defaults to the provider's default model)
 * @returns Polished text and usage stats
 * @throws Error with code for different error types
 */
export async function polishText(
  apiKey: string,
  text: string,
  promptInstruction: string,
  maxTokens: number,
  model: string = OPENAI_CONFIG.model
): Promise<AIPolishResult> {
  // Validate API key
  if (!apiKey || normalizeApiKey(apiKey).length === 0) {
    const error = new Error('NO_API_KEY');
    error.name = 'NO_API_KEY';
    throw error;
  }
  assertUsableApiKey(apiKey);

  // Validate text
  if (!text || text.trim().length === 0) {
    const error = new Error('Empty text provided');
    error.name = 'INVALID_INPUT';
    throw error;
  }

  // Validate text length
  if (text.length > OPENAI_CONFIG.maxTextLength) {
    const error = new Error(
      `Text too long. Maximum ${OPENAI_CONFIG.maxTextLength} characters allowed.`
    );
    error.name = 'INVALID_INPUT';
    throw error;
  }

  // Clamp maxTokens to valid range
  const clampedMaxTokens = Math.max(
    OPENAI_CONFIG.minMaxTokens,
    Math.min(OPENAI_CONFIG.maxMaxTokens, maxTokens)
  );

  // Construct request body
  const selectedModel = model || OPENAI_CONFIG.model;
  const requestBody: OpenAIRequest = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `${promptInstruction}\n\nText to polish:\n${text}`,
      },
    ],
    max_completion_tokens: clampedMaxTokens,
  };

  // Make API call
  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(OPENAI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalizeApiKey(apiKey)}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: OpenAIError | undefined;
      try {
        errorData = (await response.json()) as OpenAIError;
      } catch {
        // Failed to parse error response
      }

      const errorMessage = errorData?.error?.message || response.statusText || 'Unknown API error';
      const error = new Error(errorMessage);
      error.name = isInvalidModelError(errorData) ? 'INVALID_MODEL' : 'API_ERROR';
      throw error;
    }

    // Parse response
    const data = (await response.json()) as OpenAIResponse;
    const polishedText = data.choices?.[0]?.message?.content?.trim();

    // Validate response structure
    if (!polishedText) {
      const error = new Error('Invalid response from API: no content returned');
      error.name = 'INVALID_RESPONSE';
      throw error;
    }

    return {
      polishedText,
      usage: data.usage
        ? {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      throw toNetworkError(error);
    }

    // Re-throw errors with known names
    if (
      error instanceof Error &&
      (error.name === 'NO_API_KEY' ||
        error.name === 'INVALID_API_KEY' ||
        error.name === 'API_ERROR' ||
        error.name === 'NETWORK_ERROR' ||
        error.name === 'INVALID_MODEL' ||
        error.name === 'INVALID_RESPONSE')
    ) {
      throw error;
    }

    // Unknown error
    const unknownError = new Error(`Unexpected error: ${error}`);
    unknownError.name = 'API_ERROR';
    throw unknownError;
  }
}
