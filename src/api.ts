import type { SNESGame } from './types';

// Mock SNES games data with review snippets for fallback
const mockGamesData: SNESGame[] = [
  {
    id: '1',
    title: 'Super Mario World',
    reviewSnippet: 'The plumber returns in this colorful platformer adventure filled with creative level design and catchy music. A true masterpiece that defined the console generation.'
  },
  {
    id: '2',
    title: 'The Legend of Zelda: A Link to the Past',
    reviewSnippet: 'An epic quest through dungeons and overworld that showcases brilliant puzzle design and memorable boss battles. This title raised the bar for action-adventure gaming.'
  },
  {
    id: '3',
    title: 'Chrono Trigger',
    reviewSnippet: 'Time travel mechanics blend seamlessly with turn-based combat and an emotionally resonant story. The soundtrack perfectly complements each era you visit.'
  },
  {
    id: '4',
    title: 'Final Fantasy VI',
    reviewSnippet: 'A sprawling RPG with an ensemble cast and dramatic storyline. The opera house scene remains one of gaming\'s most memorable moments.'
  },
  {
    id: '5',
    title: 'Super Metroid',
    reviewSnippet: 'Atmospheric exploration meets tight controls in this sci-fi adventure. The sense of isolation and discovery creates an unforgettable experience.'
  },
  {
    id: '6',
    title: 'Donkey Kong Country',
    reviewSnippet: 'Pre-rendered graphics pushed technical boundaries while maintaining smooth gameplay. The mine cart levels deliver heart-pounding excitement.'
  },
  {
    id: '7',
    title: 'Street Fighter II Turbo',
    reviewSnippet: 'Fast-paced fighting action with diverse characters and special moves. This version brought competitive multiplayer to living rooms worldwide.'
  },
  {
    id: '8',
    title: 'Super Mario Kart',
    reviewSnippet: 'Racing chaos ensues with power-ups and slippery banana peels. The battle mode provides endless fun with friends.'
  },
  {
    id: '9',
    title: 'Mega Man X',
    reviewSnippet: 'Dashing and wall-jumping add new dimensions to classic run-and-gun gameplay. Boss battles reward skill and pattern recognition.'
  },
  {
    id: '10',
    title: 'Earthbound',
    reviewSnippet: 'Quirky humor and modern setting differentiate this RPG from fantasy peers. The psychedelic final battle pushes hardware limits creatively.'
  }
];

// Fetch SNES games from GiantBomb API or return mock data on failure
export async function fetchSNESGames(): Promise<SNESGame[]> {
  // In a real implementation, we would try to fetch from GiantBomb API
  // For this version, we'll use the mock data with a simulated delay
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
