import { useTheme } from '../context/ThemeContext';

/**
 * Custom hook for theme-aware styling
 * Provides common styles that adapt to current theme
 */
export const useThemeStyles = () => {
  const { theme } = useTheme();

  return {
    // Container styles
    container: {
      backgroundColor: theme.colors.background,
      color: theme.colors.textPrimary,
    },
    
    // Card styles
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
    },
    
    // Button styles
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textInverse,
      borderColor: theme.colors.primary,
    },
    
    primaryButtonHover: {
      backgroundColor: theme.colors.primaryLight,
    },
    
    secondaryButton: {
      backgroundColor: theme.colors.surfaceSecondary,
      color: theme.colors.textPrimary,
      borderColor: theme.colors.border,
    },
    
    // Input styles
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      borderColor: theme.colors.border,
    },
    
    inputFocus: {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
    },
    
    // Text styles
    primaryText: {
      color: theme.colors.textPrimary,
    },
    
    secondaryText: {
      color: theme.colors.textSecondary,
    },
    
    tertiaryText: {
      color: theme.colors.textTertiary,
    },
    
    // Status styles
    successText: {
      color: theme.colors.success,
    },
    
    warningText: {
      color: theme.colors.warning,
    },
    
    errorText: {
      color: theme.colors.error,
    },
    
    // Reading status styles
    wantToReadBadge: {
      backgroundColor: theme.colors.wantToRead,
      color: theme.colors.wantToReadText,
    },
    
    currentlyReadingBadge: {
      backgroundColor: theme.colors.currentlyReading,
      color: theme.colors.currentlyReadingText,
    },
    
    completedBadge: {
      backgroundColor: theme.colors.completed,
      color: theme.colors.completedText,
    },
    
    // Utility functions
    withHover: (baseStyle: React.CSSProperties, hoverStyle: React.CSSProperties) => ({
      ...baseStyle,
      ':hover': hoverStyle,
    }),
    
    // CSS classes for Tailwind compatibility
    getThemeClasses: () => ({
      background: theme.isDark ? 'dark:bg-dark-background' : 'bg-background',
      surface: theme.isDark ? 'dark:bg-dark-surface' : 'bg-surface',
      text: theme.isDark ? 'dark:text-dark-primary' : 'text-text-primary',
      border: theme.isDark ? 'dark:border-dark-default' : 'border-border',
    }),
  };
};

export default useThemeStyles;
