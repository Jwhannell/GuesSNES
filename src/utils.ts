// Normalize text by converting to lowercase and removing non-alphanumeric characters
export function normalizeGuess(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Censor words from title in the provided text, handling variants like plurals and possessives
export function censorTitle(reviewText: string, gameTitle: string): string {
  const titleWords = gameTitle.split(' ').filter(w => w.length >= 2);
  let censoredText = reviewText;
  
  for (const word of titleWords) {
    const baseWord = word.replace(/[^a-zA-Z0-9]/g, '');
    if (baseWord.length < 2) continue;
    
    // Generate word variants: base, plural (-s, -es), possessive ('s, s')
    const wordVariants: string[] = [];
    wordVariants.push(baseWord);
    wordVariants.push(baseWord + 's');
    wordVariants.push(baseWord + 'es');
    wordVariants.push(baseWord + "'s");
    wordVariants.push(baseWord + "s'");
    
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
