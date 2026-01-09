interface CustomPromptProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomPrompt({ value, onChange }: CustomPromptProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your custom prompt instructions..."
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Describe how you want your text to be polished
        </p>
        <p className="text-xs text-gray-400">
          {value.length} characters
        </p>
      </div>
    </div>
  );
}
