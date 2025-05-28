import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../../context/PetContext';

interface HeaderProps {
  greeting: string;
}

const Header: React.FC<HeaderProps> = ({ greeting }) => {
  const navigate = useNavigate();
  const { pet } = usePet();
  
  const getStatusEmoji = () => {
    const mood = pet.mood;
    const emojis = {
      happy: '😊',
      excited: '🤩', 
      content: '😌',
      sad: '😢',
      sleepy: '😴',
      hungry: '🍎'
    };
    return emojis[mood] || '😌';
  };

  return (
    <header className="p-4 bg-[#F7F5F3]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-xl font-medium text-[#3A3A3A]">{greeting}</h1>
          <p className="text-sm text-[#8B7355]">Ready to dive into a story?</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 bg-[#F0EDE8] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#E8E3DD] transition-colors"
            onClick={() => navigate('/pet')}
          >
            <span className="text-lg">{getStatusEmoji()}</span>
            <div className="text-right">
              <p className="text-xs font-medium text-[#3A3A3A]">{pet.name}</p>
              <p className="text-xs text-[#8B7355]">Lv.{pet.level}</p>
            </div>
          </div>
          
          <button className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center">
            <User className="w-5 h-5 text-[#8B7355]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;