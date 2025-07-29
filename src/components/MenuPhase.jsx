import React from 'react';
import { Package, RotateCcw } from 'lucide-react';

const MenuPhase = ({
  runNumber,
  startRun,
  setGamePhase,
  goToInventory,
  inventory,
  missionHistory,
  ship,
  equippedCards,
  skills,
  galaxiesExplored,
  planetsSettled,
  battlesWon,
  prestigePoints,
  prestige
}) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl mb-4">Command Center - Run #{runNumber}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button onClick={startRun} className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors">
          🚀 Launch Mission
        </button>
        <button onClick={() => setGamePhase('packs')} className="bg-green-600 hover:bg-green-700 p-4 rounded-lg transition-colors">
          <Package className="inline mr-2" size={20} />
          Card Packs
        </button>
        <button onClick={() => goToInventory('menu')} className="bg-orange-600 hover:bg-orange-700 p-4 rounded-lg transition-colors">
          🎒 Inventory ({inventory.length})
        </button>
        <button onClick={() => setGamePhase('history')} className="bg-cyan-600 hover:bg-cyan-700 p-4 rounded-lg transition-colors">
          📜 Mission History ({missionHistory.length})
        </button>
        <button onClick={() => setGamePhase('upgrade')} className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg transition-colors">
          ⬆️ Upgrades
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl mb-3">Ship Status</h3>
        <div className="space-y-2">
          <div><strong>{ship.name}</strong> (Level {ship.level})</div>
          <div>Fuel Efficiency: {ship.fuelEfficiency} | Weapons: {ship.weapons} | Cargo: {ship.cargo}</div>
          <div className="text-sm">
            Equipment Slots:
            ⚔️{Object.values(equippedCards.weapon).length}/{ship.equipmentSlots.weapon}
            🔍{Object.values(equippedCards.scanner).length}/{ship.equipmentSlots.scanner}
            ⚡{Object.values(equippedCards.engine).length}/{ship.equipmentSlots.engine}
            🏠{Object.values(equippedCards.habitat).length}/{ship.equipmentSlots.habitat}
            🛡️{Object.values(equippedCards.shield).length}/{ship.equipmentSlots.shield}
          </div>
          <div className="text-sm text-gray-400">Next mission: {20 + ship.level * 3} fuel, {15 + ship.level * 2} food</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl mb-3">Skills</h3>
        <div className="space-y-2">
          <div>🔍 Explorer: Level {skills.explorer}</div>
          <div>⚔️ Fighter: Level {skills.fighter}</div>
          <div>🏛️ Settler: Level {skills.settler}</div>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl mb-3">Career Statistics</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl">{galaxiesExplored}</div>
          <div className="text-sm text-gray-400">Galaxies Explored</div>
        </div>
        <div>
          <div className="text-2xl">{planetsSettled}</div>
          <div className="text-sm text-gray-400">Planets Settled</div>
        </div>
        <div>
          <div className="text-2xl">{battlesWon}</div>
          <div className="text-sm text-gray-400">Battles Won</div>
        </div>
      </div>
    </div>

    {prestigePoints >= 50 && (
      <div className="bg-purple-800 rounded-lg p-6">
        <button onClick={prestige} className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg transition-colors flex items-center gap-2">
          <RotateCcw size={20} />
          Prestige Reset (Unlock permanent bonuses)
        </button>
      </div>
    )}
  </div>
);

export default MenuPhase;
