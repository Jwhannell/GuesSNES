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
      
      // After 1 wrong guess - still 1 hint
      controller.makeGuess('Wrong Game');
      expect(controller.getHints().length).toBe(1);
      
      // After 2 wrong guesses - 2 hints
      controller.makeGuess('Another Wrong');
      expect(controller.getHints().length).toBe(2);
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
