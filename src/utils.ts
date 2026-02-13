// --- Title normalization helpers -------------------------------------------------
const ROMAN_MAP: Record<string, number> = {
  i: 1,
  v: 5,
  x: 10,
  l: 50,
  c: 100,
  d: 500,
  m: 1000,
};

/**
 * Convert a roman numeral token (e.g., "vi", "xiv") to an arabic number.
 * Returns null if the token is not a valid roman numeral.
 */
export function romanToArabic(token: string): number | null {
  const roman = token.toLowerCase();
  if (!/^[ivxlcdm]+$/.test(roman)) return null;
  let total = 0;
  let prev = 0;
  for (let i = roman.length - 1; i >= 0; i--) {
    const char = roman[i];
    const value = ROMAN_MAP[char];
    if (!value) return null; // invalid character
    if (value < prev) {
      total -= value;
    } else {
      total += value;
      prev = value;
    }
  }
  return total > 0 ? total : null;
}

/**
 * Convert an arabic number (1-3999) to a roman numeral string.
 * Used for symmetric censoring (digits <-> romans).
 */
export function arabicToRoman(num: number): string {
  if (!Number.isFinite(num) || num <= 0) return '';
  const lookup: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let remainder = Math.floor(num);
  for (const [value, numeral] of lookup) {
    while (remainder >= value) {
      result += numeral;
      remainder -= value;
    }
  }
  return result;
}

/**
 * Tokenize and normalize a title/guess for matching. Converts to lowercase,
 * strips punctuation, and normalizes roman numerals into digits where possible.
 */
export function normalizeTitleTokens(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ') // normalize separators
    .split(/\s+/)
    .filter(Boolean)
    .map(token => {
      // If token is numeric already, keep as-is
      if (/^\d+$/.test(token)) return token;
      // If token looks like a roman numeral, convert to digits
      const romanValue = romanToArabic(token);
      if (romanValue !== null) return romanValue.toString();
      return token;
    });
}

// Normalize text into a compact, comparable string. Keeps digits and
// normalizes roman numerals into their digit equivalents.
export function normalizeGuess(input: string): string {
  return normalizeTitleTokens(input).join('');
}

/**
 * Lightweight Levenshtein distance for typo-tolerance. Only used as a fallback
 * when other checks don’t match. Returns a score between 0 and 1.
 */
export function similarityScore(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 && lenB === 0) return 1;
  if (lenA === 0 || lenB === 0) return 0;
  const dp = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));
  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  const distance = dp[lenA][lenB];
  return 1 - distance / Math.max(lenA, lenB);
}

/**
 * Fuzzy title matcher supporting:
 * - Exact normalized equality (spaces/punct removed)
 * - Token subset matching ("Mario World" vs "Super Mario World")
 * - Roman numeral <-> digit equivalence ("VII" == "7")
 * - Mild typo tolerance via similarity score
 */
export function areTitlesFuzzyMatch(guess: string, target: string): boolean {
  // Quick exact normalized check
  const normalizedGuess = normalizeGuess(guess);
  const normalizedTarget = normalizeGuess(target);
  if (normalizedGuess === normalizedTarget) return true;

  const guessTokens = normalizeTitleTokens(guess);
  const targetTokens = normalizeTitleTokens(target);
  if (guessTokens.length === 0 || targetTokens.length === 0) return false;

  // Token subset check: every token in guess appears somewhere in target
  const targetTokenSet = new Set(targetTokens);
  const significantGuessTokens = guessTokens.filter(token => token.length >= 2 || targetTokenSet.has(token));
  if (
    significantGuessTokens.length > 0 &&
    significantGuessTokens.every(token => targetTokenSet.has(token))
  ) {
    return true;
  }

  // Substring check on concatenated canonical forms (helps when user omits words)
  if (
    normalizedGuess.length >= 3 &&
    (normalizedTarget.includes(normalizedGuess) || normalizedGuess.includes(normalizedTarget))
  ) {
    return true;
  }

  // Mild typo tolerance fallback
  const score = similarityScore(normalizedGuess, normalizedTarget);
  return score >= 0.8; // tweak threshold if needed
}

// --- Title censoring ----------------------------------------------------------

// Censor words from title in the provided text, handling variants like plurals and possessives
export function censorTitle(reviewText: string, gameTitle: string): string {
  const titleWords = gameTitle.split(/\s+/).filter(Boolean);
  let censoredText = reviewText;
  
  for (const word of titleWords) {
    const baseWord = word.replace(/[^a-zA-Z0-9]/g, '');
    const isNumeric = /^\d+$/.test(baseWord);
    const romanValue = romanToArabic(baseWord);
    const isRoman = romanValue !== null;

    // Skip truly trivial tokens (like "a"), but allow numerals (e.g., "6")
    // and roman numerals (e.g., "VI") even if short.
    if (baseWord.length < 2 && !isNumeric && !isRoman) continue;
    
    // Generate word variants: base, plural (-s, -es), possessive ('s, s')
    const wordVariants: string[] = [];
    wordVariants.push(baseWord);
    if (!isNumeric) { // plurals/possessives make sense for words, not bare digits
      wordVariants.push(baseWord + 's');
      wordVariants.push(baseWord + 'es');
      wordVariants.push(baseWord + "'s");
      wordVariants.push(baseWord + "s'");
    }

    // If the baseWord looks like roman numerals, add its digit form
    if (isRoman) {
      wordVariants.push(romanValue!.toString());
    }

    // If the baseWord is numeric, also add roman form to catch review variants
    if (isNumeric) {
      const numericRoman = arabicToRoman(Number(baseWord));
      if (numericRoman) {
        wordVariants.push(numericRoman);
      }
    }

    // Build pattern and censor each variant
    for (const variant of wordVariants) {
      const escapedVariant = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordPattern = new RegExp('\\b' + escapedVariant + '\\b', 'gi');
      censoredText = censoredText.replace(wordPattern, (matched) => {
        return '_'.repeat(matched.length);
      });
    }
  }
  
  return censoredText;
}
