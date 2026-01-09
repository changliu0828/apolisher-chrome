/**
 * Diff highlighting using jsdiff library
 * Compares original and polished text and renders with HTML styling
 */

import { diffChars, Change } from 'diff';

/**
 * Render original text with deletions highlighted
 */
export function renderOriginalDiff(original: string, polished: string): string {
  const changes = diffChars(original, polished);

  return changes
    .map((change: Change) => {
      const escapedText = escapeHtml(change.value);

      if (change.removed) {
        return `<span class="diff-delete">${escapedText}</span>`;
      } else if (!change.added) {
        return escapedText;
      }
      return '';
    })
    .join('');
}

/**
 * Render polished text with insertions highlighted
 */
export function renderPolishedDiff(original: string, polished: string): string {
  const changes = diffChars(original, polished);

  return changes
    .map((change: Change) => {
      const escapedText = escapeHtml(change.value);

      if (change.added) {
        return `<span class="diff-insert">${escapedText}</span>`;
      } else if (!change.removed) {
        return escapedText;
      }
      return '';
    })
    .join('');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
