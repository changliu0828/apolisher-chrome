// Unified types for all AI providers
export interface AIPolishResult {
  polishedText: string;
  usage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ProviderConfig {
  apiUrl: string;
  model: string;
  temperature: number;
  maxTextLength: number;
  defaultMaxTokens: number;
  minMaxTokens: number;
  maxMaxTokens: number;
}

// OpenAI configuration
export const OPENAI_CONFIG: ProviderConfig = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  maxTextLength: 10000, // ~2500 tokens
  temperature: 0.7,
  defaultMaxTokens: 2000,
  minMaxTokens: 100,
  maxMaxTokens: 4000,
};

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

// Claude configuration
export const CLAUDE_CONFIG: ProviderConfig = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-5-haiku-20241022',
  maxTextLength: 10000,
  temperature: 0.7,
  defaultMaxTokens: 2000,
  minMaxTokens: 100,
  maxMaxTokens: 4000,
};

export const CLAUDE_API_VERSION = '2023-06-01';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
  temperature?: number;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeError {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
  request_id?: string;
}

// Gemini configuration
export const GEMINI_CONFIG: ProviderConfig = {
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  model: 'gemini-2.5-flash',
  maxTextLength: 10000,
  temperature: 0.7,
  defaultMaxTokens: 2000,
  minMaxTokens: 100,
  maxMaxTokens: 8192,
};

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface GeminiSystemInstruction {
  parts: GeminiContentPart[];
}

export interface GeminiGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  systemInstruction?: GeminiSystemInstruction;
  generationConfig?: GeminiGenerationConfig;
}

export interface GeminiCandidate {
  content: {
    parts: GeminiContentPart[];
    role: string;
  };
  finishReason: string;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

export interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
}

export interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}
