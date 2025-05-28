import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VirtualPet } from '../types';
import { getPet, savePet, feedPet } from '../services/storage';

interface PetContextProps {
  pet: VirtualPet;
  feedPetMinutes: (minutes: number) => void;
  renamePet: (name: string) => void;
  getPetHappinessLevel: () => 'sad' | 'neutral' | 'happy';
  getLevelProgress: () => number;
}

const PetContext = createContext<PetContextProps | undefined>(undefined);

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};

interface PetProviderProps {
  children: ReactNode;
}

export const PetProvider: React.FC<PetProviderProps> = ({ children }) => {
  const [pet, setPet] = useState<VirtualPet>(getPet());

  // Initialize from local storage
  useEffect(() => {
    setPet(getPet());
  }, []);

  // Decay happiness over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prevPet => {
        const lastFed = new Date(prevPet.lastFed);
        const now = new Date();
        
        // Calculate days since last fed
        const daysSinceLastFed = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastFed > 0) {
          const newHappiness = Math.max(0, prevPet.happiness - (daysSinceLastFed * 5));
          
          const updatedPet = {
            ...prevPet,
            happiness: newHappiness
          };
          
          savePet(updatedPet);
          return updatedPet;
        }
        
        return prevPet;
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const feedPetMinutes = (minutes: number) => {
    const updatedPet = feedPet(minutes);
    setPet(updatedPet);
  };

  const renamePet = (name: string) => {
    const updatedPet = { ...pet, name };
    savePet(updatedPet);
    setPet(updatedPet);
  };

  const getPetHappinessLevel = () => {
    if (pet.happiness < 30) return 'sad';
    if (pet.happiness < 70) return 'neutral';
    return 'happy';
  };

  const getLevelProgress = () => {
    return (pet.experience / pet.experienceToNextLevel) * 100;
  };

  return (
    <PetContext.Provider
      value={{
        pet,
        feedPetMinutes,
        renamePet,
        getPetHappinessLevel,
        getLevelProgress
      }}
    >
      {children}
    </PetContext.Provider>
  );
};