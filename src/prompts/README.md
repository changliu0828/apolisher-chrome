# Prompt Presets

This directory contains all the prompt presets used by the apolisher-chrome extension.

## Structure

Each prompt preset is stored in its own file for better organization and documentation:

```
src/prompts/
├── index.ts              # Aggregates all prompts
├── standard.ts           # General-purpose polishing
├── professional.ts       # Business/formal communication
├── native.ts            # Native speaker style
├── simplified.ts        # Plain language
└── README.md            # This file
```

## Adding a New Prompt Preset

### 1. Create a new prompt file

Create `src/prompts/your-preset-name.ts`:

```typescript
/**
 * Your Preset Name
 *
 * Purpose: Brief description of what this preset does
 * Use case: When to use this preset
 * Tone: Describe the tone (formal, casual, etc.)
 */

export const yourPresetNamePrompt = `Your prompt instruction here.`;
```

### 2. Update the index file

Add your new preset to `src/prompts/index.ts`:

```typescript
import { yourPresetNamePrompt } from './your-preset-name';

export const PROMPT_PRESETS = {
  standard: standardPrompt,
  professional: professionalPrompt,
  native: nativePrompt,
  simplified: simplifiedPrompt,
  yourPresetName: yourPresetNamePrompt,  // Add this line
} as const;
```

### 3. Update the Settings type

Update `src/types/settings.ts` to include your new preset:

```typescript
export interface Settings {
  apiKey: string;
  selectedPreset: 'standard' | 'professional' | 'native' | 'simplified' | 'yourPresetName' | 'custom';
  // ... rest of interface
}
```

### 4. Update the Options Page UI

Add your new preset to `src/options/components/PromptPresets.tsx` to make it selectable in the settings.

## Writing Good Prompts

### Best Practices

1. **Be Clear and Specific**: The AI should understand exactly what transformation you want
2. **Keep it Concise**: Shorter prompts are faster and cheaper to process
3. **Test Thoroughly**: Try your prompt with various types of text
4. **Document the Purpose**: Explain when and why to use this preset

### Examples

**Good Prompts:**
- ✅ "Make it formal and concise."
- ✅ "Rewrite to sound like a native speaker."
- ✅ "Simplify while maintaining key technical details."

**Avoid:**
- ❌ "Make it better" (too vague)
- ❌ "Fix all the problems and make it perfect" (too broad)
- ❌ Long, complex multi-paragraph instructions (inefficient)

## Current Presets

| Preset | Prompt | Use Case |
|--------|--------|----------|
| **Standard** | "Fix grammar and flow." | General text polishing |
| **Professional** | "Make it formal and concise." | Business emails, reports |
| **Native** | "Rewrite to sound like a native speaker." | Non-native English speakers |
| **Simplified** | "Make it easy to understand." | Complex/technical content |

## Testing Your Prompts

After adding a new preset:

1. Build the extension: `npm run build`
2. Reload in Chrome: chrome://extensions → click reload
3. Open settings and select your new preset
4. Test on various text samples:
   - Short sentences
   - Long paragraphs
   - Technical content
   - Casual writing
5. Verify the output matches your intended transformation

## Advanced: Dynamic Prompts

For more complex use cases, you can make prompts dynamic:

```typescript
export const contextAwarePrompt = (context?: string) =>
  `Make it ${context || 'professional'} and concise.`;
```

However, keep in mind that the current implementation uses static presets. You'd need to modify the architecture to support dynamic prompts.
