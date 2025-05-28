import React, { useState, useEffect } from 'react';
import { usePet } from '../../context/PetContext';
import { Sparkles } from 'lucide-react';

interface VirtualPetProps {
  compact?: boolean;
}

const VirtualPet: React.FC<VirtualPetProps> = ({ compact = false }) => {
  const { pet, getPetHappinessLevel, getLevelProgress } = usePet();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const happinessLevel = getPetHappinessLevel();
  const progressPercent = getLevelProgress();
  
  // Eyes blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 5000);
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Show level up animation when pet level changes
  useEffect(() => {
    setShowLevelUp(true);
    const timer = setTimeout(() => setShowLevelUp(false), 3000);
    return () => clearTimeout(timer);
  }, [pet.level]);
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-[#F0EDE8] rounded-lg">
        <div className="relative w-10 h-10">
          <OwlFace mood={happinessLevel} isBlinking={isAnimating} size="small" />
          {showLevelUp && (
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-[#8B7355]">Lvl {pet.level}</span>
          <div className="w-16 h-1.5 bg-[#F7F5F3] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#E59554] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative p-4 bg-[#F0EDE8] rounded-xl shadow-sm">
      {showLevelUp && (
        <div className="absolute -top-2 right-4 animate-bounce flex items-center gap-1 bg-[#FF6B35] text-white px-2 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          Level Up!
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16">
          <OwlFace mood={happinessLevel} isBlinking={isAnimating} />
          {isAnimating && (
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 animate-float opacity-80">
              <Sparkles className="w-4 h-4 text-[#E59554]" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-serif text-sm font-medium text-[#3A3A3A]">{pet.name}</h3>
            <span className="text-xs text-[#8B7355]">I'm {getMoodText(happinessLevel)} you're reading!</span>
          </div>
          
          <div className="flex justify-between items-center text-xs text-[#8B7355] mb-1">
            <span>{pet.experience}/{pet.experienceToNextLevel}</span>
            <span>Level {pet.level}</span>
          </div>
          
          <div className="w-full h-2 bg-[#F7F5F3] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#CD853F] to-[#E59554] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const getMoodText = (mood: 'sad' | 'neutral' | 'happy') => {
  switch (mood) {
    case 'sad': return 'missing';
    case 'neutral': return 'glad';
    case 'happy': return 'so happy';
  }
};

interface OwlFaceProps {
  mood: 'sad' | 'neutral' | 'happy';
  isBlinking: boolean;
  size?: 'small' | 'normal';
}

const OwlFace: React.FC<OwlFaceProps> = ({ mood, isBlinking, size = 'normal' }) => {
  const isSmall = size === 'small';
  
  return (
    <div className={`relative ${isSmall ? 'w-10 h-10' : 'w-16 h-16'} bg-[#CD853F] rounded-full overflow-hidden flex items-center justify-center`}>
      {/* Owl face */}
      <div className={`absolute ${isSmall ? 'w-9 h-9' : 'w-14 h-14'} bg-[#D2691E] rounded-full flex items-center justify-center`}>
        {/* Eyes */}
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          <div className={`${isSmall ? 'w-2.5 h-2.5' : 'w-4 h-4'} bg-white rounded-full flex items-center justify-center ${isBlinking ? 'h-0.5' : ''} transition-all duration-100`}>
            <div className={`${isSmall ? 'w-1 h-1' : 'w-2 h-2'} bg-black rounded-full ${isBlinking ? 'hidden' : ''}`}></div>
          </div>
          <div className={`${isSmall ? 'w-2.5 h-2.5' : 'w-4 h-4'} bg-white rounded-full flex items-center justify-center ${isBlinking ? 'h-0.5' : ''} transition-all duration-100`}>
            <div className={`${isSmall ? 'w-1 h-1' : 'w-2 h-2'} bg-black rounded-full ${isBlinking ? 'hidden' : ''}`}></div>
          </div>
        </div>
        
        {/* Beak */}
        <div className={`absolute ${isSmall ? 'w-2 h-2' : 'w-3 h-3'} bg-[#FF6B35] rounded-sm ${isSmall ? 'bottom-2' : 'bottom-3'}`}></div>
        
        {/* Eyebrows */}
        <div className={`absolute ${isSmall ? 'top-1.5' : 'top-2.5'} left-0 right-0 flex justify-between px-1`}>
          <div className={`${isSmall ? 'w-2 h-0.5' : 'w-3 h-1'} bg-[#8B7355] rounded-full transform ${mood === 'sad' ? 'rotate-12' : mood === 'happy' ? '-rotate-12' : 'rotate-0'}`}></div>
          <div className={`${isSmall ? 'w-2 h-0.5' : 'w-3 h-1'} bg-[#8B7355] rounded-full transform ${mood === 'sad' ? '-rotate-12' : mood === 'happy' ? 'rotate-12' : 'rotate-0'}`}></div>
        </div>
      </div>
      
      {/* Ears */}
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#A0522D] rounded-tl-full"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#A0522D] rounded-tr-full"></div>
    </div>
  );
};

export default VirtualPet;