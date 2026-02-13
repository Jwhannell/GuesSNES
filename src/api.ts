import type { SNESGame } from './types';

// Mock SNES games data with review snippets for fallback
const mockGamesData: SNESGame[] = [
  {
    id: '1',
    title: 'Super Mario World',
    reviewSnippets: [
      'A colorful platformer adventure that perfected the Mario formula',
      'Yoshi makes his debut as a lovable rideable companion',
      'Secret exits and Star World provide incredible replay value',
      'Cape Feather power-up adds exciting flight mechanics',
      'Boss battles showcase creative and memorable designs',
      'Each world presents unique themes and challenges'
    ]
  },
  {
    id: '2',
    title: 'The Legend of Zelda: A Link to the Past',
    reviewSnippets: [
      'An epic quest with brilliant dungeon and puzzle design',
      'The Dark World mechanic effectively doubles the adventure',
      'Master Sword feels tremendously rewarding to obtain',
      'Environmental storytelling brings Hyrule to vibrant life',
      'Boss encounters test both reflexes and problem-solving',
      'The soundtrack remains iconic and emotionally resonant'
    ]
  },
  {
    id: '3',
    title: 'Chrono Trigger',
    reviewSnippets: [
      'Time travel mechanics blend seamlessly with turn-based combat',
      'Multiple endings encourage repeated playthroughs and experimentation',
      'Character combinations unlock devastating dual and triple techs',
      'Beautiful art direction captures each time period perfectly',
      'New Game Plus mode rewards mastery with fresh challenges',
      'Emotionally resonant story with memorable character arcs'
    ]
  },
  {
    id: '4',
    title: 'Final Fantasy VI',
    reviewSnippets: [
      'A sprawling RPG with an unforgettable ensemble cast',
      'The opera house scene is gaming\'s most memorable moment',
      'Kefka stands out as a truly menacing villain',
      'Esper system provides deep character customization options',
      'World of Ruin transforms the entire game experience',
      'Magitek armor sequences deliver thrilling action breaks'
    ]
  },
  {
    id: '5',
    title: 'Super Metroid',
    reviewSnippets: [
      'Atmospheric exploration with incredibly tight responsive controls',
      'Sense of isolation creates an unforgettable oppressive mood',
      'Power-ups fundamentally transform traversal and combat options',
      'Map design encourages organic exploration and discovery',
      'Boss encounters brilliantly test reflexes and strategy',
      'Speedrunning potential has engaged fans for decades'
    ]
  },
  {
    id: '6',
    title: 'Donkey Kong Country',
    reviewSnippets: [
      'Pre-rendered graphics pushed the SNES to its limits',
      'Mine cart levels deliver heart-pounding excitement and thrills',
      'Animal buddies add delightful variety to platforming',
      'Hidden bonus rooms reward thorough exploration efforts',
      'Difficulty curve perfectly balances accessibility with challenge',
      'David Wise\'s soundtrack elevates every single moment'
    ]
  },
  {
    id: '7',
    title: 'Street Fighter II Turbo',
    reviewSnippets: [
      'Fast-paced fighting with diverse character roster and moves',
      'Brought competitive multiplayer to living rooms worldwide',
      'Each fighter has distinct playstyles and strategies',
      'Special move execution demands precise timing and practice',
      'Tournament play revealed incredible depth and complexity',
      'Roster balance keeps matches exciting and unpredictable'
    ]
  },
  {
    id: '8',
    title: 'Super Mario Kart',
    reviewSnippets: [
      'Racing chaos with creative power-ups and items',
      'Battle mode provides endless fun with friends',
      'Each character has unique handling characteristics',
      'Track shortcuts reward skillful and daring driving',
      'Rubber-banding AI keeps races exciting and competitive',
      'Mode 7 graphics were revolutionary for console racing'
    ]
  },
  {
    id: '9',
    title: 'Mega Man X',
    reviewSnippets: [
      'Dashing and wall-jumping modernize classic run-and-gun gameplay',
      'Boss battles brilliantly reward pattern recognition and skill',
      'Armor upgrades provide meaningful character progression',
      'Tackle stages in any order promoting experimentation',
      'Zero\'s appearance hints at exciting future possibilities',
      'Challenging difficulty that respects player intelligence'
    ]
  },
  {
    id: '10',
    title: 'Earthbound',
    reviewSnippets: [
      'Quirky humor differentiates this RPG from fantasy peers',
      'Psychedelic final battle pushes hardware creatively',
      'Contemporary American setting feels refreshingly unique',
      'Battle system cleverly streamlines traditional RPG combat',
      'Memorable characters populate the charming quirky world',
      'Rolling HP counter adds strategic depth to healing'
    ]
  }
];

// Fetch SNES games from GiantBomb API or return mock data on failure
export async function fetchSNESGames(): Promise<SNESGame[]> {
  // In a real implementation, we would try to fetch from GiantBomb API
  // For this version, we return mock data immediately
  
  try {
    // Could attempt real API call here with API key
    // const response = await fetch('https://www.giantbomb.com/api/games/...');
    // if (!response.ok) throw new Error('API failed');
    // return processAPIResponse(await response.json());
    
    // Return mock data as fallback
    return mockGamesData;
  } catch (error) {
    console.warn('Failed to fetch from API, using mock data:', error);
    return mockGamesData;
  }
}

// Get a random game from the list
export function selectRandomGame(games: SNESGame[]): SNESGame {
  const randomIndex = Math.floor(Math.random() * games.length);
  return games[randomIndex];
}
