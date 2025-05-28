import React from 'react';
import { Book, Clock } from 'lucide-react';

interface ActivityItemProps {
  type: 'reading' | 'note' | 'completed';
  title: string;
  timestamp: string;
  duration?: number; // in minutes
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, title, timestamp, duration }) => {
  const getIcon = () => {
    switch (type) {
      case 'reading':
        return <Clock className="w-4 h-4 text-[#E59554]" />;
      case 'note':
        return <Book className="w-4 h-4 text-[#8B7355]" />;
      case 'completed':
        return <Book className="w-4 h-4 text-[#D2691E]" />;
    }
  };
  
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    }
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };
  
  return (
    <div className="flex items-center gap-3 p-3 border-b border-[#F0EDE8]">
      <div className="w-8 h-8 rounded-full bg-[#F7F5F3] flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-medium text-[#3A3A3A]">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-[#8B7355]">
          <span>{getTimeAgo(timestamp)}</span>
          {duration && (
            <>
              <span>•</span>
              <span>{duration} min</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;