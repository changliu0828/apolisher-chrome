/**
 * Mock polisher for testing the diff view UI
 * For English: toggles case of 1 letter
 * For non-English (Japanese, etc.): replaces 1 character with ✱
 */

export function mockPolish(text: string): string {
  if (!text || text.length === 0) {
    return text;
  }

  // Find all English letters
  const letterIndices: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (/[a-zA-Z]/.test(text[i])) {
      letterIndices.push(i);
    }
  }

  const chars = text.split('');

  // If we have English letters, toggle case
  if (letterIndices.length > 0) {
    const randomIndex = letterIndices[Math.floor(Math.random() * letterIndices.length)];
    const char = chars[randomIndex];
    chars[randomIndex] = char === char.toUpperCase()
      ? char.toLowerCase()
      : char.toUpperCase();
  } else {
    // For non-English text, replace a random non-space character with ✱
    const nonSpaceIndices: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (!/\s/.test(text[i])) {
        nonSpaceIndices.push(i);
      }
    }

    if (nonSpaceIndices.length > 0) {
      const randomIndex = nonSpaceIndices[Math.floor(Math.random() * nonSpaceIndices.length)];
      chars[randomIndex] = '✱';
    }
  }

  return chars.join('');
}
