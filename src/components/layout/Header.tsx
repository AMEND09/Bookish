import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../../context/PetContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import QuickThemeToggle from '../ui/QuickThemeToggle';

interface HeaderProps {
  greeting: string;
}

const Header: React.FC<HeaderProps> = ({ greeting }) => {
  const navigate = useNavigate();
  const { pet } = usePet();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const isGuest = user?.id?.startsWith('guest-');
  
  const getStatusEmoji = () => {
    const mood = pet.mood;
    const emojis = {
      happy: '😊',
      excited: '🤩', 
      content: '😌',
      sad: '😢',
      sleepy: '😴',
      hungry: '🍎'
    };
    return emojis[mood] || '😌';
  };
  return (
    <header 
      className="p-4 transition-colors duration-200"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="font-serif text-xl font-medium"
            style={{ color: theme.colors.textPrimary }}
          >
            {greeting}
          </h1>
          <p 
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Ready to dive into a story?
          </p>
        </div>
          <div className="flex items-center gap-3">
          <QuickThemeToggle />
          
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors duration-200"
            style={{
              backgroundColor: theme.colors.surfaceSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceSecondary;
            }}
            onClick={() => navigate('/pet')}
          >
            <span className="text-lg">{getStatusEmoji()}</span>
            <div className="text-right">
              <p 
                className="text-xs font-medium"
                style={{ color: theme.colors.textPrimary }}
              >
                {pet.name}
              </p>
              <p 
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                Lv.{pet.level}
              </p>
            </div>
          </div>
          
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
            style={{
              backgroundColor: isGuest ? theme.colors.wantToRead : theme.colors.surfaceSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isGuest ? theme.colors.wantToRead : theme.colors.surfaceSecondary;
            }}
            onClick={() => navigate('/profile')}
            title={isGuest ? 'Guest User' : 'Profile'}
          >
            <User 
              className="w-5 h-5"
              style={{ 
                color: isGuest ? theme.colors.wantToReadText : theme.colors.textSecondary 
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;