import React from 'react';

interface MaxTokensInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function MaxTokensInput({ value, onChange }: MaxTokensInputProps) {
  const MIN_TOKENS = 100;
  const MAX_TOKENS = 4000;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= MIN_TOKENS && newValue <= MAX_TOKENS) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="max-tokens-input" className="text-sm font-medium text-gray-700">
          Max Completion Tokens
        </label>
        <input
          id="max-tokens-input"
          type="number"
          min={MIN_TOKENS}
          max={MAX_TOKENS}
          value={value}
          onChange={handleInputChange}
          className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <input
        id="max-tokens-slider"
        type="range"
        min={MIN_TOKENS}
        max={MAX_TOKENS}
        step={100}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <div className="flex justify-between text-xs text-gray-500">
        <span>{MIN_TOKENS}</span>
        <span>{MAX_TOKENS}</span>
      </div>

      <p className="text-xs text-gray-500">
        Maximum tokens for AI responses. Lower values are faster and cheaper (typical: 100-500 for
        small edits, 1000-2000 for rewrites, 3000-4000 for extensive changes).
      </p>
    </div>
  );
}
