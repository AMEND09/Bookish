import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Coins, Play, Lock } from 'lucide-react';
import { usePet } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';
import minigamesAPI, { Minigame, GameStats } from '../services/minigamesApi';

const MinigamesPage: React.FC = () => {
  const { pet, addCoins } = usePet();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [availableGames, setAvailableGames] = useState<Minigame[]>([]);
  const [userStats, setUserStats] = useState<Map<string, GameStats>>(new Map());
  const [selectedGame, setSelectedGame] = useState<Minigame | null>(null);
  const [gameSession, setGameSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  useEffect(() => {
    // Load available games based on pet's progress
    const games = minigamesAPI.getAvailableGames(pet.level, pet.totalBooksRead, pet.badges);
    setAvailableGames(games);

    // Load user's game statistics
    const stats = minigamesAPI.getAllUserStats('current_user') || new Map();
    setUserStats(stats);  }, [pet.level, pet.totalBooksRead, pet.badges]);

  const handleGameComplete = React.useCallback((score: number, validationToken: string) => {
    if (!gameSession) return;

    const result = minigamesAPI.completeGameSession(
      gameSession,
      score,
      validationToken,
      (coins) => {
        addCoins(coins);
        setMessage(`Game completed! You earned ${coins} coins! 🪙`);
      }
    );

    if (result.success) {
      // Refresh user stats
      const stats = minigamesAPI.getAllUserStats('current_user') || new Map();
      setUserStats(stats);
    } else {
      setMessage(result.error || 'Failed to complete game');
    }

    setSelectedGame(null);
    setGameSession(null);
  }, [gameSession, addCoins]);

  useEffect(() => {
    // Set up message listener for game communication
    const handleMessage = (event: MessageEvent) => {
      if (event.data.source === 'bookish_minigame') {
        switch (event.data.type) {
          case 'game_ready':
            // Send initialization data to the game
            if (selectedGame && gameSession) {
              const iframe = document.querySelector('iframe[title="' + selectedGame.name + '"]') as HTMLIFrameElement;
              if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage({
                  type: 'init_minigame',
                  source: 'bookish_parent',
                  sessionId: gameSession,
                  validationToken: gameSession, // Using session ID as validation token for simplicity
                  gameId: selectedGame.id
                }, '*');
              }
            }
            break;
          case 'game_complete':
            if (event.data.sessionId === gameSession) {
              handleGameComplete(event.data.score, event.data.validationToken);
            }
            break;
          case 'game_error':
            setMessage(`Game error: ${event.data.error}`);
            break;        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedGame, gameSession, handleGameComplete]);

  const handleStartGame = async (game: Minigame) => {
    setLoading(true);
    setMessage('');

    const canPlay = minigamesAPI.canPlayGame('current_user', game.id);
    if (!canPlay.canPlay) {
      setMessage(canPlay.reason || 'Cannot play this game right now');
      setLoading(false);
      return;
    }

    const result = minigamesAPI.startGameSession('current_user', game.id);
    if (result.success) {
      setSelectedGame(game);
      setGameSession(result.sessionId!);
      setMessage(`Game started! You have ${canPlay.playsLeft - 1} plays left today.`);
    } else {
      setMessage(result.error || 'Failed to start game');    }
    setLoading(false);
  };
    if (selectedGame && gameSession) {
    return (
      <div 
        className="max-w-md mx-auto min-h-screen pb-6"
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Header */}
        <header 
          className="p-4 border-b"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border 
          }}
        >
          <div className="flex items-center gap-3">            <button 
              onClick={() => {
                setSelectedGame(null);
                setGameSession(null);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.surfaceSecondary }}
            >
              <ArrowLeft 
                className="w-5 h-5" 
                style={{ color: theme.colors.textSecondary }} 
              />
            </button>
            <h1 
              className="font-serif text-xl font-medium"
              style={{ color: theme.colors.textPrimary }}
            >
              {selectedGame.name}
            </h1>
          </div>
        </header>

        {/* Game Container */}
        <main className="px-4 py-2">
          <div 
            className="rounded-xl shadow-sm overflow-hidden mb-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            {selectedGame.gameUrl ? (
              <iframe
                src={selectedGame.gameUrl}
                width="100%"
                height="600"
                frameBorder="0"
                title={selectedGame.name}
                className="w-full"
              />
            ) : (
              <div className="text-center py-20 px-4">
                <div className="mb-4">
                  <Gamepad2 size={48} style={{ color: theme.colors.textSecondary, margin: '0 auto' }} />
                </div>
                <h3 
                  className="font-serif text-lg font-semibold mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {selectedGame.name}
                </h3>
                <p 
                  className="text-sm mb-6"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {selectedGame.description}
                </p>
                
                {/* Demo Game Interface */}
                <div 
                  className="rounded-lg p-4 max-w-sm mx-auto"
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <h4 
                    className="font-medium mb-3"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Demo Game Interface
                  </h4>
                  <p 
                    className="text-xs mb-4"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    This is where your HTML minigame would be embedded.
                  </p>
                  <button
                    onClick={() => handleGameComplete(Math.floor(Math.random() * 1000) + 100, gameSession)}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-colors"
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.textInverse 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary;
                    }}
                  >
                    Complete Game (Demo)
                  </button>
                  <p 
                    className="text-xs mt-2"
                    style={{ color: theme.colors.textTertiary }}
                  >
                    Click to simulate game completion and earn coins
                  </p>
                </div>
              </div>
            )}
          </div>

          {message && (
            <div 
              className="p-4 rounded-xl mb-4"
              style={{ 
                backgroundColor: theme.colors.surface,
                borderLeft: `4px solid ${theme.colors.primary}` 
              }}
            >
              <p 
                className="text-sm"
                style={{ color: theme.colors.textPrimary }}
              >
                {message}
              </p>
            </div>          )}
        </main>
      </div>
    );
  }
  return (
    <div 
      className="max-w-md mx-auto min-h-screen pb-6"
      style={{ backgroundColor: theme.colors.background }}
    >      {/* Header */}
      <header 
        className="p-4 border-b"
        style={{ 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">            <button 
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.surfaceSecondary }}
            >
              <ArrowLeft 
                className="w-5 h-5" 
                style={{ color: theme.colors.textSecondary }} 
              />
            </button>
            <h1 
              className="font-serif text-xl font-medium"
              style={{ color: theme.colors.textPrimary }}
            >
              Minigames 🎮
            </h1>
          </div>
          <div className="text-right">
            <div 
              className="text-lg font-semibold flex items-center gap-1"
              style={{ color: theme.colors.primary }}
            >
              <Coins size={18} />
              {pet.coins}
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              Pet Level: {pet.level}
            </div>
          </div>
        </div>
      </header>      <main className="px-4 py-2 space-y-6">
        {/* Message */}
        {message && (
          <div 
            className="p-4 rounded-xl"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderLeft: `4px solid ${theme.colors.primary}` 
            }}
          >
            <p 
              className="text-sm"
              style={{ color: theme.colors.textPrimary }}
            >
              {message}
            </p>
          </div>
        )}        <section>
          <h2 
            className="font-serif text-lg font-medium mb-3"
            style={{ color: theme.colors.textPrimary }}
          >
            Available Games
          </h2>
          
          {availableGames.length > 0 ? (
            <div className="space-y-3">
              {availableGames.map((game) => {
                const stats = userStats.get(game.id);
                const canPlay = minigamesAPI.canPlayGame('current_user', game.id);

                return (
                  <div
                    key={game.id}
                    className="p-4 rounded-xl shadow-sm"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 
                            className="font-serif font-semibold"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {game.name}
                          </h3>
                          <span 
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: game.difficulty === 'easy' 
                                ? '#10B981' 
                                : game.difficulty === 'medium' 
                                ? '#F59E0B' 
                                : '#EF4444',
                              color: 'white'
                            }}
                          >
                            {game.difficulty.toUpperCase()}
                          </span>
                        </div>
                        <p 
                          className="text-sm mb-3"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {game.description}
                        </p>
                      </div>
                    </div>

                    {/* Game Stats */}
                    <div 
                      className="flex justify-between text-xs mb-3 p-2 rounded-lg"
                      style={{ backgroundColor: theme.colors.background }}
                    >
                      <div className="text-center">
                        <div 
                          className="font-semibold"
                          style={{ color: theme.colors.primary }}
                        >
                          🪙 {game.baseReward}
                        </div>
                        <div style={{ color: theme.colors.textSecondary }}>Base</div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="font-semibold"
                          style={{ color: theme.colors.primary }}
                        >
                          ×{game.bonusMultiplier}
                        </div>
                        <div style={{ color: theme.colors.textSecondary }}>Bonus</div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="font-semibold"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {stats ? `${stats.playsToday}/${game.maxPlaysPerDay}` : `0/${game.maxPlaysPerDay}`}
                        </div>
                        <div style={{ color: theme.colors.textSecondary }}>Plays</div>
                      </div>
                    </div>

                    {/* Player Stats */}
                    {stats && (
                      <div 
                        className="p-3 rounded-lg mb-3"
                        style={{ backgroundColor: theme.colors.background }}
                      >
                        <h4 
                          className="text-sm font-medium mb-2"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          Your Stats
                        </h4>
                        <div className="flex justify-between text-xs">
                          <div>
                            <span style={{ color: theme.colors.textSecondary }}>High Score: </span>
                            <span 
                              className="font-medium"
                              style={{ color: theme.colors.textPrimary }}
                            >
                              {stats.highScore}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: theme.colors.textSecondary }}>Total Coins: </span>
                            <span 
                              className="font-medium"
                              style={{ color: theme.colors.primary }}
                            >
                              🪙 {stats.totalCoinsEarned}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Play Button */}
                    <button
                      onClick={() => handleStartGame(game)}
                      disabled={!canPlay.canPlay || loading}
                      className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ 
                        backgroundColor: canPlay.canPlay && !loading 
                          ? theme.colors.primary 
                          : theme.colors.border,
                        color: canPlay.canPlay && !loading 
                          ? theme.colors.textInverse 
                          : theme.colors.textSecondary,
                        cursor: canPlay.canPlay && !loading ? 'pointer' : 'not-allowed'
                      }}
                      onMouseEnter={(e) => {
                        if (canPlay.canPlay && !loading) {
                          e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canPlay.canPlay && !loading) {
                          e.currentTarget.style.backgroundColor = theme.colors.primary;
                        }
                      }}
                    >
                      {loading ? (
                        'Starting...'
                      ) : canPlay.canPlay ? (
                        <>
                          <Play size={16} />
                          Play Game
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          {canPlay.reason}
                        </>
                      )}
                    </button>

                    {canPlay.canPlay && canPlay.playsLeft <= 1 && (
                      <p 
                        className="text-xs mt-2 text-center"
                        style={{ color: theme.colors.warning }}
                      >
                        ⚠️ Last play for today!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              className="text-center py-12 rounded-xl shadow-sm"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <div className="text-6xl mb-4">🎮</div>
              <h3 
                className="font-serif text-lg font-semibold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                No Games Available
              </h3>
              <p 
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                Keep reading and leveling up your pet to unlock more minigames!
              </p>
            </div>
          )}
        </section>

        {/* Developer Info */}
        <section 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.warning,
            borderLeftWidth: '4px',
            borderLeftColor: theme.colors.warning
          }}
        >
          <h3 
            className="font-medium text-sm mb-2"
            style={{ color: theme.colors.warning }}
          >
            🔧 For Developers
          </h3>
          <div 
            className="text-xs space-y-1"
            style={{ color: theme.colors.textSecondary }}
          >
            <p><strong>API Integration:</strong> Use minigamesAPI for session management</p>
            <p><strong>Validation:</strong> Include validation tokens for security</p>
            <p><strong>Scoring:</strong> Higher scores = more bonus coins</p>
            <p><strong>Communication:</strong> Use postMessage for iframe communication</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MinigamesPage;
