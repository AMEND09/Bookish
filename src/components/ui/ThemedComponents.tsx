import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../Layout';

interface ThemedPageProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const ThemedPage: React.FC<ThemedPageProps> = ({ 
  children, 
  maxWidth = 'md',
  className = ''
}) => {
  const { theme } = useTheme();
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg', 
    xl: 'max-w-xl',
    full: 'max-w-full'
  };
  return (
    <Layout>
      <div 
        className={`${maxWidthClasses[maxWidth]} mx-auto min-h-screen ${className}`}
        style={{ backgroundColor: theme.colors.background }}
      >
        {children}
      </div>
    </Layout>
  );
};

interface ThemedHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const ThemedHeader: React.FC<ThemedHeaderProps> = ({
  title,
  onBack,
  actions,
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <header 
      className={`p-4 border-b ${className}`}
      style={{ 
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border 
      }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: theme.colors.surfaceSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceSecondary;
            }}
          >
            <svg 
              className="w-5 h-5" 
              style={{ color: theme.colors.textSecondary }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 
          className="font-serif text-xl font-medium flex-1"
          style={{ color: theme.colors.textPrimary }}
        >
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  className = '',
  elevated = false,
  onClick
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-xl transition-colors duration-200 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
        borderColor: theme.colors.border,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ThemedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}) => {
  const { theme } = useTheme();

  const baseClasses = 'rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
          color: theme.colors.textInverse,
          ':hover': !disabled ? { backgroundColor: theme.colors.primaryLight } : {}
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.colors.border : theme.colors.surfaceSecondary,
          color: disabled ? theme.colors.textTertiary : theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
          ':hover': !disabled ? { backgroundColor: theme.colors.surface } : {}
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: disabled ? theme.colors.textTertiary : theme.colors.primary,
          border: `1px solid ${disabled ? theme.colors.border : theme.colors.primary}`,
          ':hover': !disabled ? { backgroundColor: theme.colors.primary + '10' } : {}
        };
      default:
        return {};
    }
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={getVariantStyles()}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
        } else if (!disabled && variant === 'secondary') {
          e.currentTarget.style.backgroundColor = theme.colors.surface;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.backgroundColor = theme.colors.primary;
        } else if (!disabled && variant === 'secondary') {
          e.currentTarget.style.backgroundColor = theme.colors.surfaceSecondary;
        }
      }}
    >
      {children}
    </button>
  );
};

interface ThemedTextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  className = ''
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm', 
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const getColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.textPrimary;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'tertiary':
        return theme.colors.textTertiary;
      default:
        return theme.colors.textPrimary;
    }
  };

  return (
    <span
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
      style={{ color: getColor() }}
    >
      {children}
    </span>
  );
};
