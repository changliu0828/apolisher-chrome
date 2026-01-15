export enum MessageKey {
  // Brand (2 keys)
  BRAND_NAME = 'brand_name',
  BRAND_SLOGAN = 'brand_slogan',

  // Modal (7 keys)
  MODAL_LOADING_TEXT = 'modal_loading_text',
  MODAL_ACCEPT_LABEL = 'modal_accept_label',
  MODAL_REGENERATE_LABEL = 'modal_regenerate_label',
  MODAL_CLOSE_LABEL = 'modal_close_label',
  MODAL_RETRY_LABEL = 'modal_retry_label',
  MODAL_SETTINGS_LABEL = 'modal_settings_label',
  MODAL_POWERED_BY = 'modal_powered_by',

  // Errors (3 keys)
  ERROR_NO_API_KEY = 'error_no_api_key',
  ERROR_NETWORK = 'error_network',
  ERROR_API = 'error_api',

  // Options Page (3 keys)
  OPTIONS_TITLE = 'options_title',
  OPTIONS_SAVED = 'options_saved',
  OPTIONS_ERROR_LOADING = 'options_error_loading',

  // Provider Selector (5 keys)
  PROVIDER_LABEL = 'provider_label',
  PROVIDER_DESCRIPTION = 'provider_description',
  PROVIDER_OPENAI = 'provider_openai',
  PROVIDER_CLAUDE = 'provider_claude',
  PROVIDER_GEMINI = 'provider_gemini',

  // API Key Input (5 keys)
  API_KEY_SECTION_TITLE = 'api_key_section_title',
  API_KEY_HIDE_LABEL = 'api_key_hide_label',
  API_KEY_SHOW_LABEL = 'api_key_show_label',
  API_KEY_PRIVACY_NOTICE = 'api_key_privacy_notice',
  API_KEY_GET_LINK_TEXT = 'api_key_get_link_text',

  // Prompt Presets (11 keys)
  PROMPT_STYLE_TITLE = 'prompt_style_title',
  PRESET_STANDARD_LABEL = 'preset_standard_label',
  PRESET_STANDARD_DESCRIPTION = 'preset_standard_description',
  PRESET_PROFESSIONAL_LABEL = 'preset_professional_label',
  PRESET_PROFESSIONAL_DESCRIPTION = 'preset_professional_description',
  PRESET_NATIVE_LABEL = 'preset_native_label',
  PRESET_NATIVE_DESCRIPTION = 'preset_native_description',
  PRESET_SIMPLIFIED_LABEL = 'preset_simplified_label',
  PRESET_SIMPLIFIED_DESCRIPTION = 'preset_simplified_description',
  PRESET_CUSTOM_LABEL = 'preset_custom_label',
  PRESET_CUSTOM_DESCRIPTION = 'preset_custom_description',

  // Custom Prompt (4 keys)
  CUSTOM_PROMPT_TITLE = 'custom_prompt_title',
  CUSTOM_PROMPT_PLACEHOLDER = 'custom_prompt_placeholder',
  CUSTOM_PROMPT_HINT = 'custom_prompt_hint',
  CUSTOM_PROMPT_CHARACTER_COUNT = 'custom_prompt_character_count',

  // Advanced Settings (3 keys)
  ADVANCED_SETTINGS_TITLE = 'advanced_settings_title',
  MAX_TOKENS_LABEL = 'max_tokens_label',
  MAX_TOKENS_DESCRIPTION = 'max_tokens_description',

  // Footer (3 keys)
  FOOTER_GITHUB = 'footer_github',
  FOOTER_SPONSOR = 'footer_sponsor',
  FOOTER_VERSION = 'footer_version',

  // Floating Button (2 keys)
  FLOATING_BUTTON_ARIA_LABEL = 'floating_button_aria_label',
  FLOATING_BUTTON_ICON_ALT = 'floating_button_icon_alt',
}

export type MessageKeyString = `${MessageKey}`;
