import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  polishTextWithProvider,
  listModelsForProvider,
  getProviderDisplayName,
} from '../providerFactory';
import type { AIPolishResult } from '@/types/api';

// Mock the service modules
vi.mock('../openai', () => ({
  polishText: vi.fn(),
  listModels: vi.fn(),
}));

vi.mock('../claude', () => ({
  polishText: vi.fn(),
  listModels: vi.fn(),
}));

vi.mock('../gemini', () => ({
  polishText: vi.fn(),
  listModels: vi.fn(),
}));

import * as openaiService from '../openai';
import * as claudeService from '../claude';
import * as geminiService from '../gemini';

describe('providerFactory', () => {
  const mockApiKey = 'test-api-key';
  const mockText = 'Test text to polish';
  const mockPromptInstruction = 'Make it professional';
  const mockMaxTokens = 2000;

  const mockSuccessResult: AIPolishResult = {
    polishedText: 'Test text to polish, professionally',
    model: 'test-model',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('polishTextWithProvider', () => {
    it('should route to OpenAI service when provider is openai', async () => {
      vi.mocked(openaiService.polishText).mockResolvedValue(mockSuccessResult);

      const result = await polishTextWithProvider(
        'openai',
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );

      expect(openaiService.polishText).toHaveBeenCalledWith(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );
      expect(openaiService.polishText).toHaveBeenCalledTimes(1);
      expect(claudeService.polishText).not.toHaveBeenCalled();
      expect(geminiService.polishText).not.toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResult);
    });

    it('should route to Claude service when provider is claude', async () => {
      vi.mocked(claudeService.polishText).mockResolvedValue(mockSuccessResult);

      const result = await polishTextWithProvider(
        'claude',
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );

      expect(claudeService.polishText).toHaveBeenCalledWith(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );
      expect(claudeService.polishText).toHaveBeenCalledTimes(1);
      expect(openaiService.polishText).not.toHaveBeenCalled();
      expect(geminiService.polishText).not.toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResult);
    });

    it('should route to Gemini service when provider is gemini', async () => {
      vi.mocked(geminiService.polishText).mockResolvedValue(mockSuccessResult);

      const result = await polishTextWithProvider(
        'gemini',
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );

      expect(geminiService.polishText).toHaveBeenCalledWith(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );
      expect(geminiService.polishText).toHaveBeenCalledTimes(1);
      expect(openaiService.polishText).not.toHaveBeenCalled();
      expect(claudeService.polishText).not.toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResult);
    });

    it('should throw error for unsupported provider', async () => {
      await expect(
        polishTextWithProvider(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          'unsupported' as any,
          mockApiKey,
          mockText,
          mockPromptInstruction,
          mockMaxTokens
        )
      ).rejects.toThrow('Unsupported provider: unsupported');

      expect(openaiService.polishText).not.toHaveBeenCalled();
      expect(claudeService.polishText).not.toHaveBeenCalled();
      expect(geminiService.polishText).not.toHaveBeenCalled();
    });

    it('should propagate errors from OpenAI service', async () => {
      const error = new Error('OpenAI API error');
      vi.mocked(openaiService.polishText).mockRejectedValue(error);

      await expect(
        polishTextWithProvider(
          'openai',
          mockApiKey,
          mockText,
          mockPromptInstruction,
          mockMaxTokens
        )
      ).rejects.toThrow('OpenAI API error');
    });

    it('should propagate errors from Claude service', async () => {
      const error = new Error('Claude API error');
      vi.mocked(claudeService.polishText).mockRejectedValue(error);

      await expect(
        polishTextWithProvider(
          'claude',
          mockApiKey,
          mockText,
          mockPromptInstruction,
          mockMaxTokens
        )
      ).rejects.toThrow('Claude API error');
    });

    it('should propagate errors from Gemini service', async () => {
      const error = new Error('Gemini API error');
      vi.mocked(geminiService.polishText).mockRejectedValue(error);

      await expect(
        polishTextWithProvider(
          'gemini',
          mockApiKey,
          mockText,
          mockPromptInstruction,
          mockMaxTokens
        )
      ).rejects.toThrow('Gemini API error');
    });

    it('should handle empty text', async () => {
      vi.mocked(openaiService.polishText).mockResolvedValue({
        polishedText: '',
        model: 'test-model',
      });

      const result = await polishTextWithProvider(
        'openai',
        mockApiKey,
        '',
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );

      expect(openaiService.polishText).toHaveBeenCalledWith(
        mockApiKey,
        '',
        mockPromptInstruction,
        mockMaxTokens,
        undefined
      );
      expect(result.polishedText).toBe('');
    });

    it('should handle different maxTokens values', async () => {
      vi.mocked(openaiService.polishText).mockResolvedValue(mockSuccessResult);

      await polishTextWithProvider(
        'openai',
        mockApiKey,
        mockText,
        mockPromptInstruction,
        4000,
        undefined
      );

      expect(openaiService.polishText).toHaveBeenCalledWith(
        mockApiKey,
        mockText,
        mockPromptInstruction,
        4000,
        undefined
      );
    });
  });

  describe('getProviderDisplayName', () => {
    it('should return "OpenAI" for openai provider', () => {
      expect(getProviderDisplayName('openai')).toBe('OpenAI');
    });

    it('should return "Claude" for claude provider', () => {
      expect(getProviderDisplayName('claude')).toBe('Claude');
    });

    it('should return "Gemini" for gemini provider', () => {
      expect(getProviderDisplayName('gemini')).toBe('Gemini');
    });

    it('should return the provider string for unknown providers', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getProviderDisplayName('unknown' as any)).toBe('unknown');
    });
  });
  describe('listModelsForProvider', () => {
    const mockModels = [{ id: 'model-1', label: 'Model 1' }];

    it('should route to the OpenAI service', async () => {
      vi.mocked(openaiService.listModels).mockResolvedValue(mockModels);

      const result = await listModelsForProvider('openai', mockApiKey);

      expect(openaiService.listModels).toHaveBeenCalledWith(mockApiKey);
      expect(claudeService.listModels).not.toHaveBeenCalled();
      expect(geminiService.listModels).not.toHaveBeenCalled();
      expect(result).toEqual(mockModels);
    });

    it('should route to the Claude service', async () => {
      vi.mocked(claudeService.listModels).mockResolvedValue(mockModels);

      await listModelsForProvider('claude', mockApiKey);

      expect(claudeService.listModels).toHaveBeenCalledWith(mockApiKey);
      expect(openaiService.listModels).not.toHaveBeenCalled();
    });

    it('should route to the Gemini service', async () => {
      vi.mocked(geminiService.listModels).mockResolvedValue(mockModels);

      await listModelsForProvider('gemini', mockApiKey);

      expect(geminiService.listModels).toHaveBeenCalledWith(mockApiKey);
      expect(openaiService.listModels).not.toHaveBeenCalled();
    });

    it('should throw for an unsupported provider', async () => {
      await expect(
        // @ts-expect-error - testing an unsupported provider at runtime
        listModelsForProvider('unknown', mockApiKey)
      ).rejects.toThrow('Unsupported provider: unknown');
    });
  });
});
