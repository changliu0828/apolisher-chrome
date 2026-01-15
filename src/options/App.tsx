import { useSettings } from '@/hooks/useSettings';
import { APP_VERSION } from '@/constants/version';
import { useTranslation } from '@/i18n/useTranslation';
import { MessageKey } from '@/i18n/types';
import ProviderSelector from './components/ProviderSelector';
import ApiKeyInput from './components/ApiKeyInput';
import PromptPresets from './components/PromptPresets';
import CustomPrompt from './components/CustomPrompt';
import MaxTokensInput from './components/MaxTokensInput';

export default function App() {
  const { t } = useTranslation();
  const {
    settings,
    updateProvider,
    updateApiKey,
    updatePreset,
    updateCustomPrompt,
    updateMaxCompletionTokens,
    isPersistent,
    error,
  } = useSettings();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-800">{t(MessageKey.OPTIONS_ERROR_LOADING, [String(error)])}</p>
        </div>
      </div>
    );
  }

  // Get provider display name
  const getProviderName = () => {
    switch (settings.selectedProvider) {
      case 'openai':
        return 'OpenAI';
      case 'claude':
        return 'Claude';
      case 'gemini':
        return 'Gemini';
      default:
        return settings.selectedProvider;
    }
  };
  const providerName = getProviderName();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t(MessageKey.OPTIONS_TITLE, [t(MessageKey.BRAND_NAME)])}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t(MessageKey.BRAND_SLOGAN)}
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Provider Selection Section */}
          <div>
            <ProviderSelector
              value={settings.selectedProvider}
              onChange={updateProvider}
            />
          </div>

          {/* API Key Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t(MessageKey.API_KEY_SECTION_TITLE, [providerName])}</h2>
            <ApiKeyInput
              value={settings.apiKeys[settings.selectedProvider]}
              onChange={updateApiKey}
              provider={settings.selectedProvider}
            />
          </div>

          {/* Prompt Presets Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t(MessageKey.PROMPT_STYLE_TITLE)}</h2>
            <PromptPresets
              selectedPreset={settings.selectedPreset}
              onChange={updatePreset}
            />
          </div>

          {/* Custom Prompt Section (conditional) */}
          {settings.selectedPreset === 'custom' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t(MessageKey.CUSTOM_PROMPT_TITLE)}</h2>
              <CustomPrompt
                value={settings.customPrompt}
                onChange={updateCustomPrompt}
              />
            </div>
          )}

          {/* Advanced Settings Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t(MessageKey.ADVANCED_SETTINGS_TITLE)}</h2>
            <MaxTokensInput
              value={settings.maxCompletionTokens}
              onChange={updateMaxCompletionTokens}
            />
          </div>

          {/* Status Indicator */}
          {isPersistent && (
            <div className="flex items-center justify-center pt-4">
              <div className="flex items-center text-sm text-green-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t(MessageKey.OPTIONS_SAVED)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
          <p>{t(MessageKey.FOOTER_VERSION, [t(MessageKey.BRAND_NAME), APP_VERSION, t(MessageKey.BRAND_SLOGAN)])}</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/changliu0828/apolisher-chrome"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 hover:underline flex items-center gap-1"
            >
              <i className="fa-brands fa-github"></i>
              {t(MessageKey.FOOTER_GITHUB)}
            </a>
            <span>•</span>
            <a
              href="https://github.com/sponsors/changliu0828"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 hover:underline flex items-center gap-1"
            >
              <i className="fa-regular fa-heart"></i>
              {t(MessageKey.FOOTER_SPONSOR)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
