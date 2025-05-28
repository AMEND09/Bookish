import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Target, TrendingUp, Calendar, Award } from 'lucide-react';
import { getStats, getStreak, getSessions } from '../services/storage';
import { useBooks } from '../context/BookContext';
import { usePet } from '../context/PetContext';

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useBooks();
  const { pet } = usePet();
  const stats = getStats();
  const streak = getStreak();
  const sessions = getSessions();

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
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-[#F0EDE8] rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#8B7355]" />
          </div>
          <span className="text-sm text-[#8B7355] font-medium">{title}</span>
        </div>
        <p className="text-2xl font-serif font-medium text-[#3A3A3A] mb-1">{value}</p>
        {subtitle && <p className="text-xs text-[#8B7355]">{subtitle}</p>}
      </div>
    );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3]">
      <header className="p-4 bg-[#F7F5F3] border-b border-[#E8E3DD]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
          </button>
          <h1 className="font-serif text-xl font-medium text-[#3A3A3A]">Reading Statistics</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Overview Stats */}
        <section>
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Overview</h2>
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
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">This Month</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-[#8B7355]" />
                <span className="font-medium text-[#3A3A3A]">Monthly Progress</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-serif font-medium text-[#3A3A3A]">{monthlyStats.sessions}</p>
                  <p className="text-xs text-[#8B7355]">sessions</p>
                </div>
                <div>
                  <p className="text-lg font-serif font-medium text-[#3A3A3A]">{formatTime(monthlyStats.time)}</p>
                  <p className="text-xs text-[#8B7355]">reading time</p>
                </div>
                <div>
                  <p className="text-lg font-serif font-medium text-[#3A3A3A]">{monthlyStats.pages}</p>
                  <p className="text-xs text-[#8B7355]">pages</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Recent Activity</h2>
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
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Reading Companion</h2>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-[#8B7355]" />
              <span className="font-medium text-[#3A3A3A]">{pet.name}'s Progress</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-serif font-medium text-[#3A3A3A]">{pet.level}</p>
                <p className="text-xs text-[#8B7355]">level</p>
              </div>
              <div>
                <p className="text-lg font-serif font-medium text-[#3A3A3A]">{pet.happiness}%</p>
                <p className="text-xs text-[#8B7355]">happiness</p>
              </div>
              <div>
                <p className="text-lg font-serif font-medium text-[#3A3A3A]">{pet.experience}</p>
                <p className="text-xs text-[#8B7355]">experience</p>
              </div>
            </div>
          </div>
        </section>

        {sessions.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-16 h-16 text-[#8B7355] mx-auto mb-4" />
            <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">Start tracking your reading</h3>
            <p className="text-sm text-[#8B7355] mb-6">
              Begin a reading session to see your statistics here
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-[#8B7355] text-white px-6 py-3 rounded-xl font-medium"
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