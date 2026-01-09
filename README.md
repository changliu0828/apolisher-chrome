# apolisher-chrome

![Version](https://img.shields.io/badge/version-0.5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-red)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

A privacy-first Chrome extension that polishes text on any webpage using AI. Select text, click the polish button, and get AI-enhanced suggestions with visual diff comparison.

## Features

- **Text Polishing**: Select any text and polish it with AI using your own OpenAI API key
- **Multiple Presets**: Standard, Professional, Native Speaker, Simplified, or Custom prompts
- **Visual Diff**: See changes highlighted with insertions (green) and deletions (red)
- **Smart Positioning**: Modal automatically positions above or below based on available space
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

1. **Setup**: Add your OpenAI API key in the extension settings
2. **Select**: Highlight text on any webpage
3. **Polish**: Click the ✨ button that appears
4. **Review**: View the diff comparison in the modal
5. **Accept**: Click the checkmark to apply changes

## Configuration

Access settings by clicking the extension icon or right-clicking and selecting "Options":

- **API Key**: Your OpenAI API key (stored securely in Chrome sync storage)
- **Prompt Presets**: Choose from Standard, Professional, Native, Simplified, or Custom
- **Max Tokens**: Control response length (100-4000 tokens, default: 2000)

## Tech Stack

- **React** + **TypeScript** - UI components
- **Vite** - Build system with @crxjs/vite-plugin
- **Tailwind CSS** - Styling
- **Chrome Extension Manifest V3** - Extension architecture
- **OpenAI API** - gpt-4o-mini model
- **Shadow DOM** - Style isolation for content script

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
```

## Project Structure

```
src/
├── background/      # Service worker for API calls
├── content/         # Content script and UI components
├── options/         # Settings page
├── prompts/         # Prompt presets
├── services/        # OpenAI API service
├── types/           # TypeScript types
└── utils/           # Utilities
```

## License

MIT
