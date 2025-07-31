import React, { useState, useEffect, useMemo } from 'react';
import { Rocket, Coins, Wrench, Trophy } from 'lucide-react';
import {
  rarities,
  cardTypes,
  actionTemplates,
  riskLevels,
  getCardPower,
} from './utils/constants';
import { pickRandomEvent } from './utils/events';
import { achievementDefinitions } from './utils/achievements';
import Notification from './components/Notification';
import MenuPhase from './components/MenuPhase';
import RunPhase from './components/RunPhase';
import HistoryPhase from './components/HistoryPhase';
import InventoryPhase from './components/InventoryPhase';
import PacksPhase from './components/PacksPhase';
import UpgradePhase from './components/UpgradePhase';

// Static collections used throughout the game. Defining them once outside the
// component avoids recreating these objects/arrays on every render or function
// call, reducing unnecessary allocations.
const SKILL_TYPES = ['explorer', 'fighter', 'settler'];
const RISK_OPTIONS = ['low', 'high'];
const BASE_COSTS = {
  explorer: { fuel: 3, food: 1, scrap: 0 },
  fighter: { fuel: 2, food: 3, scrap: 0 },
  settler: { fuel: 4, food: 3, scrap: 5 },
};
const BASE_REWARDS = {
  explorer: { credits: 12, data: 2, scrap: 0 },
  fighter: { credits: 18, data: 0, scrap: 3 },
  settler: { credits: 25, data: 0, scrap: 0 },
};
const CARD_TYPE_KEYS = Object.keys(cardTypes);

// Pre-compute cumulative rarity thresholds for faster random card generation
// without recalculating the distribution each time.
const RARITY_THRESHOLDS = (() => {
  let cumulative = 0;
  return Object.entries(rarities).map(([key, value]) => {
    cumulative += value.chance;
    return [key, cumulative];
  });
})();

const SpaceCardGame = () => {
  // Game state
  const [gamePhase, setGamePhase] = useState('menu'); // menu, run, packs, upgrade, inventory
  const [previousPhase, setPreviousPhase] = useState('menu'); // Track where we came from
  const [turn, setTurn] = useState(0);
  
  // Notification system
  const [notification, setNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  
  // Mission and persistent resources
  const [resources, setResources] = useState({
    fuel: 20,
    food: 15,
    credits: 100,
    scrap: 0,
    energy: 0,
    data: 0,
    prestige: 0,
  });
  const [maxFuel, setMaxFuel] = useState(20);
  const [maxFood, setMaxFood] = useState(15);

  const getResource = (key) => resources[key] ?? 0;
  const adjustResource = (key, amount) => {
    setResources(prev => {
      const max = key === 'fuel' ? maxFuel : key === 'food' ? maxFood : undefined;
      let value = (prev[key] ?? 0) + amount;
      if (max !== undefined) value = Math.min(max, value);
      return { ...prev, [key]: Math.max(0, value) };
    });
  };
  
  // Skills
  const [skills, setSkills] = useState({
    explorer: 1,
    fighter: 1,
    settler: 1
  });
  
  // Inventory and ship
  const [inventory, setInventory] = useState([]);
  const [equippedCards, setEquippedCards] = useState({
    weapon: [],
    scanner: [],
    engine: [],
    habitat: [],
    shield: [],
    drone: [],
    medkit: []
  });

  // Temporary effects from consuming items
  const [nextFighterAutoSuccess, setNextFighterAutoSuccess] = useState(false);
  const [nextActionNoPenalty, setNextActionNoPenalty] = useState(false);
  const [scannerRevealTurns, setScannerRevealTurns] = useState(0);
  const [bonusSuccessTurns, setBonusSuccessTurns] = useState(0);
  const [ship, setShip] = useState({
    name: 'Rookie Cruiser',
    fuelEfficiency: 1,
    weapons: 1,
    cargo: 1,
    level: 1,
    equipmentSlots: {
      weapon: 1,
      scanner: 1,
      engine: 1,
      habitat: 1,
      shield: 1,
      drone: 1,
      medkit: 1
    }
  });
  
  // Progress
  const [galaxiesExplored, setGalaxiesExplored] = useState(1);
  const [planetsSettled, setPlanetsSettled] = useState(0);
  const [battlesWon, setBattlesWon] = useState(0);
  const [runNumber, setRunNumber] = useState(1);
  const [achievements, setAchievements] = useState([]);
  
  // Mission log
  const [missionLog, setMissionLog] = useState([]);
  
  // Mission history
  const [missionHistory, setMissionHistory] = useState([]);

  // Current turn actions
  const [currentActions, setCurrentActions] = useState([]);

  // Mission metrics
  const [randomEventCount, setRandomEventCount] = useState(0);
  const [actionTypeCounts, setActionTypeCounts] = useState({
    explorer: 0,
    fighter: 0,
    settler: 0,
  });

  // Track mission performance
  const [successfulActions, setSuccessfulActions] = useState(0);
  const [failedActions, setFailedActions] = useState(0);
  
  // Mission end summary popup
  const [showMissionSummary, setShowMissionSummary] = useState(false);
  const [missionSummaryData, setMissionSummaryData] = useState(null);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('stellarSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.resources) setResources(data.resources);
        if (data.skills) setSkills(data.skills);
        if (data.inventory) setInventory(data.inventory);
        if (data.equippedCards) setEquippedCards(data.equippedCards);
        if (data.ship) setShip(data.ship);
        if (data.missionHistory) setMissionHistory(data.missionHistory);
        if (data.galaxiesExplored) setGalaxiesExplored(data.galaxiesExplored);
        if (data.planetsSettled) setPlanetsSettled(data.planetsSettled);
        if (data.battlesWon) setBattlesWon(data.battlesWon);
        if (data.runNumber) setRunNumber(data.runNumber);
        if (data.achievements) setAchievements(data.achievements);
      } catch (err) {
        console.error('Failed to load save', err);
      }
    }
  }, []);

  // Save state whenever important values change
  useEffect(() => {
    const state = {
      resources,
      skills,
      inventory,
      equippedCards,
      ship,
      missionHistory,
      galaxiesExplored,
      planetsSettled,
      battlesWon,
      runNumber,
      achievements,
    };
    localStorage.setItem('stellarSave', JSON.stringify(state));
  }, [resources, skills, inventory, equippedCards, ship, missionHistory, galaxiesExplored, planetsSettled, battlesWon, runNumber, achievements]);
  
  // Auto-scroll mission log
  useEffect(() => {
    const logElement = document.getElementById('mission-log');
    if (logElement) {
      logElement.scrollTop = logElement.scrollHeight;
    }
  }, [missionLog]);

  // Add message to mission log
  const addToLog = (message) => {
    setMissionLog(prev => [...prev.slice(-4), `Turn ${turn + 1}: ${message}`]);
  };

  // Show notification (queued and added to feed)
  const showNotification = (title, message, type = 'info', icon = null, actions = []) => {
    // Queue popup, grouping consecutive duplicates
    setNotificationQueue(prev => {
      const last = prev[prev.length - 1];
      if (last && last.title === title && last.message === message && last.type === type) {
        last.count = (last.count || 1) + 1;
        return [...prev];
      }
      return [...prev, { title, message, type, count: 1, icon, actions }];
    });
  };

  // Display queued notifications sequentially
  useEffect(() => {
    if (!notification && notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setNotification(next);
      setNotificationQueue(prev => prev.slice(1));
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, notificationQueue]);

  const unlockAchievement = (id) => {
    if (achievements.includes(id)) return;
    const def = achievementDefinitions.find(a => a.id === id);
    if (!def) return;
    setAchievements(prev => [...prev, id]);
    showNotification('🏆 Achievement Unlocked!', def.name, 'success');
  };

  // Navigate to inventory with context
  const goToInventory = (fromPhase = 'menu') => {
    setPreviousPhase(fromPhase);
    setGamePhase('inventory');
  };

  // Go back from inventory
  const goBackFromInventory = () => {
    setGamePhase(previousPhase);
  };

  // Check if any actions are affordable
  const checkActionsAffordable = (actions) => {
    const anyAffordable = actions.some(action =>
      resources.fuel >= action.costs.fuel && resources.food >= action.costs.food && resources.scrap >= action.costs.scrap
    );

    if (!anyAffordable && actions.length > 0) {
      showNotification('No Actions Available', 'You lack the resources for these actions.', 'error');
    }

    return anyAffordable;
  };

  // Get equipment bonuses
  const getEquipmentBonuses = () => {
    const bonuses = {
      fuelCostReduction: 0,
      foodCostReduction: { fighter: 0, explorer: 0, settler: 0 },
      successBonus: { fighter: 0, explorer: 0, settler: 0 },
      rewardBonus: { fighter: 0, explorer: 0, settler: 0 },
      failurePenaltyReduction: 0
    };
    
    // Iterate through all equipment categories
    Object.values(equippedCards).flat().forEach(card => {
      switch (card.type) {
        case 'weapon':
          bonuses.foodCostReduction.fighter += Math.floor(card.equipPower / 10);
          break;
        case 'scanner':
          bonuses.successBonus.explorer += card.equipPower;
          break;
        case 'habitat':
          bonuses.rewardBonus.settler += card.equipPower;
          break;
        case 'engine':
          bonuses.fuelCostReduction += Math.floor(card.equipPower / 10);
          break;
        case 'shield':
          bonuses.failurePenaltyReduction += card.equipPower;
          break;
        case 'drone':
          bonuses.successBonus.explorer += Math.floor(card.equipPower / 2);
          bonuses.successBonus.fighter += Math.floor(card.equipPower / 2);
          break;
        case 'medkit':
          bonuses.failurePenaltyReduction += card.equipPower * 2;
          break;
        default:
          break;
      }
    });

    // Synergy bonuses
    if (equippedCards.drone.length > 0 && equippedCards.engine.length > 0) {
      const synergy = Math.min(equippedCards.drone.length, equippedCards.engine.length) * 2;
      bonuses.successBonus.explorer += synergy;
      bonuses.successBonus.fighter += synergy;
    }
    if (equippedCards.medkit.length > 0 && equippedCards.shield.length > 0) {
      const synergy = Math.min(equippedCards.medkit.length, equippedCards.shield.length) * 5;
      bonuses.failurePenaltyReduction += synergy;
    }
    
    return bonuses;
  };

  const equipmentBonuses = useMemo(() => getEquipmentBonuses(), [equippedCards]);

  // Track which card categories are available for quick action hints
  const availableCardCategories = useMemo(() => {
    const categories = new Set();
    inventory.forEach(card => {
      if (!card.isEquipped) {
        const category = cardTypes[card.type]?.category;
        if (category) categories.add(category);
      }
    });
    return Array.from(categories);
  }, [inventory]);

  const getSkillSynergy = () => {
    const synergy = { explorer: 0, fighter: 0, settler: 0 };
    if (skills.explorer >= 3 && skills.fighter >= 3) {
      synergy.explorer += 0.05;
      synergy.fighter += 0.05;
    }
    if (skills.explorer >= 3 && skills.settler >= 3) {
      synergy.explorer += 0.05;
      synergy.settler += 0.05;
    }
    if (skills.fighter >= 3 && skills.settler >= 3) {
      synergy.fighter += 0.05;
      synergy.settler += 0.05;
    }
    return synergy;
  };

  const getSpecialization = () => {
    const entries = Object.entries(skills).sort((a, b) => b[1] - a[1]);
    if (entries[0][1] >= entries[1][1] + 2) return entries[0][0];
    return null;
  };

  // Check and unlock achievements when relevant values change
  useEffect(() => {
    const state = {
      credits: resources.credits,
      battlesWon,
      galaxiesExplored,
      planetsSettled,
    };
    achievementDefinitions.forEach(def => {
      if (def.condition(state)) {
        unlockAchievement(def.id);
      }
    });
  }, [resources.credits, battlesWon, galaxiesExplored, planetsSettled]);

  // Generate random card using precomputed thresholds and card type keys
  const generateCard = () => {
    const rand = Math.random() * 100;
    let rarity = 'common';

    for (const [key, threshold] of RARITY_THRESHOLDS) {
      if (rand <= threshold) {
        rarity = key;
        break;
      }
    }

    const type = CARD_TYPE_KEYS[Math.floor(Math.random() * CARD_TYPE_KEYS.length)];
    const power = getCardPower(rarity);

    return {
      id: Date.now() + Math.random(),
      rarity,
      type,
      equipPower: power.equip,
      consumePower: power.consume,
      name: `${rarities[rarity].name} ${cardTypes[type].name}`,
      isEquipped: false
    };
  };

  // Generate actions for current turn with branching risk options
  const generateTurnActions = () => {
    const actions = [];
    const bonuses = equipmentBonuses;
    const synergy = getSkillSynergy();
    const specialization = getSpecialization();

    SKILL_TYPES.forEach(skillType => {
      const templates = actionTemplates[skillType];
      const template = templates[Math.floor(Math.random() * templates.length)];

      RISK_OPTIONS.forEach(riskKey => {
        const risk = riskLevels[riskKey];
        const skillLevel = skills[skillType];
        const perkMultiplier = skillLevel >= 5 ? 1.2 : skillLevel >= 3 ? 1.1 : 1;

        let fuelCost = Math.max(1, Math.ceil(BASE_COSTS[skillType].fuel * risk.multiplier) - (ship.fuelEfficiency - 1) - bonuses.fuelCostReduction - Math.floor((skillLevel - 1) / 4));
        let foodCost = Math.max(1, Math.ceil(BASE_COSTS[skillType].food * risk.multiplier) - Math.floor(skillLevel / 3) - bonuses.foodCostReduction[skillType]);
        let scrapCost = Math.max(0, Math.ceil(BASE_COSTS[skillType].scrap * risk.multiplier) - Math.floor(skillLevel / 2));

        let creditsReward = Math.floor(BASE_REWARDS[skillType].credits * risk.multiplier * skillLevel * perkMultiplier * (1 + bonuses.rewardBonus[skillType] / 100));
        let dataReward = Math.floor(BASE_REWARDS[skillType].data * risk.multiplier * skillLevel * perkMultiplier);
        let scrapReward = Math.floor(BASE_REWARDS[skillType].scrap * risk.multiplier * skillLevel * perkMultiplier);

        if (specialization === skillType) {
          creditsReward = Math.floor(creditsReward * 1.1);
          dataReward = Math.floor(dataReward * 1.1);
          scrapReward = Math.floor(scrapReward * 1.1);
        }

        let successChance = risk.successChance + (bonuses.successBonus[skillType] / 100) + synergy[skillType];
        successChance = Math.min(0.95, successChance);

        actions.push({
          id: `${skillType}_${riskKey}_${Date.now()}_${Math.random()}`,
          skillType,
          template,
          risk: riskKey,
          costs: { fuel: fuelCost, food: foodCost, scrap: scrapCost },
          rewards: { credits: creditsReward, data: dataReward, scrap: scrapReward },
          successChance
        });
      });
    });

    return actions;
  };

  // Card management functions
  const equipCard = (cardId) => {
    const card = inventory.find(c => c.id === cardId);
    if (!card) return;

    const cardType = card.type;
    const currentSlots = equippedCards[cardType];
    const maxSlots = ship.equipmentSlots[cardType];

    if (currentSlots.length >= maxSlots) {
      // Replace weakest card if new one is stronger
      const weakestIndex = currentSlots.reduce((minIndex, c, idx, arr) =>
        c.equipPower < arr[minIndex].equipPower ? idx : minIndex, 0);
      const weakestCard = currentSlots[weakestIndex];
      if (weakestCard.equipPower >= card.equipPower) {
        showNotification('Slots Full', `All ${cardTypes[cardType].name} slots filled with equal or better gear`, 'error');
        return;
      }
      replaceCard(cardId, weakestIndex);
      setInventory(prev => prev.filter(c => c.id !== weakestCard.id));
      showNotification('Equipment Replaced', `${card.name} replaced ${weakestCard.name}`, 'info');
      return;
    }
    
    setInventory(prev => prev.map(c => 
      c.id === cardId ? { ...c, isEquipped: true } : c
    ));
    
    setEquippedCards(prev => ({
      ...prev,
      [cardType]: [...prev[cardType], card]
    }));
  };
  
  const unequipCard = (cardId) => {
    const card = inventory.find(c => c.id === cardId);
    if (!card) return;
    
    const cardType = card.type;
    
    setInventory(prev => prev.map(c => 
      c.id === cardId ? { ...c, isEquipped: false } : c
    ));
    
    setEquippedCards(prev => ({
      ...prev,
      [cardType]: prev[cardType].filter(c => c.id !== cardId)
    }));
  };
  
  const replaceCard = (cardId, slotIndex) => {
    const card = inventory.find(c => c.id === cardId);
    if (!card) return;
    
    const cardType = card.type;
    
    // Remove the card being replaced (it's destroyed)
    setEquippedCards(prev => {
      const newSlots = [...prev[cardType]];
      newSlots[slotIndex] = card;
      return {
        ...prev,
        [cardType]: newSlots
      };
    });
    
    // Mark new card as equipped and remove from available inventory
    setInventory(prev => prev.map(c => 
      c.id === cardId ? { ...c, isEquipped: true } : c
    ));
  };
  
  const consumeCard = (cardId) => {
    const card = inventory.find(c => c.id === cardId);
    if (!card) return;

    // Apply consumable effect
    switch (card.type) {
      case 'weapon':
        setNextFighterAutoSuccess(true);
        addToLog(`💥 Used ${card.name} - next Fighter action guaranteed to succeed!`);
        showNotification('💥 Weapon Activated', `${card.name}\nNext Fighter action guaranteed!`, 'success');
        break;
      case 'scanner':
        setScannerRevealTurns(card.consumePower);
        addToLog(`🔍 Used ${card.name} - revealed precise action success rates!`);
        showNotification('🔍 Scanner Activated', `${card.name}\nSuccess rates revealed!`, 'success');
        break;
      case 'habitat':
        const foodRestore = card.consumePower * 2;
        adjustResource('food', foodRestore);
        addToLog(`🏠 Used ${card.name} - restored ${foodRestore} food!`);
        showNotification('🏠 Food Restored', `${card.name}\n+${foodRestore} food supplies`, 'success');
        break;
      case 'engine':
        const fuelRestore = card.consumePower * 2;
        adjustResource('fuel', fuelRestore);
        addToLog(`⚡ Used ${card.name} - restored ${fuelRestore} fuel!`);
        showNotification('⚡ Fuel Restored', `${card.name}\n+${fuelRestore} fuel supplies`, 'success');
        break;
      case 'shield':
        setNextActionNoPenalty(true);
        addToLog(`🛡️ Used ${card.name} - next action failure won't cause penalties!`);
        showNotification('🛡️ Shield Activated', `${card.name}\nNext failure protected!`, 'success');
        break;
      case 'drone':
        setBonusSuccessTurns(card.consumePower);
        addToLog(`🤖 Used ${card.name} - success chances boosted!`);
        showNotification('🤖 Drone Deployed', `${card.name}\nTemporary success boost`, 'success');
        break;
      case 'medkit':
        const restore = card.consumePower * 2;
        adjustResource('fuel', restore);
        adjustResource('food', restore);
        addToLog(`🩺 Used ${card.name} - restored ${restore} fuel and food!`);
        showNotification('🩺 Supplies Restored', `${card.name}\n+${restore} fuel & food`, 'success');
        break;
      default:
        break;
    }
    
    // Remove card from inventory
    setInventory(prev => prev.filter(c => c.id !== cardId));
  };

  // Open card pack
  const openPack = () => {
    if (resources.credits >= 50) {
      adjustResource('credits', -50);
      const newCards = Array.from({ length: 5 }, () => generateCard());
      setInventory(prev => [...prev, ...newCards]);
    }
  };

  // Start run
  const startRun = () => {
    const baseFuel = 20 + (ship.level * 3);
    const baseFood = 15 + (ship.level * 2);
    setResources(prev => ({ ...prev, fuel: baseFuel, food: baseFood }));
    setMaxFuel(baseFuel);
    setMaxFood(baseFood);
    setNextFighterAutoSuccess(false);
    setNextActionNoPenalty(false);
    setScannerRevealTurns(0);
    setBonusSuccessTurns(0);
    setRandomEventCount(0);
    setActionTypeCounts({ explorer: 0, fighter: 0, settler: 0 });
    setSuccessfulActions(0);
    setFailedActions(0);
    setTurn(0);
    setMissionLog([`Mission ${runNumber} begins! Ship fueled and provisioned.`]);
    setCurrentActions(generateTurnActions());
    setGamePhase('run');
  };

  // End run
  const endRun = () => {
    const basePrestige = Math.floor((battlesWon + planetsSettled + galaxiesExplored) / 3);
    const efficiencyBonus = Math.floor(Math.max(0, 30 - turn) / 5);
    
    // Give some basic resources based on performance
    const baseScrap = Math.floor(turn / 3) + 1;
    const baseEnergy = Math.floor(turn / 4) + 1;
    const baseData = Math.floor(turn / 5) + 1;
    
    let status;
    if (successfulActions >= failedActions && successfulActions > 0) {
      status = 'Success';
    } else if (successfulActions > 0) {
      status = 'Partial Success';
    } else {
      status = 'Failure';
    }

    const summaryData = {
      runNumber,
      turns: turn,
      status,
      successes: successfulActions,
      failures: failedActions,
      randomEvents: randomEventCount,
      actionTotals: actionTypeCounts,
      gains: {
        prestige: basePrestige + efficiencyBonus,
        scrap: baseScrap,
        energy: baseEnergy,
        data: baseData
      }
    };
    
    setMissionSummaryData(summaryData);
    setShowMissionSummary(true);
  };
  
  // Confirm mission end and apply rewards
  const confirmMissionEnd = () => {
    if (!missionSummaryData) return;
    
    // Apply the rewards
    adjustResource('scrap', missionSummaryData.gains.scrap);
    adjustResource('energy', missionSummaryData.gains.energy);
    adjustResource('data', missionSummaryData.gains.data);
    adjustResource('prestige', missionSummaryData.gains.prestige);
    
    // Add to mission history
    const missionRecord = {
      id: missionSummaryData.runNumber,
      date: new Date().toLocaleString(),
      turns: missionSummaryData.turns,
      gains: missionSummaryData.gains,
      status: missionSummaryData.status
    };
    
    setMissionHistory(prev => [missionRecord, ...prev.slice(0, 19)]);
    setRunNumber(prev => prev + 1);
    
    addToLog(`Mission complete! Earned ${missionSummaryData.gains.prestige} prestige points, ${missionSummaryData.gains.scrap} scrap, ${missionSummaryData.gains.energy} energy, ${missionSummaryData.gains.data} data.`);
    
    // Reset and return to menu
    setShowMissionSummary(false);
    setMissionSummaryData(null);
    setGamePhase('menu');
  };

  // Check if mission should end
const checkMissionEnd = (newFuel, newFood) => {
  if (newFuel <= 0 || newFood <= 0) {
    addToLog('🚨 Supplies depleted. You cannot perform further actions.');
    showNotification('Supplies Depleted', 'Fuel or food exhausted. End the mission when ready.', 'error');
  }
};

  const triggerRandomEvent = () => {
    if (Math.random() < 0.25) {
      const event = pickRandomEvent();
      setRandomEventCount(prev => prev + 1);
      const effects = event.effects || { [event.resource]: event.amount };
      const textParts = [];

      Object.entries(effects).forEach(([resource, value]) => {
        const gain = value > 0;
        textParts.push(`${gain ? '+' : ''}${value} ${resource}`);
        adjustResource(resource, value);
      });

      const text = `${event.text} ${textParts.join(', ')}`;
      // Use success color when overall net gain is positive
      const totalChange = Object.values(effects).reduce((a, b) => a + b, 0);
      addToLog(`🌠 ${text}`);
      showNotification('Random Event', text, totalChange >= 0 ? 'success' : 'error');
    }
  };

  // Take action
  const takeAction = (action) => {
    // Check if we have enough resources
    if (resources.fuel < action.costs.fuel || resources.food < action.costs.food || resources.scrap < action.costs.scrap) {
      return;
    }

    // Deduct costs
    const newFuel = resources.fuel - action.costs.fuel;
    const newFood = resources.food - action.costs.food;
    adjustResource('fuel', -action.costs.fuel);
    adjustResource('food', -action.costs.food);
    adjustResource('scrap', -action.costs.scrap);
    setTurn(prev => prev + 1);
    setActionTypeCounts(prev => ({
      ...prev,
      [action.skillType]: prev[action.skillType] + 1,
    }));
    
    // Determine success considering temporary bonuses
    let effectiveChance = action.successChance;
    if (bonusSuccessTurns > 0) {
      effectiveChance += 0.1;
    }
    let success;
    if (nextFighterAutoSuccess && action.skillType === 'fighter') {
      success = true;
      setNextFighterAutoSuccess(false);
    } else {
      success = Math.random() < effectiveChance;
    }
    const bonuses = equipmentBonuses;
    
    if (success) {
      // Apply rewards
      adjustResource('credits', action.rewards.credits);
      adjustResource('data', action.rewards.data);
      adjustResource('scrap', action.rewards.scrap);
      setSuccessfulActions(prev => prev + 1);
      
      // Check for special achievements
      let achievementText = '';
      let notificationTitle = '✅ Success!';
      if (action.skillType === 'explorer' && Math.random() < 0.08 * skills.explorer) {
        setGalaxiesExplored(prev => prev + 1);
        achievementText = ' 🌌 New galaxy discovered!';
        notificationTitle = '🌌 Major Discovery!';
      } else if (action.skillType === 'fighter' && Math.random() < 0.15 * skills.fighter) {
        setBattlesWon(prev => prev + 1);
        achievementText = ' ⚔️ Epic victory achieved!';
        notificationTitle = '⚔️ Epic Victory!';
      } else if (action.skillType === 'settler' && Math.random() < 0.12 * skills.settler) {
        setPlanetsSettled(prev => prev + 1);
        achievementText = ' 🏛️ Planet successfully colonized!';
        notificationTitle = '🏛️ Colony Established!';
      }
      
      const logMessage = `✅ ${action.template.name} succeeded! +${action.rewards.credits} credits${action.rewards.data > 0 ? `, +${action.rewards.data} data` : ''}${action.rewards.scrap > 0 ? `, +${action.rewards.scrap} scrap` : ''}.${achievementText}`;
      addToLog(logMessage);
      
      // Show notification
      const rewardText = `+${action.rewards.credits} credits${action.rewards.data > 0 ? `, +${action.rewards.data} data` : ''}${action.rewards.scrap > 0 ? `, +${action.rewards.scrap} scrap` : ''}`;
      showNotification(notificationTitle, `${action.template.name}\n${rewardText}${achievementText}`, 'success');
      
    } else {
      // Handle failure with optional shield protection
      setFailedActions(prev => prev + 1);
      let failureEffect = '';
      let notificationMessage = '';
      if (nextActionNoPenalty) {
        setNextActionNoPenalty(false);
        failureEffect = 'No penalties thanks to shielding.';
        notificationMessage = 'Failure protected - no penalties';
      } else if (action.skillType === 'explorer') {
        const dataLoss = Math.max(0, Math.floor(Math.random() * 2) + 1 - Math.floor(bonuses.failurePenaltyReduction / 20));
        adjustResource('data', -dataLoss);
        failureEffect = dataLoss > 0 ? `Lost ${dataLoss} data from equipment malfunction.` : 'Equipment damage prevented by protective systems.';
        notificationMessage = dataLoss > 0 ? `Equipment malfunction!\n-${dataLoss} data` : 'Equipment protected by systems';
      } else if (action.skillType === 'fighter') {
        const foodLoss = Math.max(0, Math.floor(Math.random() * 3) + 1 - Math.floor(bonuses.failurePenaltyReduction / 20));
        adjustResource('food', -foodLoss);
        failureEffect = foodLoss > 0 ? `Lost ${foodLoss} food from battle injuries.` : 'Injuries prevented by protective systems.';
        notificationMessage = foodLoss > 0 ? `Battle injuries sustained!\n-${foodLoss} food` : 'Injuries prevented by protection';
      } else if (action.skillType === 'settler') {
        const scrapLoss = Math.max(0, Math.floor(Math.random() * 4) + 2 - Math.floor(bonuses.failurePenaltyReduction / 15));
        adjustResource('scrap', -scrapLoss);
        failureEffect = scrapLoss > 0 ? `Lost ${scrapLoss} scrap from failed construction.` : 'Construction failure mitigated by protective systems.';
        notificationMessage = scrapLoss > 0 ? `Construction failed!\n-${scrapLoss} scrap` : 'Failure mitigated by systems';
      }
      
      addToLog(`❌ ${action.template.name} failed! ${failureEffect}`);
      showNotification('❌ Action Failed', `${action.template.name}\n${notificationMessage}`, 'error');
    }
    
    // Generate new actions for next turn
    setTimeout(() => {
      if (newFuel > 0 && newFood > 0) {
        triggerRandomEvent();
        const newActions = generateTurnActions();
        setCurrentActions(newActions);
        checkActionsAffordable(newActions);
      }
    }, 100);
    
    // Decrement temporary effect turns
    if (scannerRevealTurns > 0) {
      setScannerRevealTurns(prev => prev - 1);
    }
    if (bonusSuccessTurns > 0) {
      setBonusSuccessTurns(prev => prev - 1);
    }

    // Check if mission should end
    checkMissionEnd(newFuel, newFood);
  };

  // Upgrades
  const upgradeSkill = (skill) => {
    const cost = skills[skill] * 10;
    if (resources.prestige >= cost) {
      adjustResource('prestige', -cost);
      setSkills(prev => ({ ...prev, [skill]: prev[skill] + 1 }));
    }
  };

  const upgradeShip = () => {
    const cost = ship.level * 20;
    if (resources.scrap >= cost && resources.energy >= cost/2) {
      adjustResource('scrap', -cost);
      adjustResource('energy', -(cost/2));
      setShip(prev => ({
        ...prev,
        level: prev.level + 1,
        fuelEfficiency: prev.fuelEfficiency + 1,
        weapons: prev.weapons + 1,
        cargo: prev.cargo + 1,
        equipmentSlots: {
          weapon: prev.equipmentSlots.weapon + (prev.level % 2 === 0 ? 1 : 0),
          scanner: prev.equipmentSlots.scanner + (prev.level % 3 === 0 ? 1 : 0),
          engine: prev.equipmentSlots.engine + (prev.level % 4 === 0 ? 1 : 0),
          habitat: prev.equipmentSlots.habitat + (prev.level % 3 === 1 ? 1 : 0),
          shield: prev.equipmentSlots.shield + (prev.level % 5 === 0 ? 1 : 0),
          drone: prev.equipmentSlots.drone + (prev.level % 4 === 1 ? 1 : 0),
          medkit: prev.equipmentSlots.medkit + (prev.level % 4 === 2 ? 1 : 0)
        },
        name: prev.level === 1 ? 'Advanced Cruiser' : prev.level === 2 ? 'Battle Destroyer' : 'Legendary Dreadnought'
      }));
    }
  };
  
  // Prestige reset
  const prestige = () => {
    if (window.confirm('Are you sure you want to prestige? This will reset most progress but give you permanent bonuses.')) {
      setResources(prev => ({
        ...prev,
        fuel: 20,
        food: 15,
        credits: 100,
        scrap: 0,
        energy: 0,
        data: 0,
        prestige: 0,
      }));
      setInventory([]);
      setEquippedCards({
        weapon: [],
        scanner: [],
        engine: [],
        habitat: [],
        shield: [],
        drone: [],
        medkit: []
      });
      setNextFighterAutoSuccess(false);
      setNextActionNoPenalty(false);
      setScannerRevealTurns(0);
      setBonusSuccessTurns(0);
      setShip({
        name: 'Rookie Cruiser',
        fuelEfficiency: 1,
        weapons: 1,
        cargo: 1,
        level: 1,
        equipmentSlots: {
          weapon: 1,
          scanner: 1,
          engine: 1,
          habitat: 1,
          shield: 1,
          drone: 1,
          medkit: 1
        }
      });
      setGalaxiesExplored(1);
      setPlanetsSettled(0);
      setBattlesWon(0);
      setRunNumber(1);
      setGamePhase('menu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />

        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-300 mb-2 flex items-center justify-center gap-2">
            <Rocket className="text-yellow-400" />
            Stellar Expeditions
          </h1>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Coins className="text-yellow-400 w-4 h-4" />
              {resources.credits}
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="text-gray-400 w-4 h-4" />
              {resources.scrap}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">⚡</span> {resources.energy}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">📊</span> {resources.data}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="text-purple-400 w-4 h-4" /> {resources.prestige}
            </div>
          </div>
        </header>

        {gamePhase === 'menu' && (
          <MenuPhase
            runNumber={runNumber}
            startRun={startRun}
            setGamePhase={setGamePhase}
            goToInventory={goToInventory}
            inventory={inventory}
            missionHistory={missionHistory}
            ship={ship}
            equippedCards={equippedCards}
            skills={skills}
            galaxiesExplored={galaxiesExplored}
            planetsSettled={planetsSettled}
            battlesWon={battlesWon}
            prestigePoints={resources.prestige}
            prestige={prestige}
            achievements={achievements}
            achievementDefinitions={achievementDefinitions}
          />
        )}

        {gamePhase === 'run' && (
          <RunPhase
            runNumber={runNumber}
            turn={turn}
            endRun={endRun}
            fuel={resources.fuel}
            maxFuel={maxFuel}
            food={resources.food}
            maxFood={maxFood}
            goToInventory={goToInventory}
            currentActions={currentActions}
            riskLevels={riskLevels}
            takeAction={takeAction}
            scrap={resources.scrap}
            missionLog={missionLog}
            scannerRevealTurns={scannerRevealTurns}
            showMissionSummary={showMissionSummary}
            missionSummaryData={missionSummaryData}
            confirmMissionEnd={confirmMissionEnd}
            ship={ship}
            equipmentBonuses={equipmentBonuses}
            availableCardCategories={availableCardCategories}
          />
        )}

        {gamePhase === 'history' && (
          <HistoryPhase missionHistory={missionHistory} setGamePhase={setGamePhase} />
        )}

        {gamePhase === 'inventory' && (
          <InventoryPhase
            ship={ship}
            equippedCards={equippedCards}
            inventory={inventory}
            goBackFromInventory={goBackFromInventory}
            previousPhase={previousPhase}
            equipCard={equipCard}
            unequipCard={unequipCard}
            consumeCard={consumeCard}
          />
        )}

        {gamePhase === 'packs' && (
          <PacksPhase inventory={inventory} credits={resources.credits} setGamePhase={setGamePhase} openPack={openPack} />
        )}

        {gamePhase === 'upgrade' && (
          <UpgradePhase
            skills={skills}
            prestigePoints={resources.prestige}
            upgradeSkill={upgradeSkill}
            ship={ship}
            scrap={resources.scrap}
            energy={resources.energy}
            upgradeShip={upgradeShip}
            setGamePhase={setGamePhase}
          />
        )}
      </div>
    </div>
  );
};

export default SpaceCardGame;
