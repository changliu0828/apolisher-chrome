import { BUTTON_SIZE, BUTTON_BORDER_RADIUS } from '@/constants/buttonConfig';

// Inline CSS for the floating button (Shadow DOM)
export const BUTTON_STYLES = `
  .floating-button {
    position: fixed;
    width: ${BUTTON_SIZE}px;
    height: ${BUTTON_SIZE}px;
    border-radius: ${BUTTON_BORDER_RADIUS}px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    padding: 0;
    z-index: 2147483647;
  }

  .floating-button:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .floating-button:active {
    transform: scale(0.95);
  }

  .floating-button img {
    width: ${BUTTON_SIZE}px;
    height: ${BUTTON_SIZE}px;
    display: block;
    border-radius: ${BUTTON_BORDER_RADIUS}px;
  }
`;
