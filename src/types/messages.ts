// Message types for chrome.runtime messaging
export const MESSAGE_TYPES = {
  POLISH_REQUEST: 'POLISH_TEXT_REQUEST',
  POLISH_RESPONSE: 'POLISH_TEXT_RESPONSE',
  POLISH_ERROR: 'POLISH_TEXT_ERROR',
  OPEN_OPTIONS: 'OPEN_OPTIONS_PAGE',
} as const;

export interface PolishRequest {
  type: typeof MESSAGE_TYPES.POLISH_REQUEST;
  payload: {
    text: string;
  };
}

export interface PolishResponse {
  type: typeof MESSAGE_TYPES.POLISH_RESPONSE;
  payload: {
    polishedText: string;
    provider: string;
    model: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export type ErrorCode = 'NO_API_KEY' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';

export interface PolishError {
  type: typeof MESSAGE_TYPES.POLISH_ERROR;
  payload: {
    error: string;
    code: ErrorCode;
  };
}

export interface OpenOptionsMessage {
  type: typeof MESSAGE_TYPES.OPEN_OPTIONS;
}

export type Message = PolishRequest | PolishResponse | PolishError | OpenOptionsMessage;
