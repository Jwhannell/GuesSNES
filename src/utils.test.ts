import { describe, it, expect } from 'vitest';
import { normalizeGuess, censorTitle } from './utils';

describe('normalizeGuess', () => {
  it('should convert uppercase to lowercase', () => {
    expect(normalizeGuess('SUPER MARIO')).toBe('supermario');
  });

  it('should remove spaces', () => {
    expect(normalizeGuess('Super Mario World')).toBe('supermarioworld');
  });

  it('should remove punctuation', () => {
    expect(normalizeGuess("Super Mario's World!")).toBe('supermariosworld');
  });

  it('should handle mixed case and symbols', () => {
    expect(normalizeGuess('Street Fighter II: Turbo')).toBe('streetfighteriiturbo');
  });

  it('should preserve numbers', () => {
    expect(normalizeGuess('Final Fantasy 3')).toBe('finalfantasy3');
  });

  it('should handle empty string', () => {
    expect(normalizeGuess('')).toBe('');
  });
});

describe('censorTitle', () => {
  it('should censor exact title words', () => {
    const text = 'Super Mario is a great game';
    const result = censorTitle(text, 'Super Mario');
    expect(result).toBe('_____ _____ is a great game');
  });

  it('should censor plural forms', () => {
    const text = 'The Marios are jumping';
    const result = censorTitle(text, 'Mario');
    expect(result).toBe('The ______ are jumping');
  });

  it('should censor possessive forms', () => {
    const text = "Mario's adventure continues";
    const result = censorTitle(text, 'Mario');
    expect(result).toBe("_____'s adventure continues");
  });

  it('should censor es-plural forms', () => {
    const text = 'Multiple Zeldas in the series';
    const result = censorTitle(text, 'Zelda');
    expect(result).toBe('Multiple ______ in the series');
  });

  it('should handle case insensitive matching', () => {
    const text = 'MARIO and mario are both censored';
    const result = censorTitle(text, 'Mario');
    expect(result).toBe('_____ and _____ are both censored');
  });

  it('should censor multiple words in title', () => {
    const text = 'Street Fighter is a fighting game';
    const result = censorTitle(text, 'Street Fighter');
    expect(result).toBe('______ _______ is a fighting game');
  });

  it('should not censor short words (< 2 chars)', () => {
    const text = 'A game is fun';
    const result = censorTitle(text, 'A Game');
    expect(result).toBe('A ____ is fun');
  });

  it('should handle titles with numbers', () => {
    const text = 'Final Fantasy 6 is the best';
    const result = censorTitle(text, 'Final Fantasy 6');
    expect(result).toBe('_____ _______ 6 is the best');
  });
});
