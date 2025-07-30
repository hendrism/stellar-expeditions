// Each event has a small chance weight and a list of effects which are applied
// when the event is triggered. Positive numbers represent gains while negative
// numbers represent losses. Chance is relative and defaults to `1` when not
// specified.
export const randomEvents = [
  {
    id: 'solar_storm',
    text: 'Solar storm damages the ship',
    effects: { fuel: -3 },
    chance: 1,
  },
  {
    id: 'pirate_raid',
    text: 'Pirate raid steals supplies',
    effects: { food: -2 },
    chance: 1,
  },
  {
    id: 'space_cache',
    text: 'Found an abandoned supply cache',
    effects: { scrap: 4 },
    chance: 1,
  },
  {
    id: 'ancient_artifact',
    text: 'Studied an ancient artifact',
    effects: { data: 2 },
    chance: 1,
  },
  {
    id: 'hull_breach',
    text: 'Hull breach causes loss of fuel and food',
    effects: { fuel: -2, food: -2 },
    chance: 0.5,
  },
  {
    id: 'friendly_traders',
    text: 'Friendly traders share resources',
    effects: { fuel: 3, food: 3 },
    chance: 0.5,
  },
  {
    id: 'energy_flux',
    text: 'Energy flux supercharges systems',
    effects: { energy: 5 },
    chance: 0.75,
  },
  {
    id: 'smuggler_cache',
    text: "Discovered a smuggler's hidden stash",
    effects: { credits: 50 },
    chance: 0.5,
  },
];

// Select a random event using the chance weights
export function pickRandomEvent() {
  const total = randomEvents.reduce((sum, e) => sum + (e.chance ?? 1), 0);
  let roll = Math.random() * total;
  for (const event of randomEvents) {
    roll -= event.chance ?? 1;
    if (roll <= 0) {
      return event;
    }
  }
  // Fallback in the unlikely case rounding leaves roll > 0
  return randomEvents[randomEvents.length - 1];
}
