import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Pet {
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  happiness: number;
  hunger: number;
  energy: number;
  health: number;
  points: number; // Points earned from reading that can be spent on pet care
  lastFed: string;
  lastPlayed: string;
  lastSlept: string;
  createdAt: string;
  totalBooksRead: number;
  totalReadingTime: number; // in minutes
  evolutionStage: 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder';
  badges: string[];
  mood: 'happy' | 'content' | 'sad' | 'excited' | 'sleepy' | 'hungry';
}

interface PetStats {
  booksReadToday: number;
  readingTimeToday: number;
  streakDays: number;
  lastActiveDate: string;
}

interface PetContextType {
  pet: Pet;
  petStats: PetStats;
  feedPet: () => void;
  playWithPet: () => void;
  petSleep: () => void;
  updatePetFromReading: (minutes: number, isBookCompletion?: boolean) => void;
  updatePetFromBookCompletion: () => void;
  getPetMood: () => string;
  getPetEvolutionRequirement: () => { current: number; required: number; stage: string };
  resetPet: () => void;
  updatePetName: (name: string) => void;
  getPetEmoji: () => string;
  canEvolve: () => boolean;
  evolvePet: () => void;
  // Backward compatibility functions
  getPetHappinessLevel: () => 'sad' | 'neutral' | 'happy';
  getLevelProgress: () => number;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};

const getDefaultPet = (): Pet => ({
  name: 'Bookworm',
  level: 1,
  experience: 0,
  experienceToNext: 100,
  happiness: 100,
  hunger: 50,
  energy: 100,
  health: 100,
  points: 10, // Start with some points
  lastFed: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
  lastSlept: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  totalBooksRead: 0,
  totalReadingTime: 0,
  evolutionStage: 'egg',
  badges: [],
  mood: 'content'
});

const getDefaultPetStats = (): PetStats => ({
  booksReadToday: 0,
  readingTimeToday: 0,
  streakDays: 0,
  lastActiveDate: new Date().toISOString()
});

const loadPetFromStorage = (): Pet => {
  try {
    const saved = localStorage.getItem('bookish_pet');
    if (saved) {
      const pet = JSON.parse(saved);
      // Ensure all new properties exist
      return {
        ...getDefaultPet(),
        ...pet
      };
    }
  } catch (error) {
    console.error('Error loading pet from storage:', error);
  }
  return getDefaultPet();
};

const loadPetStatsFromStorage = (): PetStats => {
  try {
    const saved = localStorage.getItem('bookish_pet_stats');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading pet stats from storage:', error);
  }
  return getDefaultPetStats();
};

const savePetToStorage = (pet: Pet) => {
  localStorage.setItem('bookish_pet', JSON.stringify(pet));
};

const savePetStatsToStorage = (stats: PetStats) => {
  localStorage.setItem('bookish_pet_stats', JSON.stringify(stats));
};

interface PetProviderProps {
  children: ReactNode;
}

export const PetProvider: React.FC<PetProviderProps> = ({ children }) => {
  const [pet, setPet] = useState<Pet>(loadPetFromStorage);
  const [petStats, setPetStats] = useState<PetStats>(loadPetStatsFromStorage);

  // Auto-save when pet or stats change
  useEffect(() => {
    savePetToStorage(pet);
  }, [pet]);

  useEffect(() => {
    savePetStatsToStorage(petStats);
  }, [petStats]);

  // Auto-decay stats over time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const lastActivity = new Date(pet.lastFed);
      const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastActivity > 1) {
        setPet(prevPet => {
          const decayAmount = Math.floor(hoursSinceLastActivity);
          return {
            ...prevPet,
            hunger: Math.max(0, prevPet.hunger - decayAmount * 2),
            energy: Math.max(0, prevPet.energy - decayAmount),
            happiness: Math.max(0, prevPet.happiness - decayAmount),
            mood: getMoodFromStats(
              Math.max(0, prevPet.happiness - decayAmount),
              Math.max(0, prevPet.hunger - decayAmount * 2),
              Math.max(0, prevPet.energy - decayAmount)
            )
          };
        });
      }

      // Reset daily stats if it's a new day
      const today = now.toDateString();
      const lastActiveDate = new Date(petStats.lastActiveDate).toDateString();
      
      if (today !== lastActiveDate) {
        setPetStats(prevStats => ({
          ...prevStats,
          booksReadToday: 0,
          readingTimeToday: 0,
          lastActiveDate: now.toISOString()
        }));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [pet.lastFed, petStats.lastActiveDate]);

  const getMoodFromStats = (happiness: number, hunger: number, energy: number): Pet['mood'] => {
    if (hunger < 20) return 'hungry';
    if (energy < 20) return 'sleepy';
    if (happiness > 80) return 'happy';
    if (happiness > 60) return 'excited';
    if (happiness < 30) return 'sad';
    return 'content';
  };

  const calculateExperienceToNext = (level: number): number => {
    return 100 + (level * 50);
  };

  const checkForLevelUp = (currentExp: number, currentLevel: number): { newLevel: number; newExpToNext: number } => {
    let level = currentLevel;
    let expToNext = calculateExperienceToNext(level);
    
    while (currentExp >= expToNext) {
      level++;
      expToNext = calculateExperienceToNext(level);
    }
    
    return { newLevel: level, newExpToNext: expToNext };
  };

  const getEvolutionStage = (level: number): Pet['evolutionStage'] => {
    if (level < 3) return 'egg';
    if (level < 8) return 'baby';
    if (level < 15) return 'child';
    if (level < 25) return 'teen';
    if (level < 40) return 'adult';
    return 'elder';
  };

  const getPetEmoji = (): string => {
    const stage = pet.evolutionStage;
    const mood = pet.mood;
    
    const emojis = {
      egg: { happy: '🥚', content: '🥚', sad: '💔', excited: '✨', sleepy: '😴', hungry: '🥚' },
      baby: { happy: '😊', content: '🐛', sad: '😢', excited: '🤩', sleepy: '😴', hungry: '😋' },
      child: { happy: '😄', content: '🐯', sad: '😭', excited: '🤗', sleepy: '💤', hungry: '🍎' },
      teen: { happy: '😎', content: '🦊', sad: '😔', excited: '🚀', sleepy: '😪', hungry: '🍕' },
      adult: { happy: '🌟', content: '🦉', sad: '😞', excited: '🎉', sleepy: '😌', hungry: '🍽️' },
      elder: { happy: '👑', content: '🐉', sad: '😟', excited: '🎊', sleepy: '🧘', hungry: '🍱' }
    };
    
    return emojis[stage][mood] || emojis[stage].content;
  };

  const feedPet = () => {
    setPet(prevPet => {
      if (prevPet.points < 3) return prevPet; // Not enough points
      
      const newHunger = Math.min(100, prevPet.hunger + 30);
      const newHappiness = Math.min(100, prevPet.happiness + 10);
      const newExp = prevPet.experience + 5;
      const { newLevel, newExpToNext } = checkForLevelUp(newExp, prevPet.level);
      
      return {
        ...prevPet,
        hunger: newHunger,
        happiness: newHappiness,
        experience: newExp,
        level: newLevel,
        experienceToNext: newExpToNext,
        points: prevPet.points - 3, // Spend 3 points to feed
        lastFed: new Date().toISOString(),
        evolutionStage: getEvolutionStage(newLevel),
        mood: getMoodFromStats(newHappiness, newHunger, prevPet.energy)
      };
    });
  };

  const playWithPet = () => {
    setPet(prevPet => {
      if (prevPet.points < 5) return prevPet; // Not enough points
      
      const newHappiness = Math.min(100, prevPet.happiness + 20);
      const newEnergy = Math.max(0, prevPet.energy - 15);
      const newExp = prevPet.experience + 10;
      const { newLevel, newExpToNext } = checkForLevelUp(newExp, prevPet.level);
      
      return {
        ...prevPet,
        happiness: newHappiness,
        energy: newEnergy,
        experience: newExp,
        level: newLevel,
        experienceToNext: newExpToNext,
        points: prevPet.points - 5, // Spend 5 points to play
        lastPlayed: new Date().toISOString(),
        evolutionStage: getEvolutionStage(newLevel),
        mood: getMoodFromStats(newHappiness, prevPet.hunger, newEnergy)
      };
    });
  };

  const petSleep = () => {
    setPet(prevPet => {
      const newEnergy = Math.min(100, prevPet.energy + 40);
      const newHealth = Math.min(100, prevPet.health + 10);
      
      return {
        ...prevPet,
        energy: newEnergy,
        health: newHealth,
        lastSlept: new Date().toISOString(),
        mood: getMoodFromStats(prevPet.happiness, prevPet.hunger, newEnergy)
      };
    });
  };

  const updatePetFromReading = (minutes: number, isBookCompletion: boolean = false) => {
    const baseExperience = Math.floor(minutes / 5); // 1 XP per 5 minutes
    const bookCompletionBonus = isBookCompletion ? 50 : 0; // Bonus XP for completing a book
    const totalExperience = baseExperience + bookCompletionBonus;
    
    if (totalExperience > 0) {
      setPet(prevPet => {
        const newExp = prevPet.experience + totalExperience;
        const newHappiness = Math.min(100, prevPet.happiness + Math.floor(minutes / 10));
        const newTotalReadingTime = prevPet.totalReadingTime + minutes;
        const { newLevel, newExpToNext } = checkForLevelUp(newExp, prevPet.level);
        
        return {
          ...prevPet,
          experience: newExp,
          level: newLevel,
          experienceToNext: newExpToNext,
          happiness: newHappiness,
          totalReadingTime: newTotalReadingTime,
          evolutionStage: getEvolutionStage(newLevel),
          mood: getMoodFromStats(newHappiness, prevPet.hunger, prevPet.energy)
        };
      });

      setPetStats(prevStats => ({
        ...prevStats,
        readingTimeToday: prevStats.readingTimeToday + minutes,
        lastActiveDate: new Date().toISOString()
      }));
    }
  };

  const updatePetFromBookCompletion = () => {
    setPet(prevPet => {
      const newExp = prevPet.experience + 50; // Big bonus for completing a book
      const newHappiness = Math.min(100, prevPet.happiness + 25);
      const newTotalBooks = prevPet.totalBooksRead + 1;
      const pointsBonus = 20; // Big points bonus for completing a book
      const { newLevel, newExpToNext } = checkForLevelUp(newExp, prevPet.level);
      
      const newBadges = [...prevPet.badges];
      if (newTotalBooks === 1 && !newBadges.includes('first-book')) {
        newBadges.push('first-book');
      }
      if (newTotalBooks === 10 && !newBadges.includes('book-lover')) {
        newBadges.push('book-lover');
      }
      if (newTotalBooks === 50 && !newBadges.includes('bookworm')) {
        newBadges.push('bookworm');
      }
      
      return {
        ...prevPet,
        experience: newExp,
        level: newLevel,
        experienceToNext: newExpToNext,
        happiness: newHappiness,
        points: prevPet.points + pointsBonus,
        totalBooksRead: newTotalBooks,
        badges: newBadges,
        evolutionStage: getEvolutionStage(newLevel),
        mood: getMoodFromStats(newHappiness, prevPet.hunger, prevPet.energy)
      };
    });

    setPetStats(prevStats => ({
      ...prevStats,
      booksReadToday: prevStats.booksReadToday + 1,
      lastActiveDate: new Date().toISOString()
    }));
  };

  const getPetMood = (): string => {
    const moodDescriptions = {
      happy: "Your pet is very happy! Keep up the great reading!",
      excited: "Your pet is excited about your reading progress!",
      content: "Your pet is content and enjoying your company.",
      sad: "Your pet seems sad. Try feeding or playing with them!",
      sleepy: "Your pet is tired. Maybe they need some rest?",
      hungry: "Your pet is hungry! Don't forget to feed them."
    };
    return moodDescriptions[pet.mood];
  };

  const getPetEvolutionRequirement = () => {
    const nextStage = getEvolutionStage(pet.level + 1);
    const requiredLevel = pet.level < 3 ? 3 : pet.level < 8 ? 8 : pet.level < 15 ? 15 : pet.level < 25 ? 25 : 40;
    
    return {
      current: pet.level,
      required: requiredLevel,
      stage: nextStage
    };
  };

  const canEvolve = (): boolean => {
    const nextStageLevel = pet.level < 3 ? 3 : pet.level < 8 ? 8 : pet.level < 15 ? 15 : pet.level < 25 ? 25 : 40;
    return pet.level >= nextStageLevel && pet.evolutionStage !== getEvolutionStage(pet.level);
  };

  const evolvePet = () => {
    setPet(prevPet => ({
      ...prevPet,
      evolutionStage: getEvolutionStage(prevPet.level),
      happiness: 100,
      health: 100
    }));
  };

  const resetPet = () => {
    const newPet = getDefaultPet();
    setPet(newPet);
    setPetStats(getDefaultPetStats());
  };

  const updatePetName = (name: string) => {
    setPet(prevPet => ({
      ...prevPet,
      name
    }));
  };

  // Backward compatibility functions
  const getPetHappinessLevel = (): 'sad' | 'neutral' | 'happy' => {
    if (pet.happiness < 30) return 'sad';
    if (pet.happiness < 70) return 'neutral';
    return 'happy';
  };

  const getLevelProgress = (): number => {
    return (pet.experience / pet.experienceToNext) * 100;
  };

  return (
    <PetContext.Provider
      value={{
        pet,
        petStats,
        feedPet,
        playWithPet,
        petSleep,
        updatePetFromReading,
        updatePetFromBookCompletion,
        getPetMood,
        getPetEvolutionRequirement,
        resetPet,
        updatePetName,
        getPetEmoji,
        canEvolve,
        evolvePet,
        getPetHappinessLevel,
        getLevelProgress
      }}
    >
      {children}
    </PetContext.Provider>
  );
};