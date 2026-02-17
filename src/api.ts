import type { SNESGame } from './types';
import { appendToSet, readSet, clearKey } from './storage';
import { generateHintsFromText, filterOutUsedHints, hashHint, shuffleArray } from './hints';

const USED_HINTS_KEY = 'sgl_used_hint_hashes_v1';
const SEEN_GAME_IDS_KEY = 'sgl_seen_game_ids_v1';
const MAX_HINT_HISTORY = 500;
const MAX_GAME_HISTORY = 200;
const MAX_HINTS_PER_GAME = 6;

// Mock SNES games data (titles only; hints are fetched/generated at runtime)
// Expanded library covering the US SNES library across multiple genres
const mockGamesData: SNESGame[] = [
  // Platform Games
  { id: '1', title: 'Super Mario World', reviewSnippets: [] },
  { id: '2', title: 'Super Mario World 2: Yoshi\'s Island', reviewSnippets: [] },
  { id: '3', title: 'Donkey Kong Country', reviewSnippets: [] },
  { id: '4', title: 'Donkey Kong Country 2: Diddy\'s Kong Quest', reviewSnippets: [] },
  { id: '5', title: 'Donkey Kong Country 3: Dixie Kong\'s Double Trouble!', reviewSnippets: [] },
  { id: '6', title: 'Super Mario All-Stars', reviewSnippets: [] },
  { id: '7', title: 'Kirby Super Star', reviewSnippets: [] },
  { id: '8', title: 'Kirby\'s Dream Land 3', reviewSnippets: [] },
  { id: '9', title: 'Kirby\'s Dream Course', reviewSnippets: [] },
  { id: '10', title: 'Aladdin', reviewSnippets: [] },
  { id: '11', title: 'The Lion King', reviewSnippets: [] },
  { id: '12', title: 'Earthworm Jim', reviewSnippets: [] },
  { id: '13', title: 'Earthworm Jim 2', reviewSnippets: [] },
  { id: '14', title: 'Sparkster', reviewSnippets: [] },
  { id: '15', title: 'The Magical Quest Starring Mickey Mouse', reviewSnippets: [] },
  
  // Action-Adventure & RPGs
  { id: '16', title: 'The Legend of Zelda: A Link to the Past', reviewSnippets: [] },
  { id: '17', title: 'Super Metroid', reviewSnippets: [] },
  { id: '18', title: 'Chrono Trigger', reviewSnippets: [] },
  { id: '19', title: 'Final Fantasy VI', reviewSnippets: [] },
  { id: '20', title: 'Final Fantasy IV', reviewSnippets: [] },
  { id: '21', title: 'Final Fantasy V', reviewSnippets: [] },
  { id: '22', title: 'Earthbound', reviewSnippets: [] },
  { id: '23', title: 'Secret of Mana', reviewSnippets: [] },
  { id: '24', title: 'Secret of Evermore', reviewSnippets: [] },
  { id: '25', title: 'Super Mario RPG: Legend of the Seven Stars', reviewSnippets: [] },
  { id: '26', title: 'Breath of Fire', reviewSnippets: [] },
  { id: '27', title: 'Breath of Fire II', reviewSnippets: [] },
  { id: '28', title: 'Illusion of Gaia', reviewSnippets: [] },
  { id: '29', title: 'Terranigma', reviewSnippets: [] },
  { id: '30', title: 'Lufia II: Rise of the Sinistrals', reviewSnippets: [] },
  { id: '31', title: 'Lufia & The Fortress of Doom', reviewSnippets: [] },
  { id: '32', title: 'Star Ocean', reviewSnippets: [] },
  { id: '33', title: 'Tales of Phantasia', reviewSnippets: [] },
  { id: '34', title: 'Seiken Densetsu 3', reviewSnippets: [] },
  
  // Action Games
  { id: '35', title: 'Mega Man X', reviewSnippets: [] },
  { id: '36', title: 'Mega Man X2', reviewSnippets: [] },
  { id: '37', title: 'Mega Man X3', reviewSnippets: [] },
  { id: '38', title: 'Contra III: The Alien Wars', reviewSnippets: [] },
  { id: '39', title: 'Super Castlevania IV', reviewSnippets: [] },
  { id: '40', title: 'Castlevania: Dracula X', reviewSnippets: [] },
  { id: '41', title: 'Zombies Ate My Neighbors', reviewSnippets: [] },
  { id: '42', title: 'ActRaiser', reviewSnippets: [] },
  { id: '43', title: 'ActRaiser 2', reviewSnippets: [] },
  { id: '44', title: 'Soul Blazer', reviewSnippets: [] },
  { id: '45', title: 'Teenage Mutant Ninja Turtles IV: Turtles in Time', reviewSnippets: [] },
  { id: '46', title: 'The Adventures of Batman & Robin', reviewSnippets: [] },
  { id: '47', title: 'Maximum Carnage', reviewSnippets: [] },
  { id: '48', title: 'Sunset Riders', reviewSnippets: [] },
  { id: '49', title: 'Wild Guns', reviewSnippets: [] },
  
  // Fighting Games
  { id: '50', title: 'Street Fighter II Turbo', reviewSnippets: [] },
  { id: '51', title: 'Super Street Fighter II', reviewSnippets: [] },
  { id: '52', title: 'Mortal Kombat', reviewSnippets: [] },
  { id: '53', title: 'Mortal Kombat II', reviewSnippets: [] },
  { id: '54', title: 'Mortal Kombat 3', reviewSnippets: [] },
  { id: '55', title: 'Killer Instinct', reviewSnippets: [] },
  { id: '56', title: 'Street Fighter Alpha 2', reviewSnippets: [] },
  { id: '57', title: 'Samurai Shodown', reviewSnippets: [] },
  { id: '58', title: 'Fatal Fury', reviewSnippets: [] },
  { id: '59', title: 'Fatal Fury Special', reviewSnippets: [] },
  
  // Racing Games
  { id: '60', title: 'Super Mario Kart', reviewSnippets: [] },
  { id: '61', title: 'F-Zero', reviewSnippets: [] },
  { id: '62', title: 'Top Gear', reviewSnippets: [] },
  { id: '63', title: 'Rock n\' Roll Racing', reviewSnippets: [] },
  { id: '64', title: 'Stunt Race FX', reviewSnippets: [] },
  
  // Sports Games
  { id: '65', title: 'NBA Jam', reviewSnippets: [] },
  { id: '66', title: 'NBA Jam Tournament Edition', reviewSnippets: [] },
  { id: '67', title: 'Ken Griffey Jr. Presents Major League Baseball', reviewSnippets: [] },
  { id: '68', title: 'Madden NFL 94', reviewSnippets: [] },
  { id: '69', title: 'NHL 94', reviewSnippets: [] },
  { id: '70', title: 'International Superstar Soccer', reviewSnippets: [] },
  { id: '71', title: 'Super Punch-Out!!', reviewSnippets: [] },
  
  // Puzzle & Strategy Games
  { id: '72', title: 'Tetris Attack', reviewSnippets: [] },
  { id: '73', title: 'Super Bomberman', reviewSnippets: [] },
  { id: '74', title: 'Super Bomberman 2', reviewSnippets: [] },
  { id: '75', title: 'Lemmings', reviewSnippets: [] },
  { id: '76', title: 'SimCity', reviewSnippets: [] },
  { id: '77', title: 'Ogre Battle: The March of the Black Queen', reviewSnippets: [] },
  { id: '78', title: 'Final Fantasy Tactics', reviewSnippets: [] },
  { id: '79', title: 'Harvest Moon', reviewSnippets: [] },
  
  // Shoot 'em Ups
  { id: '80', title: 'Super R-Type', reviewSnippets: [] },
  { id: '81', title: 'Gradius III', reviewSnippets: [] },
  { id: '82', title: 'Axelay', reviewSnippets: [] },
  { id: '83', title: 'U.N. Squadron', reviewSnippets: [] },
  { id: '84', title: 'Space Megaforce', reviewSnippets: [] },
  { id: '85', title: 'Phalanx', reviewSnippets: [] },
  
  // Adventure & Point-and-Click
  { id: '86', title: 'The Lost Vikings', reviewSnippets: [] },
  { id: '87', title: 'Shadowrun', reviewSnippets: [] },
  { id: '88', title: 'Cybernator', reviewSnippets: [] },
  { id: '89', title: 'Blackthorne', reviewSnippets: [] },
  { id: '90', title: 'Out of This World', reviewSnippets: [] },
  
  // Other Notable Titles
  { id: '91', title: 'Star Fox', reviewSnippets: [] },
  { id: '92', title: 'Pilot Wings', reviewSnippets: [] },
  { id: '93', title: 'Yoshi\'s Safari', reviewSnippets: [] },
  { id: '94', title: 'Super Scope 6', reviewSnippets: [] },
  { id: '95', title: 'Demon\'s Crest', reviewSnippets: [] },
  { id: '96', title: 'Battletoads in Battlemaniacs', reviewSnippets: [] },
  { id: '97', title: 'Battletoads & Double Dragon', reviewSnippets: [] },
  { id: '98', title: 'Teenage Mutant Ninja Turtles: Tournament Fighters', reviewSnippets: [] },
  { id: '99', title: 'Teenage Mutant Ninja Turtles V: The Manhattan Project', reviewSnippets: [] },
  { id: '100', title: 'Pocky & Rocky', reviewSnippets: [] },
  { id: '101', title: 'Pocky & Rocky 2', reviewSnippets: [] },
  { id: '102', title: 'Super Ghouls \'n Ghosts', reviewSnippets: [] },
  { id: '103', title: 'Goof Troop', reviewSnippets: [] },
  { id: '104', title: 'Super Adventure Island', reviewSnippets: [] },
  { id: '105', title: 'Super Adventure Island II', reviewSnippets: [] },
  { id: '106', title: 'Joe & Mac', reviewSnippets: [] },
  { id: '107', title: 'The Jungle Book', reviewSnippets: [] },
  { id: '108', title: 'Toy Story', reviewSnippets: [] },
  { id: '109', title: 'Spider-Man', reviewSnippets: [] },
  { id: '110', title: 'Spider-Man and Venom: Maximum Carnage', reviewSnippets: [] },
  { id: '111', title: 'X-Men: Mutant Apocalypse', reviewSnippets: [] },
  { id: '112', title: 'Biker Mice from Mars', reviewSnippets: [] },
  { id: '113', title: 'Power Rangers: The Fighting Edition', reviewSnippets: [] },
  { id: '114', title: 'Mighty Morphin Power Rangers', reviewSnippets: [] },
  { id: '115', title: 'Jurassic Park', reviewSnippets: [] },
  { id: '116', title: 'Jurassic Park 2: The Chaos Continues', reviewSnippets: [] },
  { id: '117', title: 'Star Wars: Super Return of the Jedi', reviewSnippets: [] },
  { id: '118', title: 'Star Wars: The Empire Strikes Back', reviewSnippets: [] },
  { id: '119', title: 'Tin Star', reviewSnippets: [] },
  { id: '120', title: 'Rendering Ranger R2', reviewSnippets: [] },
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
  if (!picked) {
    throw new Error('No games available');
  }
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
    if (!firstPageKey) return null;
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
  const game = games[randomIndex];
  if (!game) {
    throw new Error('No games available');
  }
  return game;
}
