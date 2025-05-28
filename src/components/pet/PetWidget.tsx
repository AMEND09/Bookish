import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../../context/PetContext';
import { Settings, ArrowRight } from 'lucide-react';

const PetWidget: React.FC = () => {
  const navigate = useNavigate();
  const { 
    pet, 
    getPetMood, 
    canEvolve, 
    getPetEmoji
  } = usePet();

  const getLevelProgress = () => {
    return (pet.experience / pet.experienceToNext) * 100;
  };

  return (
    <section>
      <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Your Reading Pet</h2>
      
      <div 
        className="bg-white rounded-xl shadow-sm border border-[#E8E3DD] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/pet')}
      >
        {/* Pet Header */}
        <div className="p-4 bg-gradient-to-r from-[#F0EDE8] to-[#E8E3DD]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{getPetEmoji()}</div>
              <div>
                <h3 className="font-serif text-lg font-medium text-[#3A3A3A]">{pet.name}</h3>
                <p className="text-sm text-[#8B7355] capitalize">Level {pet.level} • {pet.evolutionStage}</p>
                {pet.points > 0 && (
                  <p className="text-xs text-[#D2691E] font-medium">💰 {pet.points} care points</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              {canEvolve() && (
                <div className="bg-gradient-to-r from-[#D2691E] to-[#FF8C00] text-white px-3 py-1 rounded-full text-xs font-medium mb-2">
                  ✨ Can Evolve!
                </div>
              )}
              <button className="p-2 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-1 text-[#8B7355]">
                <Settings className="w-4 h-4" />
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Simple Progress Section */}
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-[#8B7355] mb-2">
            <span>Experience Progress</span>
            <span>{pet.experience}/{pet.experienceToNext}</span>
          </div>
          <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#D2691E] to-[#FF8C00] rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          
          <p className="text-sm text-[#8B7355] text-center">{getPetMood()}</p>
          
          <div className="mt-3 pt-3 border-t border-[#F0EDE8] text-center">
            <p className="text-xs text-[#8B7355]">
              Tap to view full pet details and care options →
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PetWidget;