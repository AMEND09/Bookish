import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { LocalStorageService } from '../services/localStorage';

// Theme color definitions
export const lightTheme = {
  colors: {
    primary: '#D2691E',
    primaryLight: '#E89556',
    primaryDark: '#B8571A',
    
    secondary: '#8B7355',
    secondaryLight: '#A68B6B',
    secondaryDark: '#6B5A47',
    
    background: '#F7F5F3',
    surface: '#FFFFFF',
    surfaceElevated: '#FEFEFE',
    surfaceSecondary: '#F5F5F5',
    
    textPrimary: '#3A3A3A',
    textSecondary: '#8B7355',
    textTertiary: '#A0A0A0',
    textInverse: '#FFFFFF',
    
    border: '#E8E3DD',
    borderLight: '#F0EDE8',
    borderDark: '#D4C4B0',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    wantToRead: '#FEF3C7',
    wantToReadText: '#D97706',
    currentlyReading: '#DBEAFE',
    currentlyReadingText: '#2563EB',
    completed: '#D1FAE5',
    completedText: '#059669',
    
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
};

export const darkTheme = {
  colors: {
    primary: '#E89556',
    primaryLight: '#F4A971',
    primaryDark: '#D2691E',
    
    secondary: '#A68B6B',
    secondaryLight: '#B89980',
    secondaryDark: '#8B7355',
    
    background: '#0F0F0F',     // Softer dark background
    surface: '#1A1A1A',       // Slightly lighter surface
    surfaceElevated: '#252525', // More subtle elevation
    surfaceSecondary: '#1F1F1F', // Better contrast
    
    textPrimary: '#F5F5F5',    // Softer white for better readability
    textSecondary: '#C0C0C0',  // More readable secondary text
    textTertiary: '#909090',   // Improved tertiary text
    textInverse: '#0F0F0F',    // Dark text on light backgrounds
    
    border: '#333333',         // Softer borders
    borderLight: '#2A2A2A',    // Very subtle borders
    borderDark: '#444444',     // More visible borders when needed
    
    success: '#4ADE80',        // Softer green
    warning: '#FBBF24',        // Warmer warning color
    error: '#FB7185',          // Softer red
    info: '#60A5FA',           // Same blue (works well)
    
    // Category Colors (more muted for dark mode)
    wantToRead: '#2D1B00',     // Much darker yellow background
    wantToReadText: '#FBBF24', // Warmer orange text
    currentlyReading: '#1E293B', // Darker blue background
    currentlyReadingText: '#7DD3FC', // Softer blue text
    completed: '#1B2E1B',      // Darker green background
    completedText: '#4ADE80',  // Softer green text
    
    overlay: 'rgba(0, 0, 0, 0.8)', // Same overlay
    overlayLight: 'rgba(0, 0, 0, 0.6)', // Same light overlay
  },
};

export interface Theme {
  colors: typeof lightTheme.colors;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  
  // Get initial theme preference - start with a reasonable default
  const getInitialTheme = () => {
    try {
      // For guest users, check localStorage first
      const savedTheme = localStorage.getItem('bookish-theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }

      // Then check system preference
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (error) {
      console.error('Error getting initial theme:', error);
    }

    return false; // Default to light theme
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  // Update theme when user authentication completes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete

    const updateTheme = () => {
      // If user is authenticated, check their saved preference
      if (user) {
        const userTheme = LocalStorageService.getUserSettings()?.theme;
        if (userTheme) {
          setIsDark(userTheme === 'dark');
          return;
        }
      }

      // Otherwise, use the same logic as initial theme
      setIsDark(getInitialTheme());
    };

    updateTheme();
  }, [user, authLoading]);

  // Listen for system theme changes
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const hasUserPreference = user 
        ? !!LocalStorageService.getUserSettings()?.theme
        : !!localStorage.getItem('bookish-theme');
      
      if (!hasUserPreference) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }    // Update meta theme-color for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0F0F0F' : '#F7F5F3');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    saveThemePreference(dark);
  };
  const saveThemePreference = (dark: boolean) => {
    const themeValue = dark ? 'dark' : 'light';
    
    if (user) {
      // Save to user settings
      const currentSettings = LocalStorageService.getUserSettings() || {
        reminders: [],
        theme: 'light' as 'light' | 'dark',
        petName: 'Buddy'
      };
      LocalStorageService.saveUserSettings({
        ...currentSettings,
        theme: themeValue as 'light' | 'dark'
      });
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('bookish-theme', themeValue);
    }
  };

  const theme: Theme = {
    colors: isDark ? darkTheme.colors : lightTheme.colors,
    isDark,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
