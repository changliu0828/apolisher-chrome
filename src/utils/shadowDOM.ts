/**
 * Create a shadow root container and attach it to the document body
 */
export function createShadowRoot(): { container: HTMLDivElement; shadow: ShadowRoot } {
  const container = document.createElement('div');
  container.id = 'apolisher-floating-button-container';
  container.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 2147483647;';

  const shadow = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  return { container, shadow };
}

/**
 * Inject CSS styles into a shadow root
 */
export function injectStyles(shadow: ShadowRoot, styles: string): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadow.appendChild(styleElement);
}
