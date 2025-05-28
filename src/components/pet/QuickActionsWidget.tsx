import React from 'react';
import { usePet } from '../../context/PetContext';
import { Apple, Heart, Bed } from 'lucide-react';

const QuickActionsWidget: React.FC = () => {
  const { 
    pet, 
    feedPet, 
    playWithPet, 
    petSleep 
  } = usePet();

  return (
    <section>
      <h2 className="font-serif text-lg font-medium text-[#3A3A3A] mb-3">Quick Pet Care</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-[#E8E3DD] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{pet.name}</div>
            <div className="text-lg font-bold text-[#D2691E]">💰 {pet.points}</div>
          </div>
          <p className="text-xs text-[#8B7355]">Care Points</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={feedPet}
            disabled={pet.points < 3}
            className={`py-3 px-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-1 ${
              pet.points >= 3
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Apple className="w-5 h-5" />
            <span className="text-sm">Feed</span>
            <span className="text-xs">💰 3 pts</span>
          </button>
          
          <button
            onClick={playWithPet}
            disabled={pet.points < 5}
            className={`py-3 px-3 rounded-lg font-medium transition-colors flex flex-col items-center gap-1 ${
              pet.points >= 5
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm">Play</span>
            <span className="text-xs">💰 5 pts</span>
          </button>
          
          <button
            onClick={petSleep}
            className="py-3 px-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex flex-col items-center gap-1"
          >
            <Bed className="w-5 h-5" />
            <span className="text-sm">Rest</span>
            <span className="text-xs">Free</span>
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-[#F0EDE8]">
          <p className="text-xs text-[#8B7355] text-center">
            Earn more points by reading books and tracking your time
          </p>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsWidget;