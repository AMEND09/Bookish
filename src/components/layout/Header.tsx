import React from 'react';
import { User } from 'lucide-react';
import VirtualPet from '../pet/VirtualPet';

interface HeaderProps {
  greeting: string;
}

const Header: React.FC<HeaderProps> = ({ greeting }) => {
  return (
    <header className="p-4 bg-[#F7F5F3]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-xl font-medium text-[#3A3A3A]">{greeting}</h1>
          <p className="text-sm text-[#8B7355]">Ready to dive into a story?</p>
        </div>
        
        <div className="flex items-center gap-3">
          <VirtualPet compact />
          
          <button className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center">
            <User className="w-5 h-5 text-[#8B7355]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;