import { fetchSNESGames, selectNonRepeatingGame, fetchHintsForGame, resetSeenGames, resetUsedHints } from './api';
import { GameController } from './game';

let gameController: GameController | null = null;

function renderLoading(message = 'Loading a new game...'): void {
  const appElement = document.getElementById('app');
  if (!appElement) return;
  appElement.innerHTML = `<div class="loading"><p>${message}</p></div>`;
}

// Initialize the game
async function initGame() {
  const appElement = document.getElementById('app');
  if (!appElement) return;
  
  renderLoading();
  
  try {
    const games = await fetchSNESGames();
    let pickedGame = selectNonRepeatingGame(games);
    let hints: string[] = [];

    // Try multiple times to get a game with fresh hints (no repeats)
    const maxAttempts = Math.min(games.length, 5);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        hints = await fetchHintsForGame(pickedGame);
        if (hints.length > 0) break;
      } catch (err) {
        // Try another game if no new hints are available for this one
        pickedGame = selectNonRepeatingGame(games);
      }
    }

    if (!hints || hints.length === 0) {
      throw new Error('Could not fetch fresh hints for any game');
    }

    pickedGame.reviewSnippets = hints;

    gameController = new GameController(pickedGame);
    renderGame();
  } catch (error) {
    appElement.innerHTML = '<div class="loading"><p>Failed to load game. Please refresh.</p></div>';
    console.error('Game initialization failed:', error);
  }
}

// Render the game UI
function renderGame() {
  const appElement = document.getElementById('app');
  if (!appElement || !gameController) return;
  
  const state = gameController.getState();
  const hints = gameController.getHints();
  const guesses = gameController.getGuesses();
  const remainingGuesses = gameController.getRemainingGuesses();
  const isGameOver = gameController.isGameOver();
  const hasWon = gameController.hasWon();
  
  let html = `
    <div class="game-info">
      <div class="info-item">
        <div class="info-label">Guesses Left</div>
        <div class="info-value">${remainingGuesses}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Hints Revealed</div>
        <div class="info-value">${hints.length}</div>
      </div>
    </div>
  `;
  
  // Hints section
  html += '<div class="hints-section">';
  html += '<div class="hints-title">📝 Hints:</div>';
  if (hints.length === 0) {
    html += '<div class="no-hints">No hints available yet.</div>';
  } else {
    hints.forEach((hint, index) => {
      html += `<div class="hint">${index + 1}. ${hint}</div>`;
    });
  }
  html += '</div>';
  
  // Guesses section
  if (guesses.length > 0) {
    html += '<div class="guesses-section">';
    html += '<div class="hints-title">❌ Previous Guesses:</div>';
    guesses.forEach((guess, index) => {
      html += `
        <div class="guess-item">
          <span class="guess-number">#${index + 1}</span>
          <span>${guess}</span>
        </div>
      `;
    });
    html += '</div>';
  }
  
  // Input section or game over message
  if (isGameOver) {
    const wonClass = hasWon ? 'won' : 'lost';
    const title = hasWon ? '🎉 You Won!' : '😢 Game Over';
    const message = hasWon 
      ? `You guessed it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
      : 'Better luck next time!';
    
    html += `
      <div class="game-over ${wonClass}">
        <div class="game-over-title">${title}</div>
        <div>${message}</div>
        <div class="answer">The answer was: <strong>${gameController.getAnswer()}</strong></div>
        <button class="new-game-btn" onclick="window.location.reload()">🔄 Play Again</button>
      </div>
    `;
  } else {
    html += `
      <div class="input-section">
        <form id="guess-form" class="input-group">
          <input 
            type="text" 
            id="guess-input" 
            placeholder="Enter your guess..."
            autocomplete="off"
            required
          />
          <button type="submit">Guess</button>
        </form>
      </div>
    `;
  }
  
  appElement.innerHTML = html;
  
  // Attach event listener to form if game is still active
  if (!isGameOver) {
    const form = document.getElementById('guess-form') as HTMLFormElement;
    const input = document.getElementById('guess-input') as HTMLInputElement;
    
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const guess = input.value.trim();
        
        if (guess && gameController) {
          gameController.makeGuess(guess);
          renderGame();
          
          // Focus input again if game continues
          if (!gameController.isGameOver()) {
            input.value = '';
            input.focus();
          }
        }
      });
      
      // Auto-focus input on render
      input.focus();
    }
  }
}

// Debug/test helper: allow manual resets of history (non-production convenience)
// @ts-expect-error attach to window for quick access
globalThis.resetHintHistory = () => {
  try {
    resetSeenGames();
    resetUsedHints();
    console.info('Hint/game history cleared.');
  } catch (err) {
    console.warn('Failed to reset history', err);
  }
};

// Start the game when page loads
initGame();
