import { useSettings } from '@/hooks/useSettings';
import { APP_VERSION } from '@/constants/version';
import { BRAND } from '@/constants/strings';
import ProviderSelector from './components/ProviderSelector';
import ApiKeyInput from './components/ApiKeyInput';
import PromptPresets from './components/PromptPresets';
import CustomPrompt from './components/CustomPrompt';
import MaxTokensInput from './components/MaxTokensInput';

export default function App() {
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
          <p className="text-red-800">Error loading settings: {String(error)}</p>
        </div>
      </div>
    );
  }

  // Get provider display name
  const providerName = settings.selectedProvider === 'openai' ? 'OpenAI' : 'Claude';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{BRAND.NAME} Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            {BRAND.SLOGAN}
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">{providerName} API Key</h2>
            <ApiKeyInput
              value={settings.apiKeys[settings.selectedProvider]}
              onChange={updateApiKey}
              provider={settings.selectedProvider}
            />
          </div>

          {/* Prompt Presets Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Prompt Style</h2>
            <PromptPresets
              selectedPreset={settings.selectedPreset}
              onChange={updatePreset}
            />
          </div>

          {/* Custom Prompt Section (conditional) */}
          {settings.selectedPreset === 'custom' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Custom Prompt</h2>
              <CustomPrompt
                value={settings.customPrompt}
                onChange={updateCustomPrompt}
              />
            </div>
          )}

          {/* Advanced Settings Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h2>
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
                Settings saved automatically
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
          <p>{BRAND.NAME} v{APP_VERSION} • {BRAND.SLOGAN}</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/changliu0828/apolisher-chrome"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 hover:underline flex items-center gap-1"
            >
              <i className="fa-brands fa-github"></i>
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://github.com/sponsors/changliu0828"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 hover:underline flex items-center gap-1"
            >
              <i className="fa-regular fa-heart"></i>
              Sponsor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
