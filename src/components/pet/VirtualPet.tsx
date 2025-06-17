import React from 'react';
import { usePet } from '../../context/PetContext';
import { useTheme } from '../../context/ThemeContext';

const VirtualPet: React.FC = () => {
  const { pet, getPetHappinessLevel, getLevelProgress } = usePet();
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 shadow-sm" style={{ backgroundColor: theme.colors.surface }}>
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
        <h3 className="font-serif text-base font-medium" style={{ color: theme.colors.textPrimary }}>{pet.name}</h3>
        <p className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>Level {pet.level} • {pet.evolutionStage}</p>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.borderLight }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${getLevelProgress()}%`,
                backgroundColor: theme.colors.secondary
              }}
            />
          </div>
          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{Math.round(getLevelProgress())}%</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`w-3 h-3 rounded-full mb-1 ${
          getPetHappinessLevel() === 'happy' ? 'bg-green-400' :
          getPetHappinessLevel() === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
        <span className="text-xs capitalize" style={{ color: theme.colors.textSecondary }}>{pet.mood}</span>
      </div>
    </div>
  );
};

export default VirtualPet;