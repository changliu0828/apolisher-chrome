import { PROMPT_PRESETS, type Settings } from '@/types/settings';

interface PromptPresetsProps {
  selectedPreset: Settings['selectedPreset'];
  onChange: (preset: Settings['selectedPreset']) => void;
}

const presetOptions: Array<{
  id: Settings['selectedPreset'];
  label: string;
  description: string;
}> = [
  { id: 'standard', label: 'Standard', description: PROMPT_PRESETS.standard },
  { id: 'professional', label: 'Professional', description: PROMPT_PRESETS.professional },
  { id: 'native', label: 'Native Speaker', description: PROMPT_PRESETS.native },
  { id: 'simplified', label: 'Simplified', description: PROMPT_PRESETS.simplified },
  { id: 'custom', label: 'Custom', description: 'Use your own prompt instructions' },
];

export default function PromptPresets({ selectedPreset, onChange }: PromptPresetsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {presetOptions.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onChange(preset.id)}
          className={`
            text-left p-4 rounded-lg border-2 transition-all
            ${
              selectedPreset === preset.id
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{preset.label}</h3>
              <p className="mt-1 text-sm text-gray-600">{preset.description}</p>
            </div>
            {selectedPreset === preset.id && (
              <svg
                className="w-5 h-5 text-primary-600 flex-shrink-0 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
