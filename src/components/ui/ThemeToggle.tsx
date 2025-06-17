import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span 
          className="text-sm font-medium"
          style={{ color: theme.colors.textPrimary }}
        >
          Theme
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.textPrimary,
        }}
        aria-label={`Switch to ${theme.isDark ? 'light' : 'dark'} mode`}
      >
        <div className="flex items-center gap-2">
          {theme.isDark ? (
            <>
              <Sun size={16} style={{ color: theme.colors.warning }} />
              {showLabel && (
                <span className="text-sm">Light</span>
              )}
            </>
          ) : (
            <>
              <Moon size={16} style={{ color: theme.colors.textSecondary }} />
              {showLabel && (
                <span className="text-sm">Dark</span>
              )}
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
