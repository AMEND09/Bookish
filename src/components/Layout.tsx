import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-[#F7F5F3] ${className}`}>
      {children}
    </div>
  );
};

export default Layout;
