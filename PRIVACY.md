# Privacy Policy for apolisher-chrome

**Last Updated:** January 22, 2026

## Overview

apolisher-chrome is a privacy-first Chrome extension that allows users to polish text on webpages using their own AI API keys. This privacy policy explains what data we collect, how it's used, and your rights.

## Data Collection and Usage

### What Data We Collect

1. **API Keys**: Your OpenAI, Claude, or Gemini API keys (depending on which provider you select)
2. **User Settings**: Your selected AI provider, prompt presets, custom prompts, and max token settings
3. **Selected Text**: Text you select on webpages to be polished

### How We Use Your Data

- **API Keys**: Stored locally in Chrome's sync storage and used solely to authenticate API requests to your chosen AI provider
- **User Settings**: Stored locally to remember your preferences across browser sessions
- **Selected Text**: Sent directly to your chosen AI provider's API for text polishing, then immediately discarded

### Where Your Data is Stored

- **API Keys and Settings**: Stored locally in your browser using `chrome.storage.sync` (synchronized across your Chrome browsers if you're signed in)
- **Selected Text**: Temporarily processed in memory, never stored permanently

### Third-Party Data Sharing

Your selected text is sent to **only one** of the following AI providers based on your selection:
- **OpenAI** (https://openai.com) - if you select OpenAI as your provider
- **Anthropic Claude** (https://anthropic.com) - if you select Claude as your provider
- **Google Gemini** (https://ai.google.dev) - if you select Gemini as your provider

**Important**: We do NOT send your data to any other third parties. No analytics, no telemetry, no tracking.

Each AI provider has their own privacy policy and data handling practices:
- OpenAI Privacy Policy: https://openai.com/policies/privacy-policy
- Anthropic Privacy Policy: https://www.anthropic.com/legal/privacy
- Google AI Privacy Policy: https://policies.google.com/privacy

## What We DON'T Do

- ❌ We do NOT collect analytics or telemetry
- ❌ We do NOT track your browsing history
- ❌ We do NOT store your polished text
- ❌ We do NOT share your data with advertisers
- ❌ We do NOT have a backend server (all processing happens in your browser)

## Your Rights and Control

You have complete control over your data:

- **View Your Data**: Access your API keys and settings through the extension's Options page
- **Delete Your Data**: Remove your API keys and settings at any time through the Options page or by uninstalling the extension
- **Export Your Data**: Your settings are stored in Chrome sync storage and can be accessed through Chrome's developer tools

## Data Security

- API keys are stored using Chrome's secure storage APIs
- All API communications use HTTPS encryption
- No data is sent to our servers (we don't have any servers)

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date at the top of this document.

## Open Source

This extension is open source. You can review our code at: https://github.com/changliu0828/apolisher-chrome

## Contact

If you have questions about this privacy policy or data handling, please open an issue on our GitHub repository: https://github.com/changliu0828/apolisher-chrome/issues

## Consent

By using apolisher-chrome, you agree to this privacy policy.
