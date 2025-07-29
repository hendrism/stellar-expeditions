import React from 'react';
import { Fuel, Apple, Search, Sword, Globe } from 'lucide-react';

const RunPhase = ({
  runNumber,
  turn,
  endRun,
  fuel,
  maxFuel,
  food,
  maxFood,
  goToInventory,
  currentActions,
  riskLevels,
  takeAction,
  scrap,
  showStuckPopup,
  setShowStuckPopup,
  inventory,
  missionLog,
  scannerRevealTurns,
  showMissionSummary,
  missionSummaryData,
  confirmMissionEnd
}) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Mission #{runNumber} - Turn {turn}</h2>
        <button onClick={endRun} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
          End Mission
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Fuel className="w-4 h-4 text-orange-400" />
            <span>Fuel: {fuel}/{maxFuel}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-orange-400 h-2 rounded-full transition-all duration-300" style={{ width: `${(fuel / maxFuel) * 100}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Apple className="w-4 h-4 text-green-400" />
            <span>Food: {food}/{maxFood}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full transition-all duration-300" style={{ width: `${(food / maxFood) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl">Choose Your Action</h3>
        <button onClick={() => goToInventory('run')} className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm">
          🎒 Use Items
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentActions.map(action => {
          const canAfford = fuel >= action.costs.fuel && food >= action.costs.food && scrap >= action.costs.scrap;
          const risk = riskLevels[action.risk];
          const skillIcons = { explorer: Search, fighter: Sword, settler: Globe };
          const ActionIcon = skillIcons[action.skillType];
          return (
            <button
              key={action.id}
              onClick={() => takeAction(action)}
              disabled={!canAfford}
              className={`p-4 rounded-lg transition-colors text-left ${canAfford ? 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-gray-500' : 'bg-gray-800 border-2 border-gray-700 opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ActionIcon className="w-5 h-5" />
                <span className="font-bold text-lg">{action.template.name}</span>
                <span className={`text-sm ${risk.color} ml-auto`}>({risk.name})</span>
              </div>
              <div className="text-sm text-gray-300 mb-3">{action.template.description}</div>
              <div className="text-xs space-y-1">
                <div className="text-red-300">
                  Costs: {action.costs.fuel} fuel, {action.costs.food} food{action.costs.scrap > 0 && `, ${action.costs.scrap} scrap`}
                </div>
                <div className="text-green-300">
                  Rewards: {action.rewards.credits} credits{action.rewards.data > 0 && `, ${action.rewards.data} data`}
                  {action.rewards.scrap > 0 && `, ${action.rewards.scrap} scrap`}
                </div>
                <div className="text-gray-400">
                  Success chance: {scannerRevealTurns > 0 ? (action.successChance * 100).toFixed(1) : Math.floor(action.successChance * 100)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {currentActions.length === 0 && <div className="text-center text-gray-400 py-8">Generating new opportunities...</div>}
    </div>

    {showStuckPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 border-2 border-red-600 rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Insufficient Resources</h3>
          <p className="text-gray-300 mb-6">
            You don't have enough resources to take any of the available actions. You can either end the mission now or use items to restore resources.
          </p>
          <div className="flex gap-3">
            <button onClick={endRun} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">End Mission</button>
            <button
              onClick={() => {
                setShowStuckPopup(false);
                goToInventory('run');
              }}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
            >
              Use Items ({inventory.filter(c => !c.isEquipped).length})
            </button>
            <button onClick={() => setShowStuckPopup(false)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    )}

    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg mb-2">Mission Log</h3>
      <div id="mission-log" className="space-y-1 text-sm max-h-32 overflow-y-auto">
        {missionLog.map((log, index) => (
          <div key={index} className="text-gray-300">
            {log}
          </div>
        ))}
      </div>
    </div>

    {showMissionSummary && missionSummaryData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`rounded-lg p-6 max-w-md mx-4 border-2 ${missionSummaryData.status === 'Mission Complete' ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>\
          <h3 className="text-2xl font-bold mb-4 text-center">
            {missionSummaryData.status === 'Mission Complete' ? '🎉 Mission Complete!' : '⚠️ Mission Ended'}
          </h3>
          <div className="space-y-3 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold">Mission #{missionSummaryData.runNumber}</div>
              <div className="text-gray-300">Completed in {missionSummaryData.turns} turns</div>
            </div>
            <div className="bg-gray-800 rounded p-4">
              <h4 className="font-bold mb-2">Rewards Earned:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-purple-400">Prestige:</span>
                  <span className="float-right font-bold">+{missionSummaryData.gains.prestige}</span>
                </div>
                <div>
                  <span className="text-gray-400">Scrap:</span>
                  <span className="float-right font-bold">+{missionSummaryData.gains.scrap}</span>
                </div>
                <div>
                  <span className="text-blue-400">Energy:</span>
                  <span className="float-right font-bold">+{missionSummaryData.gains.energy}</span>
                </div>
                <div>
                  <span className="text-green-400">Data:</span>
                  <span className="float-right font-bold">+{missionSummaryData.gains.data}</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={confirmMissionEnd} className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${missionSummaryData.status === 'Mission Complete' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Continue</button>
        </div>
      </div>
    )}
  </div>
);

export default RunPhase;
