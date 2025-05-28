import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Zap, Apple, Bed, RefreshCw, Edit3 } from 'lucide-react';
import { usePet } from '../context/PetContext';

const PetPage: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F3]">
      <header className="p-4 bg-[#F7F5F3] border-b border-[#E8E3DD]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#8B7355]" />
          </button>
          <h1 className="font-serif text-xl font-medium text-[#3A3A3A]">My Reading Pet</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Pet Display */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-8xl mb-4">{getPetEmoji()}</div>
          
          <div className="mb-4">
            {isRenaming ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-2xl font-serif font-medium bg-[#F0EDE8] rounded px-3 py-1 border text-center"
                  onBlur={handleRename}
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-serif font-medium text-[#3A3A3A]">{pet.name}</h2>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="p-1 text-[#8B7355] hover:bg-[#F0EDE8] rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-lg text-[#8B7355] mb-2">
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
          </div>

          <p className="text-[#3A3A3A] mb-4">{getPetMood()}</p>

          {/* Points Display */}
          <div className="mb-4 p-3 bg-[#F0EDE8] rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D2691E] mb-1">💰 {pet.points}</div>
              <p className="text-sm text-[#8B7355]">Care Points (Earned from reading)</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-[#8B7355] mb-2">
              <span>Experience</span>
              <span>{pet.experience}/{pet.experienceToNext}</span>
            </div>
            <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
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
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-4">Pet Stats</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Happiness</span>
                </div>
                <span>{pet.happiness}/100</span>
              </div>
              <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
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
                </div>
                <span>{pet.hunger}/100</span>
              </div>
              <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
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
                </div>
                <span>{pet.energy}/100</span>
              </div>
              <div className="h-3 bg-[#F0EDE8] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatColor(pet.energy)} rounded-full transition-all duration-300`}
                  style={{ width: getStatBarWidth(pet.energy) }}
                />
              </div>
            </div>

            <div>
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
          </div>
        </div>

        {/* Reading Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-4">Reading Progress</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D2691E]">{pet.totalBooksRead}</div>
              <div className="text-sm text-[#8B7355]">Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D2691E]">{formatTime(pet.totalReadingTime)}</div>
              <div className="text-sm text-[#8B7355]">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D2691E]">{petStats.booksReadToday}</div>
              <div className="text-sm text-[#8B7355]">Today's Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D2691E]">{formatTime(petStats.readingTimeToday)}</div>
              <div className="text-sm text-[#8B7355]">Today's Time</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {pet.badges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-4">Achievements</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {pet.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[#F0EDE8] rounded-lg"
                >
                  <div className="text-2xl">{getBadgeEmoji(badge)}</div>
                  <div>
                    <div className="font-medium text-[#3A3A3A] capitalize text-sm">
                      {badge.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-[#8B7355]">
                      {getBadgeDescription(badge)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Pet */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-serif text-lg font-medium text-[#3A3A3A] mb-2">Pet Management</h3>
          <p className="text-sm text-[#8B7355] mb-4">
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