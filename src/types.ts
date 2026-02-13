export interface SNESGame {
  id: string;
  title: string;
  reviewSnippet: string;
}

export interface GameState {
  targetGame: SNESGame;
  guesses: string[];
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  hintsRevealed: number;
}
