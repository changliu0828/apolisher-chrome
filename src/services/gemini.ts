import {
  GEMINI_CONFIG,
  type GeminiRequest,
  type GeminiResponse,
  type GeminiError,
  type AIPolishResult,
} from '@/types/api';

const SYSTEM_PROMPT =
  'You are a professional text polishing assistant. Polish the user\'s text according to their instructions. CRITICAL RULES: 1) DO NOT change the format or structure - if input is a casual sentence, output a casual sentence; if input is a paragraph, output a paragraph; DO NOT add greetings, signatures, or restructure into emails/letters. 2) Keep the output length similar to the input. 3) Use the same language as the input text. Return ONLY the polished text, no explanations or metadata.';

/**
 * Polish text using Gemini API
 * @param apiKey Gemini API key
 * @param text Text to polish
 * @param promptInstruction Instructions for polishing (from preset or custom)
 * @param maxTokens Maximum output tokens
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
      temperature: GEMINI_CONFIG.temperature,
      maxOutputTokens: clampedMaxTokens,
    },
  };

  // Construct full URL with model and API key
  const fullUrl = `${GEMINI_CONFIG.apiUrl}/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`;

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
      } else {
        error.name = 'API_ERROR';
      }

      throw error;
    }

    // Parse response
    const data = (await response.json()) as GeminiResponse;
    const polishedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    // Validate response structure
    if (!polishedText) {
      const error = new Error('Invalid response from API: no content returned');
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
