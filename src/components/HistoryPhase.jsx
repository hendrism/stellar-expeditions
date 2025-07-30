import React from 'react';

const HistoryPhase = ({ missionHistory, setGamePhase }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl">Mission History</h2>
      <button onClick={() => setGamePhase('menu')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">
        Back to Menu
      </button>
    </div>
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl mb-4">Completed Missions ({missionHistory.length})</h3>
      {missionHistory.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No missions completed yet. Launch your first mission!</div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {missionHistory.map(mission => (
            <div
              key={mission.id}
              className={`p-4 rounded-lg border-2 ${
                mission.status === 'Success'
                  ? 'bg-green-900 border-green-600'
                  : mission.status === 'Partial Success'
                  ? 'bg-yellow-900 border-yellow-600'
                  : 'bg-red-900 border-red-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg">Mission #{mission.id}</h4>
                  <p className="text-sm text-gray-400">{mission.date}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-sm ${
                    mission.status === 'Success'
                      ? 'bg-green-700 text-green-200'
                      : mission.status === 'Partial Success'
                      ? 'bg-yellow-700 text-yellow-200'
                      : 'bg-red-700 text-red-200'
                  }`}
                >
                  {mission.status}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <div className="font-bold">{mission.turns} turns</div>
                </div>
                <div>
                  <span className="text-gray-400">Prestige:</span>
                  <div className="font-bold text-purple-400">+{mission.gains.prestige}</div>
                </div>
                <div>
                  <span className="text-gray-400">Resources:</span>
                  <div className="font-bold">+{mission.gains.scrap} scrap, +{mission.gains.energy} energy, +{mission.gains.data} data</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default HistoryPhase;
