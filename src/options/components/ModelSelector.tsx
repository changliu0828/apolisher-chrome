import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { MessageKey } from '@/i18n/types';
import { MESSAGE_TYPES, type ListModelsResponse } from '@/types/messages';
import { getDefaultModel } from '@/constants/modelCatalog';
import type { ModelOption } from '@/types/api';
import type { AIProvider } from '@/types/settings';

interface ModelSelectorProps {
  provider: AIProvider;
  /** Selected model id, or '' to use the provider default */
  value: string;
  /**
   * Whether the selected provider has an API key. Used only to reload the list
   * once a key is first entered - the key itself never leaves the background
   * worker's storage read.
   */
  hasApiKey: boolean;
  onChange: (value: string) => void;
}

type LoadState = 'loading' | 'loaded';

export default function ModelSelector({
  provider,
  value,
  hasApiKey,
  onChange,
}: ModelSelectorProps) {
  const { t } = useTranslation();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [payload, setPayload] = useState<ListModelsResponse['payload'] | null>(null);

  const loadModels = useCallback(
    async (forceRefresh: boolean) => {
      setState('loading');
      try {
        const response = (await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.LIST_MODELS_REQUEST,
          payload: { provider, forceRefresh },
        })) as ListModelsResponse | undefined;

        // Ignore a response that arrived after the provider changed
        if (!response || response.payload.provider !== provider) return;

        setModels(response.payload.models);
        setPayload(response.payload);
      } catch {
        setModels([]);
        setPayload(null);
      } finally {
        setState('loaded');
      }
    },
    [provider]
  );

  // Reload when the provider changes, and once a key is added for it
  useEffect(() => {
    loadModels(false);
  }, [loadModels, hasApiKey]);

  // Keep a previously chosen model selectable even if it is not in the list
  const options: ModelOption[] =
    value && !models.some((model) => model.id === value)
      ? [...models, { id: value, label: value }]
      : models;

  const hint = () => {
    if (state === 'loading') return t(MessageKey.MODEL_LOADING);
    if (payload?.errorCode === 'NO_API_KEY') return t(MessageKey.MODEL_NEEDS_API_KEY);
    if (payload?.errorCode === 'INVALID_API_KEY') return t(MessageKey.ERROR_INVALID_API_KEY);
    // Include the provider's own message - it is what makes the failure actionable
    if (payload?.error) return `${t(MessageKey.MODEL_ERROR_FETCH)} (${payload.error})`;
    if (payload?.source === 'cache') return t(MessageKey.MODEL_CACHED_NOTICE);
    return t(MessageKey.MODEL_DESCRIPTION);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">
          {t(MessageKey.MODEL_LABEL)}
        </label>
        <button
          type="button"
          onClick={() => loadModels(true)}
          disabled={state === 'loading'}
          className="text-xs text-gray-500 hover:text-gray-900 hover:underline disabled:opacity-50"
        >
          {t(MessageKey.MODEL_REFRESH)}
        </button>
      </div>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={state === 'loading'}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
      >
        <option value="">
          {t(MessageKey.MODEL_DEFAULT_OPTION, [getDefaultModel(provider)])}
        </option>
        {options.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">{hint()}</p>
    </div>
  );
}
