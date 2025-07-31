import React from 'react';
import { Star } from 'lucide-react';
import { cardTypes, rarities } from '../utils/constants';

const PacksPhase = ({ inventory, credits, setGamePhase, openPack }) => {
  const recent = inventory.slice(-20);
  const grouped = Object.values(
    recent.reduce((acc, card) => {
      const key = `${card.type}-${card.rarity}-${card.equipPower}-${card.consumePower}-${card.isEquipped}`;
      if (!acc[key]) acc[key] = { ...card, count: 0 };
      acc[key].count++;
      return acc;
    }, {})
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Card Packs</h2>
        <button onClick={() => setGamePhase('menu')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">
          Back to Menu
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl mb-4">Standard Pack</h3>
        <p className="mb-4">5 random cards - 50 Credits</p>
        <button onClick={openPack} disabled={credits < 50} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg transition-colors">
          Open Pack
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl mb-4">Recent Cards ({inventory.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
          {grouped.map(card => {
            const CardIcon = cardTypes[card.type]?.icon || Star;
            return (
              <div key={`${card.type}-${card.rarity}-${card.equipPower}-${card.consumePower}-${card.count}`} className={`${rarities[card.rarity].color} p-3 rounded-lg text-center text-xs relative`}>
                <CardIcon className="mx-auto mb-1" size={16} />
                <div className="font-bold">{rarities[card.rarity].name}</div>
                <div>{cardTypes[card.type]?.name}</div>
                <div className="mt-1 flex justify-center gap-2">
                  <div>⚙️+{card.equipPower}</div>
                  <div>💊+{card.consumePower}</div>
                </div>
                {card.count > 1 && (
                  <div className="absolute top-1 left-1 bg-gray-900 text-white text-xs px-1 py-0.5 rounded">x{card.count}</div>
                )}
                {card.isEquipped && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">⚙️</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PacksPhase;
