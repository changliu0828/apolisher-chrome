// Background service worker for v0.8
// Handles API calls to AI providers (OpenAI, Claude, Gemini)
import {
  MESSAGE_TYPES,
  type PolishRequest,
  type ListModelsRequest,
  type ListModelsResponse,
  type ErrorCode,
} from '@/types/messages';
import { PROMPT_PRESETS, type Settings } from '@/types/settings';
import { OPENAI_CONFIG, CLAUDE_CONFIG, GEMINI_CONFIG, type ProviderConfig } from '@/types/api';
import {
  polishTextWithProvider,
  listModelsForProvider,
  getProviderDisplayName,
} from '@/services/providerFactory';
import { fingerprintApiKey, isFresh, readCache, writeCache } from '@/services/modelCache';
import { FALLBACK_MODELS } from '@/constants/modelCatalog';
import { getMessage } from '@/i18n';
import { MessageKey } from '@/i18n/types';

// eslint-disable-next-line no-console
console.log('apolisher-chrome background service worker loaded');

/**
 * Convert image to greyscale using canvas
 */
// eslint-disable-next-line no-undef
async function convertToGreyscale(imagePath: string): Promise<ImageData> {
  // Fetch the image
  // eslint-disable-next-line no-undef
  const response = await fetch(chrome.runtime.getURL(imagePath));
  const blob = await response.blob();
  // eslint-disable-next-line no-undef
  const imageBitmap = await createImageBitmap(blob);

  // Create canvas and draw image
  // eslint-disable-next-line no-undef
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(imageBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);

  // Convert to greyscale
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grey = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = grey; // R
    data[i + 1] = grey; // G
    data[i + 2] = grey; // B
    // Keep alpha channel (i + 3) unchanged
  }

  return imageData;
}

/**
 * Update extension icon based on enabled state
 */
async function updateIcon(isEnabled: boolean): Promise<void> {
  try {
    if (isEnabled) {
      // Set to original colored icons
      await chrome.action.setIcon({
        path: {
          16: 'icons/icon16.png',
          32: 'icons/icon32.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png',
        },
      });
    } else {
      // Convert icons to greyscale
      const icon16 = await convertToGreyscale('icons/icon16.png');
      const icon32 = await convertToGreyscale('icons/icon32.png');
      const icon48 = await convertToGreyscale('icons/icon48.png');
      const icon128 = await convertToGreyscale('icons/icon128.png');

      await chrome.action.setIcon({
        imageData: {
          16: icon16,
          32: icon32,
          48: icon48,
          128: icon128,
        },
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to update icon:', error);
  }
}

/**
 * Initialize icon state on startup
 */
async function initializeIconState(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get('settings');
    const settings = result.settings as Settings | undefined;
    const isEnabled = settings?.isEnabled ?? true; // Default to enabled
    await updateIcon(isEnabled);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize icon state:', error);
  }
}

// Initialize icon state when service worker starts
initializeIconState();

// Listen for storage changes to update icon
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.settings) {
    const newSettings = changes.settings.newValue as Settings | undefined;
    const isEnabled = newSettings?.isEnabled ?? true;
    updateIcon(isEnabled);
  }
});

/**
 * Build prompt instruction from settings
 */
export function buildPromptInstruction(settings: Settings): string {
  if (settings.selectedPreset === 'custom') {
    return settings.customPrompt || PROMPT_PRESETS.standard;
  }

  return PROMPT_PRESETS[settings.selectedPreset] || PROMPT_PRESETS.standard;
}

/**
 * Determine error code from error object
 */
export function determineErrorCode(error: Error): ErrorCode {
  if (error.name === 'NO_API_KEY') return 'NO_API_KEY';
  if (error.name === 'NETWORK_ERROR') return 'NETWORK_ERROR';
  if (error.name === 'INVALID_RESPONSE') return 'INVALID_RESPONSE';
  if (error.name === 'INVALID_MODEL') return 'INVALID_MODEL';
  if (error.name === 'INVALID_API_KEY') return 'INVALID_API_KEY';
  return 'API_ERROR';
}

/**
 * Resolve the provider config for a provider
 */
export function getProviderConfig(provider: Settings['selectedProvider']): ProviderConfig {
  switch (provider) {
    case 'openai':
      return OPENAI_CONFIG;
    case 'claude':
      return CLAUDE_CONFIG;
    case 'gemini':
      return GEMINI_CONFIG;
    default:
      return OPENAI_CONFIG;
  }
}

/**
 * Resolve the model to use: the user's choice, or the provider's default.
 * Settings stored before v1.0 have no `models` field at all.
 */
export function resolveModel(settings: Settings | undefined): string {
  const provider = settings?.selectedProvider || 'openai';
  const config = getProviderConfig(provider);
  return settings?.models?.[provider] || config.model;
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
          error: getMessage(MessageKey.ERROR_NO_API_KEY, [providerName]),
          code: 'NO_API_KEY' as ErrorCode,
        },
      });
      return;
    }

    // At this point, settings must exist (we've validated it above)
    if (!settings) return;

    // Build prompt instruction
    const promptInstruction = buildPromptInstruction(settings);

    // Get max tokens and selected model based on provider
    const providerConfig = getProviderConfig(provider);
    const maxTokens = settings.maxCompletionTokens || providerConfig.defaultMaxTokens;
    const model = resolveModel(settings);

    // Call provider's API through factory
    const apiResult = await polishTextWithProvider(
      provider,
      apiKey,
      message.payload.text,
      promptInstruction,
      maxTokens,
      model
    );

    // Send success response (usage format already unified)
    await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.POLISH_RESPONSE,
      payload: {
        polishedText: apiResult.polishedText,
        provider: getProviderDisplayName(provider),
        model,
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
 * Handle a list-models request from the Options Page.
 *
 * Order of preference: fresh cache -> live fetch -> stale cache -> the
 * bundled fallback list. Never rejects: the UI always gets a usable list.
 */
export async function handleListModelsRequest(
  message: ListModelsRequest
): Promise<ListModelsResponse['payload']> {
  const { provider, forceRefresh } = message.payload;

  const storageResult = await chrome.storage.sync.get('settings');
  const settings = storageResult.settings as Settings | undefined;
  const apiKey = settings?.apiKeys?.[provider] || '';

  // Without a key there is nothing to fetch - show the fallback list
  if (!apiKey || apiKey.trim().length === 0) {
    const providerName = getProviderDisplayName(provider);
    return {
      provider,
      models: FALLBACK_MODELS[provider],
      source: 'fallback',
      error: getMessage(MessageKey.ERROR_NO_API_KEY, [providerName]),
      errorCode: 'NO_API_KEY',
    };
  }

  const keyFingerprint = fingerprintApiKey(apiKey);
  const cached = await readCache(provider, keyFingerprint);

  if (!forceRefresh && isFresh(cached, keyFingerprint)) {
    return { provider, models: cached!.models, source: 'cache' };
  }

  try {
    const models = await listModelsForProvider(provider, apiKey);

    if (models.length === 0) {
      return { provider, models: FALLBACK_MODELS[provider], source: 'fallback' };
    }

    await writeCache(provider, models, keyFingerprint);
    return { provider, models, source: 'network' };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to list models:', error);

    const errorObj = error as Error;
    const payload = {
      error: errorObj.message || 'An unknown error occurred',
      errorCode: determineErrorCode(errorObj),
    };

    // Serve a stale cache before falling back to the bundled list
    if (cached && cached.models.length > 0) {
      return { provider, models: cached.models, source: 'cache', ...payload };
    }

    return { provider, models: FALLBACK_MODELS[provider], source: 'fallback', ...payload };
  }
}

/**
 * Listen for messages from content script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.LIST_MODELS_REQUEST) {
    handleListModelsRequest(message as ListModelsRequest)
      .then((payload) => {
        sendResponse({ type: MESSAGE_TYPES.LIST_MODELS_RESPONSE, payload });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to handle list models request:', error);
        const provider = (message as ListModelsRequest).payload.provider;
        sendResponse({
          type: MESSAGE_TYPES.LIST_MODELS_RESPONSE,
          payload: {
            provider,
            models: FALLBACK_MODELS[provider],
            source: 'fallback',
            error: (error as Error).message,
            errorCode: 'API_ERROR' as ErrorCode,
          },
        });
      });
    // Keep the message channel open for the async sendResponse
    return true;
  }

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
