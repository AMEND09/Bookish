import React from 'react';
import { usePet } from '../../context/PetContext';

const VirtualPet: React.FC = () => {
  const { pet, getPetHappinessLevel, getLevelProgress } = usePet();

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
      <div className="text-4xl">
        {/* Simple emoji based on evolution stage */}
        {pet.evolutionStage === 'egg' && '🥚'}
        {pet.evolutionStage === 'baby' && '🐛'}
        {pet.evolutionStage === 'child' && '🐯'}
        {pet.evolutionStage === 'teen' && '🦊'}
        {pet.evolutionStage === 'adult' && '🦉'}
        {pet.evolutionStage === 'elder' && '🐉'}
      </div>
      
      <div className="flex-1">
        <h3 className="font-serif text-base font-medium text-[#3A3A3A]">{pet.name}</h3>
        <p className="text-xs text-[#8B7355] mb-1">Level {pet.level} • {pet.evolutionStage}</p>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D2691E] rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <span className="text-xs text-[#8B7355]">{Math.round(getLevelProgress())}%</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`w-3 h-3 rounded-full mb-1 ${
          getPetHappinessLevel() === 'happy' ? 'bg-green-400' :
          getPetHappinessLevel() === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
        <span className="text-xs text-[#8B7355] capitalize">{pet.mood}</span>
      </div>
    </div>
  );
};

export default VirtualPet;