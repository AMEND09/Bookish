// Utility for integrating HTML minigames with the Bookish pet system
import minigamesAPI from '../services/minigamesApi';

export interface MinigameIntegration {
  gameId: string;
  sessionId: string;
  validationToken: string;
  userId: string;
  onComplete: (score: number) => void;
  onError: (error: string) => void;
}

export class MinigameSDK {
  private integration: MinigameIntegration | null = null;

  /**
   * Initialize the minigame integration
   * Call this when the game starts
   */
  initialize(integration: MinigameIntegration): void {
    this.integration = integration;
    console.log('🎮 Minigame SDK initialized for game:', integration.gameId);

    // Set up message listener for iframe communication
    this.setupMessageListener();

    // Notify parent window that game is ready
    this.postMessage('game_ready', {
      gameId: integration.gameId,
      sessionId: integration.sessionId
    });
  }

  /**
   * Complete the game with a score
   * Call this when the player finishes the game
   */
  completeGame(score: number): void {
    if (!this.integration) {
      console.error('🎮 Minigame SDK not initialized');
      return;
    }

    console.log('🎮 Completing game with score:', score);
    
    // Notify parent window of completion
    this.postMessage('game_complete', {
      gameId: this.integration.gameId,
      sessionId: this.integration.sessionId,
      score: score,
      validationToken: this.integration.validationToken
    });

    // Call the completion handler
    this.integration.onComplete(score);
  }

  /**
   * Report an error during gameplay
   */
  reportError(error: string): void {
    if (!this.integration) {
      console.error('🎮 Minigame SDK not initialized');
      return;
    }

    console.error('🎮 Game error:', error);
    
    // Notify parent window of error
    this.postMessage('game_error', {
      gameId: this.integration.gameId,
      sessionId: this.integration.sessionId,
      error: error
    });

    // Call the error handler
    this.integration.onError(error);
  }

  /**
   * Get game configuration from the parent
   */
  getGameConfig(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.integration) {
        reject('SDK not initialized');
        return;
      }

      const requestId = Math.random().toString(36).substr(2, 9);
      
      // Set up one-time listener for config response
      const listener = (event: MessageEvent) => {
        if (event.data.type === 'config_response' && event.data.requestId === requestId) {
          window.removeEventListener('message', listener);
          resolve(event.data.config);
        }
      };
      
      window.addEventListener('message', listener);
      
      // Request config from parent
      this.postMessage('get_config', {
        gameId: this.integration.gameId,
        requestId: requestId
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', listener);
        reject('Config request timeout');
      }, 5000);
    });
  }

  /**
   * Update game progress (for longer games)
   */
  updateProgress(progress: { currentLevel?: number; currentScore?: number; timeElapsed?: number }): void {
    if (!this.integration) return;

    this.postMessage('game_progress', {
      gameId: this.integration.gameId,
      sessionId: this.integration.sessionId,
      progress: progress
    });
  }

  /**
   * Request a pause (for games that support it)
   */
  requestPause(): void {
    if (!this.integration) return;

    this.postMessage('game_pause_request', {
      gameId: this.integration.gameId,
      sessionId: this.integration.sessionId
    });
  }

  /**
   * Notify that game is resumed
   */
  notifyResume(): void {
    if (!this.integration) return;

    this.postMessage('game_resume', {
      gameId: this.integration.gameId,
      sessionId: this.integration.sessionId
    });
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Only accept messages from parent window
      if (event.source !== window.parent) return;

      switch (event.data.type) {
        case 'game_pause':
          this.handlePause();
          break;
        case 'game_resume':
          this.handleResume();
          break;
        case 'game_stop':
          this.handleStop();
          break;
      }
    });
  }

  private postMessage(type: string, data: any): void {
    if (window.parent) {
      window.parent.postMessage({
        type: type,
        source: 'bookish_minigame',
        ...data
      }, '*');
    }
  }

  private handlePause(): void {
    // Override this method in your game to handle pause
    console.log('🎮 Game pause requested');
  }

  private handleResume(): void {
    // Override this method in your game to handle resume
    console.log('🎮 Game resume requested');
  }

  private handleStop(): void {
    // Override this method in your game to handle stop
    console.log('🎮 Game stop requested');
  }
}

/**
 * Parent window utilities for managing minigame iframes
 */
export class MinigameManager {
  private activeGames: Map<string, {
    iframe: HTMLIFrameElement;
    integration: MinigameIntegration;
  }> = new Map();

  /**
   * Start a new minigame in an iframe
   */
  async startGame(
    gameId: string, 
    gameUrl: string, 
    container: HTMLElement,
    userId: string,
    onCoinsAwarded: (coins: number) => void
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    
    // Start game session through API
    const sessionResult = minigamesAPI.startGameSession(userId, gameId);
    if (!sessionResult.success) {
      return sessionResult;
    }

    const sessionId = sessionResult.sessionId!;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = gameUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.title = `Minigame: ${gameId}`;

    // Set up integration
    const integration: MinigameIntegration = {
      gameId,
      sessionId,
      validationToken: this.generateValidationToken(sessionId),
      userId,
      onComplete: (score: number) => {
        this.completeGame(sessionId, score, integration.validationToken, onCoinsAwarded);
      },
      onError: (error: string) => {
        console.error('🎮 Game error:', error);
      }
    };

    // Store active game
    this.activeGames.set(sessionId, { iframe, integration });

    // Set up message listener
    this.setupMessageListener(sessionId);

    // Add iframe to container
    container.appendChild(iframe);

    return { success: true, sessionId };
  }

  /**
   * Stop and remove a game
   */
  stopGame(sessionId: string): void {
    const game = this.activeGames.get(sessionId);
    if (!game) return;

    // Notify game to stop
    game.iframe.contentWindow?.postMessage({
      type: 'game_stop',
      source: 'bookish_parent'
    }, '*');

    // Remove iframe
    game.iframe.remove();

    // Clean up
    this.activeGames.delete(sessionId);
  }

  /**
   * Pause a game
   */
  pauseGame(sessionId: string): void {
    const game = this.activeGames.get(sessionId);
    if (!game) return;

    game.iframe.contentWindow?.postMessage({
      type: 'game_pause',
      source: 'bookish_parent'
    }, '*');
  }

  /**
   * Resume a game
   */
  resumeGame(sessionId: string): void {
    const game = this.activeGames.get(sessionId);
    if (!game) return;

    game.iframe.contentWindow?.postMessage({
      type: 'game_resume',
      source: 'bookish_parent'
    }, '*');
  }

  private setupMessageListener(sessionId: string): void {
    const messageHandler = (event: MessageEvent) => {
      // Only accept messages from game iframes
      if (event.data.source !== 'bookish_minigame') return;

      const game = this.activeGames.get(sessionId);
      if (!game) return;

      switch (event.data.type) {
        case 'game_ready':
          console.log('🎮 Game ready:', event.data.gameId);
          break;

        case 'game_complete':
          if (event.data.sessionId === sessionId) {
            this.completeGame(
              sessionId,
              event.data.score,
              event.data.validationToken,
              game.integration.onComplete
            );
          }
          break;

        case 'game_error':
          console.error('🎮 Game error:', event.data.error);
          game.integration.onError(event.data.error);
          break;

        case 'game_progress':
          console.log('🎮 Game progress:', event.data.progress);
          break;

        case 'get_config':
          this.handleConfigRequest(event, game);
          break;
      }
    };

    window.addEventListener('message', messageHandler);

    // Clean up listener when game is removed
    const originalDelete = this.activeGames.delete.bind(this.activeGames);
    this.activeGames.delete = (key) => {
      if (key === sessionId) {
        window.removeEventListener('message', messageHandler);
      }
      return originalDelete(key);
    };
  }

  private completeGame(
    sessionId: string, 
    score: number, 
    validationToken: string, 
    onCoinsAwarded: (coins: number) => void
  ): void {
    const result = minigamesAPI.completeGameSession(
      sessionId,
      score,
      validationToken,
      onCoinsAwarded
    );

    if (!result.success) {
      console.error('🎮 Failed to complete game:', result.error);
    }

    // Clean up the game
    this.stopGame(sessionId);
  }

  private handleConfigRequest(event: MessageEvent, game: { integration: MinigameIntegration }): void {
    const config = {
      gameId: game.integration.gameId,
      userId: game.integration.userId,
      sessionId: game.integration.sessionId,
      // Add any game-specific configuration here
    };    event.source?.postMessage({
      type: 'config_response',
      requestId: event.data.requestId,
      config: config
    }, { targetOrigin: event.origin });
  }

  private generateValidationToken(sessionId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return btoa(`${sessionId}_${timestamp}_${randomString}`);
  }
}

// Global instance for easy access
export const minigameManager = new MinigameManager();

// Utility function to be used in HTML minigames
export const createMinigameSDK = (): MinigameSDK => {
  return new MinigameSDK();
};

export default MinigameSDK;
