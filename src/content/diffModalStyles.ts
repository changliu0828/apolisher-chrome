// Inline CSS for the diff modal (Shadow DOM)
export const DIFF_MODAL_STYLES = `
  .diff-modal {
    position: fixed;
    background: white;
    border-radius: 4px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    width: 320px;
    max-width: 90vw;
    max-height: 60vh;
    overflow: auto;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
  }

  .diff-section {
    padding: 3px 6px;
    border-bottom: 1px solid #f3f4f6;
  }

  .diff-section:first-of-type {
    padding-top: 6px;
  }

  .diff-section:last-of-type {
    border-bottom: none;
    padding-bottom: 3px;
  }

  .diff-content {
    background: #f9fafb;
    padding: 6px;
    border-radius: 3px;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    font-size: 13px;
    color: #374151;
  }

  .diff-delete {
    background: #fee2e2;
    text-decoration: line-through;
    color: #b91c1c;
    padding: 1px 2px;
    border-radius: 2px;
  }

  .diff-insert {
    background: #d1fae5;
    color: #166534;
    padding: 1px 2px;
    border-radius: 2px;
    font-weight: 500;
  }

  .diff-modal-footer {
    display: flex;
    gap: 4px;
    padding: 6px;
    justify-content: flex-end;
    border-top: 1px solid #e5e7eb;
  }

  .btn {
    padding: 6px 10px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 400;
    font-size: 13px;
    line-height: 1;
    transition: all 0.2s;
    min-width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn svg {
    width: 13px;
    height: 13px;
    display: block;
  }

  .btn-primary {
    background: #0ea5e9;
    color: white;
  }

  .btn-primary:hover {
    background: #0284c7;
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn-secondary:active {
    transform: scale(0.98);
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 16px;
    text-align: center;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #0ea5e9;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    margin-top: 12px;
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
  }

  /* Error state */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    text-align: center;
  }

  .error-icon {
    color: #ef4444;
    margin-bottom: 10px;
  }

  .error-message {
    color: #374151;
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 16px;
    max-width: 280px;
  }

  .error-actions {
    display: flex;
    gap: 6px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .close-btn,
  .settings-btn,
  .retry-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
`;
