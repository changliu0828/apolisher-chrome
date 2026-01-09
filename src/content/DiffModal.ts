import { createShadowRoot, injectStyles } from '@/utils/shadowDOM';
import { renderOriginalDiff, renderPolishedDiff } from '@/utils/diffHighlighter';
import { DIFF_MODAL_STYLES } from './diffModalStyles';
import { BUTTON_SIZE } from '@/constants/buttonConfig';

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

export class DiffModal {
  private container: HTMLDivElement | null = null;
  private modal: HTMLDivElement | null = null;
  private originalText: string = '';
  private polishedText: string = '';
  private onAccept?: (text: string) => void;
  private onRegenerate?: () => void;
  private isVisible = false;
  private handleOutsideClick = this.onOutsideClick.bind(this);

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
      <button class="btn btn-secondary regenerate-btn" aria-label="Regenerate" title="Regenerate">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>
      </button>
      <button class="btn btn-primary accept-btn" aria-label="Accept" title="Accept">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>
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

  private calculatePosition(buttonPosition: Position): Position {
    if (!this.modal) return buttonPosition;

    // Position to the right of the button
    let left = buttonPosition.left + BUTTON_SIZE + 8;
    const top = buttonPosition.top;

    // Check if modal would overflow right edge
    const modalWidth = 320; // max-width from CSS
    if (left + modalWidth > window.innerWidth - 16) {
      // Position to the left of button instead
      left = buttonPosition.left - modalWidth - 8;

      // If still overflows, center on screen
      if (left < 16) {
        left = Math.max(16, (window.innerWidth - modalWidth) / 2);
      }
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

  public show(data: DiffModalData): void {
    if (!this.modal || !this.container) return;

    // Store data
    this.originalText = data.originalText;
    this.polishedText = data.polishedText;
    this.onAccept = data.onAccept;
    this.onRegenerate = data.onRegenerate;

    // Calculate position
    const position = this.calculatePosition(data.position);

    // Position modal
    this.modal.style.top = `${position.top}px`;
    this.modal.style.left = `${position.left}px`;

    // Render diff
    this.renderDiff();

    // Show modal
    this.modal.style.display = 'block';
    this.container.style.display = 'block';
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
