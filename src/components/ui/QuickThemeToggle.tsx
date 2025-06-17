import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface QuickThemeToggleProps {
  className?: string;
}

const QuickThemeToggle: React.FC<QuickThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${className}`}
      style={{
        backgroundColor: theme.colors.surfaceSecondary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surfaceSecondary;
      }}
      title={`Switch to ${theme.isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme.isDark ? 'light' : 'dark'} mode`}
    >
      {theme.isDark ? (
        <Sun 
          size={16} 
          style={{ color: theme.colors.warning }} 
        />
      ) : (
        <Moon 
          size={16} 
          style={{ color: theme.colors.textSecondary }} 
        />
      )}
    </button>
  );
};

export default QuickThemeToggle;
