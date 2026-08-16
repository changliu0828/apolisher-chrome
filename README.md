<p align="center">
  <img src="public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>A polish for your text with AI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.9.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <strong>English</strong> |
  <a href="readme/README.zh-CN.md">简体中文</a> |
  <a href="readme/README.zh-TW.md">繁體中文</a> |
  <a href="readme/README.ja.md">日本語</a> |
  <a href="readme/README.es.md">Español</a> |
  <a href="readme/README.pt.md">Português</a> |
  <a href="readme/README.fr.md">Français</a> |
  <a href="readme/README.de.md">Deutsch</a> |
  <a href="readme/README.ru.md">Русский</a> |
  <a href="readme/README.hi.md">हिन्दी</a>
</p>

---

A privacy-first Chrome extension that polishes text on any webpage using AI. Select text, click the polish button, and get AI-enhanced suggestions with visual diff comparison.

## Features

- **Multi-Provider AI Support**: Choose between OpenAI, Claude, or Gemini using your own API key
- **Text Polishing**: Select any text and polish it with AI
- **Multiple Presets**: Standard, Professional, Native Speaker, Simplified, Emotional Intelligence, or Custom prompts
- **Quick Toggle**: Enable or disable the extension from the toolbar popup
- **Visual Diff**: See changes highlighted with insertions (green) and deletions (red)
- **Privacy First**: Your API key stays local, no data collection or telemetry
- **Universal Compatibility**: Works on any webpage including Gmail, Google Docs, and more

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. **Setup**: Choose your AI provider (OpenAI, Claude, or Gemini) and add your API key in the extension settings
2. **Select**: Highlight text on any webpage
3. **Polish**: Click the <img src="public/icons/icon32.png" width="16" height="16" alt="APolish icon" style="vertical-align: middle;"> button that appears
4. **Review**: View the diff comparison in the modal
5. **Accept**: Click the checkmark to apply changes

## Configuration

Access settings by clicking the extension icon or right-clicking and selecting "Options":

- **AI Provider**: Choose between OpenAI (GPT-4o Mini), Claude (3.5 Haiku), or Gemini (2.5 Flash)
- **API Key**: Your provider-specific API key (stored securely in Chrome sync storage)
- **Prompt Presets**: Choose from Standard, Professional, Native, Simplified, Emotional Intelligence, or Custom
- **Max Tokens**: Control response length (100-4000 tokens, default: 2000)

## Tech Stack

- **React** + **TypeScript** - UI components
- **Vite** - Build system with @crxjs/vite-plugin
- **Tailwind CSS** - Styling
- **Chrome Extension Manifest V3** - Extension architecture
- **Multi-Provider AI**: OpenAI (GPT-4o Mini), Claude (3.5 Haiku), or Gemini (2.5 Flash)
- **Shadow DOM** - Style isolation for content script
- **chrome.i18n** - Native internationalization (10 locales)
- **Vitest** + **happy-dom** - Unit tests (187 tests)

## Development

```bash
# Install dependencies
npm install

# Development build with HMR
npm run dev

# Production build
npm run build

# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm run test:run

# Build and package for the Chrome Web Store
npm run package
```

## Project Structure

```
src/
├── background/      # Service worker for API calls
├── content/         # Content script and UI components
├── hooks/           # Shared settings hook
├── i18n/            # Chrome i18n helpers and typed message keys
├── options/         # Settings page
├── popup/           # Toolbar popup (enable/disable toggle)
├── prompts/         # Prompt presets
├── services/        # Multi-provider AI services (OpenAI, Claude, Gemini)
├── test/            # Vitest setup, mocks, and fixtures
├── types/           # TypeScript types
└── utils/           # Utilities
```

## Support This Project

If you find apolisher-chrome useful, please consider sponsoring! Your support helps keep this project free and open-source.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**Ways to support:**
- ⭐ Star this repository
- 💖 [Become a sponsor](https://github.com/sponsors/changliu0828) (starting at $3/month)
- 🐛 Report bugs and contribute code
- 📢 Share with others who might find it useful

### Sponsors

Thank you to all our sponsors! 🙏

<!-- sponsors --><!-- sponsors -->

*Become the first sponsor and get your name here!*

## License

MIT

