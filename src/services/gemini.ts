import {
  GEMINI_CONFIG,
  type GeminiRequest,
  type GeminiResponse,
  type GeminiCandidate,
  type GeminiError,
  type GeminiModelsResponse,
  type AIPolishResult,
  type ModelOption,
} from '@/types/api';
import { assertUsableApiKey, normalizeApiKey, toNetworkError } from './errors';

const SYSTEM_PROMPT =
  'You are a professional text polishing assistant. Polish the user\'s text according to their instructions. CRITICAL RULES: 1) DO NOT change the format or structure - if input is a casual sentence, output a casual sentence; if input is a paragraph, output a paragraph; DO NOT add greetings, signatures, or restructure into emails/letters. 2) Keep the output length similar to the input. 3) Use the same language as the input text. Return ONLY the polished text, no explanations or metadata.';

/**
 * Many Gemini models accept generateContent without being useful for text
 * polishing - image generation (Nano Banana), TTS, robotics, computer use,
 * deep research, music (Lyria), and the open Gemma weights all show up in the
 * same list. Narrow it to the Gemini text models.
 */
const NON_TEXT_MODEL_PATTERN =
  /-tts|image|robotics|computer-use|deep-research|omni|antigravity|lyria|veo|embedding|aqa|learnlm|live|native-audio|nano-banana|customtools/;

export function isTextModelId(id: string): boolean {
  const lower = id.toLowerCase();
  if (!lower.startsWith('gemini-')) return false;
  return !NON_TEXT_MODEL_PATTERN.test(lower);
}

/**
 * Drop a `-preview` model when its stable counterpart is also listed, so the
 * dropdown does not show the same model twice.
 */
export function dropSupersededPreviews(ids: string[]): string[] {
  const stable = new Set(ids.filter((id) => !id.includes('-preview')));
  return ids.filter((id) => {
    if (!id.includes('-preview')) return true;
    const base = id.replace(/-preview(-\d{2}-\d{4}|-\d{4})?$/, '').replace(/-preview-/, '-');
    return !stable.has(base);
  });
}

/**
 * Pull the answer out of a candidate.
 *
 * Gemini 3.x models think by default and spend `thoughtsTokenCount` from the
 * same output budget; a part can carry only a thought signature and no text,
 * so pick the first part that actually has text instead of position 0.
 */
export function extractText(candidate: GeminiCandidate | undefined): string | undefined {
  return candidate?.content?.parts?.find((part) => part?.text)?.text?.trim();
}

/** Page size for the list-models endpoint */
const MODELS_PAGE_SIZE = 200;
/** Safety net so a broken nextPageToken can never loop forever */
const MODELS_MAX_PAGES = 10;

/**
 * List the models available to this API key that support generateContent
 * @param apiKey Gemini API key
 * @returns Selectable models
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
    const collected: ModelOption[] = [];
    let pageToken: string | undefined;

    for (let page = 0; page < MODELS_MAX_PAGES; page++) {
      // eslint-disable-next-line no-undef
      const url = new URL(GEMINI_CONFIG.apiUrl);
      url.searchParams.set('key', normalizeApiKey(apiKey));
      url.searchParams.set('pageSize', String(MODELS_PAGE_SIZE));
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      // eslint-disable-next-line no-undef
      const response = await fetch(url.toString(), { method: 'GET' });

      if (!response.ok) {
        let errorData: GeminiError | undefined;
        try {
          errorData = (await response.json()) as GeminiError;
        } catch {
          // Failed to parse error response
        }

        const errorMessage =
          errorData?.error?.message || response.statusText || 'Unknown API error';
        const error = new Error(errorMessage);
        error.name =
          errorData?.error?.status === 'UNAUTHENTICATED' ||
          errorData?.error?.status === 'PERMISSION_DENIED' ||
          errorData?.error?.status === 'INVALID_ARGUMENT'
            ? 'NO_API_KEY'
            : 'API_ERROR';
        throw error;
      }

      const data = (await response.json()) as GeminiModelsResponse;

      if (!Array.isArray(data.models)) {
        const error = new Error('Invalid response from API: no model list returned');
        error.name = 'INVALID_RESPONSE';
        throw error;
      }

      for (const entry of data.models) {
        if (!entry?.name) continue;
        if (!entry.supportedGenerationMethods?.includes('generateContent')) continue;
        const id = entry.name.replace(/^models\//, '');
        if (!isTextModelId(id)) continue;
        collected.push({ id, label: entry.displayName || id });
      }

      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }

    const keep = new Set(dropSupersededPreviews(collected.map((model) => model.id)));
    return collected.filter((model) => keep.has(model.id));
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
 * Polish text using Gemini API
 * @param apiKey Gemini API key
 * @param text Text to polish
 * @param promptInstruction Instructions for polishing (from preset or custom)
 * @param maxTokens Maximum output tokens
 * @param model Model id to use (defaults to the provider's default model)
 * @returns Polished text and usage stats
 * @throws Error with code for different error types
 */
export async function polishText(
  apiKey: string,
  text: string,
  promptInstruction: string,
  maxTokens: number,
  model: string = GEMINI_CONFIG.model
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
  if (text.length > GEMINI_CONFIG.maxTextLength) {
    const error = new Error(
      `Text too long. Maximum ${GEMINI_CONFIG.maxTextLength} characters allowed.`
    );
    error.name = 'INVALID_INPUT';
    throw error;
  }

  // Clamp maxTokens to valid range
  const clampedMaxTokens = Math.max(
    GEMINI_CONFIG.minMaxTokens,
    Math.min(GEMINI_CONFIG.maxMaxTokens, maxTokens)
  );

  // Construct request body (Gemini format)
  const requestBody: GeminiRequest = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${promptInstruction}\n\nText to polish:\n${text}`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      maxOutputTokens: clampedMaxTokens,
    },
  };

  // Construct full URL with model and API key
  const fullUrl = `${GEMINI_CONFIG.apiUrl}/${model || GEMINI_CONFIG.model}:generateContent?key=${normalizeApiKey(apiKey)}`;

  // Make API call
  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: GeminiError | undefined;
      try {
        errorData = (await response.json()) as GeminiError;
      } catch {
        // Failed to parse error response
      }

      const errorMessage =
        errorData?.error?.message || response.statusText || 'Unknown API error';
      const error = new Error(errorMessage);

      // Map Gemini error statuses to our error codes
      if (
        errorData?.error?.status === 'UNAUTHENTICATED' ||
        errorData?.error?.status === 'PERMISSION_DENIED'
      ) {
        error.name = 'NO_API_KEY';
      } else if (errorData?.error?.status === 'RESOURCE_EXHAUSTED') {
        error.name = 'API_ERROR';
      } else if (errorData?.error?.status === 'NOT_FOUND') {
        // Gemini puts the model id in the URL path, so NOT_FOUND means the
        // selected model does not exist or is not available to this key.
        error.name = 'INVALID_MODEL';
      } else {
        error.name = 'API_ERROR';
      }

      throw error;
    }

    // Parse response
    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const polishedText = extractText(candidate);

    // Validate response structure
    if (!polishedText) {
      const truncated = candidate?.finishReason === 'MAX_TOKENS';
      const error = new Error(
        truncated
          ? 'The response was cut off before any text was produced. Raise Max Completion Tokens or pick a smaller model.'
          : 'Invalid response from API: no content returned'
      );
      error.name = 'INVALID_RESPONSE';
      throw error;
    }

    return {
      polishedText,
      usage: data.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount,
            outputTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
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
