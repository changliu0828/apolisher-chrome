# PRD: apolisher-chrome

**Version:** 1.0  
**Status:** Draft  
**Platform:** Google Chrome Extension (Manifest V3)  
**License:** MIT

---

## 1. Executive Summary
**apolisher-chrome** is a privacy-first browser extension that allows users to refine text on any webpage using their own AI API key. It focuses on transparency, allowing users to compare the original text against the AI-polished version before applying changes. Supports OpenAI, Claude, and Gemini APIs (v0.7), with internationalization support for 10 locales (v0.8).

---

## 2. User Flow
1.  **Setup:** User installs `apolisher-chrome`, opens settings, selects AI provider (OpenAI, Claude, or Gemini), and inputs their API key.
2.  **Selection:** User highlights text on a webpage (e.g., email, form, Google Doc).
3.  **Trigger:** A small floating action button appears near the selection.
4.  **Action:** User clicks the button; the extension sends the text to the selected AI provider.
5.  **Review:** A modal opens displaying a comparison of **Original** vs. **Polished** text (Visual Diff).
6.  **Commit:**
    * **Accept:** Instantly replaces the text on the page.
    * **Retry:** Generates a new version.
    * **Discard:** Closes without changes.

---

## 3. Key Features & Requirements

### 3.1 Settings (Options Page)
*The user configures these global preferences once:*
* **AI Provider Selection:** Choose between OpenAI (GPT-4o Mini), Claude (3.5 Haiku), or Gemini (2.5 Flash)
* **Model Selection (planned, v1.0):** Pick the model to use for the selected provider — see §3.5
* **API Key:** User inputs API Key for selected provider
* **Prompt Presets (Style):** Each preset is stored in `src/prompts/` directory
    * *Standard:* "Fix grammar and flow."
    * *Professional:* "Make it formal and concise."
    * *Native:* "Rewrite to sound like a native speaker."
    * *Simplified:* "Make it easy to understand."
    * *Emotional Intelligence:* "Express your true view while making the other person feel understood and respected."
* **Custom Prompt:** Ability to add specific instructions (e.g., "Use US English").
* **Advanced Settings:**
    * *Max Completion Tokens:* Control response length and API costs (100-8192 tokens, default: 2000).
* **Language Support:** Automatic locale detection with support for 10 locales (en, zh_CN, zh_TW, ja, es, pt, fr, de, ru, hi)

### 3.2 The Interaction (Content Script)
* **Trigger Logic:** Listens for text selection (`mouseup`). If selection > 0 characters, show the floating button.
* **Floating Button:** Minimalist icon (✨) positioned at the end of the text selection.

### 3.3 The UI (Modal & Diff View)
* **Design:** Clean, white-label overlay using Shadow DOM (to isolate styles).
* **Comparison Engine:** visually highlights differences between the source and result with git-diff style:
    * **Deletions:** Red background + strikethrough.
    * **Additions:** Green background.
* **Controls:** `[Accept]`, `[Regenerate]`, `[Close]`.

### 3.4 Text Replacement
* **Primary Method:** Direct DOM manipulation for `contentEditable` elements and standard inputs.
* **Fallback:** If direct replacement is blocked (e.g., specific complex web apps), copy the result to the clipboard and show a toast notification ("Copied to clipboard").

### 3.5 Model Selection (planned, v1.0)
*Today the model is hardcoded per provider in `src/types/api.ts` (`gpt-4o-mini`, `claude-3-5-haiku-20241022`, `gemini-2.5-flash`) and is not user-configurable. v1.0 makes it a setting.*
* **Goal:** The user picks which model to use for each provider from the Options Page, so they can trade cost against quality without waiting for an extension release.
* **UI:** A model dropdown in the Options Page, shown below the provider selector and scoped to the currently selected provider (only that provider's models are listed).
* **Per-provider persistence:** The choice is stored per provider in `chrome.storage.sync`, so switching provider and switching back restores that provider's previously chosen model.
* **Model catalog:** Each provider declares its selectable models in code (id + display label), with one marked as the default. Defaults are the models currently hardcoded, so existing users see no behavior change after upgrading.
* **Defaults & migration:** Settings saved before v1.0 have no model field; those fall back to the provider's default model rather than erroring.
* **Request path:** The background service worker sends the chosen model instead of the provider constant. For Gemini this also changes the request URL, since the model id is part of the path.
* **Feedback:** The diff modal footer already displays provider and model — it must reflect the user's selection, not a constant.
* **Error handling:** If the API rejects the model (unknown id, no account access), surface a provider-aware error telling the user to pick a different model, rather than a generic failure.
* **i18n:** New UI strings (label, help text, error message) are added to all 10 locales with type-safe MessageKey entries.

---

## 4. Technical Stack
* **Core:** React, Vite, TypeScript.
* **Styles:** Tailwind CSS.
* **State/Storage:** `chrome.storage.sync` (Encrypted/Private).
* **Diff Library:** `diff` or `jsdiff`.
* **API:** Direct client-side calls to AI providers (OpenAI, Claude, Gemini) via background service worker. No backend server.
* **i18n:** Chrome native `chrome.i18n` API with type-safe MessageKey enum (10 locales: en, zh_CN, zh_TW, ja, es, pt, fr, de, ru, hi)
* **Testing:** Vitest + happy-dom + @testing-library/react (shared setup, mocks, and fixtures in `src/test/`)

---

## 5. Roadmap
- [x] **v0.1:** Project Scaffold & Manifest V3 setup (ESLint, pre-commit hooks, basic manifest).
- [x] **v0.2:** Options Page (API Key storage, prompt presets, chrome.storage.sync, version management).
- [x] **v0.3:** Content Script (Selection detection & Floating button, Shadow DOM isolation, editable element detection).
- [x] **v0.4:** Diff View UI & Text Replacement logic (Mock Polisher, inline SVG icons, click-outside-to-close).
- [x] **v0.5:** AI Integration - OpenAI (Background service worker, API integration, max tokens setting, modular prompt system).
- [x] **v0.6:** Multi-Provider Support - Claude API (Provider selection UI, Claude API adapter, unified API interface).
- [x] **v0.7:** Multi-Provider Support - Gemini API (Gemini API adapter, unified provider interface, Gemini 2.5 Flash model).
- [x] **v0.8:** Internationalization (i18n support with Chrome native API, type-safe MessageKey enum; now 10 locales).
- [x] **v0.9:** Emotional Intelligence style preset, popup menu with enable/disable toggle, Vitest test suite, IME input support, PRIVACY.md, packaging command.
- [ ] **v1.0:** Per-provider model selection in the Options Page (model dropdown scoped to the selected provider, per-provider persistence, model catalog with defaults matching today's hardcoded models). See §3.5.
