import { describe, it, expect } from 'vitest';
import { GameController } from './game';
import type { SNESGame } from './types';

describe('GameController', () => {
  const mockGame: SNESGame = {
    id: '1',
    title: 'Super Mario World',
    reviewSnippet: 'Super Mario World is an amazing platformer. It features incredible level design. The graphics are stunning for its time.'
  };

  describe('Initial hint behavior', () => {
    it('should start with 1 hint revealed', () => {
      const controller = new GameController(mockGame);
      const state = controller.getState();
      expect(state.hintsRevealed).toBe(1);
    });

    it('should show one hint before any guesses', () => {
      const controller = new GameController(mockGame);
      const hints = controller.getHints();
      expect(hints.length).toBe(1);
      expect(hints[0]).toContain('is an amazing platformer');
    });

    it('should censor the game title in the initial hint', () => {
      const controller = new GameController(mockGame);
      const hints = controller.getHints();
      expect(hints[0]).not.toContain('Super Mario World');
      expect(hints[0]).toContain('_____');
    });
  });

  describe('Progressive hints after guesses', () => {
    it('should reveal additional hints after wrong guesses', () => {
      const controller = new GameController(mockGame);
      
      // Initial state - 1 hint
      expect(controller.getHints().length).toBe(1);
      
      // After 1 wrong guess - 2 hints
      controller.makeGuess('Wrong Game');
      expect(controller.getHints().length).toBe(2);
      
      // After 2 wrong guesses - 3 hints
      controller.makeGuess('Another Wrong');
      expect(controller.getHints().length).toBe(3);
    });

    it('should reveal a new hint with each wrong guess up to 6', () => {
      // Use a game with more sentences to test all 6 wrong guesses
      const gameWithManyHints: SNESGame = {
        id: '2',
        title: 'The Legend of Zelda',
        reviewSnippet: 'The Legend of Zelda is an epic adventure. It features amazing dungeons. The combat is satisfying. The puzzles are clever. The music is iconic. The world is vast. The story is compelling.'
      };
      const controller = new GameController(gameWithManyHints);
      
      // Initial state - 1 hint
      expect(controller.getHints().length).toBe(1);
      
      // Test all 6 wrong guesses - each should reveal a new hint
      controller.makeGuess('Wrong 1');
      expect(controller.getHints().length).toBe(2);
      
      controller.makeGuess('Wrong 2');
      expect(controller.getHints().length).toBe(3);
      
      controller.makeGuess('Wrong 3');
      expect(controller.getHints().length).toBe(4);
      
      controller.makeGuess('Wrong 4');
      expect(controller.getHints().length).toBe(5);
      
      controller.makeGuess('Wrong 5');
      expect(controller.getHints().length).toBe(6);
      
      // This should reveal the 7th hint, but currently doesn't due to the bug
      controller.makeGuess('Wrong 6');
      expect(controller.getHints().length).toBe(7);
    });

    it('should maintain 6 remaining guesses at start', () => {
      const controller = new GameController(mockGame);
      expect(controller.getRemainingGuesses()).toBe(6);
    });
  });

  describe('Game winning condition', () => {
    it('should win when guessing correct title', () => {
      const controller = new GameController(mockGame);
      const result = controller.makeGuess('Super Mario World');
      expect(result).toBe(true);
      expect(controller.hasWon()).toBe(true);
    });

    it('should handle case-insensitive correct guesses', () => {
      const controller = new GameController(mockGame);
      const result = controller.makeGuess('super mario world');
      expect(result).toBe(true);
      expect(controller.hasWon()).toBe(true);
    });
  });

  describe('Game losing condition', () => {
    it('should lose after 6 wrong guesses', () => {
      const controller = new GameController(mockGame);
      
      for (let i = 0; i < 6; i++) {
        controller.makeGuess(`Wrong Guess ${i}`);
      }
      
      expect(controller.isGameOver()).toBe(true);
      expect(controller.hasWon()).toBe(false);
      expect(controller.getState().gameStatus).toBe('lost');
    });
  });
});
