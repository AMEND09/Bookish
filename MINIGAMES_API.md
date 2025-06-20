# Bookish Minigames API Integration Guide

This guide explains how to integrate HTML minigames with the Bookish pet system to award coins to users.

## Overview

The Bookish minigames system allows you to create HTML games that can award coins to users when they complete them. These coins can then be spent in the pet shop alongside regular reading points.

## Quick Start

1. **View the Sample Game**: Check out `/public/sample-minigame.html` for a complete working example
2. **Access the Minigames Page**: Navigate to `/minigames` in the app to see available games
3. **Test Integration**: The sample game demonstrates the full integration workflow

## API Structure

### Available Games Configuration

Games are configured in `/src/services/minigamesApi.ts`:

```typescript
const availableGames: Minigame[] = [
  {
    id: 'word_puzzle',
    name: 'Word Puzzle',
    description: 'Solve word puzzles to earn coins',
    difficulty: 'easy',
    baseReward: 10,      // Base coins awarded
    bonusMultiplier: 1.5, // Score multiplier for bonus coins
    maxPlaysPerDay: 5,    // Daily play limit
    gameUrl: '/sample-minigame.html', // Your game URL
    isActive: true
  }
]
```

### Integration Steps

#### 1. Create Your HTML Game

Create a standalone HTML file with your game. See `/public/sample-minigame.html` for reference.

#### 2. Set Up Message Communication

Your game should communicate with the parent window using `postMessage`:

```javascript
// Notify parent that game is ready
window.parent.postMessage({
  type: 'game_ready',
  source: 'bookish_minigame'
}, '*');

// Complete the game with a score
window.parent.postMessage({
  type: 'game_complete',
  source: 'bookish_minigame',
  sessionId: gameSession.sessionId,
  score: finalScore,
  validationToken: gameSession.validationToken
}, '*');
```

#### 3. Handle Game Lifecycle

Listen for messages from the parent:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.source === 'bookish_parent') {
    switch (event.data.type) {
      case 'game_pause':
        // Pause your game
        break;
      case 'game_resume':
        // Resume your game
        break;
      case 'game_stop':
        // Stop your game
        break;
    }
  }
});
```

#### 4. Add Your Game to the System

1. Place your HTML file in the `/public` folder or host it externally
2. Add your game configuration to the `availableGames` array in `/src/services/minigamesApi.ts`
3. Set the `gameUrl` property to point to your game

## Coin Calculation

Coins awarded = `baseReward + (score × bonusMultiplier)`

- **baseReward**: Fixed coins awarded for completion
- **score**: The score your game reports
- **bonusMultiplier**: Multiplier applied to the score for bonus coins

Example: If `baseReward = 10`, `score = 100`, and `bonusMultiplier = 1.5`:
Total coins = 10 + (100 × 1.5) = 160 coins

## Game Requirements

### Required Features
- Must report a final score when completed
- Must handle pause/resume/stop commands from parent
- Must use the correct message format for communication

### Recommended Features
- Progress indication
- Responsive design for mobile devices
- Book/reading theme to match the app
- Clear instructions for players
- Difficulty scaling based on user level

## Message API Reference

### From Game to Parent

```javascript
// Game is ready to start
{
  type: 'game_ready',
  source: 'bookish_minigame'
}

// Game completed successfully
{
  type: 'game_complete',
  source: 'bookish_minigame',
  sessionId: string,
  score: number,
  validationToken: string
}

// Game encountered an error
{
  type: 'game_error',
  source: 'bookish_minigame',
  sessionId: string,
  error: string
}

// Progress update (optional)
{
  type: 'game_progress',
  source: 'bookish_minigame',
  sessionId: string,
  progress: {
    currentLevel?: number,
    currentScore?: number,
    timeElapsed?: number
  }
}
```

### From Parent to Game

```javascript
// Initialize game with session data
{
  type: 'init_minigame',
  sessionId: string,
  validationToken: string,
  gameId: string
}

// Pause the game
{
  type: 'game_pause',
  source: 'bookish_parent'
}

// Resume the game
{
  type: 'game_resume',
  source: 'bookish_parent'
}

// Stop the game
{
  type: 'game_stop',
  source: 'bookish_parent'
}
```

## Security Features

- **Validation Tokens**: Each game session has a unique validation token to prevent cheating
- **Daily Limits**: Games have configurable daily play limits
- **Score Validation**: Bonus multipliers prevent unrealistic score inflation
- **Session Management**: Each game instance is tracked and validated

## Unlock Requirements

Games can have unlock requirements:

```typescript
unlockRequirement: {
  level: 10,        // Pet must be level 10+
  books: 5,         // User must have read 5+ books
  badges: ['bookworm'] // User must have specific badges
}
```

## Testing Your Game

1. Add your game to the `availableGames` array
2. Navigate to `/minigames` in the app
3. Your game should appear if unlock requirements are met
4. Click "Play Game" to test the integration
5. Complete the game to verify coin awarding works

## Best Practices

1. **Theme Consistency**: Use book/reading related themes and vocabulary
2. **Mobile First**: Design for mobile devices primarily
3. **Accessibility**: Ensure games work without sound and with screen readers
4. **Performance**: Keep games lightweight for quick loading
5. **Error Handling**: Gracefully handle network issues and edge cases
6. **User Feedback**: Provide clear feedback on progress and completion

## Example Games Ideas

- **Word Unscramble**: Unscramble book-related words
- **Reading Comprehension**: Answer questions about short passages
- **Speed Reading**: Read text quickly and answer questions
- **Book Trivia**: Answer questions about famous books and authors
- **Genre Sorting**: Sort books into correct genres
- **Memory Match**: Match book covers or author names
- **Story Builder**: Create stories by choosing words/phrases

## File Structure

```
public/
  └── sample-minigame.html     # Example minigame
src/
  ├── services/
  │   └── minigamesApi.ts      # Game configuration and API
  ├── utils/
  │   └── minigameIntegration.ts # Integration utilities
  └── pages/
      └── MinigamesPage.tsx    # Minigames UI
```

## Support

For questions about minigame integration, check the source code or create an issue in the project repository.

Happy gaming! 🎮📚
