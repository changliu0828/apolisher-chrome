import {
  CLAUDE_CONFIG,
  CLAUDE_API_VERSION,
  type ClaudeRequest,
  type ClaudeResponse,
  type ClaudeError,
  type AIPolishResult,
} from '@/types/api';

const SYSTEM_PROMPT =
  'You are a professional text polishing assistant. Polish the user\'s text according to their instructions. CRITICAL RULES: 1) DO NOT change the format or structure - if input is a casual sentence, output a casual sentence; if input is a paragraph, output a paragraph; DO NOT add greetings, signatures, or restructure into emails/letters. 2) Keep the output length similar to the input. 3) Use the same language as the input text. Return ONLY the polished text, no explanations or metadata.';

/**
 * Polish text using Claude API
 * @param apiKey Claude API key
 * @param text Text to polish
 * @param promptInstruction Instructions for polishing (from preset or custom)
 * @param maxTokens Maximum completion tokens
 * @returns Polished text and usage stats
 * @throws Error with code for different error types
 */
export async function polishText(
  apiKey: string,
  text: string,
  promptInstruction: string,
  maxTokens: number
): Promise<AIPolishResult> {
  // Validate API key
  if (!apiKey || apiKey.trim().length === 0) {
    const error = new Error('NO_API_KEY');
    error.name = 'NO_API_KEY';
    throw error;
  }

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
  const requestBody: ClaudeRequest = {
    model: CLAUDE_CONFIG.model,
    max_tokens: clampedMaxTokens,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${promptInstruction}\n\nText to polish:\n${text}`,
      },
    ],
    temperature: CLAUDE_CONFIG.temperature,
  };

  // Make API call
  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(CLAUDE_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': CLAUDE_API_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
        'x-api-key': apiKey,
      },
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
      } else {
        error.name = 'API_ERROR';
      }

      throw error;
    }

    // Parse response
    const data = (await response.json()) as ClaudeResponse;
    const polishedText = data.content?.[0]?.text?.trim();

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
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.name = 'NETWORK_ERROR';
      throw networkError;
    }

    // Re-throw errors with known names
    if (
      error instanceof Error &&
      (error.name === 'NO_API_KEY' ||
        error.name === 'API_ERROR' ||
        error.name === 'NETWORK_ERROR' ||
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
