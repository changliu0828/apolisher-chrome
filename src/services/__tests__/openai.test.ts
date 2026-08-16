import { describe, it, expect, beforeEach, vi } from 'vitest';
import { polishText, listModels, isChatModelId, selectPolishModels } from '../openai';
import { OPENAI_CONFIG, OPENAI_MODELS_URL } from '@/types/api';
import type { OpenAIResponse, OpenAIError, OpenAIModelsResponse } from '@/types/api';

describe('openai service', () => {
  const mockApiKey = 'sk-test-key-123456789';
  const mockText = 'Hello world this is a test';
  const mockPromptInstruction = 'Make it professional';
  const mockMaxTokens = 2000;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    globalThis.fetch = vi.fn();
  });

  describe('polishText - validation', () => {
    it('should throw NO_API_KEY error when API key is empty', async () => {
      await expect(
        polishText('', mockText, mockPromptInstruction, mockMaxTokens)
      ).rejects.toThrow('NO_API_KEY');
    });

    it('should throw NO_API_KEY error when API key is whitespace', async () => {
      await expect(
        polishText('   ', mockText, mockPromptInstruction, mockMaxTokens)
      ).rejects.toThrow('NO_API_KEY');
    });

    it('should throw INVALID_INPUT error when text is empty', async () => {
      try {
        await polishText(mockApiKey, '', mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('INVALID_INPUT');
      }
    });

    it('should throw INVALID_INPUT error when text is whitespace', async () => {
      try {
        await polishText(mockApiKey, '   ', mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('INVALID_INPUT');
      }
    });

    it('should throw INVALID_INPUT error when text exceeds max length', async () => {
      const longText = 'a'.repeat(OPENAI_CONFIG.maxTextLength + 1);

      try {
        await polishText(mockApiKey, longText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('INVALID_INPUT');
        expect((error as Error).message).toContain('Text too long');
      }
    });
  });

  describe('polishText - successful requests', () => {
    it('should return polished text on successful API call', async () => {
      const mockResponse: OpenAIResponse = {
        choices: [
          {
            message: {
              content: 'Hello world, this is a professional test',
            },
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 15,
          total_tokens: 35,
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await polishText(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens
      );

      expect(result.polishedText).toBe('Hello world, this is a professional test');
      expect(result.usage).toEqual({
        inputTokens: 20,
        outputTokens: 15,
        totalTokens: 35,
      });
    });

    it('should make correct API call with proper headers and body', async () => {
      const mockResponse: OpenAIResponse = {
        choices: [
          {
            message: {
              content: 'Polished text',
            },
          },
        ],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = fetchMock;

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);

      expect(fetchMock).toHaveBeenCalledWith(OPENAI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: expect.any(String),
      });

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe(OPENAI_CONFIG.model);
      // temperature is never sent: newer models reject a custom value, so every
      // request runs at the provider default
      expect(callBody.temperature).toBeUndefined();
      expect(callBody.max_completion_tokens).toBe(mockMaxTokens);
      expect(callBody.messages).toHaveLength(2);
      expect(callBody.messages[0].role).toBe('system');
      expect(callBody.messages[1].role).toBe('user');
      expect(callBody.messages[1].content).toContain(mockText);
      expect(callBody.messages[1].content).toContain(mockPromptInstruction);
    });

    it('should clamp maxTokens to valid range', async () => {
      const mockResponse: OpenAIResponse = {
        choices: [{ message: { content: 'Polished' } }],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = fetchMock;

      // Test below minimum
      await polishText(mockApiKey, mockText, mockPromptInstruction, 50);
      let callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.max_completion_tokens).toBe(OPENAI_CONFIG.minMaxTokens);

      // Test above maximum
      await polishText(mockApiKey, mockText, mockPromptInstruction, 10000);
      callBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(callBody.max_completion_tokens).toBe(OPENAI_CONFIG.maxMaxTokens);
    });

    it('should handle response without usage data', async () => {
      const mockResponse: OpenAIResponse = {
        choices: [{ message: { content: 'Polished text' } }],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await polishText(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens
      );

      expect(result.polishedText).toBe('Polished text');
      expect(result.usage).toBeUndefined();
    });

    it('should trim whitespace from polished text', async () => {
      const mockResponse: OpenAIResponse = {
        choices: [{ message: { content: '  Polished text  ' } }],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await polishText(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens
      );

      expect(result.polishedText).toBe('Polished text');
    });
  });

  describe('polishText - API errors', () => {
    it('should throw API_ERROR with message from error response', async () => {
      const errorResponse: OpenAIError = {
        error: {
          message: 'Invalid API key provided',
          type: 'invalid_request_error',
          code: 'invalid_api_key',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toBe('Invalid API key provided');
      }
    });

    it('should throw API_ERROR with statusText when error response cannot be parsed', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toBe('Internal Server Error');
      }
    });

    it('should throw API_ERROR with generic message when no error info available', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: '',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toBe('Unknown API error');
      }
    });

    it('should throw INVALID_RESPONSE error when no content in response', async () => {
      const mockResponse: OpenAIResponse = {
        choices: [{ message: { content: '' } }],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('INVALID_RESPONSE');
        expect((error as Error).message).toContain('no content returned');
      }
    });

    it('should throw INVALID_RESPONSE when choices array is empty', async () => {
      const mockResponse = {
        choices: [],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('INVALID_RESPONSE');
      }
    });
  });

  describe('polishText - network errors', () => {
    it('should throw NETWORK_ERROR on TypeError (network failure)', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('NETWORK_ERROR');
        expect((error as Error).message).toContain('Network error');
      }
    });

    it('should re-throw known error types', async () => {
      const knownError = new Error('Test error');
      knownError.name = 'API_ERROR';

      globalThis.fetch = vi.fn().mockRejectedValue(knownError);

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(knownError);
        expect((error as Error).name).toBe('API_ERROR');
      }
    });

    it('should wrap unknown errors as API_ERROR', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Unexpected error'));

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toContain('Unexpected error');
      }
    });
  });
  describe('polishText - model parameter', () => {
    const mockResponse: OpenAIResponse = {
      choices: [{ message: { content: 'Polished' } }],
    };

    it('should send the provided model instead of the default', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'gpt-4o');

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe('gpt-4o');
    });

    it('should never send temperature, even for a model that would accept it', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'gpt-4o-mini');

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.temperature).toBeUndefined();
    });

    it('should fall back to the default model when an empty model is passed', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, '');

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe(OPENAI_CONFIG.model);
    });

    it('should map a model_not_found error to INVALID_MODEL', async () => {
      const errorResponse: OpenAIError = {
        error: { message: 'The model does not exist', type: 'invalid_request_error', code: 'model_not_found' },
      };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'gpt-nope');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_MODEL');
      }
    });
  });

  describe('isChatModelId', () => {
    it('should keep general-purpose chat models', () => {
      expect(isChatModelId('gpt-5.6-luna')).toBe(true);
      expect(isChatModelId('gpt-5.6-sol')).toBe(true);
      expect(isChatModelId('gpt-5.4-mini')).toBe(true);
      expect(isChatModelId('gpt-5.3-chat-latest')).toBe(true);
      expect(isChatModelId('gpt-4o-mini')).toBe(true);
      expect(isChatModelId('gpt-4.1')).toBe(true);
    });

    it('should drop non-chat models', () => {
      expect(isChatModelId('text-embedding-3-small')).toBe(false);
      expect(isChatModelId('whisper-1')).toBe(false);
      expect(isChatModelId('dall-e-3')).toBe(false);
      expect(isChatModelId('tts-1')).toBe(false);
      expect(isChatModelId('omni-moderation-latest')).toBe(false);
      expect(isChatModelId('gpt-4o-realtime-preview')).toBe(false);
      expect(isChatModelId('gpt-3.5-turbo-instruct')).toBe(false);
      expect(isChatModelId('gpt-image-2')).toBe(false);
    });

    it('should drop models that are a poor fit for polishing', () => {
      expect(isChatModelId('gpt-5.2-codex')).toBe(false);
      expect(isChatModelId('gpt-5.5-pro')).toBe(false);
      expect(isChatModelId('gpt-4o-search-preview')).toBe(false);
      expect(isChatModelId('o3-deep-research')).toBe(false);
    });

    it('should drop dated snapshots, legacy families, and fine-tunes', () => {
      expect(isChatModelId('gpt-5.6-2026-06-23')).toBe(false);
      expect(isChatModelId('gpt-4o-mini-2024-07-18')).toBe(false);
      expect(isChatModelId('gpt-3.5-turbo')).toBe(false);
      expect(isChatModelId('gpt-4')).toBe(false);
      expect(isChatModelId('gpt-4-turbo')).toBe(false);
      expect(isChatModelId('o3-mini')).toBe(false);
      expect(isChatModelId('ft:gpt-3.5-turbo-0613:acme::abc123')).toBe(false);
    });
  });

  describe('selectPolishModels', () => {
    const DAY = 24 * 60 * 60;

    it('should keep only models within the recency window, newest first', () => {
      const newest = 1_780_000_000;
      const selected = selectPolishModels([
        { id: 'gpt-5.6-luna', created: newest },
        { id: 'gpt-5.4', created: newest - 100 * DAY },
        { id: 'gpt-4o-mini', created: newest - 700 * DAY },
        { id: 'text-embedding-3-small', created: newest },
      ]);

      expect(selected.map((entry) => entry.id)).toEqual(['gpt-5.6-luna', 'gpt-5.4']);
    });

    it('should still offer the newest generation when a provider has shipped nothing recently', () => {
      // The window is relative to the newest model in the list, not to today,
      // so a long release gap does not empty the dropdown.
      const ancient = 1_600_000_000;
      const selected = selectPolishModels([
        { id: 'gpt-5.6-luna', created: ancient },
        { id: 'gpt-5.6-sol', created: ancient - 10 * DAY },
        { id: 'gpt-5', created: ancient - 900 * DAY },
      ]);

      expect(selected.map((entry) => entry.id)).toEqual(['gpt-5.6-luna', 'gpt-5.6-sol']);
    });

    it('should return an empty list when nothing qualifies', () => {
      expect(selectPolishModels([{ id: 'whisper-1', created: 1 }])).toEqual([]);
    });
  });

  describe('listModels', () => {
    const modelsResponse: OpenAIModelsResponse = {
      data: [
        { id: 'text-embedding-3-small', created: 300 },
        { id: 'gpt-4o-mini', created: 100 },
        { id: 'gpt-4o', created: 200 },
        { id: 'whisper-1', created: 400 },
      ],
    };

    it('should throw NO_API_KEY when the key is empty', async () => {
      await expect(listModels('')).rejects.toThrow('NO_API_KEY');
    });

    it('should GET the models endpoint with a bearer token', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => modelsResponse,
      });

      await listModels(mockApiKey);

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock.mock.calls[0][0]).toBe(OPENAI_MODELS_URL);
      expect(fetchMock.mock.calls[0][1].method).toBe('GET');
      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${mockApiKey}`);
    });

    it('should filter non-chat models and sort newest first', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => modelsResponse,
      });

      const models = await listModels(mockApiKey);

      expect(models).toEqual([
        { id: 'gpt-4o', label: 'gpt-4o' },
        { id: 'gpt-4o-mini', label: 'gpt-4o-mini' },
      ]);
    });

    it('should map a 401 to NO_API_KEY', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: { message: 'Invalid key', type: 'invalid_request_error', code: 'invalid_api_key' } }),
      });

      try {
        await listModels(mockApiKey);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('NO_API_KEY');
      }
    });

    it('should throw NETWORK_ERROR on a fetch TypeError', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await listModels(mockApiKey);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('NETWORK_ERROR');
      }
    });

    it('should throw INVALID_RESPONSE when the payload has no list', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      try {
        await listModels(mockApiKey);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_RESPONSE');
      }
    });
  });
  describe('unusable API key', () => {
    it('should throw INVALID_API_KEY without sending a request', async () => {
      globalThis.fetch = vi.fn();
      const badKey = `${mockApiKey}\u3001`;

      try {
        await polishText(badKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_API_KEY');
      }

      try {
        await listModels(badKey);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_API_KEY');
      }

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });
});
