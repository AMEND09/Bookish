import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PenLine, Library, BarChart3 } from 'lucide-react';
import Header from '../components/layout/Header';
import CurrentlyReading from '../components/books/CurrentlyReading';
import ReadingStats from '../components/reading/ReadingStats';
import ActionButton from '../components/ui/ActionButton';
import ActivityItem from '../components/layout/ActivityItem';
import { getSessions } from '../services/storage';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const sessions = getSessions();
  
  // Sort sessions by start time (most recent first)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3] pb-6">
      <Header greeting={getGreeting()} />
      
      <main className="px-4 py-2 space-y-6">
        <CurrentlyReading onContinueReading={() => navigate('/reading')} />
        
        <section>
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton 
              icon={Search} 
              label="Find Books" 
              onClick={() => navigate('/search')} 
            />
            <ActionButton 
              icon={PenLine} 
              label="My Notes" 
              onClick={() => navigate('/notes')} 
            />
            <ActionButton 
              icon={Library} 
              label="My Library" 
              onClick={() => navigate('/library')} 
            />
            <ActionButton 
              icon={BarChart3} 
              label="Statistics" 
              onClick={() => navigate('/stats')} 
            />
          </div>
        </section>
        
        <section>
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Your Progress</h2>
          <ReadingStats />
        </section>
        
        <section>
          <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-1">Recent Activity</h2>
          
          {recentSessions.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {recentSessions.map(session => (
                <ActivityItem 
                  key={session.id}
                  type="reading"
                  title="Reading session completed"
                  timestamp={session.endTime || session.startTime}
                  duration={session.duration || 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8B7355] p-4 bg-white rounded-xl shadow-sm">
              No recent activity. Start reading to track your progress!
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;