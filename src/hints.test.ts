import { describe, it, expect } from 'vitest';
import { shuffleArray, generateHintsFromText, filterOutUsedHints, hashHint, splitIntoSentences } from './hints';

const makeStubRng = (sequence: number[]) => {
  let idx = 0;
  return () => {
    const value = sequence[idx % sequence.length];
    idx += 1;
    return value;
  };
};

describe('hints utilities', () => {
  it('shuffleArray should produce deterministic order with stub RNG', () => {
    const items = ['a', 'b', 'c', 'd'];
    const rng = makeStubRng([0.1, 0.9, 0.5, 0.2]);
    const shuffled = shuffleArray(items, rng);
    // Deterministic expectation based on sort-based shuffle and stub RNG
    expect(shuffled).toEqual(['a', 'd', 'c', 'b']);
    // Ensure original array not mutated
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('splitIntoSentences should split on punctuation boundaries', () => {
    const text = 'Sentence one. Sentence two! Are you ready? Last one';
    const sentences = splitIntoSentences(text);
    expect(sentences).toEqual([
      'Sentence one.',
      'Sentence two!',
      'Are you ready?',
      'Last one'
    ]);
  });

  it('generateHintsFromText should split, filter by length, dedupe, and shuffle', () => {
    const text = 'Short. This is a sufficiently long sentence about a game. Another interesting detail here. This is a sufficiently long sentence about a game.';
    const rng = makeStubRng([0.3, 0.1, 0.7, 0.9]);
    const hints = generateHintsFromText(text, { minLen: 20, maxLen: 120, maxHints: 2, rng });
    expect(hints.length).toBe(2);
    // Should dedupe the repeated sentence
    expect(new Set(hints).size).toBe(2);
  });

  it('filterOutUsedHints should drop hints with matching hashes', () => {
    const hints = ['One cool fact about the game', 'Another fact'];
    const used = new Set([hashHint(hints[0])]);
    const filtered = filterOutUsedHints(hints, used);
    expect(filtered).toEqual(['Another fact']);
  });
});
