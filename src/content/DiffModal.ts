import { createShadowRoot, injectStyles } from '@/utils/shadowDOM';
import { renderOriginalDiff, renderPolishedDiff } from '@/utils/diffHighlighter';
import { DIFF_MODAL_STYLES } from './diffModalStyles';
import { BUTTON_SIZE } from '@/constants/buttonConfig';
import { MODAL_WIDTH, MODAL_HEIGHT, MODAL_VIEWPORT_PADDING } from '@/constants/modalConfig';
import { APP_VERSION } from '@/constants/version';
import { BRAND, MODAL } from '@/constants/strings';

interface Position {
  top: number;
  left: number;
}

interface DiffModalData {
  originalText: string;
  polishedText: string;
  position: Position;
  targetElement: HTMLElement;
  onAccept: (text: string) => void;
  onRegenerate: () => void;
}

interface ErrorOptions {
  onRetry: () => void;
  showSettings: boolean;
}

export class DiffModal {
  private container: HTMLDivElement | null = null;
  private modal: HTMLDivElement | null = null;
  private originalText: string = '';
  private polishedText: string = '';
  private onAccept?: (text: string) => void;
  private onRegenerate?: () => void;
  private isVisible = false;
  private handleOutsideClick = this.onOutsideClick.bind(this);
  private lastPosition: Position = { top: 100, left: 100 }; // Store last known position

  constructor() {
    this.init();
  }

  private init(): void {
    const { container, shadow } = createShadowRoot();
    this.container = container;
    this.container.id = 'apolisher-diff-modal-container';

    // Inject styles
    injectStyles(shadow, DIFF_MODAL_STYLES);

    // Create modal structure
    this.modal = document.createElement('div');
    this.modal.className = 'diff-modal';
    this.modal.style.display = 'none';

    const body = document.createElement('div');
    body.className = 'diff-modal-body';
    body.innerHTML = `
      <div class="diff-section">
        <div class="diff-content original-diff"></div>
      </div>
      <div class="diff-section">
        <div class="diff-content polished-diff"></div>
      </div>
    `;

    const footer = document.createElement('div');
    footer.className = 'diff-modal-footer';
    footer.innerHTML = `
      <div class="footer-brand">
        <div class="footer-brand-name">${BRAND.NAME} v${APP_VERSION}</div>
        <div class="footer-brand-slogan">${BRAND.SLOGAN}</div>
      </div>
      <div class="footer-buttons">
        <button class="btn btn-secondary regenerate-btn" aria-label="${MODAL.REGENERATE_LABEL}" title="${MODAL.REGENERATE_LABEL}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
        <button class="btn btn-primary accept-btn" aria-label="${MODAL.ACCEPT_LABEL}" title="${MODAL.ACCEPT_LABEL}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
      </div>
    `;

    this.modal.appendChild(body);
    this.modal.appendChild(footer);
    shadow.appendChild(this.modal);

    // Attach event listeners
    this.attachEventListeners(shadow);
  }

  private attachEventListeners(shadow: ShadowRoot): void {
    const acceptBtn = shadow.querySelector('.accept-btn');
    const regenerateBtn = shadow.querySelector('.regenerate-btn');

    acceptBtn?.addEventListener('click', () => this.handleAccept());
    regenerateBtn?.addEventListener('click', () => this.handleRegenerate());
  }

  private onOutsideClick(event: MouseEvent): void {
    if (!this.container || !this.modal) return;

    const target = event.target as Node;

    // Check if click is outside the container (not in shadow DOM)
    if (!this.container.contains(target)) {
      this.hide();
    }
  }

  private handleAccept(): void {
    if (this.onAccept) {
      this.onAccept(this.polishedText);
    }
  }

  private handleRegenerate(): void {
    if (this.onRegenerate) {
      this.onRegenerate();
    }
  }

  private calculatePosition(buttonPosition: Position, modalHeight?: number): Position {
    if (!this.modal) return buttonPosition;

    // Use actual modal height if provided, otherwise use config height
    const actualModalHeight = modalHeight || MODAL_HEIGHT;

    // Calculate button center point (absolute coordinates)
    const buttonCenterX = buttonPosition.left + BUTTON_SIZE / 2;
    const buttonCenterY = buttonPosition.top + BUTTON_SIZE / 2;

    // Viewport bounds (absolute coordinates)
    const viewportTop = window.scrollY + MODAL_VIEWPORT_PADDING;
    const viewportBottom = window.scrollY + window.innerHeight - MODAL_VIEWPORT_PADDING;
    const viewportLeft = window.scrollX + MODAL_VIEWPORT_PADDING;
    const viewportRight = window.scrollX + window.innerWidth - MODAL_VIEWPORT_PADDING;

    // Horizontal: Modal left edge at button horizontal center
    let left = buttonCenterX;

    // Vertical: Try to position modal top-left at button center
    let top = buttonCenterY;

    // Check if modal would extend past bottom of viewport
    if (top + actualModalHeight > viewportBottom) {
      // Instead, position modal bottom-left at button center
      top = buttonCenterY - actualModalHeight;
    }

    // Clamp to viewport bounds
    if (left + MODAL_WIDTH > viewportRight) {
      left = viewportRight - MODAL_WIDTH;
    }
    if (left < viewportLeft) {
      left = viewportLeft;
    }
    if (top < viewportTop) {
      top = viewportTop;
    }
    // Final check: ensure modal bottom doesn't exceed viewport bottom
    if (top + actualModalHeight > viewportBottom) {
      top = viewportBottom - actualModalHeight;
    }

    return { top, left };
  }

  private renderDiff(): void {
    if (!this.modal) return;

    const originalDiffEl = this.modal.querySelector('.original-diff');
    const polishedDiffEl = this.modal.querySelector('.polished-diff');

    if (originalDiffEl) {
      originalDiffEl.innerHTML = renderOriginalDiff(this.originalText, this.polishedText);
    }

    if (polishedDiffEl) {
      polishedDiffEl.innerHTML = renderPolishedDiff(this.originalText, this.polishedText);
    }
  }

  public showLoading(position?: Position): void {
    if (!this.modal || !this.container) return;

    // Show modal with loading state
    this.modal.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">${MODAL.LOADING_TEXT}</p>
      </div>
    `;

    // Temporarily show to measure height
    this.modal.style.display = 'block';
    this.modal.style.visibility = 'hidden';
    this.container.style.display = 'block';

    // Get actual height
    const actualHeight = this.modal.offsetHeight;

    // Calculate position with actual height
    if (position) {
      this.lastPosition = this.calculatePosition(position, actualHeight);
    }

    // Position the modal
    this.modal.style.top = `${this.lastPosition.top}px`;
    this.modal.style.left = `${this.lastPosition.left}px`;

    // Make visible
    this.modal.style.visibility = 'visible';
    this.isVisible = true;
  }

  public showError(message: string, options: ErrorOptions): void {
    if (!this.modal || !this.container) return;

    const settingsButton = options.showSettings
      ? `<button class="btn btn-secondary settings-btn">${MODAL.SETTINGS_LABEL}</button>`
      : '';

    // Show modal with error state
    this.modal.innerHTML = `
      <div class="error-state">
        <svg class="error-icon" width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
        <p class="error-message">${message}</p>
        <div class="error-actions">
          <button class="btn btn-secondary close-btn">${MODAL.CLOSE_LABEL}</button>
          ${settingsButton}
          <button class="btn btn-primary retry-btn">${MODAL.RETRY_LABEL}</button>
        </div>
      </div>
    `;

    // Attach event listeners for error buttons
    const retryBtn = this.modal.querySelector('.retry-btn');
    const closeBtn = this.modal.querySelector('.close-btn');
    const settingsBtn = this.modal.querySelector('.settings-btn');

    retryBtn?.addEventListener('click', () => {
      options.onRetry();
    });

    closeBtn?.addEventListener('click', () => {
      this.hide();
    });

    settingsBtn?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Temporarily show to measure height
    this.modal.style.display = 'block';
    this.modal.style.visibility = 'hidden';
    this.container.style.display = 'block';

    // Get actual height and recalculate position
    const actualHeight = this.modal.offsetHeight;
    this.lastPosition = this.calculatePosition(this.lastPosition, actualHeight);

    // Position the modal
    this.modal.style.top = `${this.lastPosition.top}px`;
    this.modal.style.left = `${this.lastPosition.left}px`;

    // Make visible
    this.modal.style.visibility = 'visible';
    this.isVisible = true;
  }

  public show(data: DiffModalData): void {
    if (!this.modal || !this.container) return;

    // Store data
    this.originalText = data.originalText;
    this.polishedText = data.polishedText;
    this.onAccept = data.onAccept;
    this.onRegenerate = data.onRegenerate;

    // Rebuild modal structure for diff view
    this.modal.innerHTML = '';

    const body = document.createElement('div');
    body.className = 'diff-modal-body';
    body.innerHTML = `
      <div class="diff-section">
        <div class="diff-content original-diff"></div>
      </div>
      <div class="diff-section">
        <div class="diff-content polished-diff"></div>
      </div>
    `;

    const footer = document.createElement('div');
    footer.className = 'diff-modal-footer';
    footer.innerHTML = `
      <div class="footer-brand">
        <div class="footer-brand-name">${BRAND.NAME} v${APP_VERSION}</div>
        <div class="footer-brand-slogan">${BRAND.SLOGAN}</div>
      </div>
      <div class="footer-buttons">
        <button class="btn btn-secondary regenerate-btn" aria-label="${MODAL.REGENERATE_LABEL}" title="${MODAL.REGENERATE_LABEL}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
        <button class="btn btn-primary accept-btn" aria-label="${MODAL.ACCEPT_LABEL}" title="${MODAL.ACCEPT_LABEL}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
      </div>
    `;

    this.modal.appendChild(body);
    this.modal.appendChild(footer);

    // Re-attach event listeners for diff view buttons
    const acceptBtn = this.modal.querySelector('.accept-btn');
    const regenerateBtn = this.modal.querySelector('.regenerate-btn');

    acceptBtn?.addEventListener('click', () => this.handleAccept());
    regenerateBtn?.addEventListener('click', () => this.handleRegenerate());

    // Render diff first
    this.renderDiff();

    // Temporarily show modal to measure its height
    this.modal.style.display = 'block';
    this.modal.style.visibility = 'hidden'; // Hidden but still rendered for measurement
    this.container.style.display = 'block';

    // Get actual modal height after content is rendered
    const actualHeight = this.modal.offsetHeight;

    // Calculate position with actual height
    this.lastPosition = this.calculatePosition(data.position, actualHeight);

    // Position modal
    this.modal.style.top = `${this.lastPosition.top}px`;
    this.modal.style.left = `${this.lastPosition.left}px`;

    // Make modal visible
    this.modal.style.visibility = 'visible';
    this.isVisible = true;

    // Add click outside listener (with a small delay to prevent immediate close)
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick, true);
    }, 100);
  }

  public hide(): void {
    if (!this.modal || !this.container) return;

    this.modal.style.display = 'none';
    this.container.style.display = 'none';
    this.isVisible = false;

    // Remove click outside listener
    document.removeEventListener('click', this.handleOutsideClick, true);
  }

  public updatePolishedText(newPolishedText: string): void {
    this.polishedText = newPolishedText;
    this.renderDiff();
  }

  public get visible(): boolean {
    return this.isVisible;
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.modal = null;
    this.isVisible = false;
  }
}
