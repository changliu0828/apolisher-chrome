import { describe, it, expect, beforeEach } from 'vitest';
import { createShadowRoot, injectStyles } from '../shadowDOM';

describe('shadowDOM', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createShadowRoot', () => {
    it('should create a shadow root container', () => {
      const { container, shadow } = createShadowRoot();

      expect(container).toBeInstanceOf(HTMLDivElement);
      expect(shadow).toBeInstanceOf(ShadowRoot);
    });

    it('should set correct container ID', () => {
      const { container } = createShadowRoot();

      expect(container.id).toBe('apolisher-floating-button-container');
    });

    it('should apply correct container styles', () => {
      const { container } = createShadowRoot();

      expect(container.style.position).toBe('absolute');
      expect(container.style.top).toBe('0px');
      expect(container.style.left).toBe('0px');
      expect(container.style.zIndex).toBe('2147483647');
    });

    it('should attach shadow root with open mode', () => {
      const { shadow } = createShadowRoot();

      expect(shadow.mode).toBe('open');
    });

    it('should append container to document body', () => {
      const { container } = createShadowRoot();

      expect(document.body.contains(container)).toBe(true);
    });

    it('should create multiple independent shadow roots', () => {
      const first = createShadowRoot();
      const second = createShadowRoot();

      expect(first.container).not.toBe(second.container);
      expect(first.shadow).not.toBe(second.shadow);
      expect(document.body.children.length).toBe(2);
    });

    it('should return both container and shadow in object', () => {
      const result = createShadowRoot();

      expect(result).toHaveProperty('container');
      expect(result).toHaveProperty('shadow');
      expect(Object.keys(result)).toEqual(['container', 'shadow']);
    });
  });

  describe('injectStyles', () => {
    it('should inject CSS into shadow root', () => {
      const { shadow } = createShadowRoot();
      const styles = 'body { color: red; }';

      injectStyles(shadow, styles);

      const styleElement = shadow.querySelector('style');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.textContent).toBe(styles);
    });

    it('should create a style element in shadow root', () => {
      const { shadow } = createShadowRoot();

      injectStyles(shadow, '.test { display: block; }');

      const styleElements = shadow.querySelectorAll('style');
      expect(styleElements.length).toBe(1);
    });

    it('should handle empty styles string', () => {
      const { shadow } = createShadowRoot();

      injectStyles(shadow, '');

      const styleElement = shadow.querySelector('style');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.textContent).toBe('');
    });

    it('should handle complex CSS styles', () => {
      const { shadow } = createShadowRoot();
      const complexStyles = `
        .button {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 12px 24px;
        }
        .button:hover {
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .button {
            padding: 8px 16px;
          }
        }
      `;

      injectStyles(shadow, complexStyles);

      const styleElement = shadow.querySelector('style');
      expect(styleElement?.textContent).toBe(complexStyles);
    });

    it('should inject multiple styles independently', () => {
      const { shadow } = createShadowRoot();

      injectStyles(shadow, '.first { color: red; }');
      injectStyles(shadow, '.second { color: blue; }');

      const styleElements = shadow.querySelectorAll('style');
      expect(styleElements.length).toBe(2);
      expect(styleElements[0].textContent).toBe('.first { color: red; }');
      expect(styleElements[1].textContent).toBe('.second { color: blue; }');
    });

    it('should handle styles with special characters', () => {
      const { shadow } = createShadowRoot();
      const styles = '.icon::before { content: "\\2713"; }';

      injectStyles(shadow, styles);

      const styleElement = shadow.querySelector('style');
      expect(styleElement?.textContent).toBe(styles);
    });

    it('should append style element to shadow root', () => {
      const { shadow } = createShadowRoot();
      const initialChildCount = shadow.childNodes.length;

      injectStyles(shadow, '.test {}');

      expect(shadow.childNodes.length).toBe(initialChildCount + 1);
    });
  });

  describe('integration', () => {
    it('should create shadow root and inject styles together', () => {
      const { container, shadow } = createShadowRoot();
      const styles = '.button { background: blue; }';

      injectStyles(shadow, styles);

      expect(document.body.contains(container)).toBe(true);
      expect(shadow.querySelector('style')?.textContent).toBe(styles);
    });

    it('should isolate styles within shadow DOM', () => {
      const { shadow } = createShadowRoot();
      const styles = 'body { background: red; }';

      injectStyles(shadow, styles);

      // Styles should not affect main document
      const mainDocumentBody = document.body;
      const computedStyle = window.getComputedStyle(mainDocumentBody);
      // Background should not be red (would be default or transparent)
      expect(computedStyle.backgroundColor).not.toBe('red');
    });

    it('should allow multiple shadow roots with different styles', () => {
      const first = createShadowRoot();
      const second = createShadowRoot();

      injectStyles(first.shadow, '.first { color: red; }');
      injectStyles(second.shadow, '.second { color: blue; }');

      expect(first.shadow.querySelector('style')?.textContent).toBe('.first { color: red; }');
      expect(second.shadow.querySelector('style')?.textContent).toBe('.second { color: blue; }');
    });
  });
});
