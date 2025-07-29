export const rarities = {
  common: { name: 'Common', color: 'bg-gray-500', chance: 60 },
  uncommon: { name: 'Uncommon', color: 'bg-green-500', chance: 25 },
  rare: { name: 'Rare', color: 'bg-blue-500', chance: 10 },
  epic: { name: 'Epic', color: 'bg-purple-500', chance: 4 },
  legendary: { name: 'Legendary', color: 'bg-yellow-500', chance: 1 }
};

export const cardTypes = {
  weapon: {
    name: 'Weapon',
    icon: require('lucide-react').Sword,
    category: 'fighter',
    equipEffect: 'Reduces food cost in Fighter actions',
    consumeEffect: 'Guarantees next Fighter action succeeds'
  },
  scanner: {
    name: 'Scanner',
    icon: require('lucide-react').Search,
    category: 'explorer',
    equipEffect: 'Increases Explorer action success rate',
    consumeEffect: 'Reveals exact success chances for all actions'
  },
  habitat: {
    name: 'Habitat Module',
    icon: require('lucide-react').Globe,
    category: 'settler',
    equipEffect: 'Increases Settler action rewards',
    consumeEffect: 'Restores food supplies'
  },
  engine: {
    name: 'Engine',
    icon: require('lucide-react').Zap,
    category: 'all',
    equipEffect: 'Reduces fuel costs for all actions',
    consumeEffect: 'Restores fuel supplies'
  },
  shield: {
    name: 'Shield',
    icon: require('lucide-react').Star,
    category: 'all',
    equipEffect: 'Reduces penalties from failed actions',
    consumeEffect: 'Prevents failure penalty on next action'
  }
};

export const actionTemplates = {
  explorer: [
    { name: 'Scan Nebula', description: 'Chart unknown stellar phenomena' },
    { name: 'Investigate Asteroid Field', description: 'Search for valuable minerals' },
    { name: 'Map Star System', description: 'Create detailed navigation charts' },
    { name: 'Deep Space Probe', description: 'Launch long-range reconnaissance' },
    { name: 'Explore Derelict Ship', description: 'Board abandoned vessel' },
    { name: 'Survey Planet', description: 'Conduct planetary analysis' },
    { name: 'Track Energy Signature', description: 'Follow mysterious signals' },
    { name: 'Chart Wormhole', description: 'Map unstable space-time rifts' }
  ],
  fighter: [
    { name: 'Pirate Convoy', description: 'Intercept raiding vessels' },
    { name: 'Defend Station', description: 'Protect civilian outpost' },
    { name: 'Bounty Hunt', description: 'Track dangerous fugitive' },
    { name: 'Escort Mission', description: 'Guard merchant vessel' },
    { name: 'Mercenary Work', description: 'Accept combat contract' },
    { name: 'Clear Space Lanes', description: 'Eliminate hostile forces' },
    { name: 'Rescue Operation', description: 'Extract trapped personnel' },
    { name: 'Patrol Sector', description: 'Maintain peace and order' }
  ],
  settler: [
    { name: 'Establish Outpost', description: 'Build new settlement' },
    { name: 'Trading Post', description: 'Create commercial hub' },
    { name: 'Mining Operation', description: 'Set up resource extraction' },
    { name: 'Diplomatic Mission', description: 'Negotiate with locals' },
    { name: 'Colony Support', description: 'Aid struggling settlement' },
    { name: 'Terraforming Project', description: 'Prepare planet for habitation' },
    { name: 'Research Station', description: 'Establish scientific facility' },
    { name: 'Cultural Exchange', description: 'Build relations with aliens' }
  ]
};

export const riskLevels = {
  low: { name: 'Safe', color: 'text-green-400', multiplier: 0.7, successChance: 0.85 },
  medium: { name: 'Risky', color: 'text-yellow-400', multiplier: 1.0, successChance: 0.65 },
  high: { name: 'Dangerous', color: 'text-red-400', multiplier: 1.5, successChance: 0.45 }
};

export const getCardPower = (rarity) => {
  switch (rarity) {
    case 'common':
      return { equip: 5, consume: 1 };
    case 'uncommon':
      return { equip: 10, consume: 2 };
    case 'rare':
      return { equip: 15, consume: 3 };
    case 'epic':
      return { equip: 25, consume: 4 };
    case 'legendary':
      return { equip: 40, consume: 5 };
    default:
      return { equip: 5, consume: 1 };
  }
};
