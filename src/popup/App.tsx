import { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/i18n/useTranslation';
import { MessageKey } from '@/i18n/types';

export default function App() {
  const { settings, updateIsEnabled, isPersistent } = useSettings();
  const { t } = useTranslation();
  const [enableTransitions, setEnableTransitions] = useState(false);

  // Enable transitions after initial render to prevent flickering
  useEffect(() => {
    if (isPersistent) {
      // Small delay to ensure initial state is rendered first
      const timer = setTimeout(() => setEnableTransitions(true), 50);
      // eslint-disable-next-line no-undef
      return () => clearTimeout(timer);
    }
  }, [isPersistent]);

  const handleToggle = () => {
    updateIsEnabled(!settings.isEnabled);
  };

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  // Don't render until settings are loaded to prevent flickering
  if (!isPersistent) {
    return <div className="w-52 bg-white h-24" />;
  }

  return (
    <div className="w-52 bg-white">
      {/* Toggle Row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <label htmlFor="enable-toggle" className="text-gray-700 cursor-pointer">
          {t(MessageKey.POPUP_ENABLE_LABEL)}
        </label>
        <button
          id="enable-toggle"
          type="button"
          role="switch"
          aria-checked={settings.isEnabled}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            enableTransitions ? 'transition-colors duration-200' : ''
          } ${settings.isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white ${
              enableTransitions ? 'transition-transform duration-200' : ''
            } ${settings.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {/* Settings Button Row */}
      <button
        type="button"
        onClick={handleOpenOptions}
        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {t(MessageKey.POPUP_OPEN_OPTIONS_BUTTON)}
      </button>
    </div>
  );
}
