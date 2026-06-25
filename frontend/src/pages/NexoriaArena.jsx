import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Swords, Zap, Heart, Skull, Activity, Flame } from 'lucide-react';
import SEO from '../components/SEO';

const ENEMIES = [
  { name: 'Mutated Scavenger', maxHp: 100, damage: 10, color: 'text-amber-500', bg: 'bg-amber-500' },
  { name: 'Cybernetic Assassin', maxHp: 150, damage: 18, color: 'text-rose-500', bg: 'bg-rose-500' },
  { name: 'Toxic Behemoth', maxHp: 250, damage: 25, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { name: 'Void Phantom', maxHp: 350, damage: 35, color: 'text-purple-500', bg: 'bg-purple-500' },
  { name: 'Nexoria Overlord', maxHp: 500, damage: 50, color: 'text-red-600', bg: 'bg-red-600' }
];

const NexoriaArena = () => {
  const [level, setLevel] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerEnergy, setPlayerEnergy] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].maxHp);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  const [combatLog, setCombatLog] = useState(['Welcome to Nexoria Arena. Prepare to fight.']);
  const [screenShake, setScreenShake] = useState(false);
  const [bloodFlash, setBloodFlash] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentEnemy = ENEMIES[level] || ENEMIES[ENEMIES.length - 1];

  const addLog = (msg) => {
    setCombatLog(prev => [msg, ...prev].slice(0, 5));
  };

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  const triggerBlood = () => {
    setBloodFlash(true);
    setTimeout(() => setBloodFlash(false), 400);
  };

  // Enemy Turn Logic
  useEffect(() => {
    if (!isPlayerTurn && !isDead && !isVictory) {
      const timer = setTimeout(() => {
        if (enemyHp <= 0) return;
        
        // Enemy decision
        const action = Math.random();
        let dmg = 0;
        
        if (action < 0.2) {
          addLog(`${currentEnemy.name} missed the attack!`);
        } else if (action < 0.8) {
          dmg = Math.floor(currentEnemy.damage * (0.8 + Math.random() * 0.4));
          addLog(`${currentEnemy.name} strikes you for ${dmg} damage!`);
        } else {
          dmg = Math.floor(currentEnemy.damage * 1.5);
          addLog(`CRITICAL! ${currentEnemy.name} crushes you for ${dmg} damage!`);
        }

        if (dmg > 0) {
          setPlayerHp(prev => {
            const newHp = Math.max(0, prev - dmg);
            if (newHp === 0) {
              setIsDead(true);
              addLog('You have died...');
            }
            return newHp;
          });
          triggerBlood();
          triggerShake();
        }
        
        setIsPlayerTurn(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, enemyHp, isDead, isVictory, currentEnemy]);

  const handleAttack = (type) => {
    if (!isPlayerTurn || isDead || isVictory) return;

    let dmg = 0;
    if (type === 'quick') {
      dmg = Math.floor(15 + Math.random() * 10);
      addLog(`You used Quick Slash for ${dmg} damage.`);
    } else if (type === 'heavy') {
      if (playerEnergy < 30) {
        addLog('Not enough energy for Heavy Strike!');
        return;
      }
      setPlayerEnergy(prev => prev - 30);
      dmg = Math.floor(35 + Math.random() * 20);
      addLog(`You used Heavy Strike for ${dmg} damage!`);
      triggerShake();
    } else if (type === 'heal') {
      if (playerEnergy < 40) {
        addLog('Not enough energy to Heal!');
        return;
      }
      setPlayerEnergy(prev => prev - 40);
      const healAmt = 40;
      setPlayerHp(prev => Math.min(playerMaxHp, prev + healAmt));
      addLog(`You healed for ${healAmt} HP.`);
      setIsPlayerTurn(false);
      return;
    }

    // Apply damage
    setEnemyHp(prev => {
      const newHp = Math.max(0, prev - dmg);
      if (newHp === 0) {
        handleEnemyDeath();
      }
      return newHp;
    });
    
    if (enemyHp - dmg > 0) {
      setIsPlayerTurn(false);
    }
  };

  const handleEnemyDeath = () => {
    addLog(`You defeated ${currentEnemy.name}!`);
    if (level + 1 >= ENEMIES.length) {
      setIsVictory(true);
      addLog('YOU ARE THE ARENA CHAMPION!');
    } else {
      setTimeout(() => {
        setLevel(prev => prev + 1);
        setEnemyHp(ENEMIES[level + 1].maxHp);
        setPlayerMaxHp(prev => prev + 20);
        setPlayerHp(prev => prev + 50); // heal on level up
        setPlayerEnergy(100);
        addLog(`A new challenger approaches: ${ENEMIES[level + 1].name}`);
        setIsPlayerTurn(true);
      }, 2000);
    }
  };

  const restartGame = () => {
    setLevel(0);
    setPlayerMaxHp(100);
    setPlayerHp(100);
    setPlayerEnergy(100);
    setEnemyHp(ENEMIES[0].maxHp);
    setIsDead(false);
    setIsVictory(false);
    setIsPlayerTurn(true);
    setCombatLog(['You have re-entered the arena.']);
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 overflow-hidden relative ${screenShake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
      <SEO title="Nexoria Arena | 18+ RPG Fighter" />
      
      {/* Blood Flash Overlay */}
      <AnimatePresence>
        {bloodFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600 pointer-events-none z-50 mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            Nexoria Arena
          </h1>
          <p className="text-red-500/80 font-bold mt-2 uppercase tracking-widest text-sm">Fight to Survive</p>
        </div>

        {/* Combat Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative">
          {/* VS Badge */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#111] border-2 border-red-900 rounded-full items-center justify-center z-10 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            <Swords className="w-8 h-8 text-red-500" />
          </div>

          {/* Player Card */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Shield className="w-6 h-6" /> You
            </h2>
            
            {/* HP Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold mb-1 text-slate-400">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> HP</span>
                <span>{Math.floor(playerHp)} / {playerMaxHp}</span>
              </div>
              <div className="h-4 bg-[#222] rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                  transition={{ type: 'spring' }}
                />
              </div>
            </div>

            {/* Energy Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold mb-1 text-slate-400">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> Energy</span>
                <span>{playerEnergy} / 100</span>
              </div>
              <div className="h-3 bg-[#222] rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${playerEnergy}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleAttack('quick')}
                disabled={!isPlayerTurn || isDead || isVictory}
                className="bg-[#222] hover:bg-[#333] disabled:opacity-50 border border-white/10 rounded-xl p-3 text-sm font-bold transition-all active:scale-95 flex flex-col items-center gap-1 text-slate-300 hover:text-white hover:border-slate-500"
              >
                <Swords className="w-5 h-5" /> Quick Slash
              </button>
              <button 
                onClick={() => handleAttack('heavy')}
                disabled={!isPlayerTurn || isDead || isVictory || playerEnergy < 30}
                className="bg-red-900/20 hover:bg-red-900/40 disabled:opacity-50 border border-red-500/20 hover:border-red-500/50 rounded-xl p-3 text-sm font-bold transition-all active:scale-95 flex flex-col items-center gap-1 text-red-400 hover:text-red-300"
              >
                <Flame className="w-5 h-5" /> Heavy Strike (30E)
              </button>
              <button 
                onClick={() => handleAttack('heal')}
                disabled={!isPlayerTurn || isDead || isVictory || playerEnergy < 40}
                className="col-span-2 bg-emerald-900/20 hover:bg-emerald-900/40 disabled:opacity-50 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-3 text-sm font-bold transition-all active:scale-95 flex flex-col items-center gap-1 text-emerald-400 hover:text-emerald-300"
              >
                <Heart className="w-5 h-5" /> Heal Wound (40E)
              </button>
            </div>
          </div>

          {/* Enemy Card */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-40 h-40 ${currentEnemy.bg} blur-[70px] opacity-20 rounded-full`}></div>
            <h2 className={`text-2xl font-black mb-4 flex items-center gap-2 ${currentEnemy.color}`}>
              <Skull className="w-6 h-6" /> {currentEnemy.name}
            </h2>
            
            <div className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-wider">Level {level + 1} Boss</div>

            {/* Enemy HP */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold mb-1 text-slate-400">
                <span>Health</span>
                <span>{Math.floor(enemyHp)} / {currentEnemy.maxHp}</span>
              </div>
              <div className="h-6 bg-[#222] rounded-full overflow-hidden border border-white/5 relative">
                <motion.div 
                  className={`h-full ${currentEnemy.bg}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(enemyHp / currentEnemy.maxHp) * 100}%` }}
                  transition={{ type: 'spring' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black mix-blend-difference text-white">
                  {Math.floor((enemyHp / currentEnemy.maxHp) * 100)}%
                </div>
              </div>
            </div>

            {/* Enemy Status */}
            <div className="mt-8 flex items-center justify-center h-24 border border-dashed border-white/10 rounded-xl bg-black/20">
              {isPlayerTurn ? (
                <span className="text-slate-500 font-bold animate-pulse text-sm">Waiting for your move...</span>
              ) : (
                <span className="text-red-500 font-black animate-pulse flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Attacking...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Combat Log */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 md:p-6 font-mono text-sm shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 to-transparent"></div>
          <h3 className="text-slate-500 mb-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <Activity className="w-4 h-4" /> Battle Log
          </h3>
          <div className="space-y-2">
            {combatLog.map((log, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 - idx * 0.2, x: 0 }}
                className={`py-1 ${idx === 0 ? 'text-white font-bold text-base' : 'text-slate-400'}`}
              >
                > {log}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Over / Victory Overlays */}
        <AnimatePresence>
          {(isDead || isVictory) && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`max-w-md w-full p-8 rounded-3xl border text-center ${
                  isVictory ? 'bg-gradient-to-b from-[#111] to-emerald-900/20 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]' 
                            : 'bg-gradient-to-b from-[#111] to-red-900/20 border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)]'
                }`}
              >
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 bg-black/50 border border-white/10">
                  {isVictory ? <Crown className="w-10 h-10 text-emerald-400" /> : <Skull className="w-10 h-10 text-red-500" />}
                </div>
                <h2 className={`text-4xl font-black mb-2 uppercase ${isVictory ? 'text-emerald-400' : 'text-red-500'}`}>
                  {isVictory ? 'Victory!' : 'You Died'}
                </h2>
                <p className="text-slate-400 mb-8 font-medium">
                  {isVictory ? 'You have conquered the Nexoria Arena and defeated all bosses!' : `You were slain by ${currentEnemy.name} on Level ${level + 1}.`}
                </p>
                <button 
                  onClick={restartGame}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                    isVictory ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' 
                              : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                  }`}
                >
                  {isVictory ? 'Play Again' : 'Try Again'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// Simple Crown icon component fallback since lucide-react might not have Crown imported above
const Crown = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

export default NexoriaArena;
