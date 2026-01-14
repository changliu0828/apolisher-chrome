// Background service worker for v0.7
// Handles API calls to AI providers (OpenAI, Claude, Gemini)
import { MESSAGE_TYPES, type PolishRequest, type ErrorCode } from '@/types/messages';
import { PROMPT_PRESETS, type Settings } from '@/types/settings';
import { OPENAI_CONFIG, CLAUDE_CONFIG, GEMINI_CONFIG, type ProviderConfig } from '@/types/api';
import { polishTextWithProvider, getProviderDisplayName } from '@/services/providerFactory';

// eslint-disable-next-line no-console
console.log('apolisher-chrome background service worker loaded');

/**
 * Build prompt instruction from settings
 */
function buildPromptInstruction(settings: Settings): string {
  if (settings.selectedPreset === 'custom') {
    return settings.customPrompt || PROMPT_PRESETS.standard;
  }

  return PROMPT_PRESETS[settings.selectedPreset] || PROMPT_PRESETS.standard;
}

/**
 * Determine error code from error object
 */
function determineErrorCode(error: Error): ErrorCode {
  if (error.name === 'NO_API_KEY') return 'NO_API_KEY';
  if (error.name === 'NETWORK_ERROR') return 'NETWORK_ERROR';
  if (error.name === 'INVALID_RESPONSE') return 'INVALID_RESPONSE';
  return 'API_ERROR';
}

/**
 * Handle polish text request
 */
async function handlePolishRequest(
  message: PolishRequest,
  tabId: number | undefined
): Promise<void> {
  if (!tabId) {
    // eslint-disable-next-line no-console
    console.error('No tab ID provided');
    return;
  }

  try {
    // Get settings from storage
    const storageResult = await chrome.storage.sync.get('settings');
    const settings = storageResult.settings as Settings | undefined;

    // Get selected provider and its API key
    const provider = settings?.selectedProvider || 'openai';
    const apiKey = settings?.apiKeys?.[provider] || '';

    // Validate API key exists
    if (!apiKey || apiKey.trim().length === 0) {
      const providerName = getProviderDisplayName(provider);
      await chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPES.POLISH_ERROR,
        payload: {
          error: `Please add your ${providerName} API key in the extension settings.`,
          code: 'NO_API_KEY' as ErrorCode,
        },
      });
      return;
    }

    // At this point, settings must exist (we've validated it above)
    if (!settings) return;

    // Build prompt instruction
    const promptInstruction = buildPromptInstruction(settings);

    // Get max tokens based on provider
    let providerConfig: ProviderConfig;
    switch (provider) {
      case 'openai':
        providerConfig = OPENAI_CONFIG;
        break;
      case 'claude':
        providerConfig = CLAUDE_CONFIG;
        break;
      case 'gemini':
        providerConfig = GEMINI_CONFIG;
        break;
      default:
        providerConfig = OPENAI_CONFIG;
    }
    const maxTokens = settings.maxCompletionTokens || providerConfig.defaultMaxTokens;

    // Call provider's API through factory
    const apiResult = await polishTextWithProvider(
      provider,
      apiKey,
      message.payload.text,
      promptInstruction,
      maxTokens
    );

    // Send success response (usage format already unified)
    await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.POLISH_RESPONSE,
      payload: {
        polishedText: apiResult.polishedText,
        provider: getProviderDisplayName(provider),
        model: providerConfig.model,
        usage: apiResult.usage,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error handling polish request:', error);

    const errorObj = error as Error;
    const errorCode = determineErrorCode(errorObj);
    const errorMessage = errorObj.message || 'An unknown error occurred';

    // Send error response
    await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.POLISH_ERROR,
      payload: {
        error: errorMessage,
        code: errorCode,
      },
    });
  }
}

/**
 * Listen for messages from content script
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === MESSAGE_TYPES.POLISH_REQUEST) {
    // Handle polish request asynchronously
    handlePolishRequest(message as PolishRequest, sender.tab?.id)
      .then(() => {
        // Request handled successfully
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to handle polish request:', error);
      });
  } else if (message.type === MESSAGE_TYPES.OPEN_OPTIONS) {
    // Open options page
    chrome.runtime.openOptionsPage();
  }
  // Return false - we're using chrome.tabs.sendMessage, not sendResponse
  return false;
});
