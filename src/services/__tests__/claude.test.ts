import { describe, it, expect, beforeEach, vi } from 'vitest';
import { polishText, listModels, extractText } from '../claude';
import { CLAUDE_CONFIG, CLAUDE_API_VERSION, CLAUDE_MODELS_URL } from '@/types/api';
import type { ClaudeResponse, ClaudeError, ClaudeModelsResponse } from '@/types/api';

describe('claude service', () => {
  const mockApiKey = 'sk-ant-test-key-123456789';
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
      const longText = 'a'.repeat(CLAUDE_CONFIG.maxTextLength + 1);

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
      const mockResponse: ClaudeResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        model: CLAUDE_CONFIG.model,
        stop_reason: 'end_turn',
        content: [
          {
            type: 'text',
            text: 'Hello world, this is a professional test',
          },
        ],
        usage: {
          input_tokens: 20,
          output_tokens: 15,
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

    it('should make correct API call with Claude-specific headers', async () => {
      const mockResponse: ClaudeResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        model: CLAUDE_CONFIG.model,
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Polished text' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = fetchMock;

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens);

      expect(fetchMock).toHaveBeenCalledWith(CLAUDE_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': CLAUDE_API_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
          'x-api-key': mockApiKey,
        },
        body: expect.any(String),
      });

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe(CLAUDE_CONFIG.model);
      expect(callBody.temperature).toBe(CLAUDE_CONFIG.temperature);
      expect(callBody.max_tokens).toBe(mockMaxTokens);
      expect(callBody.system).toBeDefined();
      expect(callBody.messages).toHaveLength(1);
      expect(callBody.messages[0].role).toBe('user');
    });

    it('should clamp maxTokens to valid range', async () => {
      const mockResponse: ClaudeResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        model: CLAUDE_CONFIG.model,
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Polished' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      globalThis.fetch = fetchMock;

      // Test below minimum
      await polishText(mockApiKey, mockText, mockPromptInstruction, 50);
      let callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.max_tokens).toBe(CLAUDE_CONFIG.minMaxTokens);

      // Test above maximum
      await polishText(mockApiKey, mockText, mockPromptInstruction, 10000);
      callBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(callBody.max_tokens).toBe(CLAUDE_CONFIG.maxMaxTokens);
    });

    it('should handle response without usage data', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        model: CLAUDE_CONFIG.model,
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Polished text' }],
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
    it('should throw NO_API_KEY error for authentication errors', async () => {
      const errorResponse: ClaudeError = {
        type: 'error',
        error: {
          type: 'authentication_error',
          message: 'Invalid API key',
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
        expect((error as Error).message).toBe('Invalid API key');
      }
    });

    it('should throw API_ERROR for rate limit errors', async () => {
      const errorResponse: ClaudeError = {
        type: 'error',
        error: {
          type: 'rate_limit_error',
          message: 'Rate limit exceeded',
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
        expect((error as Error).message).toBe('Rate limit exceeded');
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
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        model: CLAUDE_CONFIG.model,
        stop_reason: 'end_turn',
        content: [],
        usage: { input_tokens: 10, output_tokens: 0 },
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
    const mockResponse: ClaudeResponse = {
      id: 'msg_1',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Polished' }],
      model: 'claude-sonnet-4-5',
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    };

    it('should send the provided model instead of the default', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        'claude-sonnet-4-5'
      );

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe('claude-sonnet-4-5');
    });

    it('should fall back to the default model when an empty model is passed', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, '');

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe(CLAUDE_CONFIG.model);
    });

    it('should map a not_found_error to INVALID_MODEL', async () => {
      const errorResponse: ClaudeError = {
        type: 'error',
        error: { type: 'not_found_error', message: 'model: claude-nope' },
      };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorResponse,
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'claude-nope');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_MODEL');
      }
    });
  });

  describe('listModels', () => {
    const page: ClaudeModelsResponse = {
      data: [
        { id: 'claude-opus-4-5', display_name: 'Claude Opus 4.5' },
        { id: 'claude-haiku-4-5' },
      ],
      has_more: false,
      last_id: 'claude-haiku-4-5',
    };

    it('should throw NO_API_KEY when the key is empty', async () => {
      await expect(listModels('')).rejects.toThrow('NO_API_KEY');
    });

    it('should send the browser-access and version headers', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => page,
      });

      await listModels(mockApiKey);

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain(CLAUDE_MODELS_URL);
      expect(url).toContain('limit=100');
      expect(init.method).toBe('GET');
      expect(init.headers['x-api-key']).toBe(mockApiKey);
      expect(init.headers['anthropic-version']).toBe(CLAUDE_API_VERSION);
      expect(init.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    });

    it('should use display_name as the label and fall back to the id', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => page,
      });

      const models = await listModels(mockApiKey);

      expect(models).toEqual([
        { id: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
        { id: 'claude-haiku-4-5', label: 'claude-haiku-4-5' },
      ]);
    });

    it('should follow pagination using after_id', async () => {
      const firstPage: ClaudeModelsResponse = {
        data: [{ id: 'model-a', display_name: 'Model A' }],
        has_more: true,
        last_id: 'model-a',
      };
      const secondPage: ClaudeModelsResponse = {
        data: [{ id: 'model-b', display_name: 'Model B' }],
        has_more: false,
        last_id: 'model-b',
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => firstPage })
        .mockResolvedValueOnce({ ok: true, json: async () => secondPage });

      const models = await listModels(mockApiKey);

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toContain('after_id=model-a');
      expect(models.map((m) => m.id)).toEqual(['model-a', 'model-b']);
    });

    it('should map an authentication_error to NO_API_KEY', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          type: 'error',
          error: { type: 'authentication_error', message: 'invalid x-api-key' },
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
    it('should skip a leading thinking block', () => {
      expect(
        extractText([
          { type: 'thinking', thinking: '' },
          { type: 'text', text: '  Polished  ' },
        ])
      ).toBe('Polished');
    });

    it('should return undefined when there is no text block', () => {
      expect(extractText([{ type: 'thinking', thinking: '' }])).toBeUndefined();
      expect(extractText([])).toBeUndefined();
      expect(extractText(undefined)).toBeUndefined();
    });
  });

  describe('polishText - newer model families', () => {
    const thinkingResponse = {
      id: 'msg_1',
      type: 'message',
      role: 'assistant',
      content: [
        { type: 'thinking', thinking: '' },
        { type: 'text', text: 'Polished' },
      ],
      model: 'claude-opus-5',
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    };

    it('should never send temperature', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => thinkingResponse,
      });

      await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'claude-opus-5');

      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe('claude-opus-5');
      expect(callBody.temperature).toBeUndefined();
    });

    it('should read the text block that follows a thinking block', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => thinkingResponse,
      });

      const result = await polishText(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        'claude-opus-5'
      );

      expect(result.polishedText).toBe('Polished');
    });

    it('should explain a max_tokens truncation that produced no text', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...thinkingResponse, content: [{ type: 'thinking', thinking: '' }], stop_reason: 'max_tokens' }),
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'claude-opus-5');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('INVALID_RESPONSE');
        expect((error as Error).message).toContain('Max Completion Tokens');
      }
    });

    it('should not report a deprecated-parameter 400 as an unavailable model', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          type: 'error',
          error: { type: 'invalid_request_error', message: '`temperature` is deprecated for this model.' },
        }),
      });

      try {
        await polishText(mockApiKey, mockText, mockPromptInstruction, mockMaxTokens, 'claude-opus-5');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).toBe('API_ERROR');
      }
    });
  });
});
