import {
  CLAUDE_CONFIG,
  CLAUDE_API_VERSION,
  CLAUDE_MODELS_URL,
  type ClaudeRequest,
  type ClaudeResponse,
  type ClaudeError,
  type ClaudeModelsResponse,
  type AIPolishResult,
  type ModelOption,
} from '@/types/api';
import { assertUsableApiKey, normalizeApiKey, toNetworkError } from './errors';

const SYSTEM_PROMPT =
  'You are a professional text polishing assistant. Polish the user\'s text according to their instructions. CRITICAL RULES: 1) DO NOT change the format or structure - if input is a casual sentence, output a casual sentence; if input is a paragraph, output a paragraph; DO NOT add greetings, signatures, or restructure into emails/letters. 2) Keep the output length similar to the input. 3) Use the same language as the input text. Return ONLY the polished text, no explanations or metadata.';

/** Page size for the list-models endpoint (max 1000, 20 by default) */
const MODELS_PAGE_LIMIT = 100;
/** Safety net so a broken has_more can never loop forever */
const MODELS_MAX_PAGES = 10;

/**
 * Pull the assistant's text out of a response.
 *
 * Thinking is on by default on the newest models, so `content[0]` is a
 * `thinking` block and the text sits after it - indexing position 0 returns
 * undefined and looks like an empty response.
 */
export function extractText(content: ClaudeResponse['content'] | undefined): string | undefined {
  return content?.find((block) => block?.type === 'text' && block.text)?.text?.trim();
}

function claudeHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': CLAUDE_API_VERSION,
    'anthropic-dangerous-direct-browser-access': 'true',
    'x-api-key': normalizeApiKey(apiKey),
  };
}

/**
 * List the models available to this API key
 * @param apiKey Claude API key
 * @returns Selectable models, in the order the API returns them (newest first)
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
    let afterId: string | undefined;

    for (let page = 0; page < MODELS_MAX_PAGES; page++) {
      // eslint-disable-next-line no-undef
      const url = new URL(CLAUDE_MODELS_URL);
      url.searchParams.set('limit', String(MODELS_PAGE_LIMIT));
      if (afterId) {
        url.searchParams.set('after_id', afterId);
      }

      // eslint-disable-next-line no-undef
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: claudeHeaders(apiKey),
      });

      if (!response.ok) {
        let errorData: ClaudeError | undefined;
        try {
          errorData = (await response.json()) as ClaudeError;
        } catch {
          // Failed to parse error response
        }

        const errorMessage =
          errorData?.error?.message || response.statusText || 'Unknown API error';
        const error = new Error(errorMessage);
        error.name = errorData?.error?.type === 'authentication_error' ? 'NO_API_KEY' : 'API_ERROR';
        throw error;
      }

      const data = (await response.json()) as ClaudeModelsResponse;

      if (!Array.isArray(data.data)) {
        const error = new Error('Invalid response from API: no model list returned');
        error.name = 'INVALID_RESPONSE';
        throw error;
      }

      for (const entry of data.data) {
        if (entry?.id) {
          collected.push({ id: entry.id, label: entry.display_name || entry.id });
        }
      }

      if (!data.has_more || !data.last_id) break;
      afterId = data.last_id;
    }

    return collected;
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
 * Polish text using Claude API
 * @param apiKey Claude API key
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
  model: string = CLAUDE_CONFIG.model
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
  if (text.length > CLAUDE_CONFIG.maxTextLength) {
    const error = new Error(
      `Text too long. Maximum ${CLAUDE_CONFIG.maxTextLength} characters allowed.`
    );
    error.name = 'INVALID_INPUT';
    throw error;
  }

  // Clamp maxTokens to valid range
  const clampedMaxTokens = Math.max(
    CLAUDE_CONFIG.minMaxTokens,
    Math.min(CLAUDE_CONFIG.maxMaxTokens, maxTokens)
  );

  // Construct request body (Claude format)
  const selectedModel = model || CLAUDE_CONFIG.model;
  const requestBody: ClaudeRequest = {
    model: selectedModel,
    max_tokens: clampedMaxTokens,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${promptInstruction}\n\nText to polish:\n${text}`,
      },
    ],
  };

  // Make API call
  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(CLAUDE_CONFIG.apiUrl, {
      method: 'POST',
      headers: claudeHeaders(apiKey),
      body: JSON.stringify(requestBody),
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: ClaudeError | undefined;
      try {
        errorData = (await response.json()) as ClaudeError;
      } catch {
        // Failed to parse error response
      }

      const errorMessage = errorData?.error?.message || response.statusText || 'Unknown API error';
      const error = new Error(errorMessage);

      // Map Claude error types to our error codes
      if (errorData?.error?.type === 'authentication_error') {
        error.name = 'NO_API_KEY';
      } else if (errorData?.error?.type === 'rate_limit_error') {
        error.name = 'API_ERROR';
      } else if (errorData?.error?.type === 'not_found_error') {
        // An unknown or unavailable model id is the only thing that 404s here.
        // Do not sniff invalid_request_error messages for the word "model" -
        // unrelated failures such as "`temperature` is deprecated for this
        // model" would be misreported as a bad model choice.
        error.name = 'INVALID_MODEL';
      } else {
        error.name = 'API_ERROR';
      }

      throw error;
    }

    // Parse response
    const data = (await response.json()) as ClaudeResponse;
    const polishedText = extractText(data.content);

    // Validate response structure
    if (!polishedText) {
      const truncated = data.stop_reason === 'max_tokens';
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
      usage: data.usage
        ? {
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
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
