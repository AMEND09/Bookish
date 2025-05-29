import React from 'react';
import { Clock, BookOpenCheck, Flame } from 'lucide-react';
import { getStats, getStreak } from '../../services/storage';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${color} mb-1`}>
        {icon}
      </div>
      <span className="font-serif text-lg font-medium text-[#3A3A3A]">{value}</span>
      <span className="text-xs text-[#8B7355]">{label}</span>
    </div>
  );
};

const ReadingStats: React.FC = () => {
  const stats = getStats();
  const streak = getStreak();
  
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
        color="bg-[#E59554]"
      />
      <StatCard
        icon={<Clock className="w-5 h-5 text-white" />}
        value={formatReadingTime(stats.readingTimeThisWeek)}
        label="This Week"
        color="bg-[#CD853F]"
      />
      <StatCard
        icon={<BookOpenCheck className="w-5 h-5 text-white" />}
        value={stats.totalBooksRead}
        label="Books Read"
        color="bg-[#8B7355]"
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-white" />}
        value={streak.currentStreak}
        label="Streak"
        color="bg-[#D2691E]"
      />
    </div>
  );
};

export default ReadingStats;