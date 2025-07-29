export const achievementDefinitions = [
  {
    id: 'galaxy_discovered',
    name: 'Galactic Explorer',
    condition: state => state.galaxiesExplored > 1,
  },
  {
    id: 'battle_won',
    name: 'Battle Hardened',
    condition: state => state.battlesWon > 0,
  },
  {
    id: 'planet_settled',
    name: 'Colonizer',
    condition: state => state.planetsSettled > 0,
  },
  {
    id: 'credits_500',
    name: 'Wealthy Captain',
    condition: state => state.credits >= 500,
  },
];
