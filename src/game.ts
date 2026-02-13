import type { GameState, SNESGame } from './types';
import { normalizeGuess, censorTitle } from './utils';

export class GameController {
  private state: GameState;
  
  constructor(targetGame: SNESGame) {
    this.state = {
      targetGame,
      guesses: [],
      maxGuesses: 6,
      gameStatus: 'playing',
      hintsRevealed: 1
    };
  }
  
  getState(): GameState {
    return { ...this.state };
  }
  
  makeGuess(guess: string): boolean {
    if (this.state.gameStatus !== 'playing') {
      return false;
    }
    
    const normalizedGuess = normalizeGuess(guess);
    const normalizedTarget = normalizeGuess(this.state.targetGame.title);
    
    this.state.guesses.push(guess);
    
    if (normalizedGuess === normalizedTarget) {
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
    const reviewSnippets = this.state.targetGame.reviewSnippets;
    
    // Use review snippets directly (one snippet per hint)
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
