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

/** A selectable model, as shown in the Options Page dropdown */
export interface ModelOption {
  id: string;
  label: string;
}

export interface ProviderConfig {
  apiUrl: string;
  model: string;
  maxTextLength: number;
  defaultMaxTokens: number;
  minMaxTokens: number;
  maxMaxTokens: number;
}

// OpenAI configuration
export const OPENAI_CONFIG: ProviderConfig = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-5.6-luna',
  maxTextLength: 10000, // ~2500 tokens
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
  /**
   * Never sent. Newer OpenAI and Anthropic models reject a custom value, so
   * every request runs at the provider default.
   */
  temperature?: number;
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
    /** Which request field was rejected, when the API says so */
    param?: string;
  };
}

// OpenAI list-models endpoint (GET). Returns every model visible to the
// account, with no "supports chat" metadata - hence the heuristic filter.
export const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';

export interface OpenAIModelsResponse {
  data: Array<{
    id: string;
    created?: number;
    owned_by?: string;
  }>;
}

// Claude configuration
export const CLAUDE_CONFIG: ProviderConfig = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  // claude-3-5-haiku-20241022 was retired in Feb 2026 and now 404s
  model: 'claude-haiku-4-5-20251001',
  maxTextLength: 10000,
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
  /**
   * Mixed block types: models with thinking on return a `thinking` block
   * before the `text` one, so never index this by position.
   */
  content: Array<{
    type: string;
    text?: string;
    thinking?: string;
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

// Claude list-models endpoint (GET), cursor-paginated via after_id/has_more
export const CLAUDE_MODELS_URL = 'https://api.anthropic.com/v1/models';

export interface ClaudeModelsResponse {
  data: Array<{
    id: string;
    display_name?: string;
    created_at?: string;
  }>;
  has_more?: boolean;
  first_id?: string | null;
  last_id?: string | null;
}

// Gemini configuration
export const GEMINI_CONFIG: ProviderConfig = {
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  // Cheapest model that does the job: gemini-2.5-flash costs more per token
  // *and* spends ~450 thinking tokens on every call, which this one does not.
  model: 'gemini-3.1-flash-lite',
  maxTextLength: 10000,
  defaultMaxTokens: 2000,
  minMaxTokens: 100,
  maxMaxTokens: 8192,
};

export interface GeminiContentPart {
  /** Absent on parts that carry only a thought signature */
  text?: string;
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

// Gemini list-models endpoint (GET). GEMINI_CONFIG.apiUrl is already the
// models collection URL; models are filtered by supportedGenerationMethods.
export interface GeminiModelsResponse {
  models?: Array<{
    name: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
  }>;
  nextPageToken?: string;
}
