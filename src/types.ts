export interface SNESGame {
  id: string;
  title: string;
  reviewSnippets?: string[]; // Hints fetched/generated at runtime; optional for test/fallback
}

export interface GameState {
  targetGame: SNESGame;
  guesses: string[];
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  hintsRevealed: number;
  shuffledHints: string[]; // runtime hints (shuffled, deduped)
}
