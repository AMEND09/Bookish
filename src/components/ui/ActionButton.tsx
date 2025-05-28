import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:bg-[#F0EDE8] transition-colors"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F7F5F3] mb-2">
        <Icon className="w-5 h-5 text-[#8B7355]" />
      </div>
      <span className="text-sm text-[#3A3A3A]">{label}</span>
    </button>
  );
};

export default ActionButton;