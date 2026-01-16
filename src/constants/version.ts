import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;

export const ROADMAP = {
  'v0.1': 'Project Scaffold & Manifest V3 setup',
  'v0.2': 'Options Page (API Key storage)',
  'v0.3': 'Content Script (Selection detection & Floating button)',
  'v0.4': 'Diff View UI & Text Replacement logic (Mock Polisher)',
  'v0.5': 'AI Integration (OpenAI API)',
  'v0.6': 'Multi-provider AI Support (Claude API)',
  'v0.7': 'Multi-provider AI Support (Gemini API)',
  'v0.8': 'Internationalization (i18n)',
} as const;
