import { useTranslation } from '@/i18n/useTranslation';
import { MessageKey } from '@/i18n/types';

interface CustomPromptProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomPrompt({ value, onChange }: CustomPromptProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t(MessageKey.CUSTOM_PROMPT_PLACEHOLDER)}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {t(MessageKey.CUSTOM_PROMPT_HINT)}
        </p>
        <p className="text-xs text-gray-400">
          {t(MessageKey.CUSTOM_PROMPT_CHARACTER_COUNT, [value.length.toString()])}
        </p>
      </div>
    </div>
  );
}
