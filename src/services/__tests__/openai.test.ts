import { describe, it, expect, beforeEach, vi } from 'vitest';
import { polishText } from '../openai';
import { OPENAI_CONFIG } from '@/types/api';
import type { OpenAIResponse, OpenAIError } from '@/types/api';

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
      expect(callBody.temperature).toBe(OPENAI_CONFIG.temperature);
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
});
