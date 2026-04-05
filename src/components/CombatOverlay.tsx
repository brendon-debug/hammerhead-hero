
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Entity, Stats, Item } from '../types';
import { Sword, Shield, Heart, FlaskConical, HelpCircle } from 'lucide-react';
import { sounds } from '../lib/sounds';

interface CombatOverlayProps {
  playerStats: Stats;
  enemy: Entity;
  inventory: Item[];
  mapId: string;
  azeranJoined?: boolean;
  finneganJoined?: boolean;
  equippedWeapon?: Item | null;
  secondaryWeapon?: Item | null;
  onVictory: (exp: number, gold: number, finalHp: number) => void;
  onDefeat: () => void;
  onUsePotion: (item: Item) => void;
}

interface Hazard {
  id: string;
  name: string;
  sprite: string;
  description: string;
  type: 'pillar' | 'current' | 'vent' | 'shield' | 'ink' | 'shards';
  active: boolean;
  cooldown: number;
}

export const CombatOverlay: React.FC<CombatOverlayProps> = ({ 
  playerStats, 
  enemy, 
  inventory,
  mapId,
  azeranJoined,
  finneganJoined,
  equippedWeapon,
  secondaryWeapon,
  onVictory, 
  onDefeat,
  onUsePotion
}) => {
  const [enemyHp, setEnemyHp] = React.useState(enemy.stats?.hp || 50);
  const [playerHp, setPlayerHp] = React.useState(playerStats.hp);
  const [bonusDamage, setBonusDamage] = React.useState(0);
  const [bonusDefense, setBonusDefense] = React.useState(0);
  const [poisonDamage, setPoisonDamage] = React.useState(0);
  const [log, setLog] = React.useState<string[]>([]);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [playerAnimation, setPlayerAnimation] = React.useState<'idle' | 'attack' | 'hit'>('idle');
  const [enemyAnimation, setEnemyAnimation] = React.useState<'idle' | 'attack' | 'hit'>('idle');
  const [specialEffect, setSpecialEffect] = React.useState<'none' | 'tide' | 'poison' | 'critical' | 'heal' | 'ability' | 'fire' | 'hazard'>('none');
  const [damagePopup, setDamagePopup] = React.useState<{ value: number, type: 'player' | 'enemy' | 'heal' } | null>(null);
  const [isShaking, setIsShaking] = React.useState(false);
  const [parryWindow, setParryWindow] = React.useState(false);
  const [parrySuccess, setParrySuccess] = React.useState(false);
  const [consecutiveParries, setConsecutiveParries] = React.useState(0);
  const [hazards, setHazards] = React.useState<Hazard[]>([]);
  const [nextAttackBlocked, setNextAttackBlocked] = React.useState(false);
  const [showHazardInfo, setShowHazardInfo] = React.useState(false);
  const parryRef = React.useRef(false);

  // Initialize hazards based on mapId
  React.useEffect(() => {
    const initialHazards: Hazard[] = [];
    if (mapId === 'dungeon_1') {
      initialHazards.push({
        id: 'pillar_1',
        name: 'Ancient Pillar',
        sprite: '🪨',
        description: 'Hide behind to block the next attack!',
        type: 'pillar',
        active: true,
        cooldown: 0
      });
    }
    if (mapId === 'dungeon_2') {
      initialHazards.push({
        id: 'shards_1',
        name: 'Diamond Shards',
        sprite: '💎',
        description: 'Shatter shards to damage and weaken the enemy!',
        type: 'shards',
        active: true,
        cooldown: 0
      });
    }
    if (mapId === 'dungeon_abyss') {
      initialHazards.push({
        id: 'ink_1',
        name: 'Abyssal Ink',
        sprite: '🦑',
        description: 'Release ink to blind the enemy!',
        type: 'ink',
        active: true,
        cooldown: 0
      });
    }
    if (mapId === 'dungeon_3') {
      initialHazards.push({
        id: 'vent_1',
        name: 'Lava Vent',
        sprite: '🔥',
        description: 'Trigger to burn the enemy!',
        type: 'vent',
        active: true,
        cooldown: 0
      });
    }
    if (mapId === 'coral_castle') {
      initialHazards.push({
        id: 'shield_1',
        name: 'Coral Shield',
        sprite: '🛡️',
        description: 'Harness the castle\'s power for a defense boost!',
        type: 'shield',
        active: true,
        cooldown: 0
      });
    }
    setHazards(initialHazards);
  }, [mapId]);

  const triggerHazard = (hazard: Hazard) => {
    if (!hazard.active || isAnimating || playerHp <= 0 || enemyHp <= 0) return;

    sounds.playHazardTrigger();
    
    if (hazard.type === 'pillar') {
      setNextAttackBlocked(true);
      setLog(prev => ["You take cover behind the Ancient Pillar!", ...prev]);
      setHazards(prev => prev.map(h => h.id === hazard.id ? { ...h, active: false } : h));
      sounds.playPillarBreak();
    } else if (hazard.type === 'vent') {
      const ventDmg = 150;
      const nextEnemyHp = Math.max(0, enemyHp - ventDmg);
      setEnemyHp(nextEnemyHp);
      setLog(prev => ["You trigger the Lava Vent! Bob is scorched!", ...prev]);
      setEnemyAnimation('hit');
      setDamagePopup({ value: ventDmg, type: 'enemy' });
      setSpecialEffect('fire');
      setIsShaking(true);
      setHazards(prev => prev.map(h => h.id === hazard.id ? { ...h, active: false, cooldown: 3 } : h));
      setTimeout(() => {
        setDamagePopup(null);
        setSpecialEffect('none');
        setIsShaking(false);
      }, 600);
      
      if (nextEnemyHp <= 0) {
        setTimeout(() => {
          onVictory(enemy.stats?.exp || 0, enemy.stats?.gold || 0, playerHp);
        }, 1000);
      }
    } else if (hazard.type === 'shield') {
      setBonusDefense(prev => prev + 20);
      setLog(prev => ["The Coral Shield bolsters your defense!", ...prev]);
      setSpecialEffect('heal');
      setHazards(prev => prev.map(h => h.id === hazard.id ? { ...h, active: false, cooldown: 5 } : h));
      setTimeout(() => setSpecialEffect('none'), 600);
    } else if (hazard.type === 'ink') {
      setNextAttackBlocked(true); // Blinding the enemy effectively blocks their next attack
      setLog(prev => ["You release Abyssal Ink! The enemy is blinded!", ...prev]);
      setSpecialEffect('ability');
      setHazards(prev => prev.map(h => h.id === hazard.id ? { ...h, active: false, cooldown: 4 } : h));
      setTimeout(() => setSpecialEffect('none'), 600);
    } else if (hazard.type === 'shards') {
      const shardDmg = 100;
      const nextEnemyHp = Math.max(0, enemyHp - shardDmg);
      setEnemyHp(nextEnemyHp);
      setBonusDamage(prev => prev + 10); // Weaken enemy defense = increase player damage
      setLog(prev => ["Diamond Shards explode, damaging and weakening the enemy!", ...prev]);
      setEnemyAnimation('hit');
      setDamagePopup({ value: shardDmg, type: 'enemy' });
      setHazards(prev => prev.map(h => h.id === hazard.id ? { ...h, active: false, cooldown: 4 } : h));
      setTimeout(() => setDamagePopup(null), 600);
      
      if (nextEnemyHp <= 0) {
        setTimeout(() => {
          onVictory(enemy.stats?.exp || 0, enemy.stats?.gold || 0, playerHp);
        }, 1000);
      }
    }
  };

  const consumables = inventory.filter(item => item.type === 'consumable');

  const useConsumable = (item: Item) => {
    if (isAnimating || playerHp <= 0) return;
    
    let used = false;
    let logMsg = `You consume ${item.name}`;

    if (item.stats?.hp) {
      sounds.playHeal();
      const healAmount = item.stats.hp;
      setPlayerHp(prev => Math.min(playerStats.maxHp, prev + healAmount));
      logMsg += ` and restore ${healAmount} HP`;
      setSpecialEffect('heal');
      setDamagePopup({ value: healAmount, type: 'heal' });
      used = true;
    }

    if (item.stats?.attack) {
      if (!used) sounds.playHeal();
      const boost = item.stats.attack;
      setBonusDamage(prev => prev + boost);
      logMsg += `${used ? ',' : ''} and gain +${boost} Attack`;
      setSpecialEffect('ability');
      used = true;
    }

    if (item.stats?.defense) {
      if (!used) sounds.playHeal();
      const boost = item.stats.defense;
      setBonusDefense(prev => prev + boost);
      logMsg += `${used ? ',' : ''} and gain +${boost} Defense`;
      setSpecialEffect('ability');
      used = true;
    }

    if (used) {
      setLog(prev => [`${logMsg} for this battle!`, ...prev]);
      setTimeout(() => {
        setSpecialEffect('none');
        setDamagePopup(null);
      }, 600);
    } else {
      setLog(prev => [`You consume ${item.name}, but nothing happens...`, ...prev]);
    }
    onUsePotion(item);
  };

  const attack = () => {
    if (isAnimating || playerHp <= 0 || enemyHp <= 0) return;
    setIsAnimating(true);
    parryRef.current = false;

    const isTideSword = (equippedWeapon?.baseId || equippedWeapon?.id) === 'sword_of_the_tides' || (secondaryWeapon?.baseId || secondaryWeapon?.id) === 'sword_of_the_tides';
    const isPoisonSword = (equippedWeapon?.baseId || equippedWeapon?.id) === 'poison_steel_sword' || (secondaryWeapon?.baseId || secondaryWeapon?.id) === 'poison_steel_sword';
    const poisonCount = ((equippedWeapon?.baseId || equippedWeapon?.id) === 'poison_steel_sword' ? 1 : 0) + ((secondaryWeapon?.baseId || secondaryWeapon?.id) === 'poison_steel_sword' ? 1 : 0);
    const currentPoisonBonus = poisonDamage;
    
    const isCritical = Math.random() < 0.15;
    
    if (isCritical) setSpecialEffect('critical');
    else if (isTideSword) setSpecialEffect('tide');
    else if (isPoisonSword) setSpecialEffect('poison');

    let playerDmg = Math.max(5, (playerStats.attack + bonusDamage + currentPoisonBonus) - (enemy.stats?.defense || 0));
    
    // Apply parry bonus if any
    const parryMultiplier = 1 + (consecutiveParries * 0.2); // 20% bonus per consecutive parry
    if (consecutiveParries > 0) {
      playerDmg = Math.floor(playerDmg * parryMultiplier);
    }

    if (isCritical) {
      playerDmg = Math.floor(playerDmg * 1.5);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
    
    let totalDmg = playerDmg;
    let azeranDmg = 0;

    if (azeranJoined) {
      azeranDmg = Math.floor(playerStats.attack * 0.5);
      totalDmg += azeranDmg;
    }

    const newEnemyHp = Math.max(0, enemyHp - totalDmg);
    
    let attackMsg = `You strike ${enemy.name} for ${playerDmg} damage!`;
    if (consecutiveParries > 0) {
      attackMsg = `EMPOWERED STRIKE! You strike ${enemy.name} for ${playerDmg} damage!`;
    }
    if (isCritical) {
      attackMsg = `CRITICAL HIT! You strike ${enemy.name} for ${playerDmg} damage!`;
    }
    if (azeranJoined) {
      attackMsg = `You and Azeran strike ${enemy.name} for ${totalDmg} damage!`;
    }
    if (isPoisonSword && currentPoisonBonus > 0) {
      attackMsg += ` (+${currentPoisonBonus} poison bonus!)`;
    }
    
    setLog(prev => [attackMsg, ...prev]);
    setEnemyHp(newEnemyHp);
    setPlayerAnimation('attack');
    setEnemyAnimation('hit');
    setDamagePopup({ value: totalDmg, type: 'enemy' });
    
    if (isCritical) {
      sounds.playCriticalHit();
    } else if (isTideSword) {
      sounds.playTideAttack();
    } else if (isPoisonSword) {
      sounds.playPoisonAttack();
    } else {
      sounds.playAttack();
    }
    
    setTimeout(() => sounds.playEnemyHit(), 200);

    // Reset parry bonus after attack
    setConsecutiveParries(0);

    setTimeout(() => {
      setPlayerAnimation('idle');
      setEnemyAnimation('idle');
      setDamagePopup(null);
      setSpecialEffect('none');
    }, 400);

    // Reduce cooldowns
    setHazards(prev => prev.map(h => h.cooldown > 0 ? { ...h, cooldown: h.cooldown - 1, active: h.cooldown - 1 === 0 ? true : h.active } : h));

    if (isPoisonSword) {
      setPoisonDamage(prev => prev + (5 * poisonCount));
    }

    if (newEnemyHp <= 0) {
      setTimeout(() => {
        onVictory(enemy.stats?.exp || 0, enemy.stats?.gold || 0, playerHp);
      }, 1000);
      return;
    }

    // Start parry window after player's attack animation
    setTimeout(() => {
      setParryWindow(true);
      parryRef.current = false;
      sounds.playWhoosh();
      setTimeout(() => setParryWindow(false), 500);
    }, 400);

    setTimeout(() => {
      // Check if parried
      if (parryRef.current) {
        parryRef.current = false;
        setIsAnimating(false);
        return;
      }

      let enemyDmg = Math.max(2, (enemy.stats?.attack || 10) - (playerStats.defense + bonusDefense));
      
      if (nextAttackBlocked) {
        setNextAttackBlocked(false);
        setLog(prev => ["The Pillar blocks the attack!", ...prev]);
        setIsAnimating(false);
        return;
      }

      if (finneganJoined) {
        const reduction = Math.floor(playerStats.defense * 0.5);
        enemyDmg = Math.max(1, enemyDmg - reduction);
      }

      let abilityMsg = "";

      let isSpecialAbility = false;

      // Special Abilities
      if (enemy.type === 'giant_crab' && Math.random() < 0.25) {
        const multiplier = 1.5;
        enemyDmg = Math.floor(enemyDmg * multiplier);
        abilityMsg = `${enemy.name} uses Crushing Pinch! It deals massive damage!`;
        setSpecialEffect('ability');
        isSpecialAbility = true;
        setIsShaking(true);
        setTimeout(() => {
          setSpecialEffect('none');
          setIsShaking(false);
        }, 600);
      }

      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      
      // Reset consecutive parries on hit
      setConsecutiveParries(0);
      
      setEnemyAnimation('attack');
      setPlayerAnimation('hit');
      setDamagePopup({ value: enemyDmg, type: 'player' });
      
      if (enemy.type === 'boss') {
        sounds.playBossAttack();
      } else if (isSpecialAbility) {
        sounds.playSpecialAbility();
      } else {
        sounds.playEnemyAttack();
      }
      
      setTimeout(() => sounds.playShieldBlock(), 200);

      setTimeout(() => {
        setEnemyAnimation('idle');
        setPlayerAnimation('idle');
        setDamagePopup(null);
      }, 400);

      if (abilityMsg) {
        setLog(prev => [abilityMsg, ...prev]);
      }
      setLog(prev => [`${enemy.name} hits you for ${enemyDmg} damage!`, ...prev]);
      setPlayerHp(newPlayerHp);
      setIsAnimating(false);

      if (newPlayerHp <= 0) {
        sounds.playDeath();
        onDefeat();
      }
    }, 800);
  };

  const parry = () => {
    if (!parryWindow) return;
    
    setParryWindow(false);
    setParrySuccess(true);
    parryRef.current = true;
    sounds.playParry();
    
    const parryDmg = 70;
    const newEnemyHp = Math.max(0, enemyHp - parryDmg);
    
    setLog(prev => [`PERFECT PARRY! You counter-attack ${enemy.name} for ${parryDmg} damage!`, ...prev]);
    setConsecutiveParries(prev => prev + 1);
    setEnemyHp(newEnemyHp);
    setEnemyAnimation('hit');
    setDamagePopup({ value: parryDmg, type: 'enemy' });
    setSpecialEffect('critical');
    
    setTimeout(() => {
      setParrySuccess(false);
      setEnemyAnimation('idle');
      setDamagePopup(null);
      setSpecialEffect('none');
    }, 600);

    if (newEnemyHp <= 0) {
      setTimeout(() => {
        onVictory(enemy.stats?.exp || 0, enemy.stats?.gold || 0, playerHp);
      }, 1000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 overflow-hidden ${
      isShaking ? 'screen-shake' : ''
    } ${
      mapId === 'dungeon_1' ? 'bg-slate-950/90' :
      mapId === 'dungeon_2' ? 'bg-indigo-950/90' :
      mapId === 'dungeon_3' ? 'bg-rose-950/90' :
      mapId === 'dungeon_abyss' ? 'bg-purple-950/90' :
      'bg-slate-950/90'
    }`}>
      {/* Underwater Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-b from-sky-900/20 via-blue-900/40 to-slate-950 ${
          mapId === 'dungeon_3' ? 'from-red-900/20 via-orange-900/40 to-black' :
          mapId === 'dungeon_2' ? 'from-indigo-900/20 via-purple-900/40 to-black' :
          ''
        }`} />
        <div className="absolute inset-0 caustics-overlay" />
      </div>

      {/* Decorative Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="bubble" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              width: `${Math.random() * 8 + 4}px`, 
              height: `${Math.random() * 8 + 4}px`,
              animationDuration: `${Math.random() * 4 + 4}s`,
              animationDelay: `${Math.random() * 8}s`
            }} 
          />
        ))}
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Player Side */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-8 flex flex-col items-center relative"
        >
          <div className="flex gap-4 text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <Sword size={16} /> {playerStats.attack}
              {(bonusDamage + poisonDamage) > 0 && (
                <span className="text-emerald-400 font-bold">
                  +{bonusDamage + poisonDamage}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Shield size={16} /> {playerStats.defense}
              {bonusDefense !== 0 && (
                <span className={`${bonusDefense > 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
                  {bonusDefense > 0 ? `+${bonusDefense}` : bonusDefense}
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-rose-500" style={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }} />
          </div>

          {/* Attack Bar - Player Side */}
          <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">Attack Power</span>
              <span className="text-[8px] font-mono text-amber-400">{playerStats.attack + bonusDamage + poisonDamage}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, ((playerStats.attack + bonusDamage + poisonDamage) / 100) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Clickable Strike Bar */}
          <div className="w-full flex gap-2 mb-4">
            <button
              onClick={attack}
              disabled={isAnimating || enemyHp <= 0}
              className="flex-1 group relative"
            >
              <div className="absolute inset-0 bg-emerald-500/20 blur-sm rounded-lg group-hover:bg-emerald-500/30 transition-all" />
              <div className="relative bg-slate-800 border border-emerald-500/50 hover:border-emerald-400 py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Sword size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Strike</span>
              </div>
            </button>

            <button
              onClick={parry}
              disabled={enemyHp <= 0}
              className={`flex-1 group relative transition-all ${parryWindow ? 'scale-110' : 'opacity-50'}`}
            >
              <div className={`absolute inset-0 blur-sm rounded-lg transition-all ${parryWindow ? 'bg-amber-500/40 animate-pulse' : 'bg-slate-500/10'}`} />
              <div className={`relative bg-slate-800 border py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden ${parryWindow ? 'border-amber-400 text-amber-400' : 'border-slate-700 text-slate-500'}`}>
                <Shield size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Parry</span>
              </div>
              {parryWindow && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-0 right-0 text-center text-[8px] font-bold text-amber-400 animate-bounce"
                >
                  TAP NOW!
                </motion.div>
              )}
            </button>
          </div>

          {/* Consumables Bar - Player Side */}
          <div className="w-full mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
              {consumables.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic">No snacks left!</div>
              ) : (
                consumables.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => useConsumable(item)}
                    disabled={isAnimating}
                    className="flex flex-col items-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 p-2 rounded-lg border border-slate-700 transition-all min-w-[60px] group relative"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.sprite}</span>
                    <span className="text-[8px] font-bold text-white text-center leading-tight">{item.name}</span>
                    {item.quantity && item.quantity > 1 && (
                      <div className="absolute -top-1 -right-1 bg-sky-600 text-white text-[8px] font-black px-1 rounded-full border border-sky-400">
                        {item.quantity}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col items-center relative">
            {/* Hazards UI */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2">
                {hazards.map(hazard => (
                  <button
                    key={hazard.id}
                    onClick={() => triggerHazard(hazard)}
                    disabled={!hazard.active || isAnimating}
                    className={`relative p-2 rounded-lg border-2 transition-all ${
                      hazard.active 
                        ? 'bg-slate-800 border-amber-500 hover:scale-110' 
                        : 'bg-slate-900 border-slate-700 opacity-50'
                    }`}
                    title={hazard.description}
                  >
                    {hazard.sprite.startsWith('http') ? (
                      <img src={hazard.sprite} alt={hazard.name} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl">{hazard.sprite}</span>
                    )}
                    {hazard.cooldown > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                        <span className="text-xs font-bold text-white">{hazard.cooldown}</span>
                      </div>
                    )}
                    {hazard.active && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>
              
              {hazards.length > 0 && (
                <button 
                  onClick={() => setShowHazardInfo(!showHazardInfo)}
                  className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Hazard Info"
                >
                  <HelpCircle size={20} />
                </button>
              )}
            </div>

            {/* Hazard Info Panel */}
            <AnimatePresence>
              {showHazardInfo && hazards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-4 w-64 bg-slate-900 border border-amber-500/50 rounded-xl p-4 shadow-2xl z-50"
                >
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 border-b border-amber-500/20 pb-2">
                    Environmental Hazards
                  </h3>
                  <div className="space-y-3">
                    {hazards.map(hazard => (
                      <div key={hazard.id} className="flex gap-3">
                    {hazard.sprite.startsWith('http') ? (
                      <img src={hazard.sprite} alt={hazard.name} className="w-8 h-8 object-contain shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xl shrink-0">{hazard.sprite}</span>
                    )}
                        <div>
                          <div className="text-[10px] font-bold text-white uppercase">{hazard.name}</div>
                          <div className="text-[9px] text-slate-400 leading-tight">{hazard.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              animate={
                playerAnimation === 'attack' ? (
                  specialEffect === 'critical' ? { x: [0, 150, 0], scale: [1, 1.4, 1], filter: ['brightness(1)', 'brightness(2) drop-shadow(0 0 30px #eab308)', 'brightness(1)'] } :
                  specialEffect === 'tide' ? { x: [0, 120, 0], y: [0, -20, 20, 0], scale: [1, 1.2, 1], filter: ['brightness(1)', 'brightness(1.5) drop-shadow(0 0 30px #0ea5e9)', 'brightness(1)'] } :
                  specialEffect === 'poison' ? { x: [0, 60, 0], rotate: [0, 15, 0], filter: ['brightness(1)', 'brightness(1.2) drop-shadow(0 0 15px #22c55e)', 'brightness(1)'] } :
                  { x: [0, 40, 0] }
                ) :
                playerAnimation === 'hit' ? (
                  specialEffect === 'hazard' ? { x: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1], filter: ['brightness(1)', 'brightness(2) saturate(2) hue-rotate(180deg)', 'brightness(1)'] } :
                  { x: [0, -5, 5, -5, 5, 0], filter: ['brightness(1)', 'brightness(2) saturate(2) hue-rotate(320deg)', 'brightness(1)'] }
                ) :
                { x: 0, filter: 'brightness(1)' }
              }
              transition={{ duration: playerAnimation === 'hit' ? 0.2 : (specialEffect === 'critical' ? 0.3 : (specialEffect === 'tide' ? 0.6 : 0.4)) }}
              className={`flex items-end gap-2 relative ${playerAnimation === 'hit' ? 'flash-white' : ''} ${specialEffect === 'heal' ? 'heal-glow' : ''}`}
            >
              {specialEffect === 'tide' && (
                <>
                  <div className="tide-attack-trail top-1/2 left-0" />
                  <div className="swirling-water top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className="water-particle" 
                      style={{ 
                        '--dx': `${Math.random() * 200 - 100}px`, 
                        '--dy': `${Math.random() * 200 - 100}px`,
                        width: `${Math.random() * 8 + 4}px`,
                        height: `${Math.random() * 8 + 4}px`,
                        left: '50%',
                        top: '50%'
                      } as any} 
                    />
                  ))}
                </>
              )}
              {specialEffect === 'hazard' && <div className="hazard-current-overlay" />}
              {specialEffect === 'poison' && <div className="poison-attack-trail top-1/2 left-0" />}
              {specialEffect === 'heal' && <div className="ability-aura" style={{ borderColor: '#22c55e' }} />}
              {consecutiveParries > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full -z-10"
                />
              )}
              <div className="w-32 h-32 mb-2 relative flex items-center justify-center">
                <span className="text-8xl">🦈</span>
                {consecutiveParries > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -20 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 font-black text-xl whitespace-nowrap drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  >
                    EMPOWERED x{consecutiveParries}
                  </motion.div>
                )}
              </div>
              {azeranJoined && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mb-2 flex items-center justify-center"
                >
                  <span className="text-5xl">🐱</span>
                </motion.div>
              )}
              {finneganJoined && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mb-2 flex items-center justify-center"
                >
                  <span className="text-5xl">🦈</span>
                </motion.div>
              )}
              <AnimatePresence>
                {parrySuccess && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 font-black text-2xl drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-50 whitespace-nowrap"
                  >
                    PARRIED!
                  </motion.div>
                )}
                {damagePopup?.type === 'player' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -50 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] z-50"
                  >
                    -{damagePopup.value}
                  </motion.div>
                )}
                {damagePopup?.type === 'heal' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -50 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] z-50"
                  >
                    +{damagePopup.value}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              {azeranJoined && finneganJoined ? 'The Hammerhead Trio' : azeranJoined ? 'Hammerhead & Azeran' : 'Hammerhead Hero'}
            </h2>
          </div>
        </motion.div>

        {/* Enemy Side */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-slate-900 border-2 border-red-500 rounded-2xl p-8 flex flex-col items-center"
        >
          <div className="flex gap-4 text-slate-400 mb-4">
            <span className="flex items-center gap-1"><Sword size={16} /> {enemy.stats?.attack}</span>
            <span className="flex items-center gap-1"><Shield size={16} /> {enemy.stats?.defense}</span>
          </div>
          <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-rose-500" style={{ width: `${(enemyHp / (enemy.stats?.maxHp || 100)) * 100}%` }} />
          </div>
          
          {/* Attack Bar - Enemy Side */}
          <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">Attack Power</span>
              <span className="text-[8px] font-mono text-amber-400">{enemy.stats?.attack}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, ((enemy.stats?.attack || 0) / 100) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Enemy Target Indicator (Symmetry) */}
          <div className="w-full mb-4 relative opacity-50">
            <div className="relative bg-slate-800 border border-red-500/30 py-2 rounded-lg flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Enemy Target</span>
            </div>
          </div>

          {/* Empty Potion Bar - Enemy Side (for symmetry) */}
          <div className="w-full mb-6 h-[48px] flex items-center justify-center">
            <div className="text-[10px] text-slate-700 font-mono tracking-widest uppercase opacity-30">Enemy Status</div>
          </div>

          <div className="flex flex-col items-center">
            <motion.div 
              animate={
                enemyAnimation === 'attack' ? (
                  specialEffect === 'ability' ? { x: [0, -100, 0], scale: [1, 1.3, 1], filter: ['brightness(1)', 'brightness(1.5) drop-shadow(0 0 20px #f87171)', 'brightness(1)'] } :
                  { x: [0, -40, 0] }
                ) :
                enemyAnimation === 'hit' ? (
                  specialEffect === 'fire' ? { x: [0, 10, -10, 10, -10, 0], scale: [1, 1.3, 1], filter: ['brightness(1)', 'brightness(3) saturate(5) hue-rotate(30deg) drop-shadow(0 0 40px #ff4500)', 'brightness(1)'] } :
                  specialEffect === 'hazard' ? { x: [0, 10, -10, 10, -10, 0], scale: [1, 1.2, 1], filter: ['brightness(1)', 'brightness(2) saturate(2) hue-rotate(180deg)', 'brightness(1)'] } :
                  { x: [0, 5, -5, 5, -5, 0], scale: [1, 1.15, 1], filter: ['brightness(1)', 'brightness(2) saturate(4) hue-rotate(340deg) drop-shadow(0 0 25px #ff0000)', 'brightness(1)'] }
                ) :
                { 
                  x: 0, 
                  y: [0, -10, 0],
                  filter: 'brightness(1)' 
                }
              }
              transition={
                enemyAnimation === 'idle' ? 
                { duration: 2, repeat: Infinity, ease: "easeInOut" } :
                { duration: enemyAnimation === 'hit' ? 0.2 : (specialEffect === 'ability' ? 0.5 : 0.4) }
              }
              className={`w-40 h-40 mb-2 relative flex items-center justify-center ${enemyAnimation === 'hit' ? 'flash-white' : ''} ${
                enemy.id === 'boss_fish' ? 'boss-evil-aura' : 
                enemy.id === 'boss_3' ? 'bob-green-aura' :
                (enemy.type === 'goblin' || enemy.type === 'hobgoblin') ? 'red-goblin-tint' : ''
              }`}
            >
              {specialEffect === 'ability' && <div className="ability-aura" style={{ borderColor: '#f87171' }} />}
              {specialEffect === 'fire' && <div className="lava-burst" />}
              {enemy.sprite?.startsWith('http') ? (
                <img 
                  src={enemy.sprite} 
                  alt={enemy.name} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-8xl">{enemy.sprite}</span>
              )}
              <AnimatePresence>
                {damagePopup?.type === 'enemy' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -50 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black ${specialEffect === 'critical' ? 'text-amber-500 scale-150 z-[60]' : 'text-yellow-400'} drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] z-50`}
                  >
                    -{damagePopup.value}
                    {specialEffect === 'critical' && <span className="block text-xs uppercase tracking-widest">Crit!</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <h2 className={`text-xl font-black uppercase tracking-wider ${
              enemy.id === 'boss_fish' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-white'
            }`}>
              {enemy.name}
            </h2>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
