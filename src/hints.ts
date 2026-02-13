import { normalizeGuess } from './utils';

export type RNG = () => number;

export function shuffleArray<T>(items: T[], rng: RNG = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dedupePreserveOrder<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

export function hashHint(hint: string): string {
  // Use normalizeGuess to collapse punctuation/whitespace, but keep numbers
  return normalizeGuess(hint).slice(0, 120); // reasonably short hash
}

export function splitIntoSentences(text: string): string[] {
  // Naive sentence splitter for short snippets. Keeps punctuation.
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map(s => s.trim())
    .filter(Boolean);
  // If splitter failed (no punctuation), fall back to single chunk
  if (sentences.length === 0) return [text.trim()].filter(Boolean);
  return sentences;
}

export function generateHintsFromText(rawText: string, opts?: { minLen?: number; maxLen?: number; maxHints?: number; rng?: RNG }): string[] {
  const { minLen = 30, maxLen = 180, maxHints = 6, rng = Math.random } = opts || {};
  const sentences = splitIntoSentences(rawText);
  const filtered = sentences.filter(s => s.length >= minLen && s.length <= maxLen);
  const deduped = dedupePreserveOrder(filtered);
  const shuffled = shuffleArray(deduped, rng);
  return shuffled.slice(0, maxHints);
}

export function filterOutUsedHints(hints: string[], usedHashes: Set<string>): string[] {
  return hints.filter(h => !usedHashes.has(hashHint(h)));
}
