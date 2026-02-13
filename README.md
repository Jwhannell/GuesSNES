# GuessNES 🎮

A Wordle-like web game where players guess a random SNES game title in 6 tries!

## Features

- 🎯 Guess SNES game titles in 6 attempts
- 💡 Progressive hint system that reveals censored review snippets after each wrong guess
- 🔤 Smart text normalization (case-insensitive, punctuation-ignored)
- 🚫 Intelligent word censoring that handles plurals and possessive forms
- 🎨 Clean, polished UI with gradient background
- 📦 No database required - uses runtime API fetching with graceful fallback to mock data
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

## Game Data

The game attempts to fetch SNES titles and review snippets from public APIs (like GiantBomb) at runtime. If the API is unavailable, it gracefully falls back to a curated set of 10 classic SNES games with hand-written review snippets.

## License

ISC
