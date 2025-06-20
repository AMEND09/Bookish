import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Star, Lock, Info } from 'lucide-react';
import { usePet } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';
import { ShopItem } from '../context/PetContext';

const PetShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    pet,
    getShopItems,
    getUnlockedItems,
    buyItem,
    useItem
  } = usePet();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  const allItems = getShopItems();
  const unlockedItems = getUnlockedItems();

  const categories = [
    { id: 'all', name: 'All Items', emoji: '🛍️' },
    { id: 'food', name: 'Food', emoji: '🍖' },
    { id: 'toy', name: 'Toys', emoji: '⚽' },
    { id: 'medicine', name: 'Medicine', emoji: '💊' },
    { id: 'decoration', name: 'Care', emoji: '🧼' },
    { id: 'special', name: 'Special', emoji: '✨' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? unlockedItems 
    : unlockedItems.filter(item => item.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-200';
      case 'rare': return 'border-blue-200';
      case 'epic': return 'border-purple-200';
      case 'legendary': return 'border-yellow-200';
      default: return 'border-gray-200';
    }
  };

  const handleBuyItem = (itemId: string) => {
    const success = buyItem(itemId);
    if (success) {
      // Could show success toast here
    } else {
      // Could show error toast here
    }
  };

  const handleUseItem = (itemId: string) => {
    const success = useItem(itemId);
    if (success) {
      // Could show success toast here
    } else {
      // Could show error toast here
    }
  };

  const getEffectText = (effect: ShopItem['effect']) => {
    const effects: string[] = [];
    if (effect.hunger) effects.push(`Hunger +${effect.hunger}`);
    if (effect.happiness) effects.push(`Happiness +${effect.happiness}`);
    if (effect.energy) effects.push(`Energy ${effect.energy > 0 ? '+' : ''}${effect.energy}`);
    if (effect.health) effects.push(`Health +${effect.health}`);
    if (effect.cleanliness) effects.push(`Cleanliness +${effect.cleanliness}`);
    if (effect.sickness) effects.push(`Sickness ${effect.sickness}`);
    if (effect.experience) effects.push(`Experience +${effect.experience}`);
    return effects.join(', ');
  };

  const getInventoryCount = (itemId: string) => {
    const item = pet.inventory.find(i => i.id === itemId);
    return item?.quantity || 0;
  };

  return (
    <div className="max-w-md mx-auto min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <header className="p-4" style={{ backgroundColor: theme.colors.background, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.borderLight }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </button>
            <h1 className="font-serif text-xl font-medium" style={{ color: theme.colors.textPrimary }}>Pet Shop</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.borderLight }}>
              <span className="text-lg">💰</span>
              <span className="font-medium" style={{ color: theme.colors.primary }}>{pet.points}</span>
            </div>
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.borderLight }}
            >
              <Package className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </button>
          </div>
        </div>
      </header>

      {!pet.isAlive && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💀</span>
            <div>
              <h3 className="font-medium text-red-800">Pet Has Passed Away</h3>
              <p className="text-sm text-red-600">You can only buy Phoenix Feather to revive your pet</p>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#D2691E] to-[#FF8C00] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                ...(selectedCategory !== category.id && {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`
                })
              }}
            >
              <span className="mr-2">{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Inventory Panel */}
        {showInventory && (
          <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>Your Inventory</h3>
            {pet.inventory.length === 0 ? (
              <p className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
                No items in inventory. Buy some items from the shop!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {pet.inventory.map((item, index) => (
                  <div
                    key={index}
                    className={`relative p-3 rounded-lg border-2 ${getRarityBorder(item.rarity)}`}
                    style={{ backgroundColor: theme.colors.borderLight }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <h4 className="font-medium text-sm mb-1" style={{ color: theme.colors.textPrimary }}>{item.name}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                        <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                          x{item.quantity || 1}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUseItem(item.id)}
                        disabled={!pet.isAlive && item.id !== 'phoenix_feather'}
                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          pet.isAlive || item.id === 'phoenix_feather'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shop Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
              <p style={{ color: theme.colors.textSecondary }}>No items available in this category</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map(item => {
                const inventoryCount = getInventoryCount(item.id);
                const canAfford = pet.points >= item.price;
                const canBuy = canAfford && (pet.isAlive || item.id === 'phoenix_feather');
                
                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-xl border-2 ${getRarityBorder(item.rarity)} transition-all hover:shadow-md`}
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{item.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-serif text-lg font-medium" style={{ color: theme.colors.textPrimary }}>
                              {item.name}
                            </h3>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${getRarityColor(item.rarity)}`}>
                              <Star className="w-3 h-3 inline mr-1" />
                              {item.rarity}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold" style={{ color: theme.colors.primary }}>
                              <span>💰</span>
                              <span>{item.price}</span>
                            </div>
                            {inventoryCount > 0 && (
                              <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Owned: {inventoryCount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>
                          {item.description}
                        </p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>Effects:</p>
                          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {getEffectText(item.effect)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBuyItem(item.id)}
                            disabled={!canBuy}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                              canBuy
                                ? 'bg-gradient-to-r from-[#D2691E] to-[#FF8C00] text-white hover:opacity-90'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4 inline mr-2" />
                            {!canAfford ? 'Not enough points' : !pet.isAlive && item.id !== 'phoenix_feather' ? 'Pet must be alive' : 'Buy'}
                          </button>
                          
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            style={{ backgroundColor: theme.colors.borderLight }}
                          >
                            <Info className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Locked Items Preview */}
        {allItems.length > unlockedItems.length && (
          <div className="rounded-xl shadow-sm p-4" style={{ backgroundColor: theme.colors.surface }}>
            <h3 className="font-serif text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
              <Lock className="w-5 h-5 inline mr-2" />
              Locked Items
            </h3>
            <div className="grid gap-3">
              {allItems
                .filter(item => !unlockedItems.find(u => u.id === item.id))
                .slice(0, 3)
                .map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg opacity-60"
                  style={{ backgroundColor: theme.colors.borderLight }}
                >
                  <div className="text-2xl grayscale">{item.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>{item.name}</h4>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      {item.unlockRequirement?.level && `Requires Level ${item.unlockRequirement.level}`}
                      {item.unlockRequirement?.books && ` • ${item.unlockRequirement.books} books read`}
                    </p>
                  </div>
                  <Lock className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" style={{ backgroundColor: theme.colors.surface }}>
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{selectedItem.emoji}</div>
              <h3 className="font-serif text-xl font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                {selectedItem.name}
              </h3>
              <span className={`inline-block text-sm px-3 py-1 rounded-full ${getRarityColor(selectedItem.rarity)}`}>
                <Star className="w-4 h-4 inline mr-1" />
                {selectedItem.rarity.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {selectedItem.description}
              </p>
              
              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: theme.colors.textPrimary }}>Effects:</h4>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {getEffectText(selectedItem.effect)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                  💰 {selectedItem.price} points
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: theme.colors.borderLight,
                color: theme.colors.textPrimary
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetShopPage;
