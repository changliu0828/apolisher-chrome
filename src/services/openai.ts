import {
  OPENAI_CONFIG,
  type OpenAIRequest,
  type OpenAIResponse,
  type OpenAIError,
} from '@/types/api';

const SYSTEM_PROMPT =
  'You are a professional text polishing assistant. Polish the user\'s text according to their instructions. CRITICAL RULES: 1) DO NOT change the format or structure - if input is a casual sentence, output a casual sentence; if input is a paragraph, output a paragraph; DO NOT add greetings, signatures, or restructure into emails/letters. 2) Keep the output length similar to the input. 3) Use the same language as the input text. Return ONLY the polished text, no explanations or metadata.';

/**
 * Polish text using OpenAI API
 * @param apiKey OpenAI API key
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
): Promise<{ polishedText: string; usage?: OpenAIResponse['usage'] }> {
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
  if (text.length > OPENAI_CONFIG.MAX_TEXT_LENGTH) {
    const error = new Error(
      `Text too long. Maximum ${OPENAI_CONFIG.MAX_TEXT_LENGTH} characters allowed.`
    );
    error.name = 'INVALID_INPUT';
    throw error;
  }

  // Clamp maxTokens to valid range
  const clampedMaxTokens = Math.max(
    OPENAI_CONFIG.MIN_MAX_TOKENS,
    Math.min(OPENAI_CONFIG.MAX_MAX_TOKENS, maxTokens)
  );

  // Construct request body
  const requestBody: OpenAIRequest = {
    model: OPENAI_CONFIG.MODEL,
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
    temperature: OPENAI_CONFIG.TEMPERATURE,
    max_completion_tokens: clampedMaxTokens,
  };

  // Make API call
  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(OPENAI_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
      error.name = 'API_ERROR';
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
      usage: data.usage,
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
