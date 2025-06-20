import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Zap, Apple, Bed, RefreshCw, Edit3, ShoppingCart, AlertTriangle } from 'lucide-react';
import { usePet } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';

const PetPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    pet, 
    petStats, 
    feedPet, 
    playWithPet, 
    petSleep, 
    getPetMood, 
    getPetEvolutionRequirement,
    resetPet,
    updatePetName,
    getPetEmoji,
    canEvolve,
    evolvePet
  } = usePet();
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(pet.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getStatColor = (value: number) => {
    if (value > 70) return 'bg-green-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatBarWidth = (value: number) => `${Math.max(0, Math.min(100, value))}%`;

  const handleRename = () => {
    if (newName.trim()) {
      updatePetName(newName.trim());
      setIsRenaming(false);
    }
  };

  const handleResetPet = () => {
    resetPet();
    setShowResetConfirm(false);
  };

  const getBadgeEmoji = (badge: string) => {
    const badges = {
      'first-book': '📖',
      'book-lover': '📚',
      'bookworm': '🐛',
      'speed-reader': '⚡',
      'night-owl': '🦉',
      'early-bird': '🐦'
    };
    return badges[badge as keyof typeof badges] || '🏆';
  };

  const getBadgeDescription = (badge: string) => {
    const descriptions = {
      'first-book': 'Read your first book',
      'book-lover': 'Read 10 books',
      'bookworm': 'Read 50 books',
      'speed-reader': 'Read for 100+ minutes in a day',
      'night-owl': 'Read after midnight',
      'early-bird': 'Read before 6 AM'
    };
    return descriptions[badge as keyof typeof descriptions] || 'Special achievement';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const evolutionReq = getPetEvolutionRequirement();

  return (    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>      <header className="p-4" style={{ backgroundColor: theme.colors.background, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">            <button 
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.surfaceSecondary }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </button>
            <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>My Reading Pet</h1>
          </div>          <div className="flex gap-2">
            <button
              onClick={() => navigate('/pet-shop')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#D2691E] to-[#FF8C00] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop
            </button>
            <button
              onClick={() => navigate('/minigames')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              🎮
              <span className="text-sm">Games</span>
            </button>
          </div>
        </div>
      </header>

      {/* Critical Status Warnings */}
      {!pet.isAlive && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-red-50 border-2 border-red-300 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💀</span>
            <div>
              <h3 className="font-bold text-red-800 text-lg">Your Pet Has Died!</h3>
              <p className="text-red-700">Visit the shop to buy a Phoenix Feather to revive them.</p>
              {pet.deathDate && (
                <p className="text-sm text-red-600 mt-1">
                  Died: {new Date(pet.deathDate).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {pet.isAlive && pet.mood === 'dying' && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-red-50 border-2 border-red-400 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-bold text-red-800 text-lg">CRITICAL CONDITION!</h3>
              <p className="text-red-700">Your pet is dying! Take immediate action!</p>
            </div>
          </div>
        </div>
      )}
      
      {pet.isAlive && pet.hunger < 15 && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-orange-50 border-2 border-orange-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍖</span>
            <div>
              <h3 className="font-bold text-orange-800">Starving!</h3>
              <p className="text-orange-700">Your pet desperately needs food!</p>
            </div>
          </div>
        </div>
      )}
      
      {pet.isAlive && pet.sickness > 70 && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-purple-50 border-2 border-purple-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤒</span>
            <div>
              <h3 className="font-bold text-purple-800">Seriously Ill!</h3>
              <p className="text-purple-700">Your pet needs medicine urgently!</p>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-6">        {/* Pet Display */}
        <div className="rounded-xl shadow-sm p-6 text-center" style={{ backgroundColor: theme.colors.surface }}>
          <div className="text-8xl mb-4">{getPetEmoji()}</div>
          
          <div className="mb-4">
            {isRenaming ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-2xl font-serif font-medium rounded px-3 py-1 border text-center"
                  style={{ 
                    backgroundColor: theme.colors.borderLight,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border
                  }}
                  onBlur={handleRename}
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">                <h2 className="text-2xl font-serif font-medium" style={{ color: theme.colors.textPrimary }}>{pet.name}</h2>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="p-1 rounded transition-colors hover:opacity-80"
                  style={{ 
                    color: theme.colors.textSecondary,
                    backgroundColor: theme.colors.borderLight
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-lg mb-2" style={{ color: theme.colors.textSecondary }}>
              <span>Level {pet.level}</span>
              <span>•</span>
              <span className="capitalize">{pet.evolutionStage}</span>
            </div>
            
            {canEvolve() && (
              <button
                onClick={evolvePet}
                className="bg-gradient-to-r from-[#D2691E] to-[#FF8C00] text-white px-6 py-2 rounded-full font-medium mb-2"
              >
                ✨ Evolve to {evolutionReq.stage}!
              </button>
            )}
          </div>          <p className="mb-4" style={{ color: theme.colors.textPrimary }}>{getPetMood()}</p>          {/* Points & Coins Display */}
          <div className="mb-4 p-3 rounded-lg grid grid-cols-2 gap-3" style={{ backgroundColor: theme.colors.borderLight }}>
            <div className="text-center">
              <div className="text-xl font-bold mb-1" style={{ color: theme.colors.primary }}>💰 {pet.points}</div>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Care Points</p>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>(From reading)</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1" style={{ color: '#FFD700' }}>🪙 {pet.coins}</div>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Game Coins</p>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>(From minigames)</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
              <span>Experience</span>
              <span>{pet.experience}/{pet.experienceToNext}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.borderLight }}>
              <div 
                className="h-full bg-gradient-to-r from-[#D2691E] to-[#FF8C00] rounded-full transition-all duration-300"
                style={{ width: `${(pet.experience / pet.experienceToNext) * 100}%` }}
              />
            </div>
          </div>          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={feedPet}
              disabled={pet.points < 3}
              className={`py-3 px-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 ${
                pet.points >= 3
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Apple className="w-6 h-6" />
              <span className="text-sm">Feed</span>
              <span className="text-xs">💰 3 pts</span>
            </button>
            
            <button
              onClick={playWithPet}
              disabled={pet.points < 5}
              className={`py-3 px-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 ${
                pet.points >= 5
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Heart className="w-6 h-6" />
              <span className="text-sm">Play</span>
              <span className="text-xs">💰 5 pts</span>
            </button>
            
            <button
              onClick={petSleep}
              className="py-3 px-4 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors flex flex-col items-center gap-1"
            >
              <Bed className="w-6 h-6" />
              <span className="text-sm">Sleep</span>
              <span className="text-xs">Free</span>
            </button>
          </div>
        </div>        {/* Stats */}
        <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
          <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>Pet Stats</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Happiness</span>
                </div>                <span>{pet.happiness}/100</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.borderLight }}>
                <div 
                  className={`h-full ${getStatColor(pet.happiness)} rounded-full transition-all duration-300`}
                  style={{ width: getStatBarWidth(pet.happiness) }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-green-500" />
                  <span>Hunger</span>
                </div>                <span>{pet.hunger}/100</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.borderLight }}>
                <div 
                  className={`h-full ${getStatColor(pet.hunger)} rounded-full transition-all duration-300`}
                  style={{ width: getStatBarWidth(pet.hunger) }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Energy</span>
                </div>                <span>{pet.energy}/100</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.borderLight }}>
                <div 
                  className={`h-full ${getStatColor(pet.energy)} rounded-full transition-all duration-300`}
                  style={{ width: getStatBarWidth(pet.energy) }}
                />
              </div>
            </div>            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-purple-500" />
                  <span>Health</span>
                </div>
                <span>{pet.health}/100</span>
              </div>
              <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatColor(pet.health)} rounded-full transition-all duration-300`}
                  style={{ width: getStatBarWidth(pet.health) }}
                />
              </div>
            </div>

            {/* Sickness Stat - only show if pet is sick */}
            {pet.sickness > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">🤒</span>
                    <span>Sickness</span>
                  </div>
                  <span className="text-purple-600 font-medium">{Math.round(pet.sickness)}/100</span>
                </div>
                <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: getStatBarWidth(pet.sickness) }}
                  />
                </div>
              </div>
            )}

            {/* Cleanliness Stat */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-500">🧼</span>
                  <span>Cleanliness</span>
                </div>
                <span>{Math.round(pet.cleanliness)}/100</span>
              </div>
              <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatColor(pet.cleanliness)} rounded-full transition-all duration-300`}
                  style={{ width: getStatBarWidth(pet.cleanliness) }}
                />
              </div>
            </div>
          </div>
        </div>        {/* Reading Stats */}
        <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
          <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>Reading Progress</h3>
          
          <div className="grid grid-cols-2 gap-4">            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{pet.totalBooksRead}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{formatTime(pet.totalReadingTime)}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{petStats.booksReadToday}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Today's Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{formatTime(petStats.readingTimeToday)}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Today's Time</div>
            </div>
          </div>
        </div>        {/* Badges */}
        {pet.badges.length > 0 && (
          <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>Achievements</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {pet.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.borderLight }}
                >
                  <div className="text-2xl">{getBadgeEmoji(badge)}</div>
                  <div>
                    <div className="font-medium capitalize text-sm" style={{ color: theme.colors.textPrimary }}>
                      {badge.replace('-', ' ')}
                    </div>
                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      {getBadgeDescription(badge)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Pet */}
        <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
          <h3 className="font-serif text-lg font-medium mb-2" style={{ color: theme.colors.textPrimary }}>Pet Management</h3>
          <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
            Reset your pet to start over with a new companion. This action cannot be undone.
          </p>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Pet
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600 font-medium">Are you sure you want to reset your pet?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetPet}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PetPage;