import React from 'react';
import { Star } from 'lucide-react';
import { cardTypes, rarities } from '../utils/constants';

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

    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl mb-4">Equipment Loadout</h3>
      {Object.entries(ship.equipmentSlots).map(([slotType, maxSlots]) => {
        const equipped = equippedCards[slotType] || [];
        const SlotIcon = cardTypes[slotType]?.icon || Star;
        return (
          <div key={slotType} className="mb-6">
            <h4 className="text-lg mb-2 flex items-center gap-2">
              <SlotIcon className="w-5 h-5" />
              {cardTypes[slotType]?.name} Slots ({equipped.length}/{maxSlots})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: maxSlots }).map((_, slotIndex) => {
                const card = equipped[slotIndex];
                return (
                  <div key={slotIndex} className="relative">
                    {card ? (
                      <div className={`${rarities[card.rarity].color} p-3 rounded-lg text-center relative`}>
                        <SlotIcon className="mx-auto mb-1" size={16} />
                        <div className="text-xs font-bold">{rarities[card.rarity].name}</div>
                        <div className="text-xs">{cardTypes[card.type]?.name}</div>
                        <div className="text-xs mt-1">+{card.equipPower}</div>
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
          </div>
        );
      })}
    </div>

    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl mb-4">Available Cards ({inventory.filter(c => !c.isEquipped).length})</h3>
      {inventory.filter(c => !c.isEquipped).length === 0 ? (
        <div className="text-center text-gray-400 py-8">No cards available. Open some card packs!</div>
      ) : (
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(cardTypes).map(([cardType, cardInfo]) => {
            const cardsOfType = inventory
              .filter(card => !card.isEquipped && card.type === cardType)
              .sort((a, b) => {
                const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
              });
            if (cardsOfType.length === 0) return null;
            const CardIcon = cardInfo.icon || Star;
            const equippedOfType = equippedCards[cardType] || [];
            const maxSlots = ship.equipmentSlots[cardType] || 0;
            return (
              <div key={cardType} className="border-t border-gray-700 pt-4 first:border-t-0 first:pt-0">
                <h4 className="text-lg mb-3 flex items-center gap-2">
                  <CardIcon className="w-5 h-5" />
                  {cardInfo.name}s ({cardsOfType.length})
                  <span className="text-sm text-gray-400">- {equippedOfType.length}/{maxSlots} equipped</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {cardsOfType.map(card => {
                    const canEquip = equippedOfType.length < maxSlots;
                    return (
                      <div key={card.id} className={`${rarities[card.rarity].color} p-3 rounded-lg text-center text-xs relative`}>
                        <CardIcon className="mx-auto mb-1" size={16} />
                        <div className="font-bold">{rarities[card.rarity].name}</div>
                        <div>{cardInfo.name}</div>
                        <div className="mt-1">
                          <div>Equip: +{card.equipPower}</div>
                          <div>Use: +{card.consumePower}</div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {canEquip ? (
                            <button onClick={() => equipCard(card.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">Equip</button>
                          ) : (
                            <div className="text-xs text-gray-400 mb-1">Slots full</div>
                          )}
                          <button onClick={() => consumeCard(card.id)} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">Use</button>
                        </div>
                        <div className="text-xs mt-1 text-gray-200">
                          <div>⚙️ {cardInfo.equipEffect}</div>
                          <div>💊 {cardInfo.consumeEffect}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

export default InventoryPhase;
