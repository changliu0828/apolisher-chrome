import { createShadowRoot, injectStyles } from '@/utils/shadowDOM';
import { BUTTON_STYLES } from './styles';
import type { Position } from '@/utils/positioning';

export interface SelectionContext {
  selectedText: string;
  element: HTMLElement;
  buttonPosition: Position;
}

interface FloatingButtonConfig {
  onPolishClick?: (context: SelectionContext) => void;
}

export class FloatingButton {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private isVisible = false;
  private config: FloatingButtonConfig;
  private currentContext: SelectionContext | null = null;

  constructor(config: FloatingButtonConfig = {}) {
    this.config = config;
    this.init();
  }

  private init(): void {
    const { container, shadow } = createShadowRoot();
    this.container = container;

    // Inject styles
    injectStyles(shadow, BUTTON_STYLES);

    // Create button element
    this.button = document.createElement('button');
    this.button.className = 'floating-button';
    this.button.setAttribute('aria-label', 'Polish text with AI');

    // Create icon element
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/icon32.png');
    icon.alt = 'Polish';
    this.button.appendChild(icon);

    // Add click handler
    this.button.addEventListener('click', this.handleClick.bind(this));

    shadow.appendChild(this.button);

    // Initially hidden
    this.hide();
  }

  private handleClick(): void {
    if (this.currentContext && this.config.onPolishClick) {
      this.config.onPolishClick(this.currentContext);
    }
  }

  /**
   * Show the button at the specified position
   */
  public show(position: Position, context: SelectionContext): void {
    if (!this.button || !this.container) return;

    // Store context
    this.currentContext = { ...context, buttonPosition: position };

    this.button.style.top = `${position.top}px`;
    this.button.style.left = `${position.left}px`;
    this.button.style.display = 'flex';
    this.container.style.display = 'block';
    this.isVisible = true;
  }

  /**
   * Hide the button
   */
  public hide(): void {
    if (!this.button || !this.container) return;

    this.button.style.display = 'none';
    this.container.style.display = 'none';
    this.isVisible = false;
  }

  /**
   * Check if button is currently visible
   */
  public get visible(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy the button and clean up
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.button = null;
    this.isVisible = false;
  }
}
