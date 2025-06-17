import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`min-h-screen transition-colors duration-200 ${className}`}
      style={{ backgroundColor: theme.colors.background }}
    >
      {children}
    </div>
  );
};

export default Layout;
