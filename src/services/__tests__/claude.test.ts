import { describe, it, expect, beforeEach, vi } from 'vitest';
import { polishText } from '../claude';
import { CLAUDE_CONFIG, CLAUDE_API_VERSION } from '@/types/api';
import type { ClaudeResponse, ClaudeError } from '@/types/api';

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
});
