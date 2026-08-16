import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  polishText,
  listModels,
  extractText,
  isTextModelId,
  dropSupersededPreviews,
} from '../gemini';
import { GEMINI_CONFIG } from '@/types/api';
import type { GeminiResponse, GeminiError, GeminiModelsResponse } from '@/types/api';

describe('gemini service', () => {
  const mockApiKey = 'test-gemini-key-123456789';
  const mockText = 'Hello world this is a test';
  const mockPromptInstruction = 'Make it professional';
  const mockMaxTokens = 2000;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  describe('polishText - validation', () => {
    it('should throw NO_API_KEY error when API key is empty', async () => {
      await expect(
        polishText('', mockText, mockPromptInstruction, mockMaxTokens)
      ).rejects.toThrow('NO_API_KEY');
    });

    it('should throw INVALID_INPUT error when text is empty', async () => {
      try {
        await polishText(mockApiKey, '', mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_INPUT');
      }
    });

    it('should throw INVALID_INPUT error when text exceeds max length', async () => {
      const longText = 'a'.repeat(GEMINI_CONFIG.maxTextLength + 1);

      try {
        await polishText(mockApiKey, longText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_INPUT');
        expect((error as Error).message).toContain('Text too long');
      }
    });
  });

  describe('polishText - successful requests', () => {
    it('should return polished text on successful API call', async () => {
      const mockResponse: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello world, this is a professional test' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 20,
          candidatesTokenCount: 15,
          totalTokenCount: 35,
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

    it('should make correct API call with API key in query params', async () => {
      const mockResponse: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Polished text' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = fetchMock;

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);

      const expectedUrl = `${GEMINI_CONFIG.apiUrl}/${GEMINI_CONFIG.model}:generateContent?key=${mockApiKey}`;
      expect(fetchMock).toHaveBeenCalledWith(expectedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.systemInstruction).toBeDefined();
      // temperature is never sent, so every request runs at the provider default
      expect(callBody.generationConfig.temperature).toBeUndefined();
      expect(callBody.generationConfig.maxOutputTokens).toBe(mockMaxTokens);
      expect(callBody.contents).toHaveLength(1);
      expect(callBody.contents[0].role).toBe('user');
      expect(callBody.contents[0].parts).toHaveLength(1);
    });

    it('should clamp maxTokens to valid range', async () => {
      const mockResponse: GeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Polished' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = fetchMock;

      // Test below minimum
      await polishText(mockApiKey, mockText, mockPromptInstruction, 50);
      let callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.generationConfig.maxOutputTokens).toBe(GEMINI_CONFIG.minMaxTokens);

      // Test above maximum
      await polishText(mockApiKey, mockText, mockPromptInstruction, 20000);
      callBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(callBody.generationConfig.maxOutputTokens).toBe(GEMINI_CONFIG.maxMaxTokens);
    });

    it('should handle response without usage data', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Polished text' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
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
  });

  describe('polishText - API errors', () => {
    it('should throw NO_API_KEY error for UNAUTHENTICATED status', async () => {
      const errorResponse: GeminiError = {
        error: {
          code: 401,
          message: 'API key not valid',
          status: 'UNAUTHENTICATED',
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
        expect((error as Error).name).toBe('NO_API_KEY');
        expect((error as Error).message).toBe('API key not valid');
      }
    });

    it('should throw NO_API_KEY error for PERMISSION_DENIED status', async () => {
      const errorResponse: GeminiError = {
        error: {
          code: 403,
          message: 'Permission denied',
          status: 'PERMISSION_DENIED',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => errorResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('NO_API_KEY');
      }
    });

    it('should throw API_ERROR for RESOURCE_EXHAUSTED status', async () => {
      const errorResponse: GeminiError = {
        error: {
          code: 429,
          message: 'Quota exceeded',
          status: 'RESOURCE_EXHAUSTED',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => errorResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toBe('Quota exceeded');
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
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toBe('Internal Server Error');
      }
    });

    it('should throw INVALID_RESPONSE when no content in response', async () => {
      const mockResponse = {
        candidates: [],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_RESPONSE');
      }
    });

    it('should throw INVALID_RESPONSE when candidate parts are empty', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_RESPONSE');
      }
    });
  });

  describe('polishText - network errors', () => {
    it('should throw NETWORK_ERROR on TypeError', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('NETWORK_ERROR');
        expect((error as Error).message).toContain('Network error');
      }
    });

    it('should wrap unknown errors as API_ERROR', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Unexpected error'));

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('API_ERROR');
        expect((error as Error).message).toContain('Unexpected error');
      }
    });
  });
  describe('polishText - model parameter', () => {
    const mockResponse: GeminiResponse = {
      candidates: [
        { content: { parts: [{ text: 'Polished' }], role: 'model' }, finishReason: 'STOP' },
      ],
    };

    it('should put the provided model in the request URL', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        'gemini-2.5-pro'
      );

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock.mock.calls[0][0]).toBe(
        `${GEMINI_CONFIG.apiUrl}/gemini-2.5-pro:generateContent?key=${mockApiKey}`
      );
    });

    it('should fall back to the default model when an empty model is passed', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, '');

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock.mock.calls[0][0]).toContain(`/${GEMINI_CONFIG.model}:generateContent`);
    });

    it('should map a NOT_FOUND status to INVALID_MODEL', async () => {
      const errorResponse: GeminiError = {
        error: { code: 404, message: 'models/gemini-nope is not found', status: 'NOT_FOUND' },
      };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'gemini-nope');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_MODEL');
      }
    });
  });

  describe('listModels', () => {
    const page: GeminiModelsResponse = {
      models: [
        {
          name: 'models/gemini-2.5-flash',
          displayName: 'Gemini 2.5 Flash',
          supportedGenerationMethods: ['generateContent', 'countTokens'],
        },
        {
          name: 'models/text-embedding-004',
          displayName: 'Embedding 004',
          supportedGenerationMethods: ['embedContent'],
        },
        {
          name: 'models/gemini-2.5-pro',
          supportedGenerationMethods: ['generateContent'],
        },
      ],
    };

    it('should throw NO_API_KEY when the key is empty', async () => {
      await expect(listModels('')).rejects.toThrow('NO_API_KEY');
    });

    it('should GET the models collection with the key as a query parameter', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => page,
      });

      await listModels(mockApiKey);

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain(GEMINI_CONFIG.apiUrl);
      expect(url).toContain(`key=${mockApiKey}`);
      expect(init.method).toBe('GET');
    });

    it('should keep only models supporting generateContent and strip the models/ prefix', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => page,
      });

      const models = await listModels(mockApiKey);

      expect(models).toEqual([
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
      ]);
    });

    it('should follow pagination using pageToken', async () => {
      const firstPage: GeminiModelsResponse = {
        models: [{ name: 'models/gemini-a', supportedGenerationMethods: ['generateContent'] }],
        nextPageToken: 'token-2',
      };
      const secondPage: GeminiModelsResponse = {
        models: [{ name: 'models/gemini-b', supportedGenerationMethods: ['generateContent'] }],
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => firstPage })
        .mockResolvedValueOnce({ ok: true, json: async () => secondPage });

      const models = await listModels(mockApiKey);

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toContain('pageToken=token-2');
      expect(models.map((m) => m.id)).toEqual(['gemini-a', 'gemini-b']);
    });

    it('should map an invalid key to NO_API_KEY', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: { code: 400, message: 'API key not valid', status: 'INVALID_ARGUMENT' },
        }),
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
  });
  describe('isTextModelId', () => {
    it('should keep Gemini text models', () => {
      expect(isTextModelId('gemini-2.5-flash')).toBe(true);
      expect(isTextModelId('gemini-3.7-flash')).toBe(true);
      expect(isTextModelId('gemini-flash-latest')).toBe(true);
      expect(isTextModelId('gemini-3.1-pro-preview')).toBe(true);
    });

    it('should drop non-text models that still accept generateContent', () => {
      expect(isTextModelId('gemini-2.5-flash-preview-tts')).toBe(false);
      expect(isTextModelId('gemini-3-pro-image')).toBe(false);
      expect(isTextModelId('gemini-robotics-er-2-preview')).toBe(false);
      expect(isTextModelId('gemini-2.5-computer-use-preview-10-2025')).toBe(false);
      expect(isTextModelId('gemini-omni-flash-preview')).toBe(false);
    });

    it('should drop non-Gemini families', () => {
      expect(isTextModelId('gemma-4-31b-it')).toBe(false);
      expect(isTextModelId('lyria-3-pro-preview')).toBe(false);
      expect(isTextModelId('nano-banana-pro-preview')).toBe(false);
      expect(isTextModelId('deep-research-preview-04-2026')).toBe(false);
      expect(isTextModelId('antigravity-preview-05-2026')).toBe(false);
    });
  });

  describe('dropSupersededPreviews', () => {
    it('should drop a preview whose stable counterpart is listed', () => {
      expect(
        dropSupersededPreviews(['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview'])
      ).toEqual(['gemini-3.1-flash-lite']);
    });

    it('should keep a preview with no stable counterpart', () => {
      expect(dropSupersededPreviews(['gemini-3-flash-preview'])).toEqual([
        'gemini-3-flash-preview',
      ]);
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
  describe('extractText', () => {
    it('should skip a part that carries only a thought signature', () => {
      expect(
        extractText({
          content: {
            role: 'model',
            parts: [{ thoughtSignature: 'abc' } as never, { text: '  Polished  ' }],
          },
          finishReason: 'STOP',
        })
      ).toBe('Polished');
    });

    it('should return undefined when no part has text', () => {
      expect(
        extractText({
          content: { role: 'model', parts: [{ thoughtSignature: 'abc' } as never] },
          finishReason: 'MAX_TOKENS',
        })
      ).toBeUndefined();
      expect(extractText(undefined)).toBeUndefined();
    });
  });

  describe('polishText - thinking models', () => {
    it('should explain a MAX_TOKENS truncation that produced no text', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { role: 'model', parts: [] }, finishReason: 'MAX_TOKENS' }],
        }),
      });

      try {
        await polishText(
          mockApiKey,
          mockText,
          mockPromptInstruction,
          mockMaxTokens,
          'gemini-3.7-flash'
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_RESPONSE');
        expect((error as Error).message).toContain('Max Completion Tokens');
      }
    });
  });
});
