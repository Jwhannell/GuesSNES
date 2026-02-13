import { describe, it, expect, beforeEach } from 'vitest';
import {
  selectNonRepeatingGame,
  resetSeenGames,
  getSeenGameIds,
  fetchHintsForGame,
  resetUsedHints,
  getUsedHintHashes,
  fetchSNESGames
} from './api';
import type { SNESGame } from './types';

const makeGames = (): SNESGame[] => [
  { id: 'g1', title: 'Game One', reviewSnippets: [] },
  { id: 'g2', title: 'Game Two', reviewSnippets: [] },
  { id: 'g3', title: 'Game Three', reviewSnippets: [] }
];

const makeStubFetch = (extractText: string) => async (_url: string) => ({
  ok: true,
  status: 200,
  json: async () => ({
    query: {
      pages: {
        dummy: {
          extract: extractText,
        },
      },
    },
  }),
});

const stubRng = () => 0.42;

describe('api utilities', () => {
  beforeEach(() => {
    resetSeenGames();
    resetUsedHints();
  });

  it('selectNonRepeatingGame should cycle through unseen games first', () => {
    const games = makeGames();
    const picks = new Set<string>();
    for (let i = 0; i < games.length; i++) {
      const picked = selectNonRepeatingGame(games);
      picks.add(picked.id);
    }
    expect(picks.size).toBe(games.length);
    // After exhausting, should still return a valid game and reset history automatically
    const pickedAgain = selectNonRepeatingGame(games);
    expect(pickedAgain).toBeDefined();
    expect(getSeenGameIds().size).toBeGreaterThan(0);
  });

  it('fetchHintsForGame should generate non-repeating hints and persist history', async () => {
    const game: SNESGame = { id: 'g1', title: 'Test Title', reviewSnippets: [] };
    const extract = 'This is the first hint sentence. This is the second hint sentence. Third hint is here.';
    const hints1 = await fetchHintsForGame(game, { fetchImpl: makeStubFetch(extract), rng: stubRng });
    expect(hints1.length).toBeGreaterThan(0);
    const usedHashesAfter = getUsedHintHashes();
    expect(usedHashesAfter.size).toBe(hints1.length);

    // Second call should detect repeats and throw because all hints are now used
    await expect(fetchHintsForGame(game, { fetchImpl: makeStubFetch(extract), rng: stubRng })).rejects.toThrow();

    // After resetting used hints, it should work again
    resetUsedHints();
    const hints2 = await fetchHintsForGame(game, { fetchImpl: makeStubFetch(extract), rng: stubRng });
    expect(hints2.length).toBeGreaterThan(0);
  });

  it('fetchSNESGames should still return mock data as fallback', async () => {
    const games = await fetchSNESGames();
    expect(Array.isArray(games)).toBe(true);
    expect(games.length).toBeGreaterThan(0);
  });
});
