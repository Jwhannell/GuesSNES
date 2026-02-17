export interface SNESGame {
  id: string;
  title: string;
  reviewSnippets?: string[]; // Hints fetched/generated at runtime; optional for test/fallback
  reviewScore?: number; // Metacritic or similar review score (0-100)
  summary?: string; // Unredacted game summary
  externalLink?: string; // Link to Wikipedia, GiantBomb, or similar
}

export interface GameState {
  targetGame: SNESGame;
  guesses: string[];
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  hintsRevealed: number;
  shuffledHints: string[]; // runtime hints (shuffled, deduped)
}
