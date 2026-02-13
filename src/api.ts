import type { SNESGame } from './types';
import { appendToSet, readSet, clearKey } from './storage';
import { generateHintsFromText, filterOutUsedHints, hashHint, shuffleArray } from './hints';

const USED_HINTS_KEY = 'sgl_used_hint_hashes_v1';
const SEEN_GAME_IDS_KEY = 'sgl_seen_game_ids_v1';
const MAX_HINT_HISTORY = 500;
const MAX_GAME_HISTORY = 200;
const MAX_HINTS_PER_GAME = 6;

// Mock SNES games data (titles only; hints are fetched/generated at runtime)
const mockGamesData: SNESGame[] = [
  { id: '1', title: 'Super Mario World', reviewSnippets: [] },
  { id: '2', title: 'The Legend of Zelda: A Link to the Past', reviewSnippets: [] },
  { id: '3', title: 'Chrono Trigger', reviewSnippets: [] },
  { id: '4', title: 'Final Fantasy VI', reviewSnippets: [] },
  { id: '5', title: 'Super Metroid', reviewSnippets: [] },
  { id: '6', title: 'Donkey Kong Country', reviewSnippets: [] },
  { id: '7', title: 'Street Fighter II Turbo', reviewSnippets: [] },
  { id: '8', title: 'Super Mario Kart', reviewSnippets: [] },
  { id: '9', title: 'Mega Man X', reviewSnippets: [] },
  { id: '10', title: 'Earthbound', reviewSnippets: [] },
];

// --- Non-repeating game selection -------------------------------------------------
export function getSeenGameIds(): Set<string> {
  return readSet(SEEN_GAME_IDS_KEY);
}

export function rememberGame(gameId: string): Set<string> {
  return appendToSet(SEEN_GAME_IDS_KEY, [gameId], MAX_GAME_HISTORY);
}

export function resetSeenGames(): void {
  clearKey(SEEN_GAME_IDS_KEY);
}

export function selectNonRepeatingGame(games: SNESGame[]): SNESGame {
  const seen = getSeenGameIds();
  const unseen = games.filter(g => !seen.has(g.id));
  const pool = unseen.length > 0 ? unseen : games;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  // If we had to reuse (no unseen left), reset the history to reduce repeats next time
  if (unseen.length === 0) {
    resetSeenGames();
  }
  rememberGame(picked.id);
  return picked;
}

// --- Hint fetching/generation ------------------------------------------------------
// Wikipedia summary endpoint (no API key needed; use origin=* for CORS)
const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function fetchWikiExtract(title: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    exsentences: '40',
    format: 'json',
    origin: '*',
    titles: title,
  });
  // Ensure plain text; MediaWiki API expects `explaintext=1`
  params.append('explaintext', '1');
  try {
    const resp = await fetchImpl(`${WIKI_API}?${params.toString()}`);
    if (!resp.ok) throw new Error(`Wiki fetch failed: ${resp.status}`);
    const json = await resp.json();
    const pages = json?.query?.pages ?? {};
    const firstPageKey = Object.keys(pages)[0];
    const extract = pages[firstPageKey]?.extract as string | undefined;
    if (!extract) return null;
    return extract;
  } catch (err) {
    console.warn('Failed to fetch wiki extract', err);
    return null;
  }
}

export function getUsedHintHashes(): Set<string> {
  return readSet(USED_HINTS_KEY);
}

export function rememberHints(hints: string[]): Set<string> {
  const hashes = hints.map(hashHint);
  return appendToSet(USED_HINTS_KEY, hashes, MAX_HINT_HISTORY);
}

export function resetUsedHints(): void {
  clearKey(USED_HINTS_KEY);
}

function fallbackHintsFromMock(game: SNESGame): string[] {
  // Provide a small pool of generic hints if external fetch fails; still shuffle and dedupe.
  const fallbackText = [
    `${game.title} was critically acclaimed on the SNES.`,
    `Players praised ${game.title} for its gameplay and visuals.`,
    `${game.title} introduced memorable mechanics for its genre.`,
    `${game.title} has a soundtrack fans still adore.`,
    `${game.title} features iconic bosses and levels.`,
    `${game.title} remains a fan favorite decades later.`
  ].join(' ');
  return generateHintsFromText(fallbackText, { maxHints: MAX_HINTS_PER_GAME });
}

export async function fetchHintsForGame(game: SNESGame, opts?: { fetchImpl?: typeof fetch; rng?: () => number }): Promise<string[]> {
  const { fetchImpl = fetch, rng = Math.random } = opts || {};
  const usedHashSet = getUsedHintHashes();

  // Try Wikipedia extract first
  const extract = await fetchWikiExtract(game.title, fetchImpl);
  const rawHints = extract
    ? generateHintsFromText(extract, { maxHints: MAX_HINTS_PER_GAME * 5, rng })
    : fallbackHintsFromMock(game);

  // Remove already used hints across sessions
  const filtered = filterOutUsedHints(rawHints, usedHashSet);

  if (filtered.length === 0) {
    // No new hints available for this game at the moment; let caller decide to pick a new game.
    throw new Error('No new hints available for this game');
  }

  // Shuffle again to avoid same order even if same hints remain
  const shuffled = shuffleArray(filtered, rng);
  const finalHints = shuffled.slice(0, MAX_HINTS_PER_GAME);
  rememberHints(finalHints);
  return finalHints;
}

// Fetch SNES games from a real API (if available) or return mock data as fallback
export async function fetchSNESGames(): Promise<SNESGame[]> {
  try {
    // Placeholder for a real API call (e.g., RAWG, GiantBomb). Keep mock fallback for now.
    return mockGamesData;
  } catch (error) {
    console.warn('Failed to fetch games, using mock data:', error);
    return mockGamesData;
  }
}

// Backwards-compatible function for older callers; prefer selectNonRepeatingGame
export function selectRandomGame(games: SNESGame[]): SNESGame {
  const randomIndex = Math.floor(Math.random() * games.length);
  return games[randomIndex];
}
