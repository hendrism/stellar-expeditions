import React from 'react';
import { Star } from 'lucide-react';
import { cardTypes, rarities } from '../utils/constants';

// Order to display rarity counts
const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

const InventoryPhase = ({
  ship,
  equippedCards,
  inventory,
  goBackFromInventory,
  previousPhase,
  equipCard,
  unequipCard,
  consumeCard
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl">Equipment & Inventory</h2>
      <button onClick={goBackFromInventory} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">
        {previousPhase === 'run' ? 'Back to Mission' : 'Back to Menu'}
      </button>
    </div>
    <div className="bg-gray-800 rounded-lg p-6 space-y-8">
      <h3 className="text-xl mb-4">Equipment Loadout</h3>
      {Object.entries(ship.equipmentSlots).map(([slotType, maxSlots]) => {
        const equipped = equippedCards[slotType] || [];
        const SlotIcon = cardTypes[slotType]?.icon || Star;
        const cardInfo = cardTypes[slotType];
        const availableCards = inventory
          .filter(card => !card.isEquipped && card.type === slotType)
          .sort((a, b) => {
            const order = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
            return order[b.rarity] - order[a.rarity];
          });
        const groupedCards = Object.values(
          availableCards.reduce((acc, card) => {
            const key = `${card.type}-${card.rarity}-${card.equipPower}-${card.consumePower}`;
            if (!acc[key]) acc[key] = { ...card, ids: [], count: 0 };
            acc[key].ids.push(card.id);
            acc[key].count++;
            return acc;
          }, {})
        );
        const rarityCounts = availableCards.reduce((acc, card) => {
          acc[card.rarity] = (acc[card.rarity] || 0) + 1;
          return acc;
        }, {});
        const raritySummary = rarityOrder
          .map(r => (rarityCounts[r] ? `${rarityCounts[r]} ${rarities[r].name}` : null))
          .filter(Boolean)
          .join(', ');
        return (
          <div key={slotType} className="mb-6">
            <h4 className="text-lg flex items-center gap-2 mb-2">
              <SlotIcon className="w-5 h-5" />
              {cardInfo?.name} Slots ({equipped.length}/{maxSlots})
            </h4>
            {raritySummary && (
              <div className="text-sm text-gray-400 mb-2">Available: {raritySummary}</div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Array.from({ length: maxSlots }).map((_, slotIndex) => {
                const card = equipped[slotIndex];
                return (
                  <div key={slotIndex} className="relative">
                    {card ? (
                      <div className={`${rarities[card.rarity].color} p-3 rounded-lg text-center relative shadow-md hover:shadow-xl transform hover:scale-105 transition-transform`}>
                        <SlotIcon className="mx-auto mb-1" size={16} />
                        <div className="text-xs font-bold">{rarities[card.rarity].name}</div>
                        <div className="text-xs">{cardTypes[card.type]?.name}</div>
                        <div className="text-xs mt-1 text-left">⚙️ {cardInfo?.equipEffect} (+{card.equipPower})</div>
                        <button onClick={() => unequipCard(card.id)} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-1 py-0.5 rounded">✕</button>
                      </div>
                    ) : (
                      <div className="bg-gray-700 border-2 border-dashed border-gray-600 p-3 rounded-lg flex items-center justify-center min-h-20">
                        <span className="text-gray-500 text-xs">Empty</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {groupedCards.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {groupedCards.map(card => {
                  const canEquip = equipped.length < maxSlots;
                  const id = card.ids[0];
                  return (
                    <div key={id} className={`${rarities[card.rarity].color} p-3 rounded-lg text-center text-xs relative shadow-md hover:shadow-xl transform hover:scale-105 transition-transform`}>
                      <SlotIcon className="mx-auto mb-1" size={16} />
                      <div className="font-bold">{rarities[card.rarity].name}</div>
                      <div>{cardInfo?.name}</div>
                      <div className="mt-1 text-left">
                        <div>⚙️ {cardInfo?.equipEffect} (+{card.equipPower})</div>
                        <div>💊 {cardInfo?.consumeEffect} (+{card.consumePower})</div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {canEquip ? (
                          <button onClick={() => equipCard(id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">Equip</button>
                        ) : (
                          <div className="text-xs text-gray-400 mb-1">Slots full</div>
                        )}
                        <button onClick={() => consumeCard(id)} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">Use</button>
                      </div>
                      {card.count > 1 && (
                        <div className="absolute top-1 left-1 bg-gray-900 text-white text-xs px-1 py-0.5 rounded">x{card.count}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">No available cards</div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default InventoryPhase;
