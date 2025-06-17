import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-xl shadow-sm transition-colors duration-200"
      style={{
        backgroundColor: theme.colors.surface,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surfaceSecondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surface;
      }}
    >
      <div 
        className="w-10 h-10 flex items-center justify-center rounded-full mb-2"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Icon 
          className="w-5 h-5" 
          style={{ color: theme.colors.textSecondary }}
        />
      </div>
      <span 
        className="text-sm"
        style={{ color: theme.colors.textPrimary }}
      >
        {label}
      </span>
    </button>
  );
};

export default ActionButton;