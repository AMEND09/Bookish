import React, { useState, useEffect } from 'react';
import { Clock, BookOpenCheck, Flame } from 'lucide-react';
import { getStats, getStreak } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="flex flex-col items-center p-3 rounded-xl shadow-sm"
      style={{ backgroundColor: theme.colors.surface }}
    >
      <div 
        className="w-8 h-8 flex items-center justify-center rounded-full mb-1"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <span 
        className="font-serif text-lg font-medium"
        style={{ color: theme.colors.textPrimary }}
      >
        {value}
      </span>
      <span 
        className="text-xs"
        style={{ color: theme.colors.textSecondary }}
      >
        {label}
      </span>
    </div>
  );
};

const ReadingStats: React.FC = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(getStats());
  const [streak, setStreak] = useState(getStreak());
  
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
  
  // Format reading time (in minutes) to hours and minutes
  const formatReadingTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hrs`;
    }
    
    return `${hours}.${Math.floor(remainingMinutes / 6)}`;
  };
    return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Clock className="w-5 h-5 text-white" />}
        value={formatReadingTime(stats.readingTimeToday)}
        label="Today"
        color={theme.colors.primary}
      />
      <StatCard
        icon={<Clock className="w-5 h-5 text-white" />}
        value={formatReadingTime(stats.readingTimeThisWeek)}
        label="This Week"
        color={theme.colors.primaryDark}
      />
      <StatCard
        icon={<BookOpenCheck className="w-5 h-5 text-white" />}
        value={stats.totalBooksRead}
        label="Books Read"
        color={theme.colors.secondary}
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-white" />}
        value={streak.currentStreak}
        label="Streak"
        color={theme.colors.primaryLight}
      />
    </div>
  );
};

export default ReadingStats;