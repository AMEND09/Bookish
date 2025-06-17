import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PenLine, Library, BarChart3} from 'lucide-react';
import Header from '../components/layout/Header';
import CurrentlyReading from '../components/books/CurrentlyReading';
import ReadingStats from '../components/reading/ReadingStats';
import ActionButton from '../components/ui/ActionButton';
import ActivityItem from '../components/layout/ActivityItem';
import { getSessions } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
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
    <div 
      className="max-w-md mx-auto min-h-screen pb-6"
      style={{ backgroundColor: theme.colors.background }}
    >
      <Header greeting={getGreeting()} />
      
      <main className="px-4 py-2 space-y-6">
        <CurrentlyReading onContinueReading={() => navigate('/reading')} />
        
        <section>
          <h2 
            className="font-serif text-lg font-medium mb-3"
            style={{ color: theme.colors.textPrimary }}
          >
            Quick Actions
          </h2>
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
          <h2 
            className="font-serif text-lg font-medium mb-3"
            style={{ color: theme.colors.textPrimary }}
          >
            Your Progress
          </h2>
          <ReadingStats />
        </section>
        
        <section>
          <h2 
            className="font-serif text-lg font-medium mb-1"
            style={{ color: theme.colors.textPrimary }}
          >
            Recent Activity
          </h2>
          
          {recentSessions.length > 0 ? (
            <div 
              className="rounded-xl shadow-sm overflow-hidden"
              style={{ backgroundColor: theme.colors.surface }}
            >
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
            <p 
              className="text-sm p-4 rounded-xl shadow-sm"
              style={{ 
                color: theme.colors.textSecondary,
                backgroundColor: theme.colors.surface
              }}
            >
              No recent activity. Start reading to track your progress!
            </p>
          )}
        </section>
        
        <section className="text-center py-4">
          <button
            onClick={() => navigate('/welcome')}
            className="text-sm hover:underline transition-colors underline"
            style={{ 
              color: theme.colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            Learn more about Bookish features
          </button>
        </section>
      </main>
    </div>
  );
};

export default HomePage;