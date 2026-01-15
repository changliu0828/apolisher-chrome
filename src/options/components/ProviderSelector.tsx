import { useTranslation } from '@/i18n/useTranslation';
import { MessageKey } from '@/i18n/types';

interface ProviderSelectorProps {
  value: 'openai' | 'claude' | 'gemini';
  onChange: (value: 'openai' | 'claude' | 'gemini') => void;
}

export default function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label htmlFor="provider-select" className="block text-sm font-medium text-gray-700">
        {t(MessageKey.PROVIDER_LABEL)}
      </label>
      <select
        id="provider-select"
        value={value}
        onChange={(e) => onChange(e.target.value as 'openai' | 'claude' | 'gemini')}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="openai">{t(MessageKey.PROVIDER_OPENAI)}</option>
        <option value="claude">{t(MessageKey.PROVIDER_CLAUDE)}</option>
        <option value="gemini">{t(MessageKey.PROVIDER_GEMINI)}</option>
      </select>
      <p className="text-xs text-gray-500">{t(MessageKey.PROVIDER_DESCRIPTION)}</p>
    </div>
  );
}
