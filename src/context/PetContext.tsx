import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import gunService from '../services/gun';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'toy' | 'medicine' | 'decoration' | 'special';
  effect: {
    hunger?: number;
    happiness?: number;
    energy?: number;
    health?: number;
    cleanliness?: number;
    sickness?: number;
    experience?: number;
  };
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockRequirement?: {
    level?: number;
    books?: number;
    badges?: string[];
  };
  quantity?: number; // For items in inventory
}

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
  mood: 'happy' | 'content' | 'sad' | 'excited' | 'sleepy' | 'hungry' | 'sick' | 'dying' | 'dead';
  isAlive: boolean;
  deathDate?: string;
  sickness: number; // 0-100, higher means more sick
  cleanliness: number; // 0-100, lower means dirtier
  inventory: ShopItem[];
  unlockedItems: string[]; // Item IDs that have been unlocked for purchase
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
  shopItems: ShopItem[];
  feedPet: () => void;
  playWithPet: () => void;
  petSleep: () => void;
  cleanPet: () => void;
  healPet: () => void;
  revivePet: () => void;
  useItem: (itemId: string) => boolean;
  buyItem: (itemId: string) => boolean;
  getShopItems: () => ShopItem[];
  getUnlockedItems: () => ShopItem[];
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
  mood: 'content',
  isAlive: true,
  sickness: 0,
  cleanliness: 100,
  inventory: [],
  unlockedItems: ['basic_food', 'water', 'soap']
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
  // Shop items data
  const shopItems: ShopItem[] = [
    // Food items
    {
      id: 'basic_food',
      name: 'Pet Food',
      description: 'Basic nutritious food for your pet',
      price: 3,
      category: 'food',
      effect: { hunger: 25, happiness: 5 },
      emoji: '🍖',
      rarity: 'common'
    },
    {
      id: 'premium_food',
      name: 'Premium Feast',
      description: 'Delicious high-quality meal',
      price: 8,
      category: 'food',
      effect: { hunger: 40, happiness: 15, health: 5 },
      emoji: '🍗',
      rarity: 'rare',
      unlockRequirement: { level: 5 }
    },
    {
      id: 'energy_drink',
      name: 'Energy Potion',
      description: 'Restores energy and vitality',
      price: 5,
      category: 'food',
      effect: { energy: 30, happiness: 10 },
      emoji: '🧪',
      rarity: 'common'
    },
    {
      id: 'gourmet_meal',
      name: 'Gourmet Delicacy',
      description: 'Fancy meal that satisfies all needs',
      price: 15,
      category: 'food',
      effect: { hunger: 50, happiness: 25, health: 10, energy: 20 },
      emoji: '🥘',
      rarity: 'rare',
      unlockRequirement: { level: 10 }
    },
    {
      id: 'superfood',
      name: 'Superfood Bowl',
      description: 'Nutritious meal that boosts all stats',
      price: 25,
      category: 'food',
      effect: { hunger: 60, happiness: 30, health: 20, energy: 25, experience: 10 },
      emoji: '🥗',
      rarity: 'epic',
      unlockRequirement: { level: 15, books: 20 }
    },
    {
      id: 'water',
      name: 'Fresh Water',
      description: 'Essential hydration for your pet',
      price: 1,
      category: 'food',
      effect: { hunger: 10, health: 5 },
      emoji: '💧',
      rarity: 'common'
    },
    {
      id: 'vitamin_treats',
      name: 'Vitamin Treats',
      description: 'Healthy snacks that prevent sickness',
      price: 12,
      category: 'food',
      effect: { hunger: 20, health: 15, sickness: -30 },
      emoji: '🍎',
      rarity: 'rare',
      unlockRequirement: { level: 8 }
    },
    // Toys
    {
      id: 'ball',
      name: 'Bouncy Ball',
      description: 'Fun toy that increases happiness',
      price: 6,
      category: 'toy',
      effect: { happiness: 25, energy: -10 },
      emoji: '⚽',
      rarity: 'common'
    },
    {
      id: 'puzzle',
      name: 'Brain Puzzle',
      description: 'Intellectual toy that boosts experience',
      price: 12,
      category: 'toy',
      effect: { happiness: 20, experience: 15 },
      emoji: '🧩',
      rarity: 'rare',
      unlockRequirement: { level: 8 }
    },
    {
      id: 'teddy_bear',
      name: 'Comfort Teddy',
      description: 'Cuddly companion that reduces stress',
      price: 10,
      category: 'toy',
      effect: { happiness: 30, health: 10, sickness: -20 },
      emoji: '🧸',
      rarity: 'common'
    },
    {
      id: 'laser_pointer',
      name: 'Laser Pointer',
      description: 'High-tech toy for active play',
      price: 18,
      category: 'toy',
      effect: { happiness: 35, energy: -20, experience: 20 },
      emoji: '🔦',
      rarity: 'rare',
      unlockRequirement: { level: 12 }
    },
    {
      id: 'robot_companion',
      name: 'Robot Companion',
      description: 'AI-powered toy that teaches and entertains',
      price: 40,
      category: 'toy',
      effect: { happiness: 50, experience: 40, energy: 10 },
      emoji: '🤖',
      rarity: 'epic',
      unlockRequirement: { level: 20, books: 15 }
    },
    // Medicine
    {
      id: 'medicine',
      name: 'Health Potion',
      description: 'Cures sickness and restores health',
      price: 10,
      category: 'medicine',
      effect: { health: 30, sickness: -50 },
      emoji: '💊',
      rarity: 'common'
    },
    {
      id: 'super_medicine',
      name: 'Super Cure',
      description: 'Powerful medicine that fully heals',
      price: 25,
      category: 'medicine',
      effect: { health: 50, sickness: -100, happiness: 10 },
      emoji: '💉',
      rarity: 'epic',
      unlockRequirement: { level: 15 }
    },
    {
      id: 'antibiotics',
      name: 'Antibiotics',
      description: 'Prevents and treats serious illness',
      price: 20,
      category: 'medicine',
      effect: { health: 40, sickness: -80, happiness: 5 },
      emoji: '🔬',
      rarity: 'rare',
      unlockRequirement: { level: 12 }
    },
    {
      id: 'pain_relief',
      name: 'Pain Relief',
      description: 'Reduces suffering and improves mood',
      price: 8,
      category: 'medicine',
      effect: { health: 20, happiness: 15, sickness: -30 },
      emoji: '🩹',
      rarity: 'common'
    },
    {
      id: 'immunity_boost',
      name: 'Immunity Booster',
      description: 'Strengthens immune system',
      price: 30,
      category: 'medicine',
      effect: { health: 60, sickness: -100, happiness: 20 },
      emoji: '🛡️',
      rarity: 'epic',
      unlockRequirement: { level: 18, books: 12 }
    },
    // Cleaning items
    {
      id: 'soap',
      name: 'Pet Soap',
      description: 'Keeps your pet clean and fresh',
      price: 4,
      category: 'decoration',
      effect: { cleanliness: 30, happiness: 10 },
      emoji: '🧼',
      rarity: 'common'
    },
    {
      id: 'luxury_bath',
      name: 'Luxury Spa Treatment',
      description: 'Ultimate cleaning experience',
      price: 15,
      category: 'decoration',
      effect: { cleanliness: 50, happiness: 25, health: 10 },
      emoji: '🛁',
      rarity: 'rare',
      unlockRequirement: { level: 10 }
    },
    {
      id: 'grooming_kit',
      name: 'Grooming Kit',
      description: 'Professional grooming tools',
      price: 22,
      category: 'decoration',
      effect: { cleanliness: 60, happiness: 30, health: 15 },
      emoji: '✂️',
      rarity: 'rare',
      unlockRequirement: { level: 14 }
    },
    {
      id: 'air_freshener',
      name: 'Air Freshener',
      description: 'Keeps the environment fresh',
      price: 6,
      category: 'decoration',
      effect: { cleanliness: 20, happiness: 15, health: 5 },
      emoji: '🌸',
      rarity: 'common'
    },
    // Special items
    {
      id: 'phoenix_feather',
      name: 'Phoenix Feather',
      description: 'Can revive a deceased pet',
      price: 100,
      category: 'special',
      effect: { health: 100, happiness: 50, energy: 100 },
      emoji: '🪶',
      rarity: 'legendary',
      unlockRequirement: { level: 20, books: 25 }
    },
    {
      id: 'evolution_crystal',
      name: 'Evolution Crystal',
      description: 'Instantly evolves your pet to the next stage',
      price: 50,
      category: 'special',
      effect: { experience: 1000, happiness: 30 },
      emoji: '💎',
      rarity: 'epic',
      unlockRequirement: { level: 12, books: 10 }
    },
    {
      id: 'time_crystal',
      name: 'Time Crystal',
      description: 'Slows down aging and decay',
      price: 75,
      category: 'special',
      effect: { health: 30, happiness: 20, energy: 30 },
      emoji: '⏰',
      rarity: 'epic',
      unlockRequirement: { level: 25, books: 30 }
    },
    {
      id: 'golden_coin',
      name: 'Golden Coin',
      description: 'Increases reading rewards',
      price: 80,
      category: 'special',
      effect: { happiness: 40, experience: 50 },
      emoji: '🪙',
      rarity: 'epic',
      unlockRequirement: { level: 30, books: 40 }
    },
    {
      id: 'rainbow_potion',
      name: 'Rainbow Potion',
      description: 'Magical potion that maximizes all stats',
      price: 150,
      category: 'special',
      effect: { hunger: 100, happiness: 100, energy: 100, health: 100, cleanliness: 100, sickness: -100 },
      emoji: '🌈',
      rarity: 'legendary',
      unlockRequirement: { level: 35, books: 50 }
    },
    {
      id: 'book_of_wisdom',
      name: 'Book of Wisdom',
      description: 'Ancient tome that grants massive experience',
      price: 60,
      category: 'special',
      effect: { experience: 500, happiness: 25 },
      emoji: '📚',
      rarity: 'epic',
      unlockRequirement: { level: 22, books: 35 }
    }
  ];

  // Auto-save when pet or stats change
  useEffect(() => {
    savePetToStorage(pet);
  }, [pet]);

  useEffect(() => {
    savePetStatsToStorage(petStats);
  }, [petStats]);  // Enhanced auto-decay with death mechanics - More aggressive survival system
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pet.isAlive) return; // Don't decay if pet is dead
      
      const now = new Date();
      const lastActivity = new Date(pet.lastFed);
      const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastActivity > 0.5) { // Start decay after 30 minutes
        setPet(prevPet => {
          if (!prevPet.isAlive) return prevPet;
          
          const decayMultiplier = Math.max(1, hoursSinceLastActivity / 2); // Faster decay over time
          let newHunger = Math.max(0, prevPet.hunger - decayMultiplier * 4); // Faster hunger decay
          let newEnergy = Math.max(0, prevPet.energy - decayMultiplier * 3);
          let newHappiness = Math.max(0, prevPet.happiness - decayMultiplier * 2);
          let newHealth = prevPet.health;
          let newSickness = prevPet.sickness;
          let newCleanliness = Math.max(0, prevPet.cleanliness - decayMultiplier * 2);

          // Critical conditions increase sickness dramatically
          if (newHunger < 30) newSickness = Math.min(100, newSickness + decayMultiplier * 8);
          if (newHunger < 15) newSickness = Math.min(100, newSickness + decayMultiplier * 15);
          if (newCleanliness < 40) newSickness = Math.min(100, newSickness + decayMultiplier * 5);
          if (newHappiness < 25) newSickness = Math.min(100, newSickness + decayMultiplier * 3);
          if (newEnergy < 20) newSickness = Math.min(100, newSickness + decayMultiplier * 2);

          // Sickness affects health more severely
          if (newSickness > 30) {
            newHealth = Math.max(0, newHealth - decayMultiplier * 4);
          }
          if (newSickness > 60) {
            newHealth = Math.max(0, newHealth - decayMultiplier * 8);
          }
          if (newSickness > 80) {
            newHealth = Math.max(0, newHealth - decayMultiplier * 12);
          }

          // Multiple death conditions - more realistic
          const starvationDeath = newHunger <= 0;
          const sicknessDeath = newSickness >= 100;
          const healthDeath = newHealth <= 0;
          const neglectDeath = (newHunger < 10 && newCleanliness < 10 && newHappiness < 10);
          
          const shouldDie = (starvationDeath || sicknessDeath || healthDeath || neglectDeath) && prevPet.isAlive;
          const newIsAlive = shouldDie ? false : prevPet.isAlive;
          const newDeathDate = shouldDie ? now.toISOString() : prevPet.deathDate;

          const newMood = getMoodFromStats(
            newHappiness,
            newHunger,
            newEnergy,
            newHealth,
            newSickness,
            newCleanliness,
            newIsAlive
          );

          return {
            ...prevPet,
            hunger: newHunger,
            energy: newEnergy,
            happiness: newHappiness,
            health: newHealth,
            sickness: newSickness,
            cleanliness: newCleanliness,
            isAlive: newIsAlive,
            deathDate: newDeathDate,
            mood: newMood
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
    }, 60000); // Check every minute for more responsive decay

    return () => clearInterval(interval);
  }, [pet.lastFed, pet.isAlive, petStats.lastActiveDate]);
  const getMoodFromStats = (happiness: number, hunger: number, energy: number, health: number, sickness: number, cleanliness: number, isAlive: boolean): Pet['mood'] => {
    if (!isAlive) return 'dead';
    if (health <= 10 || sickness >= 90) return 'dying';
    if (sickness >= 50) return 'sick';
    if (hunger < 20) return 'hungry';
    if (energy < 20) return 'sleepy';
    if (happiness > 80 && cleanliness > 70) return 'happy';
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
    if (!pet.isAlive) return '💀';
    
    const stage = pet.evolutionStage;
    const mood = pet.mood;
    
    const emojis = {
      egg: { 
        happy: '🥚', content: '🥚', sad: '💔', excited: '✨', sleepy: '😴', hungry: '🥚',
        sick: '🤒', dying: '💀', dead: '💀'
      },
      baby: { 
        happy: '😊', content: '🐛', sad: '😢', excited: '🤩', sleepy: '😴', hungry: '😋',
        sick: '🤒', dying: '💀', dead: '💀'
      },
      child: { 
        happy: '😄', content: '🐯', sad: '😭', excited: '🤗', sleepy: '💤', hungry: '🍎',
        sick: '🤒', dying: '💀', dead: '💀'
      },
      teen: { 
        happy: '😎', content: '🦊', sad: '😔', excited: '🚀', sleepy: '😪', hungry: '🍕',
        sick: '🤒', dying: '💀', dead: '💀'
      },
      adult: { 
        happy: '🌟', content: '🦉', sad: '😞', excited: '🎉', sleepy: '😌', hungry: '🍽️',
        sick: '🤒', dying: '💀', dead: '💀'
      },
      elder: { 
        happy: '👑', content: '🐉', sad: '😟', excited: '🎊', sleepy: '🧘', hungry: '🍱',
        sick: '🤒', dying: '💀', dead: '💀'
      }
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
      
      // Track feeding activity
      trackActivity('fed');
      
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
        mood: getMoodFromStats(newHappiness, newHunger, prevPet.energy, prevPet.health, prevPet.sickness, prevPet.cleanliness, prevPet.isAlive)
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
      
      // Track playing activity
      trackActivity('played');
      
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
        mood: getMoodFromStats(newHappiness, prevPet.hunger, newEnergy, prevPet.health, prevPet.sickness, prevPet.cleanliness, prevPet.isAlive)
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
        mood: getMoodFromStats(prevPet.happiness, prevPet.hunger, newEnergy, newHealth, prevPet.sickness, prevPet.cleanliness, prevPet.isAlive)
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
          mood: getMoodFromStats(newHappiness, prevPet.hunger, prevPet.energy, prevPet.health, prevPet.sickness, prevPet.cleanliness, prevPet.isAlive)
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
        mood: getMoodFromStats(newHappiness, prevPet.hunger, prevPet.energy, prevPet.health, prevPet.sickness, prevPet.cleanliness, prevPet.isAlive)
      };
    });

    setPetStats(prevStats => ({
      ...prevStats,
      booksReadToday: prevStats.booksReadToday + 1,
      lastActiveDate: new Date().toISOString()
    }));
  };  const getPetMood = (): string => {
    const moodDescriptions = {
      happy: "Your pet is thriving! They're full of energy and love for reading!",
      excited: "Your pet is bouncing with excitement about your reading progress!",
      content: "Your pet is peacefully content, enjoying your company.",
      sad: "Your pet looks dejected and needs attention. Feed them or play with them!",
      sleepy: "Your pet is exhausted and struggling to stay awake. They need rest!",
      hungry: "⚠️ Your pet is starving! They desperately need food right now!",
      sick: "🤒 Your pet is seriously ill and suffering! Buy medicine immediately!",
      dying: "🚨 CRITICAL: Your pet is dying! Their health is failing rapidly - act NOW or they will die!",
      dead: "💔 Your beloved pet has passed away. Only a Phoenix Feather can bring them back to life."
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

  // Sync pet data with gun service
  const syncPetWithGun = async (petData: Pet) => {
    if (gunService.isAuthenticated()) {
      try {
        await gunService.syncPetShopData(petData, petData.inventory);
      } catch (error) {
        console.warn('Failed to sync pet data:', error);
      }
    }
  };

  // Track pet activities for social features
  const trackActivity = async (type: 'fed' | 'played' | 'slept' | 'sick' | 'died' | 'revived' | 'evolved') => {
    if (gunService.isAuthenticated()) {
      try {
        await gunService.trackPetActivity({
          type,
          petName: pet.name,
          petLevel: pet.level,
          petStage: pet.evolutionStage,
          timestamp: new Date().toISOString(),
          stats: {
            happiness: pet.happiness,
            hunger: pet.hunger,
            health: pet.health
          }
        });
      } catch (error) {
        console.warn('Failed to track pet activity:', error);
      }
    }
  };

  // Shop functions
  const getShopItems = (): ShopItem[] => {
    return shopItems;
  };

  const getUnlockedItems = (): ShopItem[] => {
    return shopItems.filter(item => {
      if (pet.unlockedItems.includes(item.id)) return true;
      if (!item.unlockRequirement) return true;
      
      const req = item.unlockRequirement;
      if (req.level && pet.level < req.level) return false;
      if (req.books && pet.totalBooksRead < req.books) return false;
      if (req.badges && !req.badges.every(badge => pet.badges.includes(badge))) return false;
      
      return true;
    });
  };

  const buyItem = (itemId: string): boolean => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;
    if (pet.points < item.price) return false;
    if (!getUnlockedItems().find(i => i.id === itemId)) return false;

    setPet(prevPet => {
      const existingItem = prevPet.inventory.find(i => i.id === itemId);
      const updatedInventory = existingItem
        ? prevPet.inventory.map(i => i.id === itemId ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
        : [...prevPet.inventory, { ...item, quantity: 1 }];

      return {
        ...prevPet,
        points: prevPet.points - item.price,
        inventory: updatedInventory
      };
    });

    return true;
  };

  const useItem = (itemId: string): boolean => {
    const item = pet.inventory.find(i => i.id === itemId);
    if (!item || (item.quantity || 0) <= 0) return false;
    if (!pet.isAlive && itemId !== 'phoenix_feather') return false;

    setPet(prevPet => {
      let updatedPet = { ...prevPet };
      
      // Apply item effects
      if (item.effect.hunger) updatedPet.hunger = Math.min(100, updatedPet.hunger + item.effect.hunger);
      if (item.effect.happiness) updatedPet.happiness = Math.min(100, updatedPet.happiness + item.effect.happiness);
      if (item.effect.energy) updatedPet.energy = Math.min(100, Math.max(0, updatedPet.energy + item.effect.energy));
      if (item.effect.health) updatedPet.health = Math.min(100, updatedPet.health + item.effect.health);
      if (item.effect.cleanliness) updatedPet.cleanliness = Math.min(100, updatedPet.cleanliness + item.effect.cleanliness);
      if (item.effect.sickness) updatedPet.sickness = Math.max(0, updatedPet.sickness + item.effect.sickness);
      if (item.effect.experience) {
        const newExp = updatedPet.experience + item.effect.experience;
        const { newLevel, newExpToNext } = checkForLevelUp(newExp, updatedPet.level);
        updatedPet.experience = newExp;
        updatedPet.level = newLevel;
        updatedPet.experienceToNext = newExpToNext;
        updatedPet.evolutionStage = getEvolutionStage(newLevel);
      }

      // Special item effects
      if (itemId === 'phoenix_feather' && !updatedPet.isAlive) {
        updatedPet.isAlive = true;
        updatedPet.health = 100;
        updatedPet.happiness = 50;
        updatedPet.energy = 100;
        updatedPet.hunger = 50;
        updatedPet.sickness = 0;
        updatedPet.cleanliness = 80;
        delete updatedPet.deathDate;
      }

      // Update mood and check for death
      if (updatedPet.health <= 0 || updatedPet.sickness >= 100) {
        updatedPet.isAlive = false;
        updatedPet.deathDate = new Date().toISOString();
        updatedPet.mood = 'dead';
      } else {
        updatedPet.mood = getMoodFromStats(
          updatedPet.happiness, 
          updatedPet.hunger, 
          updatedPet.energy, 
          updatedPet.health, 
          updatedPet.sickness, 
          updatedPet.cleanliness, 
          updatedPet.isAlive
        );
      }

      // Remove item from inventory
      updatedPet.inventory = updatedPet.inventory.map(i => 
        i.id === itemId 
          ? { ...i, quantity: (i.quantity || 1) - 1 }
          : i
      ).filter(i => (i.quantity || 0) > 0);

      return updatedPet;
    });

    return true;
  };

  const cleanPet = () => {
    if (!pet.isAlive) return;
    
    setPet(prevPet => {
      const newCleanliness = Math.min(100, prevPet.cleanliness + 25);
      const newHappiness = Math.min(100, prevPet.happiness + 10);
      
      return {
        ...prevPet,
        cleanliness: newCleanliness,
        happiness: newHappiness,
        mood: getMoodFromStats(newHappiness, prevPet.hunger, prevPet.energy, prevPet.health, prevPet.sickness, newCleanliness, prevPet.isAlive)
      };
    });
  };

  const healPet = () => {
    if (!pet.isAlive || pet.points < 15) return;
    
    setPet(prevPet => {
      const newHealth = Math.min(100, prevPet.health + 30);
      const newSickness = Math.max(0, prevPet.sickness - 25);
      const newHappiness = Math.min(100, prevPet.happiness + 15);
      
      return {
        ...prevPet,
        health: newHealth,
        sickness: newSickness,
        happiness: newHappiness,
        points: prevPet.points - 15,
        mood: getMoodFromStats(newHappiness, prevPet.hunger, prevPet.energy, newHealth, newSickness, prevPet.cleanliness, prevPet.isAlive)
      };
    });
  };

  const revivePet = () => {
    if (pet.isAlive || pet.points < 100) return;
    
    setPet(prevPet => ({
      ...prevPet,
      isAlive: true,
      health: 50,
      happiness: 30,
      energy: 60,
      hunger: 40,
      sickness: 0,
      cleanliness: 60,
      points: prevPet.points - 100,
      mood: 'content',
      deathDate: undefined
    }));
  };

  // Enhanced auto-decay with death mechanics
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prevPet => {
        if (!prevPet.isAlive) return prevPet;
        
        const now = new Date();
        const lastFed = new Date(prevPet.lastFed);
        const hoursSinceLastFed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastFed > 0) {
          let newHunger = prevPet.hunger - hoursSinceLastFed * 10;
          let newEnergy = prevPet.energy - hoursSinceLastFed * 5;
          let newHappiness = prevPet.happiness - hoursSinceLastFed * 2;
          let newSickness = prevPet.sickness + hoursSinceLastFed * 2;
          
          // Health decreases if sick, increases if clean
          let newHealth = prevPet.health - (prevPet.sickness * 0.1) + (prevPet.cleanliness * 0.1);
          newHealth = Math.min(100, Math.max(0, newHealth));
          
          // Check for death
          if (newHealth <= 0 || newSickness >= 100) {
            return {
              ...prevPet,
              hunger: Math.max(0, newHunger),
              energy: Math.max(0, newEnergy),
              happiness: Math.max(0, newHappiness),
              sickness: Math.min(100, newSickness),
              health: newHealth,
              isAlive: false,
              deathDate: new Date().toISOString(),
              mood: 'dead'
            };
          }
          
          return {
            ...prevPet,
            hunger: Math.max(0, newHunger),
            energy: Math.max(0, newEnergy),
            happiness: Math.max(0, newHappiness),
            sickness: Math.min(100, newSickness),
            health: newHealth,
            mood: getMoodFromStats(
              Math.max(0, newHappiness),
              Math.max(0, newHunger),
              Math.max(0, newEnergy),
              newHealth,
              Math.min(100, newSickness),
              prevPet.cleanliness,
              true
            )
          };
        }
        
        return prevPet;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Enhanced mood system
  useEffect(() => {
    setPet(prevPet => ({
      ...prevPet,
      mood: getMoodFromStats(prevPet.happiness, prevPet.hunger, prevPet.energy, prevPet.health, prevPet.sickness, prevPet.cleanliness, prevPet.isAlive)
    }));
  }, [pet.happiness, pet.hunger, pet.energy, pet.health, pet.sickness, pet.cleanliness, pet.isAlive]);

  // Auto-sync pet data when it changes
  useEffect(() => {
    syncPetWithGun(pet);
  }, [pet.level, pet.health, pet.isAlive, pet.evolutionStage, pet.inventory.length]);

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
        shopItems,
        feedPet,
        playWithPet,
        petSleep,
        cleanPet,
        healPet,
        revivePet,
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
        getLevelProgress,
        getShopItems,
        getUnlockedItems,
        buyItem,
        useItem
      }}
    >
      {children}
    </PetContext.Provider>
  );
};