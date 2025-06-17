import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthForm from './AuthForm';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Always use light theme for auth pages
  const authTheme = {
    colors: {
      background: '#F7F5F3',
      surface: '#FFFFFF',
      borderLight: '#F0EDE8',
      border: '#E8E3DD',
      primary: '#8B7355',
      textPrimary: '#3A3A3A',
      textSecondary: '#8B7355'
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: authTheme.colors.background }}>
        <div className="rounded-2xl shadow-xl p-8 text-center border" style={{ backgroundColor: authTheme.colors.surface, borderColor: authTheme.colors.border }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: authTheme.colors.primary }}></div>
          <p className="font-medium" style={{ color: authTheme.colors.textSecondary }}>Loading your reading world...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: authTheme.colors.background }}>
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
