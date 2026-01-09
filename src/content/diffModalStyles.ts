// Inline CSS for the diff modal (Shadow DOM)
export const DIFF_MODAL_STYLES = `
  .diff-modal {
    position: fixed;
    background: white;
    border-radius: 6px;
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
    padding: 6px 8px;
    border-bottom: 1px solid #f3f4f6;
  }

  .diff-section:first-of-type {
    padding-top: 10px;
  }

  .diff-section:last-of-type {
    border-bottom: none;
  }

  .diff-content {
    background: #f9fafb;
    padding: 8px;
    border-radius: 3px;
    line-height: 1.5;
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
    gap: 6px;
    padding: 8px;
    justify-content: flex-end;
    border-top: 1px solid #e5e7eb;
  }

  .btn {
    padding: 8px 14px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    line-height: 1;
    transition: all 0.2s;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn svg {
    width: 14px;
    height: 14px;
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
`;
