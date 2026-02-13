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
      hintsRevealed: 0
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
    if (this.state.guesses.length < this.state.maxGuesses) {
      this.state.hintsRevealed = this.state.guesses.length;
    }
    
    if (this.state.guesses.length >= this.state.maxGuesses) {
      this.state.gameStatus = 'lost';
    }
    
    return false;
  }
  
  getHints(): string[] {
    const hints: string[] = [];
    const reviewText = this.state.targetGame.reviewSnippet;
    
    // Split review into sentences for progressive hints, handling various punctuation
    const sentences = reviewText.split(/[.!?]+\s*/).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < this.state.hintsRevealed && i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const censoredSentence = censorTitle(sentence, this.state.targetGame.title);
      hints.push(censoredSentence);
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
