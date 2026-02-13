import type { GameState, SNESGame } from './types';
import { censorTitle, areTitlesFuzzyMatch } from './utils';
import { shuffleArray } from './hints';

export class GameController {
  private state: GameState;
  
  constructor(targetGame: SNESGame, opts?: { rng?: () => number }) {
    const { rng = Math.random } = opts || {};
    const hints = targetGame.reviewSnippets ?? [];
    // Shuffle once per game to ensure hint order varies, even for same game
    const shuffledHints = shuffleArray(hints, rng);

    this.state = {
      targetGame,
      guesses: [],
      maxGuesses: 6,
      gameStatus: 'playing',
      hintsRevealed: 1,
      shuffledHints,
    };
  }
  
  getState(): GameState {
    return { ...this.state, shuffledHints: [...this.state.shuffledHints] };
  }
  
  makeGuess(guess: string): boolean {
    if (this.state.gameStatus !== 'playing') {
      return false;
    }
    
    this.state.guesses.push(guess);
    
    if (areTitlesFuzzyMatch(guess, this.state.targetGame.title)) {
      this.state.gameStatus = 'won';
      return true;
    }
    
    // Reveal one more hint after wrong guess
    this.state.hintsRevealed = this.state.guesses.length + 1;
    
    if (this.state.guesses.length >= this.state.maxGuesses) {
      this.state.gameStatus = 'lost';
    }
    
    return false;
  }
  
  getHints(): string[] {
    const hints: string[] = [];
    const reviewSnippets = this.state.shuffledHints;
    
    for (let i = 0; i < this.state.hintsRevealed && i < reviewSnippets.length; i++) {
      const snippet = reviewSnippets[i];
      if (snippet) {
        const censoredSnippet = censorTitle(snippet, this.state.targetGame.title);
        hints.push(censoredSnippet);
      }
    }
    
    return hints;
  }
  
  getRemainingGuesses(): number {
    return this.state.maxGuesses - this.state.guesses.length;
  }
  
  getGuesses(): string[] {
    return [...this.state.guesses];
  }
  
  isGameOver(): boolean {
    return this.state.gameStatus !== 'playing';
  }
  
  hasWon(): boolean {
    return this.state.gameStatus === 'won';
  }
  
  getAnswer(): string {
    return this.state.targetGame.title;
  }
}
