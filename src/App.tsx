import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { DialogueOverlay } from './components/DialogueOverlay';
import { CombatOverlay } from './components/CombatOverlay';
import { InventoryScreen } from './components/InventoryScreen';
import { ShopOverlay } from './components/ShopOverlay';
import { QuestLog } from './components/QuestLog';
import { StoryOverlay } from './components/StoryOverlay';
import { GameState, Position, Stats, WorldMap, Entity, Item, Quest } from './types';
import { INITIAL_PLAYER_STATS, TOWNS, DUNGEONS, DUNGEON_2, DUNGEON_ABYSS, DUNGEON_3, CORAL_CASTLE, QUESTS, ITEMS, FUNNY_DEATH_MESSAGES, SHARK_JOKES } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Shield, Trophy, Skull, Ghost, Volume2, VolumeX, LogIn, LogOut, Users } from 'lucide-react';
import { sounds } from './lib/sounds';
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, collection, doc, setDoc, getDoc, onSnapshot, query, where, limit, orderBy, getDocs, serverTimestamp, User, handleFirestoreError, OperationType } from './firebase';
import { Leaderboard } from './components/Leaderboard';
import { Multiplayer } from './components/Multiplayer';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [playerPos, setPlayerPos] = useState<Position>({ x: 7, y: 7 });
  const [playerStats, setPlayerStats] = useState<Stats>(INITIAL_PLAYER_STATS);
  const [activeDialogue, setActiveDialogue] = useState<Entity | null>(null);
  const [activeCombat, setActiveCombat] = useState<Entity | null>(null);
  const [bossesDefeated, setBossesDefeated] = useState<string[]>([]);
  
  // World Persistence
  const [worldMaps, setWorldMaps] = useState<Record<string, WorldMap>>({
    town_1: TOWNS[0],
    dungeon_1: DUNGEONS[0],
    dungeon_2: DUNGEON_2,
    dungeon_abyss: DUNGEON_ABYSS,
    dungeon_3: DUNGEON_3,
    coral_castle: CORAL_CASTLE
  });
  const [currentMapId, setCurrentMapId] = useState<string>('town_1');
  const currentMap = worldMaps[currentMapId];

  // New States
  const [inventory, setInventory] = useState<Item[]>([
    { ...ITEMS.kelp, id: 'kelp_1', baseId: 'kelp', quantity: 2 }
  ]);

  const createInventoryItem = (item: Item): Item => ({
    ...item,
    baseId: item.baseId || item.id,
    id: `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    quantity: item.quantity || 1
  });

  const addToInventory = (items: Item[]) => {
    setInventory(prev => {
      let newInv = [...prev];
      items.forEach(itemToAdd => {
        if (itemToAdd.type === 'consumable') {
          const existingIdx = newInv.findIndex(i => i.baseId === (itemToAdd.baseId || itemToAdd.id));
          if (existingIdx !== -1) {
            const existing = { ...newInv[existingIdx] };
            existing.quantity = (existing.quantity || 1) + (itemToAdd.quantity || 1);
            newInv[existingIdx] = existing;
          } else {
            newInv.push({ ...itemToAdd, quantity: itemToAdd.quantity || 1, baseId: itemToAdd.baseId || itemToAdd.id });
          }
        } else {
          newInv.push(itemToAdd);
        }
      });
      return newInv;
    });
  };
  const [equippedWeapon, setEquippedWeapon] = useState<Item | null>(null);
  const [secondaryWeapon, setSecondaryWeapon] = useState<Item | null>(null);
  const [equippedArmor, setEquippedArmor] = useState<Item | null>(null);
  const [equippedAccessory, setEquippedAccessory] = useState<Item | null>(null);
  const [quests, setQuests] = useState<Quest[]>(Object.values(QUESTS));
  const [showStory, setShowStory] = useState(false);
  const [azeranJoined, setAzeranJoined] = useState(false);
  const [finneganJoined, setFinneganJoined] = useState(false);
  const [shopConfig, setShopConfig] = useState<{ title: string; items: Item[] } | null>(null);
  const [deathMessage, setDeathMessage] = useState("");
  const [sharkJoke, setSharkJoke] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Firebase States
  const [user, setUser] = useState<User | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [leaderboardScores, setLeaderboardScores] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Handle Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Initial sync of player data if logged in
        syncPlayerData(u.uid, playerStats, playerPos, currentMapId);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync player position and stats to Firestore
  const syncPlayerData = async (uid: string, stats: Stats, pos: Position, mapId: string) => {
    if (!user) return;
    const path = `players/${uid}`;
    try {
      await setDoc(doc(db, 'players', uid), {
        name: user.displayName || 'Anonymous Shark',
        level: stats.level,
        gold: stats.gold,
        pos,
        mapId,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  };

  // Update Firestore when player moves or stats change
  useEffect(() => {
    if (user && gameState === 'playing') {
      const timeout = setTimeout(() => {
        syncPlayerData(user.uid, playerStats, playerPos, currentMapId);
      }, 500); // Debounce sync
      return () => clearTimeout(timeout);
    }
  }, [playerPos, playerStats.level, playerStats.gold, currentMapId, user, gameState]);

  // Listen for other players
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'players'),
      where('lastSeen', '>', new Date(Date.now() - 60000)), // Active in last minute
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const players = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== user.uid);
      setOnlinePlayers(players);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'players');
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, 'players'), orderBy('level', 'desc'), orderBy('gold', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const scores = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          level: data.level,
          gold: data.gold,
          date: data.lastSeen?.toDate().toLocaleDateString() || 'Recently'
        };
      });
      setLeaderboardScores(scores);
      setShowLeaderboard(true);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'players');
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      sounds.playBuy();
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  // Handle Mute/Unmute for SFX
  useEffect(() => {
    sounds.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveEnemies = () => {
      setWorldMaps(prev => {
        const currentMap = prev[currentMapId];
        if (!currentMap) return prev;

        const newEntities = currentMap.entities.map(entity => {
          const enemyTypes = ['goblin', 'hobgoblin', 'dragon', 'giant_crab'];
          if (!enemyTypes.includes(entity.type) || entity.isDead) return entity;

          // 30% chance to move each tick
          if (Math.random() > 0.3) return entity;

          const directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
          ];

          const dir = directions[Math.floor(Math.random() * directions.length)];
          const newPos = { x: entity.pos.x + dir.x, y: entity.pos.y + dir.y };

          // Check bounds
          if (newPos.x < 0 || newPos.x >= currentMap.width || newPos.y < 0 || newPos.y >= currentMap.height) return entity;

          // Check walls
          if (currentMap.tiles[newPos.y][newPos.x] === 1) return entity;

          // Check player
          if (newPos.x === playerPos.x && newPos.y === playerPos.y) return entity;

          // Check other entities
          const otherEntity = currentMap.entities.find(e => e.id !== entity.id && !e.isDead && e.pos.x === newPos.x && e.pos.y === newPos.y);
          if (otherEntity) return entity;

          return { ...entity, pos: newPos };
        });

        return {
          ...prev,
          [currentMapId]: { ...currentMap, entities: newEntities }
        };
      });
    };

    const interval = setInterval(moveEnemies, 2000);
    return () => clearInterval(interval);
  }, [gameState, currentMapId, playerPos]);

  const handleMove = (pos: Position) => {
    setPlayerPos(pos);
  };

  const handleInteract = (entity: Entity) => {
    if (entity.type === 'npc') {
      if (entity.id === 'shop_1') {
        setShopConfig({
          title: "BARNABY'S FORGE",
          items: [ITEMS.rusty_sword, ITEMS.steel_blade, ITEMS.poison_steel_sword, ITEMS.leather_armor, ITEMS.sword_holder]
        });
        setGameState('shop');
      } else if (entity.id === 'tavern_keeper') {
        setShopConfig({
          title: "THE SALTY FIN SNACKS",
          items: [
            ITEMS.kelp,
            ITEMS.sea_grapes,
            ITEMS.glowing_kelp,
            ITEMS.spicy_coral,
            ITEMS.bubble_soda,
            ITEMS.starfish_cookie,
            ITEMS.electric_jerky
          ]
        });
        setGameState('shop');
      } else {
        setActiveDialogue(entity);
        setGameState('dialogue');
      }
    } else if (entity.type === 'goblin' || entity.type === 'hobgoblin' || entity.type === 'dragon' || entity.type === 'boss') {
      setActiveCombat(entity);
      setGameState('combat');
    } else if (entity.type === 'chest') {
      if (entity.loot) {
        const newItems = entity.loot.map(createInventoryItem);
        addToInventory(newItems);
        const updatedEntities = currentMap.entities.map(en => 
          en.id === entity.id ? { ...en, isDead: true } : en
        );
        setWorldMaps(prev => ({
          ...prev,
          [currentMapId]: { ...prev[currentMapId], entities: updatedEntities }
        }));
        
        // Check for quest items
        newItems.forEach(item => {
          updateQuestProgressByTarget(item.baseId || item.id, 1);
        });
        
        // Update treasure hunter quest
        updateQuestProgressByTarget('chest', 1);
      }
    } else if (entity.type === 'portal') {
      if (entity.id === 'quest_portal') {
        // Accept all available portal quests
        const portalQuests = ['portal_quest', 'dragon_slayer', 'treasure_hunter', 'kelp_collector', 'lost_ring', 'boss_slayer_2', 'boss_slayer_3', 'boss_slayer_fish', 'level_5'];
        portalQuests.forEach(qId => {
          const quest = quests.find(q => q.id === qId);
          if (quest?.status === 'available') {
            acceptQuest(qId);
          }
        });
        setGameState('quests');
        return;
      }
      
      if (entity.id === 'portal_tests') {
        setCurrentMapId('coral_castle');
        setPlayerPos({ x: 15, y: 3 });
        return;
      }
      
      if (entity.id === 'portal_back_castle') {
        setCurrentMapId('town_1');
        setPlayerPos({ x: 15, y: 11 });
        return;
      }

      if (currentMapId === 'town_1') {
        if (bossesDefeated.includes('boss_3')) {
           setCurrentMapId('dungeon_abyss');
           setPlayerPos({ x: 11, y: 2 });
        } else if (bossesDefeated.includes('boss_2')) {
           setCurrentMapId('dungeon_3');
           setPlayerPos({ x: 12, y: 2 });
        } else if (bossesDefeated.includes('boss_1')) {
           setCurrentMapId('dungeon_2');
           setPlayerPos({ x: 10, y: 2 });
        } else {
           setCurrentMapId('dungeon_1');
           setPlayerPos({ x: 10, y: 2 });
        }
      } else {
        setCurrentMapId('town_1');
        setPlayerPos({ x: 10, y: 1 });
      }
    }
  };

  const updateQuestProgressByTarget = (targetId: string, amount: number = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.targetId === targetId && q.status === 'active') {
        const newCount = (q.currentCount || 0) + amount;
        if (q.targetCount && newCount >= q.targetCount) {
          return { ...q, currentCount: newCount, status: 'completed' };
        }
        if (!q.targetCount) {
          return { ...q, status: 'completed' };
        }
        return { ...q, currentCount: newCount };
      }
      return q;
    }));
  };

  const acceptQuest = (questId: string) => {
    setQuests(prev => prev.map(q => 
      q.id === questId && q.status === 'available' ? { ...q, status: 'active' } : q
    ));
  };

  const completeQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (quest && quest.status === 'completed') {
      setPlayerStats(prev => ({
        ...prev,
        gold: prev.gold + quest.reward.gold,
        exp: prev.exp + quest.reward.exp
      }));
      // Mark as completed in a way that doesn't let them re-complete
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, status: 'completed' } : q
      ));
    }
  };

  const onCombatVictory = (exp: number, gold: number, finalHp: number) => {
    if (activeCombat) {
      // Update quests by target ID (type or specific ID)
      updateQuestProgressByTarget(activeCombat.type);
      updateQuestProgressByTarget(activeCombat.id);
      
      if (activeCombat.type === 'boss') {
        setBossesDefeated(prev => [...prev, activeCombat.id]);
        if (activeCombat.id === 'boss_1') {
          setAzeranJoined(true);
        }
        if (activeCombat.id === 'boss_3') {
          setFinneganJoined(true);
        }
        if (activeCombat.id === 'boss_fish') {
          setGameState('victory');
          setActiveCombat(null);
          return;
        }
      }
      
      if (activeCombat.loot) {
        const newLoot = activeCombat.loot.map(createInventoryItem);
        addToInventory(newLoot);
        // Check for quest items in loot
        newLoot.forEach(item => {
          updateQuestProgressByTarget(item.baseId || item.id, 1);
        });
      }
    }

    setPlayerStats(prev => {
      const newExp = prev.exp + exp;
      let newLevel = prev.level;
      let newAttack = prev.attack;
      let newMaxHp = prev.maxHp;
      let newHp = finalHp;
      
      if (newExp >= prev.level * 100) {
        sounds.playLevelUp();
        newLevel++;
        newAttack += 5;
        newMaxHp += 20;
        newHp = newMaxHp; // Heal on level up
        
        if (newLevel >= 5) {
          updateQuestProgressByTarget('level_5');
        }
      }

      return {
        ...prev,
        exp: newExp,
        level: newLevel,
        attack: newAttack,
        maxHp: newMaxHp,
        hp: newHp,
        gold: prev.gold + gold
      };
    });

    if (activeCombat) {
      const updatedEntities = currentMap.entities.map(en => 
        en.id === activeCombat.id ? { ...en, isDead: true } : en
      );
      setWorldMaps(prev => ({
        ...prev,
        [currentMapId]: { ...prev[currentMapId], entities: updatedEntities }
      }));
    }

    setActiveCombat(null);
    setGameState('playing');
  };

  const onCombatDefeat = () => {
    const randomMsg = FUNNY_DEATH_MESSAGES[Math.floor(Math.random() * FUNNY_DEATH_MESSAGES.length)];
    const randomJoke = SHARK_JOKES[Math.floor(Math.random() * SHARK_JOKES.length)];
    setDeathMessage(randomMsg);
    setSharkJoke(randomJoke);
    setGameState('gameover');
  };

  const handleEquip = (item: Item) => {
    const hasSwordHolder = equippedAccessory?.baseId === 'sword_holder';
    
    // Check if an item of the same type (baseId) is already equipped in another slot
    // Exception: Weapons can be dual-equipped if sword holder is active
    const isAlreadyEquipped = (
      (equippedWeapon?.baseId === item.baseId && equippedWeapon?.id !== item.id && (!hasSwordHolder || item.type !== 'weapon')) ||
      (secondaryWeapon?.baseId === item.baseId && secondaryWeapon?.id !== item.id && (!hasSwordHolder || item.type !== 'weapon')) ||
      (equippedArmor?.baseId === item.baseId && equippedArmor?.id !== item.id) ||
      (equippedAccessory?.baseId === item.baseId && equippedAccessory?.id !== item.id)
    );

    if (isAlreadyEquipped) {
      alert(`You already have a ${item.name} equipped! You can't equip another one of the same type.`);
      return;
    }

    if (item.type === 'weapon') {
      if (equippedWeapon?.id === item.id) {
        setEquippedWeapon(null);
      } else if (secondaryWeapon?.id === item.id) {
        setSecondaryWeapon(null);
      } else {
        if (equippedAccessory?.baseId === 'sword_holder') {
          if (!equippedWeapon) {
            setEquippedWeapon(item);
          } else {
            setSecondaryWeapon(item);
          }
        } else {
          setEquippedWeapon(item);
          setSecondaryWeapon(null);
        }
      }
    } else if (item.type === 'armor') {
      if (equippedArmor?.id === item.id) {
        setEquippedArmor(null);
      } else {
        setEquippedArmor(item);
      }
    } else if (item.type === 'accessory') {
      if (equippedAccessory?.id === item.id) {
        setEquippedAccessory(null);
        if (item.baseId === 'sword_holder') {
          setSecondaryWeapon(null);
        }
      } else {
        setEquippedAccessory(item);
        if (item.baseId !== 'sword_holder') {
          setSecondaryWeapon(null);
        }
      }
    }
  };

  useEffect(() => {
    const baseWeaponAtk = (equippedWeapon?.stats?.attack || 0) + (secondaryWeapon?.stats?.attack || 0);
    // 20% bonus to weapon damage when dual-wielding
    const dualWieldMultiplier = (equippedWeapon && secondaryWeapon) ? 1.2 : 1.0;
    const totalWeaponAtk = Math.floor(baseWeaponAtk * dualWieldMultiplier);
    
    const armorDef = equippedArmor?.stats?.defense || 0;
    const accAtk = equippedAccessory?.stats?.attack || 0;
    const accDef = equippedAccessory?.stats?.defense || 0;
    
    setPlayerStats(prev => ({
      ...prev,
      attack: INITIAL_PLAYER_STATS.attack + totalWeaponAtk + (prev.level - 1) * 5 + accAtk,
      defense: INITIAL_PLAYER_STATS.defense + armorDef + accDef
    }));
  }, [equippedWeapon, secondaryWeapon, equippedArmor, equippedAccessory, playerStats.level]);

  const handleUse = (item: Item) => {
    if (item.type === 'consumable') {
      let used = false;
      setPlayerStats(prev => {
        const newStats = { ...prev };
        if (item.stats?.hp) {
          newStats.hp = Math.max(0, Math.min(prev.maxHp, prev.hp + item.stats.hp));
          used = true;
          if (item.stats.hp > 0) sounds.playHeal();
          else sounds.playHit();
        }
        
        if (item.stats?.gold) {
          newStats.gold += item.stats.gold;
          used = true;
          sounds.playBuy();
        }
        
        if (item.stats?.exp) {
          newStats.exp += item.stats.exp;
          used = true;
          sounds.playLevelUp();
        }

        if (item.stats?.attack) {
          used = true;
          // Attack boost is handled in CombatOverlay for battle duration
          // but we mark it as used here to remove it from inventory
        }

        if (item.stats?.defense) {
          used = true;
          // Defense boost is handled in CombatOverlay for battle duration
          // but we mark it as used here to remove it from inventory
        }

        return newStats;
      });
      
      if (used) {
        setInventory(prev => {
          const idx = prev.findIndex(i => i.id === item.id);
          if (idx === -1) return prev;
          const newInv = [...prev];
          const existing = { ...newInv[idx] };
          if (existing.quantity && existing.quantity > 1) {
            existing.quantity -= 1;
            newInv[idx] = existing;
          } else {
            newInv.splice(idx, 1);
          }
          return newInv;
        });
      }
    }
  };

  const handleBuy = (item: Item) => {
    if (playerStats.gold >= item.value) {
      sounds.playBuy();
      setPlayerStats(prev => ({ ...prev, gold: prev.gold - item.value }));
      addToInventory([createInventoryItem(item)]);
    }
  };

  const handleSell = (item: Item) => {
    // Unequip if currently equipped
    if (equippedWeapon?.id === item.id) setEquippedWeapon(null);
    if (secondaryWeapon?.id === item.id) setSecondaryWeapon(null);
    if (equippedArmor?.id === item.id) setEquippedArmor(null);
    if (equippedAccessory?.id === item.id) {
      setEquippedAccessory(null);
      if (item.baseId === 'sword_holder') setSecondaryWeapon(null);
    }

    setPlayerStats(prev => ({ ...prev, gold: prev.gold + Math.floor(item.value / 2) }));
    sounds.playBuy();
    setInventory(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx === -1) return prev;
      const newInv = [...prev];
      const existing = { ...newInv[idx] };
      if (existing.quantity && existing.quantity > 1) {
        existing.quantity -= 1;
        newInv[idx] = existing;
      } else {
        newInv.splice(idx, 1);
      }
      return newInv;
    });
  };

  const handleSave = async () => {
    const saveData = {
      playerStats,
      playerPos,
      currentMapId,
      inventory,
      equippedWeapon,
      secondaryWeapon,
      equippedArmor,
      equippedAccessory,
      bossesDefeated,
      azeranJoined,
      finneganJoined,
      quests
    };

    if (user) {
      const path = `saves/${user.uid}`;
      try {
        await setDoc(doc(db, 'saves', user.uid), {
          ...saveData,
          updatedAt: serverTimestamp()
        });
        alert("Game Saved to Cloud!");
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
    } else {
      localStorage.setItem('hammerhead_hero_save', JSON.stringify(saveData));
      alert("Game Saved Locally! Sign in to save to the cloud.");
    }
  };

  const handleLoad = async () => {
    if (user) {
      const path = `saves/${user.uid}`;
      try {
        const docSnap = await getDoc(doc(db, 'saves', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          applySaveData(data);
          alert("Game Loaded from Cloud!");
          return;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
      }
    }

    const saved = localStorage.getItem('hammerhead_hero_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        applySaveData(data);
        alert("Game Loaded from Local Storage!");
      } catch (e) {
        alert("Error loading local save data.");
      }
    } else {
      alert("No save data found.");
    }
  };

  const applySaveData = (data: any) => {
    setPlayerStats(data.playerStats);
    setPlayerPos(data.playerPos);
    setCurrentMapId(data.currentMapId);
    setInventory(data.inventory);
    setEquippedWeapon(data.equippedWeapon);
    setSecondaryWeapon(data.secondaryWeapon);
    setEquippedArmor(data.equippedArmor);
    setEquippedAccessory(data.equippedAccessory);
    setBossesDefeated(data.bossesDefeated || []);
    setAzeranJoined(data.azeranJoined || false);
    setFinneganJoined(data.finneganJoined || false);
    setQuests(data.quests || Object.values(QUESTS));
  };

  const startGame = () => {
    sounds.resume();
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 p-8 text-center overflow-hidden"
          >
            {/* Underwater Background */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/assets/images/ui/logo.png" 
                alt="" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />
            </div>
            <div className="absolute inset-0 caustics-overlay opacity-20 z-10" />
            
            {/* Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className="bubble" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    width: `${Math.random() * 15 + 5}px`, 
                    height: `${Math.random() * 15 + 5}px`,
                    animationDuration: `${Math.random() * 6 + 4}s`,
                    animationDelay: `${Math.random() * 10}s`
                  }} 
                />
              ))}
            </div>

              <div className="relative z-30 flex flex-col items-center gap-6 mt-20">
              <p style={{marginBottom: '100px'}}>
                &nbsp;
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={startGame}
                  className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-2xl rounded-full shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 border-2 border-emerald-400/30"
                >
                  START ADVENTURE
                </button>

                {!user ? (
                  <button 
                    onClick={handleLogin}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xl rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                  >
                    <LogIn size={24} />
                    SIGN IN TO SYNC
                  </button>
                ) : (
                  <div className="flex items-center gap-4 bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md">
                    <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-emerald-400" />
                    <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-black">Logged In</p>
                      <p className="text-sm font-bold text-white leading-none">{user.displayName}</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-2xl text-sky-100 mb-8 max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-medium">
                A sword-wielding shark in a world of goblins. 
                <br />Fight your way to the Abyssal Maw to defeat the darkness.
              </p>

              <button 
                onClick={fetchLeaderboard}
                className="mt-4 text-sky-400 hover:text-sky-300 font-bold flex items-center gap-2 transition-colors"
              >
                <Trophy size={20} />
                VIEW GLOBAL LEADERBOARD
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-8 text-center"
          >
            <div className="relative mb-8">
              <Skull size={120} className="text-rose-600" />
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 text-4xl"
              >
                👻
              </motion.div>
            </div>
            
            <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">YOU PERISHED</h1>
            
            <div className="bg-rose-950/30 border border-rose-500/20 p-6 rounded-2xl max-w-lg mb-8">
              <p className="text-2xl font-bold text-rose-400 mb-2 italic">"{deathMessage}"</p>
              <div className="h-px bg-rose-500/20 w-1/2 mx-auto my-4" />
              <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">{sharkJoke}</p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xl rounded-full transition-all shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95"
            >
              TRY AGAIN (IF YOU DARE)
            </button>
            
            <p className="mt-8 text-xs text-slate-700 uppercase tracking-[0.3em]">The ocean is a cruel mistress.</p>
          </motion.div>
        )}

        {gameState === 'victory' && (
          <motion.div 
            key="victory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950 p-8 text-center"
          >
            <Trophy size={120} className="text-yellow-400 mb-8" />
            <h1 className="text-6xl font-black text-white mb-4">VICTORY!</h1>
            
            <p className="text-xl text-emerald-200 mb-12">
              The <span className="text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">Corrupted Abyssal Maw</span> has been defeated. The Hammerhead Shark is now the true King of the Tides!
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xl rounded-full transition-all"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <HUD 
        stats={playerStats} 
        locationName={currentMap.name} 
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        onInventoryOpen={() => setGameState('inventory')}
        onQuestsOpen={() => setGameState('quests')}
        onStoryOpen={() => setShowStory(true)}
        onSave={handleSave}
        onLoad={handleLoad}
      />

      {user && gameState === 'playing' && (
        <Multiplayer players={onlinePlayers} currentMapId={currentMapId} />
      )}

      {showLeaderboard && (
        <Leaderboard scores={leaderboardScores} onClose={() => setShowLeaderboard(false)} />
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-8">
          <GameCanvas 
            map={currentMap} 
            playerPos={playerPos} 
            otherPlayers={onlinePlayers}
            azeranJoined={azeranJoined}
            finneganJoined={finneganJoined}
            equippedWeapon={equippedWeapon}
            secondaryWeapon={secondaryWeapon}
            onMove={handleMove} 
            onInteract={handleInteract} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Controls</h4>
              <p className="text-sm text-slate-300">WASD or Arrows to move. Walk into NPCs to talk, or enemies to fight.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Objective</h4>
              <p className="text-sm text-slate-300">Find Azeran in Coral Cove, then head to the Grotto to face the Goblin Queen.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stats</h4>
              <p className="text-sm text-slate-300">Level up to increase your power. Defeat bosses to unlock new areas.</p>
            </div>
          </div>
        </div>
      </main>

      {gameState === 'dialogue' && activeDialogue && (
        <DialogueOverlay 
          entity={
            activeDialogue.id === 'azeran' && azeranJoined ? {
              ...activeDialogue,
              dialogue: ["Onward, hero! I'll support you with my magic as we delve deeper!"]
            } : 
            activeDialogue.id === 'old_shark' && finneganJoined ? {
              ...activeDialogue,
              dialogue: ["I'm too old for this, but for the Hero, I'll give it my all!"]
            } : 
            activeDialogue
          } 
          onClose={() => {
            if (activeDialogue.questId) {
              const quest = quests.find(q => q.id === activeDialogue.questId);
              if (quest?.status === 'available') {
                acceptQuest(activeDialogue.questId);
              } else if (quest?.status === 'completed') {
                completeQuest(activeDialogue.questId);
              }
            }
            setActiveDialogue(null);
            setGameState('playing');
          }} 
        />
      )}

      {gameState === 'combat' && activeCombat && (
        <CombatOverlay 
          playerStats={playerStats} 
          enemy={activeCombat} 
          inventory={inventory}
          mapId={currentMapId}
          azeranJoined={azeranJoined}
          finneganJoined={finneganJoined}
          equippedWeapon={equippedWeapon}
          secondaryWeapon={secondaryWeapon}
          onVictory={onCombatVictory}
          onDefeat={onCombatDefeat}
          onUsePotion={handleUse}
        />
      )}

      {gameState === 'inventory' && (
        <InventoryScreen 
          inventory={inventory}
          equippedWeapon={equippedWeapon}
          secondaryWeapon={secondaryWeapon}
          equippedArmor={equippedArmor}
          equippedAccessory={equippedAccessory}
          stats={playerStats}
          onEquip={handleEquip}
          onUse={handleUse}
          onClose={() => setGameState('playing')}
        />
      )}

      {gameState === 'shop' && (
        <ShopOverlay 
          inventory={inventory}
          gold={playerStats.gold}
          shopTitle={shopConfig?.title}
          shopItems={shopConfig?.items}
          onBuy={handleBuy}
          onSell={handleSell}
          onClose={() => setGameState('playing')}
        />
      )}

      {gameState === 'quests' && (
        <QuestLog 
          quests={quests}
          onClose={() => setGameState('playing')}
        />
      )}

      {showStory && (
        <StoryOverlay onClose={() => setShowStory(false)} />
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) {
          errorMessage = `Firebase Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
        }
      } catch (e) {
        errorMessage = this.state.error.message || String(this.state.error);
      }

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-8 text-center">
          <div className="max-w-md bg-slate-900 border-2 border-rose-500 p-8 rounded-3xl shadow-2xl">
            <Skull size={64} className="text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">System Malfunction</h2>
            <p className="text-slate-400 mb-8 font-mono text-sm bg-black/50 p-4 rounded-xl border border-slate-800 break-words">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full transition-all"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
