export interface SNESGame {
  id: string;
  title: string;
  reviewSnippets: string[]; // Array of 6 review snippets from different reviews
}

export interface GameState {
  targetGame: SNESGame;
  guesses: string[];
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  hintsRevealed: number;
}
