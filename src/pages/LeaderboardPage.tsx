import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Crown, BookOpen, Clock, Target, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import { useAuth } from '../context/AuthContext';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { leaderboard, loading, refreshLeaderboard } = useFriends();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'alltime'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'books_read' | 'pages_read' | 'reading_time' | 'streak'>('books_read');  useEffect(() => {
    refreshLeaderboard(selectedPeriod, selectedMetric);
  }, [selectedPeriod, selectedMetric, refreshLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-yellow-600" />;
      default:
        return <span className="font-bold text-lg" style={{ color: theme.colors.textSecondary }}>#{rank}</span>;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'books_read':
        return <BookOpen className="w-4 h-4" />;
      case 'pages_read':
        return <Target className="w-4 h-4" />;
      case 'reading_time':
        return <Clock className="w-4 h-4" />;
      case 'streak':
        return <Zap className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const formatScore = (score: number, metric: string) => {
    switch (metric) {
      case 'books_read':
        return `${score} books`;
      case 'pages_read':
        return `${score.toLocaleString()} pages`;
      case 'reading_time':
        const hours = Math.floor(score / 60);
        const minutes = score % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      case 'streak':
        return `${score} days`;
      default:
        return score.toString();
    }
  };

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'alltime', label: 'All Time' }
  ];

  const metrics = [
    { id: 'books_read', label: 'Books Read', icon: BookOpen },
    { id: 'pages_read', label: 'Pages Read', icon: Target },
    { id: 'reading_time', label: 'Reading Time', icon: Clock },
    { id: 'streak', label: 'Reading Streak', icon: Zap }
  ];

  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.id);

  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.primary }} />
          </button>
          <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>
            Leaderboard
          </h1>
        </div>
      </div>

      {/* Your Rank */}
      {currentUserEntry && (
        <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.primary + '10' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(currentUserEntry.rank)}
                </div>
                <div>
                  <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                    Your Rank
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {formatScore(currentUserEntry.score, selectedMetric)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                  #{currentUserEntry.rank}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  out of {leaderboard.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex gap-2">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.id ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: selectedPeriod === period.id ? theme.colors.primary : theme.colors.surface,
                color: selectedPeriod === period.id ? 'white' : theme.colors.textSecondary
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(metric => {
            const IconComponent = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id as any)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedMetric === metric.id ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: selectedMetric === metric.id ? theme.colors.primary : theme.colors.surface,
                  color: selectedMetric === metric.id ? 'white' : theme.colors.textSecondary
                }}
              >
                <IconComponent className="w-4 h-4" />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, index) => (
              <div
                key={index}
                className="p-4 rounded-xl animate-pulse"
                style={{ backgroundColor: theme.colors.surface }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: theme.colors.borderLight }}></div>
                  <div className="flex-1">
                    <div className="h-4 rounded mb-2" style={{ backgroundColor: theme.colors.borderLight }}></div>
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: theme.colors.borderLight }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`p-4 rounded-xl transition-all ${
                  entry.userId === user?.id ? 'ring-2' : ''
                }`}
                style={{ 
                  backgroundColor: theme.colors.surface,
                  ...(entry.userId === user?.id && {
                    boxShadow: `0 0 0 2px ${theme.colors.primary}`
                  })
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                        {entry.displayName || entry.username}
                        {entry.userId === user?.id && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ 
                            backgroundColor: theme.colors.primary + '20',
                            color: theme.colors.primary
                          }}>
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        @{entry.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {getMetricIcon(selectedMetric)}
                      <span className="font-bold" style={{ color: theme.colors.primary }}>
                        {formatScore(entry.score, selectedMetric)}
                      </span>
                    </div>
                    {entry.details && (
                      <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                        {selectedMetric !== 'books_read' && entry.details.booksRead && (
                          <span>{entry.details.booksRead} books • </span>
                        )}
                        {selectedMetric !== 'streak' && entry.details.currentStreak && (
                          <span>{entry.details.currentStreak} day streak</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: theme.colors.textSecondary }} />
            <p style={{ color: theme.colors.textSecondary }}>No leaderboard data yet</p>
            <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
              Add friends to compete on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
