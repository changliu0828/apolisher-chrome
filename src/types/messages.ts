import type { ModelOption } from '@/types/api';
import type { AIProvider } from '@/types/settings';

// Message types for chrome.runtime messaging
export const MESSAGE_TYPES = {
  POLISH_REQUEST: 'POLISH_TEXT_REQUEST',
  POLISH_RESPONSE: 'POLISH_TEXT_RESPONSE',
  POLISH_ERROR: 'POLISH_TEXT_ERROR',
  OPEN_OPTIONS: 'OPEN_OPTIONS_PAGE',
  LIST_MODELS_REQUEST: 'LIST_MODELS_REQUEST',
  LIST_MODELS_RESPONSE: 'LIST_MODELS_RESPONSE',
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

export type ErrorCode =
  | 'NO_API_KEY'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'INVALID_MODEL'
  | 'INVALID_API_KEY';

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

/**
 * Options Page -> background. Carries no API key: the background worker reads
 * it from storage, so keys never travel over the message channel.
 */
export interface ListModelsRequest {
  type: typeof MESSAGE_TYPES.LIST_MODELS_REQUEST;
  payload: {
    provider: AIProvider;
    forceRefresh?: boolean;
  };
}

/** Where the returned list came from, so the UI can explain itself */
export type ModelListSource = 'network' | 'cache' | 'fallback';

export interface ListModelsResponse {
  type: typeof MESSAGE_TYPES.LIST_MODELS_RESPONSE;
  payload: {
    provider: AIProvider;
    models: ModelOption[];
    source: ModelListSource;
    /** Present when the live fetch failed and a cache/fallback was used */
    error?: string;
    errorCode?: ErrorCode;
  };
}

export type Message =
  | PolishRequest
  | PolishResponse
  | PolishError
  | OpenOptionsMessage
  | ListModelsRequest
  | ListModelsResponse;
