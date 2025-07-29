import React from 'react';

const UpgradePhase = ({ skills, prestigePoints, upgradeSkill, ship, scrap, energy, upgradeShip, setGamePhase }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl">Upgrades</h2>
      <button onClick={() => setGamePhase('menu')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">
        Back to Menu
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl mb-4">Skill Upgrades (Prestige Points)</h3>
        <div className="space-y-3">
          {Object.entries(skills).map(([skill, level]) => (
            <div key={skill} className="flex justify-between items-center">
              <span className="capitalize">{skill} (Level {level})</span>
              <button onClick={() => upgradeSkill(skill)} disabled={prestigePoints < level * 10} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm">
                Upgrade ({level * 10} PP)
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl mb-4">Ship Upgrades</h3>
        <div className="space-y-3">
          <div>Current: {ship.name} (Level {ship.level})</div>
          <div className="text-sm text-gray-400">
            Next upgrade: +1 all stats
            {(ship.level + 1) % 2 === 0 && ' +1 weapon slot'}
            {(ship.level + 1) % 3 === 0 && ' +1 scanner slot'}
            {(ship.level + 1) % 4 === 0 && ' +1 engine slot'}
            {(ship.level + 1) % 3 === 1 && ' +1 habitat slot'}
            {(ship.level + 1) % 5 === 0 && ' +1 shield slot'}
          </div>
          <div className="text-sm text-gray-400">Cost: {ship.level * 20} Scrap, {ship.level * 10} Energy</div>
          <button onClick={upgradeShip} disabled={scrap < ship.level * 20 || energy < ship.level * 10} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded">
            Upgrade Ship
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default UpgradePhase;
