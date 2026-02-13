# GuessNES 🎮

A Wordle-like web game where players guess a random SNES game title in 6 tries!

## Features

- 🎯 Guess SNES game titles in 6 attempts
- 💡 Progressive hint system that fetches and shuffles **fresh hints per game** (no repeats)
- 🔤 Smart text normalization (case-insensitive, punctuation-ignored) with **roman ↔ arabic numeral equivalence**
- 🤝 Fuzzy title matching with token coverage thresholds (e.g., `Mario Kart` ok, but not just `Mario`)
- 🚫 Intelligent word censoring that handles plurals, possessives, and numeral variants
- 🎨 Clean, polished UI with gradient background
- 📦 No database required - uses runtime API fetching with graceful fallback when offline
- ✅ Comprehensive test coverage for core logic

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Deploy to GitHub Pages

This project is configured to deploy to GitHub Pages. To set it up:

1. **Build the project**: Run `npm run build` to create the production build in the `dist/` folder.

2. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub
   - Navigate to **Pages** in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Under **Branch**, select the branch you want to deploy from (e.g., `main`)
   - Set the folder to **`/ (root)`**
   - Click **Save**

3. **Access your game**: After a few minutes, your game will be available at:
   `https://jwhannell.github.io/GuesSNES/`

**Note**: The `dist/` folder is committed to the repository and includes a `.nojekyll` file to ensure proper deployment. The Vite configuration includes a base path of `/GuesSNES/` to work correctly with GitHub Pages.

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## How to Play

1. A random SNES game is selected from the library
2. You have 6 attempts to guess the correct title
3. After each wrong guess, a new hint is revealed (review text with the game title censored)
4. Guesses are normalized (case, punctuation, and spaces don't matter)
5. Win by guessing correctly or lose after 6 wrong attempts

## Technical Details

### Architecture

- **TypeScript** - Type-safe code throughout
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **Vanilla JS/TS** - No framework overhead, pure web technologies

### Core Functions

- `normalizeGuess()` - Normalizes user input by removing punctuation, spaces, and converting to lowercase
- `censorTitle()` - Censors game title words in review text, handling variants like plurals (`-s`, `-es`) and possessives (`'s`, `s'`)

## Game Data & No-Repeats

- 🎲 Games are selected via `selectNonRepeatingGame`, which persists a `seenGameIds` set in `localStorage` to avoid repeats across refreshes.
- 🧠 Hints are fetched/generated at runtime using `fetchHintsForGame` (Wikipedia extracts + sentence splitting) with a persistent `usedHintHashes` set to ensure **no hint repeats**, even for the same game. Hints are also **shuffled per game instance** so the order changes every time.
- 🔌 Fallback: if the Wikipedia call fails, we still generate hint sentences on the fly (no static arrays anymore), then dedupe/shuffle them before display.
- 🧼 Title words are censored via `censorTitle`, including numeric/roman variants (e.g., `6` ↔ `VI`).
- 🧪 Debug helper: in the browser console, run `resetHintHistory()` to clear stored `seenGameIds`/`usedHintHashes` during development.

## License

ISC
