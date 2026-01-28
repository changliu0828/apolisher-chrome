/**
 * Prompt Presets
 *
 * This file aggregates all prompt presets from individual files.
 * Each preset is stored in its own file for better organization and documentation.
 */

import { standardPrompt } from './standard';
import { professionalPrompt } from './professional';
import { nativePrompt } from './native';
import { simplifiedPrompt } from './simplified';
import { emotionalIntelligencePrompt } from './emotionalIntelligence';

export const PROMPT_PRESETS = {
  standard: standardPrompt,
  professional: professionalPrompt,
  native: nativePrompt,
  simplified: simplifiedPrompt,
  emotionalIntelligence: emotionalIntelligencePrompt,
} as const;

export type PromptPreset = keyof typeof PROMPT_PRESETS;
