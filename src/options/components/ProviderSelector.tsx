interface ProviderSelectorProps {
  value: 'openai' | 'claude';
  onChange: (value: 'openai' | 'claude') => void;
}

export default function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="provider-select" className="block text-sm font-medium text-gray-700">
        AI Provider
      </label>
      <select
        id="provider-select"
        value={value}
        onChange={(e) => onChange(e.target.value as 'openai' | 'claude')}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="openai">OpenAI (GPT-4o Mini)</option>
        <option value="claude">Claude (3.5 Haiku)</option>
      </select>
      <p className="text-xs text-gray-500">Choose your preferred AI provider for text polishing</p>
    </div>
  );
}
