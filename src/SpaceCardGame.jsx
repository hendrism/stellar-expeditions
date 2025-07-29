import React, { useState, useEffect } from 'react';
import { Rocket, Coins, Wrench, Trophy } from 'lucide-react';
import {
  rarities,
  cardTypes,
  actionTemplates,
  riskLevels,
  getCardPower,
} from './utils/constants';
import { randomEvents } from './utils/events';
import { achievementDefinitions } from './utils/achievements';
import Notification from './components/Notification';
import NotificationFeed from './components/NotificationFeed';
import MenuPhase from './components/MenuPhase';
import RunPhase from './components/RunPhase';
import HistoryPhase from './components/HistoryPhase';
import InventoryPhase from './components/InventoryPhase';
import PacksPhase from './components/PacksPhase';
import UpgradePhase from './components/UpgradePhase';

const SpaceCardGame = () => {
  // Game state
  const [gamePhase, setGamePhase] = useState('menu'); // menu, run, packs, upgrade, inventory
  const [previousPhase, setPreviousPhase] = useState('menu'); // Track where we came from
  const [turn, setTurn] = useState(0);
  
  // Notification system
  const [notification, setNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [notificationFeed, setNotificationFeed] = useState([]);
  const [feedOpen, setFeedOpen] = useState(false);
  
  // Mission resources (reset each run)
  const [fuel, setFuel] = useState(20);
  const [food, setFood] = useState(15);
  const [maxFuel, setMaxFuel] = useState(20);
  const [maxFood, setMaxFood] = useState(15);
  
  // Persistent resources
  const [credits, setCredits] = useState(100);
  const [scrap, setScrap] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [data, setData] = useState(0);
  const [prestigePoints, setPrestigePoints] = useState(0);
  
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
  
  // Show stuck popup when no actions are affordable
  const [showStuckPopup, setShowStuckPopup] = useState(false);
  
  // Mission end summary popup
  const [showMissionSummary, setShowMissionSummary] = useState(false);
  const [missionSummaryData, setMissionSummaryData] = useState(null);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('stellarSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCredits(data.credits ?? 100);
        setScrap(data.scrap ?? 0);
        setEnergy(data.energy ?? 0);
        setData(data.data ?? 0);
        setPrestigePoints(data.prestigePoints ?? 0);
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
      credits,
      scrap,
      energy,
      data,
      prestigePoints,
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
  }, [credits, scrap, energy, data, prestigePoints, skills, inventory, equippedCards, ship, missionHistory, galaxiesExplored, planetsSettled, battlesWon, runNumber, achievements]);
  
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
  const showNotification = (title, message, type = 'info') => {
    // Add to feed with grouping
    setNotificationFeed(prev => {
      if (prev.length > 0 && prev[0].title === title && prev[0].message === message && prev[0].type === type) {
        const updated = { ...prev[0], count: (prev[0].count || 1) + 1 };
        return [updated, ...prev.slice(1)];
      }
      return [{ title, message, type, count: 1 }, ...prev];
    });

    // Queue popup, grouping consecutive duplicates
    setNotificationQueue(prev => {
      const last = prev[prev.length - 1];
      if (last && last.title === title && last.message === message && last.type === type) {
        last.count = (last.count || 1) + 1;
        return [...prev];
      }
      return [...prev, { title, message, type, count: 1 }];
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
      fuel >= action.costs.fuel && food >= action.costs.food && scrap >= action.costs.scrap
    );
    
    if (!anyAffordable && actions.length > 0) {
      setShowStuckPopup(true);
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

  // Check and unlock achievements when relevant values change
  useEffect(() => {
    const state = {
      credits,
      battlesWon,
      galaxiesExplored,
      planetsSettled,
    };
    achievementDefinitions.forEach(def => {
      if (def.condition(state)) {
        unlockAchievement(def.id);
      }
    });
  }, [credits, battlesWon, galaxiesExplored, planetsSettled]);

  // Generate random card
  const generateCard = () => {
    const rand = Math.random() * 100;
    let rarity = 'common';
    let cumulative = 0;
    
    for (const [key, value] of Object.entries(rarities)) {
      cumulative += value.chance;
      if (rand <= cumulative) {
        rarity = key;
        break;
      }
    }
    
    const typeKeys = Object.keys(cardTypes);
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
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

  // Generate three actions for current turn
  const generateTurnActions = () => {
    const actions = [];
    const skillTypes = ['explorer', 'fighter', 'settler'];
    const riskKeys = ['low', 'medium', 'high'];
    const bonuses = getEquipmentBonuses();
    
    skillTypes.forEach(skillType => {
      // Pick random action template
      const templates = actionTemplates[skillType];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Assign random risk level
      const riskKey = riskKeys[Math.floor(Math.random() * riskKeys.length)];
      const risk = riskLevels[riskKey];
      
      // Calculate costs and rewards based on skill level and risk
      const skillLevel = skills[skillType];
      const perkMultiplier = skillLevel >= 5 ? 1.2 : skillLevel >= 3 ? 1.1 : 1;
      const baseCosts = {
        explorer: { fuel: 3, food: 1, scrap: 0 },
        fighter: { fuel: 2, food: 3, scrap: 0 },
        settler: { fuel: 4, food: 3, scrap: 5 }
      };
      
      const baseRewards = {
        explorer: { credits: 12, data: 2, scrap: 0 },
        fighter: { credits: 18, data: 0, scrap: 3 },
        settler: { credits: 25, data: 0, scrap: 0 }
      };
      
      // Adjust costs based on ship, skills, and equipment
      let fuelCost = Math.max(1, Math.ceil(baseCosts[skillType].fuel * risk.multiplier) - (ship.fuelEfficiency - 1) - bonuses.fuelCostReduction - Math.floor((skillLevel - 1) / 4));
      let foodCost = Math.max(1, Math.ceil(baseCosts[skillType].food * risk.multiplier) - Math.floor(skillLevel / 3) - bonuses.foodCostReduction[skillType]);
      let scrapCost = Math.max(0, Math.ceil(baseCosts[skillType].scrap * risk.multiplier) - Math.floor(skillLevel / 2));
      
      // Calculate potential rewards with equipment bonuses
      let creditsReward = Math.floor(baseRewards[skillType].credits * risk.multiplier * skillLevel * perkMultiplier * (1 + bonuses.rewardBonus[skillType] / 100));
      let dataReward = Math.floor(baseRewards[skillType].data * risk.multiplier * skillLevel * perkMultiplier);
      let scrapReward = Math.floor(baseRewards[skillType].scrap * risk.multiplier * skillLevel * perkMultiplier);
      
      // Adjust success chance with equipment bonuses
      let successChance = risk.successChance + (bonuses.successBonus[skillType] / 100);
      successChance = Math.min(0.95, successChance); // Cap at 95%
      
      actions.push({
        id: `${skillType}_${Date.now()}`,
        skillType,
        template,
        risk: riskKey,
        costs: { fuel: fuelCost, food: foodCost, scrap: scrapCost },
        rewards: { credits: creditsReward, data: dataReward, scrap: scrapReward },
        successChance
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
        setFood(prev => Math.min(maxFood, prev + foodRestore));
        addToLog(`🏠 Used ${card.name} - restored ${foodRestore} food!`);
        showNotification('🏠 Food Restored', `${card.name}\n+${foodRestore} food supplies`, 'success');
        break;
      case 'engine':
        const fuelRestore = card.consumePower * 2;
        setFuel(prev => Math.min(maxFuel, prev + fuelRestore));
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
        setFuel(prev => Math.min(maxFuel, prev + restore));
        setFood(prev => Math.min(maxFood, prev + restore));
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
    if (credits >= 50) {
      setCredits(prev => prev - 50);
      const newCards = Array.from({ length: 5 }, () => generateCard());
      setInventory(prev => [...prev, ...newCards]);
    }
  };

  // Start run
  const startRun = () => {
    const baseFuel = 20 + (ship.level * 3);
    const baseFood = 15 + (ship.level * 2);
    setFuel(baseFuel);
    setFood(baseFood);
    setMaxFuel(baseFuel);
    setMaxFood(baseFood);
    setNextFighterAutoSuccess(false);
    setNextActionNoPenalty(false);
    setScannerRevealTurns(0);
    setBonusSuccessTurns(0);
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
    
    const summaryData = {
      runNumber,
      turns: turn,
      status: fuel <= 0 || food <= 0 ? 'Resources Depleted' : 'Mission Complete',
      gains: {
        prestige: basePrestige + efficiencyBonus,
        scrap: baseScrap,
        energy: baseEnergy,
        data: baseData
      }
    };
    
    setMissionSummaryData(summaryData);
    setShowMissionSummary(true);
    setShowStuckPopup(false);
  };
  
  // Confirm mission end and apply rewards
  const confirmMissionEnd = () => {
    if (!missionSummaryData) return;
    
    // Apply the rewards
    setScrap(prev => prev + missionSummaryData.gains.scrap);
    setEnergy(prev => prev + missionSummaryData.gains.energy);
    setData(prev => prev + missionSummaryData.gains.data);
    setPrestigePoints(prev => prev + missionSummaryData.gains.prestige);
    
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
    addToLog("Mission critical! Out of essential supplies. Returning to base.");
    showNotification('🚨 Supplies Depleted', 'Mission ending due to lack of supplies.', 'error');
    setTimeout(endRun, 1500);
    return true;
  }
  return false;
};

  const triggerRandomEvent = () => {
    if (Math.random() < 0.25) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      const amount = event.amount;
      const absAmount = Math.abs(amount);
      const gain = amount > 0;
      const text = `${event.text}${gain ? ` +${absAmount}` : ` -${absAmount}`} ${event.resource}`;
      switch (event.resource) {
        case 'fuel':
          setFuel(prev => gain ? Math.min(maxFuel, prev + absAmount) : Math.max(0, prev - absAmount));
          break;
        case 'food':
          setFood(prev => gain ? Math.min(maxFood, prev + absAmount) : Math.max(0, prev - absAmount));
          break;
        case 'scrap':
          setScrap(prev => gain ? prev + absAmount : Math.max(0, prev - absAmount));
          break;
        case 'data':
          setData(prev => gain ? prev + absAmount : Math.max(0, prev - absAmount));
          break;
        default:
          break;
      }
      addToLog(`🌠 ${text}`);
      showNotification('Random Event', text, gain ? 'success' : 'error');
    }
  };

  // Take action
  const takeAction = (action) => {
    // Check if we have enough resources
    if (fuel < action.costs.fuel || food < action.costs.food || scrap < action.costs.scrap) {
      return;
    }
    
    // Deduct costs
    const newFuel = fuel - action.costs.fuel;
    const newFood = food - action.costs.food;
    setFuel(newFuel);
    setFood(newFood);
    setScrap(prev => prev - action.costs.scrap);
    setTurn(prev => prev + 1);
    
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
    const bonuses = getEquipmentBonuses();
    
    if (success) {
      // Apply rewards
      setCredits(prev => prev + action.rewards.credits);
      setData(prev => prev + action.rewards.data);
      setScrap(prev => prev + action.rewards.scrap);
      
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
      let failureEffect = '';
      let notificationMessage = '';
      if (nextActionNoPenalty) {
        setNextActionNoPenalty(false);
        failureEffect = 'No penalties thanks to shielding.';
        notificationMessage = 'Failure protected - no penalties';
      } else if (action.skillType === 'explorer') {
        const dataLoss = Math.max(0, Math.floor(Math.random() * 2) + 1 - Math.floor(bonuses.failurePenaltyReduction / 20));
        setData(prev => Math.max(0, prev - dataLoss));
        failureEffect = dataLoss > 0 ? `Lost ${dataLoss} data from equipment malfunction.` : 'Equipment damage prevented by protective systems.';
        notificationMessage = dataLoss > 0 ? `Equipment malfunction!\n-${dataLoss} data` : 'Equipment protected by systems';
      } else if (action.skillType === 'fighter') {
        const foodLoss = Math.max(0, Math.floor(Math.random() * 3) + 1 - Math.floor(bonuses.failurePenaltyReduction / 20));
        setFood(prev => Math.max(0, prev - foodLoss));
        failureEffect = foodLoss > 0 ? `Lost ${foodLoss} food from battle injuries.` : 'Injuries prevented by protective systems.';
        notificationMessage = foodLoss > 0 ? `Battle injuries sustained!\n-${foodLoss} food` : 'Injuries prevented by protection';
      } else if (action.skillType === 'settler') {
        const scrapLoss = Math.max(0, Math.floor(Math.random() * 4) + 2 - Math.floor(bonuses.failurePenaltyReduction / 15));
        setScrap(prev => Math.max(0, prev - scrapLoss));
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
    if (prestigePoints >= cost) {
      setPrestigePoints(prev => prev - cost);
      setSkills(prev => ({ ...prev, [skill]: prev[skill] + 1 }));
    }
  };
  
  const upgradeShip = () => {
    const cost = ship.level * 20;
    if (scrap >= cost && energy >= cost/2) {
      setScrap(prev => prev - cost);
      setEnergy(prev => prev - cost/2);
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
      setCredits(100);
      setScrap(0);
      setEnergy(0);
      setData(0);
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
        <NotificationFeed
          feed={notificationFeed}
          open={feedOpen}
          toggleOpen={() => setFeedOpen(prev => !prev)}
          clearFeed={() => setNotificationFeed([])}
        />

        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-300 mb-2 flex items-center justify-center gap-2">
            <Rocket className="text-yellow-400" />
            Stellar Expeditions
          </h1>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Coins className="text-yellow-400 w-4 h-4" />
              {credits}
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="text-gray-400 w-4 h-4" />
              {scrap}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">⚡</span> {energy}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">📊</span> {data}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="text-purple-400 w-4 h-4" /> {prestigePoints}
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
            prestigePoints={prestigePoints}
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
            fuel={fuel}
            maxFuel={maxFuel}
            food={food}
            maxFood={maxFood}
            goToInventory={goToInventory}
            currentActions={currentActions}
            riskLevels={riskLevels}
            takeAction={takeAction}
            scrap={scrap}
            showStuckPopup={showStuckPopup}
            setShowStuckPopup={setShowStuckPopup}
            inventory={inventory}
            missionLog={missionLog}
            scannerRevealTurns={scannerRevealTurns}
            showMissionSummary={showMissionSummary}
            missionSummaryData={missionSummaryData}
            confirmMissionEnd={confirmMissionEnd}
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
          <PacksPhase inventory={inventory} credits={credits} setGamePhase={setGamePhase} openPack={openPack} />
        )}

        {gamePhase === 'upgrade' && (
          <UpgradePhase
            skills={skills}
            prestigePoints={prestigePoints}
            upgradeSkill={upgradeSkill}
            ship={ship}
            scrap={scrap}
            energy={energy}
            upgradeShip={upgradeShip}
            setGamePhase={setGamePhase}
          />
        )}
      </div>
    </div>
  );
};

export default SpaceCardGame;
