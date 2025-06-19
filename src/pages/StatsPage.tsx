import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Target, TrendingUp, Calendar, Award } from 'lucide-react';
import { getStats, getStreak, getSessions } from '../services/storage';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useBooks();
  const { pet } = usePet();
  const { theme } = useTheme();
  const [stats, setStats] = useState(getStats());
  const [streak, setStreak] = useState(getStreak());
  const sessions = getSessions();

  // Listen for stats updates
  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent) => {
      setStats(event.detail);
      setStreak(getStreak()); // Also refresh streak
    };
    
    // Add event listener for stats updates
    window.addEventListener('statsUpdated', handleStatsUpdate as EventListener);
    
    // Refresh stats when component mounts
    setStats(getStats());
    setStreak(getStreak());
    
    // Cleanup
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdate as EventListener);
    };
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAverageSessionTime = () => {
    if (sessions.length === 0) return 0;
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return Math.round(totalTime / sessions.length);
  };

  const getCurrentMonthStats = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthSessions = sessions.filter(session => 
      new Date(session.startTime) >= startOfMonth
    );
    
    const monthlyTime = monthSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const monthlyPages = monthSessions.reduce((sum, session) => 
      sum + ((session.endPage || 0) - (session.startPage || 0)), 0
    );
    
    return { time: monthlyTime, pages: monthlyPages, sessions: monthSessions.length };
  };

  const monthlyStats = getCurrentMonthStats();
  const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; subtitle?: string }> = 
    ({ icon: Icon, title, value, subtitle }) => (
      <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.colors.borderLight }}>
            <Icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </div>
          <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>{title}</span>
        </div>
        <p className="text-2xl font-serif font-medium mb-1" style={{ color: theme.colors.textPrimary }}>{value}</p>
        {subtitle && <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>}
      </div>
    );
  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <header className="p-4" style={{ backgroundColor: theme.colors.background, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.borderLight }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
          </button>
          <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>Reading Statistics</h1>
        </div>
      </header>      <main className="p-4 space-y-6">
        {/* Overview Stats */}
        <section>
          <h2 className="font-serif text-lg font-medium mb-3" style={{ color: theme.colors.textPrimary }}>Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              icon={BookOpen}
              title="Books Read"
              value={stats.totalBooksRead.toString()}
              subtitle="this year"
            />
            <StatCard 
              icon={Clock}
              title="Total Time"
              value={formatTime(stats.totalReadingTime)}
              subtitle="all time"
            />
            <StatCard 
              icon={Target}
              title="Pages Read"
              value={stats.totalPagesRead.toString()}
              subtitle="all time"
            />
            <StatCard 
              icon={TrendingUp}
              title="Current Streak"
              value={`${streak.currentStreak} days`}
              subtitle={`longest: ${streak.longestStreak} days`}
            />
          </div>
        </section>

        {/* This Month */}
        <section>
          <h2 className="font-serif text-lg font-medium mb-3" style={{ color: theme.colors.textPrimary }}>This Month</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>Monthly Progress</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{monthlyStats.sessions}</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>sessions</p>
                </div>
                <div>
                  <p className="text-lg font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{formatTime(monthlyStats.time)}</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>reading time</p>
                </div>
                <div>
                  <p className="text-lg font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{monthlyStats.pages}</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>pages</p>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* Recent Activity */}
        <section>
          <h2 className="font-serif text-lg font-medium mb-3" style={{ color: theme.colors.textPrimary }}>Recent Activity</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              icon={Clock}
              title="Today"
              value={formatTime(stats.readingTimeToday)}
            />
            <StatCard 
              icon={Calendar}
              title="This Week"
              value={formatTime(stats.readingTimeThisWeek)}
            />
            <StatCard 
              icon={Target}
              title="Average Session"
              value={formatTime(getAverageSessionTime())}
            />
            <StatCard 
              icon={BookOpen}
              title="Books in Library"
              value={books.length.toString()}
            />
          </div>
        </section>

        {/* Pet Stats */}
        <section>
          <h2 className="font-serif text-lg font-medium mb-3" style={{ color: theme.colors.textPrimary }}>Reading Companion</h2>
          <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
              <span className="font-medium" style={{ color: theme.colors.textPrimary }}>{pet.name}'s Progress</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{pet.level}</p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>level</p>
              </div>
              <div>
                <p className="text-lg font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{pet.happiness}%</p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>happiness</p>
              </div>
              <div>
                <p className="text-lg font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{pet.experience}</p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>experience</p>
              </div>
            </div>
          </div>
        </section>

        {sessions.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <h3 className="font-serif text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>Start tracking your reading</h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              Begin a reading session to see your statistics here
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ backgroundColor: theme.colors.secondary }}
            >
              Find a Book to Read
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StatsPage;