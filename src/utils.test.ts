import { describe, it, expect } from 'vitest';
import { normalizeGuess, censorTitle, areTitlesFuzzyMatch, romanToArabic, arabicToRoman } from './utils';

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
    expect(normalizeGuess('Street Fighter II: Turbo')).toBe('streetfighter2turbo');
  });

  it('should normalize roman numerals to digits', () => {
    expect(normalizeGuess('Final Fantasy VII')).toBe('finalfantasy7');
    expect(normalizeGuess('Mega Man X')).toBe('megaman10'); // X = 10
  });

  it('should preserve numbers', () => {
    expect(normalizeGuess('Final Fantasy 3')).toBe('finalfantasy3');
  });

  it('should handle empty string', () => {
    expect(normalizeGuess('')).toBe('');
  });
});

describe('roman numeral helpers', () => {
  it('should convert roman numerals to arabic', () => {
    expect(romanToArabic('ii')).toBe(2);
    expect(romanToArabic('IV')).toBe(4);
    expect(romanToArabic('xiv')).toBe(14);
    expect(romanToArabic('MCMXCIV')).toBe(1994);
  });

  it('should convert arabic numerals to roman', () => {
    expect(arabicToRoman(2)).toBe('II');
    expect(arabicToRoman(4)).toBe('IV');
    expect(arabicToRoman(14)).toBe('XIV');
    expect(arabicToRoman(1994)).toBe('MCMXCIV');
  });

  it('should return null/empty for invalid roman tokens', () => {
    expect(romanToArabic('foo')).toBeNull();
    expect(arabicToRoman(-1)).toBe('');
  });
});

describe('areTitlesFuzzyMatch', () => {
  it('should match partial titles when tokens align', () => {
    expect(areTitlesFuzzyMatch('Mario World', 'Super Mario World')).toBe(true);
    expect(areTitlesFuzzyMatch('Link to the Past', 'The Legend of Zelda: A Link to the Past')).toBe(true);
  });

  it('should match roman numerals with arabic numerals', () => {
    expect(areTitlesFuzzyMatch('Final Fantasy 7', 'Final Fantasy VII')).toBe(true);
    expect(areTitlesFuzzyMatch('Final Fantasy VI', 'Final Fantasy 6')).toBe(true);
    expect(areTitlesFuzzyMatch('Street Fighter 2 Turbo', 'Street Fighter II Turbo')).toBe(true);
  });

  it('should not match unrelated titles', () => {
    expect(areTitlesFuzzyMatch('Metroid', 'Super Mario World')).toBe(false);
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
    expect(result).toBe('_____ _______ _ is the best'); // now censors the digit too
  });

  it('should cross-censor roman and arabic numerals in hints', () => {
    const text = 'Final Fantasy 6 is the best';
    const result = censorTitle(text, 'Final Fantasy VI');
    expect(result).toBe('_____ _______ _ is the best');

    const romanText = 'Street Fighter II Turbo is fast';
    const romanResult = censorTitle(romanText, 'Street Fighter 2 Turbo');
    expect(romanResult).toBe('______ _______ __ _____ is fast');
  });
});
