// Minigames API for HTML games integration
import gunService from './gun';

export interface Minigame {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  baseReward: number; // Base coins awarded
  bonusMultiplier: number; // Multiplier for high scores
  maxPlaysPerDay: number; // Daily play limit
  unlockRequirement?: {
    level?: number;
    books?: number;
    badges?: string[];
  };
  gameUrl?: string; // URL to the HTML game
  isActive: boolean;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  score?: number;
  completed: boolean;
  coinsAwarded: number;
  validationToken: string; // Prevents cheating
}

export interface GameStats {
  gameId: string;
  playsToday: number;
  totalPlays: number;
  highScore: number;
  lastPlayed: string;
  totalCoinsEarned: number;
}

class MinigamesAPI {
  private sessions: Map<string, GameSession> = new Map();
  private userStats: Map<string, Map<string, GameStats>> = new Map();
  
  // Available minigames
  private availableGames: Minigame[] = [    {
      id: 'word_puzzle',
      name: 'Word Puzzle',
      description: 'Solve word puzzles to earn coins',
      difficulty: 'easy',
      baseReward: 10,
      bonusMultiplier: 1.5,
      maxPlaysPerDay: 5,
      gameUrl: '/Bookish/sample-minigame.html',
      isActive: true
    },
    {
      id: 'memory_match',
      name: 'Memory Match',
      description: 'Match pairs of book covers',
      difficulty: 'medium',
      baseReward: 15,
      bonusMultiplier: 2.0,
      maxPlaysPerDay: 3,
      unlockRequirement: { level: 5 },
      isActive: true
    },
    {
      id: 'speed_reading',
      name: 'Speed Reading Challenge',
      description: 'Read passages quickly and answer questions',
      difficulty: 'hard',
      baseReward: 25,
      bonusMultiplier: 2.5,
      maxPlaysPerDay: 2,
      unlockRequirement: { level: 10, books: 5 },
      isActive: true
    },
    {
      id: 'book_trivia',
      name: 'Book Trivia',
      description: 'Answer questions about famous books',
      difficulty: 'medium',
      baseReward: 20,
      bonusMultiplier: 1.8,
      maxPlaysPerDay: 4,
      unlockRequirement: { level: 8 },
      isActive: true
    },
    {
      id: 'genre_sort',
      name: 'Genre Sorting',
      description: 'Sort books into correct genres quickly',
      difficulty: 'easy',
      baseReward: 12,
      bonusMultiplier: 1.3,
      maxPlaysPerDay: 6,
      unlockRequirement: { level: 3 },
      isActive: true
    }
  ];

  // Get available games based on user's progress
  getAvailableGames(userLevel: number, userBooks: number, userBadges: string[]): Minigame[] {
    return this.availableGames.filter(game => {
      if (!game.isActive) return false;
      if (!game.unlockRequirement) return true;
      
      const req = game.unlockRequirement;
      if (req.level && userLevel < req.level) return false;
      if (req.books && userBooks < req.books) return false;
      if (req.badges && !req.badges.every(badge => userBadges.includes(badge))) return false;
      
      return true;
    });
  }

  // Get user's game statistics
  getUserGameStats(userId: string, gameId: string): GameStats | null {
    const userStats = this.userStats.get(userId);
    if (!userStats) return null;
    return userStats.get(gameId) || null;
  }

  // Check if user can play a game today
  canPlayGame(userId: string, gameId: string): { canPlay: boolean; playsLeft: number; reason?: string } {
    const game = this.availableGames.find(g => g.id === gameId);
    if (!game) {
      return { canPlay: false, playsLeft: 0, reason: 'Game not found' };
    }

    if (!game.isActive) {
      return { canPlay: false, playsLeft: 0, reason: 'Game is currently disabled' };
    }

    const stats = this.getUserGameStats(userId, gameId);
    if (!stats) {
      return { canPlay: true, playsLeft: game.maxPlaysPerDay };
    }

    const today = new Date().toDateString();
    const lastPlayedDate = new Date(stats.lastPlayed).toDateString();
    
    // Reset daily plays if it's a new day
    if (today !== lastPlayedDate) {
      stats.playsToday = 0;
    }

    const playsLeft = game.maxPlaysPerDay - stats.playsToday;
    return {
      canPlay: playsLeft > 0,
      playsLeft,
      reason: playsLeft <= 0 ? 'Daily play limit reached' : undefined
    };
  }

  // Start a new game session
  startGameSession(userId: string, gameId: string): { success: boolean; sessionId?: string; error?: string } {
    const playCheck = this.canPlayGame(userId, gameId);
    if (!playCheck.canPlay) {
      return { success: false, error: playCheck.reason };
    }

    const sessionId = `${gameId}_${userId}_${Date.now()}`;
    const validationToken = this.generateValidationToken(sessionId);

    const session: GameSession = {
      id: sessionId,
      gameId,
      userId,
      startTime: new Date().toISOString(),
      completed: false,
      coinsAwarded: 0,
      validationToken
    };

    this.sessions.set(sessionId, session);
    
    // Update user stats
    this.updateUserStats(userId, gameId, 'started');

    return { success: true, sessionId };
  }

  // Complete a game session and award coins
  completeGameSession(
    sessionId: string, 
    score: number, 
    validationToken: string,
    onCoinsAwarded?: (coins: number) => void
  ): { success: boolean; coinsAwarded?: number; error?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.validationToken !== validationToken) {
      return { success: false, error: 'Invalid validation token' };
    }

    if (session.completed) {
      return { success: false, error: 'Session already completed' };
    }

    const game = this.availableGames.find(g => g.id === session.gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Calculate coins based on score and difficulty
    const baseCoins = game.baseReward;
    const bonusCoins = Math.floor(score * game.bonusMultiplier);
    const totalCoins = baseCoins + bonusCoins;

    // Update session
    session.endTime = new Date().toISOString();
    session.score = score;
    session.completed = true;
    session.coinsAwarded = totalCoins;

    // Update user stats
    this.updateUserStats(session.userId!, session.gameId, 'completed', score, totalCoins);

    // Award coins through callback
    if (onCoinsAwarded) {
      onCoinsAwarded(totalCoins);
    }

    // Sync with gun service if authenticated
    this.syncGameCompletion(session);

    return { success: true, coinsAwarded: totalCoins };
  }

  // Generate a validation token to prevent cheating
  private generateValidationToken(sessionId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return btoa(`${sessionId}_${timestamp}_${randomString}`);
  }

  // Update user game statistics
  private updateUserStats(userId: string, gameId: string, action: 'started' | 'completed', score?: number, coinsEarned?: number) {
    if (!this.userStats.has(userId)) {
      this.userStats.set(userId, new Map());
    }

    const userStats = this.userStats.get(userId)!;
    let gameStats = userStats.get(gameId);

    if (!gameStats) {
      gameStats = {
        gameId,
        playsToday: 0,
        totalPlays: 0,
        highScore: 0,
        lastPlayed: new Date().toISOString(),
        totalCoinsEarned: 0
      };
      userStats.set(gameId, gameStats);
    }

    const today = new Date().toDateString();
    const lastPlayedDate = new Date(gameStats.lastPlayed).toDateString();
    
    // Reset daily plays if it's a new day
    if (today !== lastPlayedDate) {
      gameStats.playsToday = 0;
    }

    if (action === 'started') {
      gameStats.playsToday++;
      gameStats.totalPlays++;
      gameStats.lastPlayed = new Date().toISOString();
    } else if (action === 'completed' && score !== undefined && coinsEarned !== undefined) {
      gameStats.highScore = Math.max(gameStats.highScore, score);
      gameStats.totalCoinsEarned += coinsEarned;
    }
  }

  // Sync game completion with gun service
  private async syncGameCompletion(session: GameSession) {
    if (gunService.isAuthenticated() && session.userId) {
      try {
        await gunService.trackGameCompletion({
          sessionId: session.id,
          gameId: session.gameId,
          userId: session.userId,
          score: session.score || 0,
          coinsEarned: session.coinsAwarded,
          completedAt: session.endTime!
        });
      } catch (error) {
        console.warn('Failed to sync game completion:', error);
      }
    }
  }
  // Get leaderboard for a specific game
  async getGameLeaderboard(_gameId: string, _limit: number = 10): Promise<{rank: number, userId: string, score: number, date: string}[]> {
    // This would typically fetch from a backend service
    // For now, return mock data
    return [];
  }

  // Get user's rank in a specific game
  async getUserRank(_userId: string, _gameId: string): Promise<number> {
    // This would typically fetch from a backend service
    return 0;
  }

  // Admin functions for managing games
  addGame(game: Minigame): boolean {
    const exists = this.availableGames.find(g => g.id === game.id);
    if (exists) return false;
    
    this.availableGames.push(game);
    return true;
  }

  updateGame(gameId: string, updates: Partial<Minigame>): boolean {
    const gameIndex = this.availableGames.findIndex(g => g.id === gameId);
    if (gameIndex === -1) return false;
    
    this.availableGames[gameIndex] = { ...this.availableGames[gameIndex], ...updates };
    return true;
  }

  disableGame(gameId: string): boolean {
    return this.updateGame(gameId, { isActive: false });
  }

  enableGame(gameId: string): boolean {
    return this.updateGame(gameId, { isActive: true });
  }

  // Get all user statistics
  getAllUserStats(userId: string): Map<string, GameStats> | undefined {
    return this.userStats.get(userId);
  }

  // Clear user statistics (for testing or reset)
  clearUserStats(userId: string): void {
    this.userStats.delete(userId);
  }

  // Get active sessions for a user
  getUserActiveSessions(userId: string): GameSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId && !session.completed
    );
  }

  // Clean up old sessions (should be called periodically)
  cleanupOldSessions(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - new Date(session.startTime).getTime();
      if (sessionAge > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const minigamesAPI = new MinigamesAPI();
export default minigamesAPI;
