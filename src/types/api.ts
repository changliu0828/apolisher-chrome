export const OPENAI_CONFIG = {
  API_URL: 'https://api.openai.com/v1/chat/completions',
  MODEL: 'gpt-4o-mini',
  MAX_TEXT_LENGTH: 10000, // ~2500 tokens
  TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2000,
  MIN_MAX_TOKENS: 100,
  MAX_MAX_TOKENS: 4000,
} as const;

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  max_completion_tokens: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}
