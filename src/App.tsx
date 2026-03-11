import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Heart, 
  Zap, 
  Shield, 
  ChevronRight,
  Home,
  Settings
} from 'lucide-react';
import { GameState } from './types';
import { ACHIEVEMENTS } from './constants';
import { Starfield } from './components/Starfield';
import { GameCanvas } from './components/GameCanvas';
import { Sidebar } from './components/Sidebar';
import { AchievementPopup } from './components/AchievementPopup';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [level, setLevel] = useState(1);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setHealth(3);
    setLevel(1);
  };

  const handlePause = useCallback(() => {
    if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
    else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
  }, [gameState]);

  const handleGameOver = (finalScore: number, finalLevel: number) => {
    setScore(finalScore);
    setLevel(finalLevel);
    setGameState(GameState.GAMEOVER);
  };

  const handleAchievementUnlock = (id: string) => {
    if (!unlockedAchievements.includes(id)) {
      setUnlockedAchievements(prev => [...prev, id]);
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
        setCurrentAchievement(achievement);
        setTimeout(() => setCurrentAchievement(null), 3000);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') handlePause();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePause]);

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden select-none">
      <Starfield />
      <AchievementPopup achievement={currentAchievement} />

      {/* Header / HUD */}
      <header className="p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <span className="font-display font-bold text-xl tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <ChevronRight size={18} className="text-blue-400" />
            <span className="font-display font-bold">LVL {level}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                size={24} 
                className={i < health ? "text-rose-500 fill-rose-500" : "text-white/20"} 
              />
            ))}
          </div>
          <button 
            onClick={handlePause}
            className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            {gameState === GameState.PAUSED ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-8 p-4 lg:p-8 max-w-7xl mx-auto w-full h-[calc(100vh-80px)]">
        <Sidebar />
        
        <div className="flex-1 relative glass-dark rounded-3xl overflow-hidden border border-white/5">
          <GameCanvas 
            gameState={gameState}
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
            onHealthUpdate={setHealth}
            onLevelUpdate={setLevel}
            onAchievementUnlock={handleAchievementUnlock}
          />

          {/* Overlays */}
          <AnimatePresence>
            {gameState === GameState.START && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center glass-dark backdrop-blur-xl p-8 text-center"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-6xl lg:text-8xl font-display font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                    MARK
                  </h1>
                  <h2 className="text-2xl lg:text-3xl font-display font-bold tracking-[0.2em] text-blue-400 mb-12">
                    星际先锋
                  </h2>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="btn-glass px-12 py-4 text-xl border-blue-500/50 hover:border-blue-400"
                >
                  <Play className="fill-current" />
                  开始作战
                </motion.button>

                <div className="mt-12 grid grid-cols-3 gap-8 text-white/40">
                  <div className="flex flex-col items-center gap-2">
                    <Zap size={20} />
                    <span className="text-xs uppercase tracking-widest">极速射击</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Shield size={20} />
                    <span className="text-xs uppercase tracking-widest">能量护盾</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Trophy size={20} />
                    <span className="text-xs uppercase tracking-widest">成就挑战</span>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === GameState.PAUSED && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center glass-dark backdrop-blur-md"
              >
                <h2 className="text-4xl font-display font-bold mb-8">游戏暂停</h2>
                <div className="flex flex-col gap-4 w-48">
                  <button onClick={handlePause} className="btn-glass">
                    <Play size={18} /> 继续游戏
                  </button>
                  <button onClick={() => setGameState(GameState.START)} className="btn-glass border-white/10">
                    <Home size={18} /> 返回主页
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === GameState.GAMEOVER && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center glass-dark backdrop-blur-xl p-8"
              >
                <h2 className="text-5xl lg:text-7xl font-display font-black text-rose-500 mb-2">任务失败</h2>
                <p className="text-white/60 mb-8 uppercase tracking-widest">战机已被摧毁</p>
                
                <div className="grid grid-cols-2 gap-4 mb-12 w-full max-w-md">
                  <div className="glass p-4 rounded-2xl text-center">
                    <p className="text-xs text-white/40 uppercase mb-1">最终得分</p>
                    <p className="text-3xl font-display font-bold text-amber-400">{score.toLocaleString()}</p>
                  </div>
                  <div className="glass p-4 rounded-2xl text-center">
                    <p className="text-xs text-white/40 uppercase mb-1">最高关卡</p>
                    <p className="text-3xl font-display font-bold text-blue-400">{level}</p>
                  </div>
                </div>

                <div className="w-full max-w-md mb-12">
                  <p className="text-xs text-white/40 uppercase mb-4 text-center">已解锁成就</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {unlockedAchievements.length > 0 ? (
                      unlockedAchievements.map(id => {
                        const a = ACHIEVEMENTS.find(ach => ach.id === id);
                        return (
                          <div key={id} className="glass px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border-amber-500/30">
                            <Trophy size={12} className="text-amber-500" />
                            {a?.title}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-sm text-white/20 italic">暂无成就</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleStart} className="btn-glass px-8 border-blue-500/50">
                    <RotateCcw size={18} /> 重新开始
                  </button>
                  <button onClick={() => setGameState(GameState.START)} className="btn-glass px-8 border-white/10">
                    <Home size={18} /> 返回主页
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Mobile Controls Hint */}
      <footer className="p-4 text-center text-[10px] text-white/20 uppercase tracking-[0.3em] lg:block hidden">
        © 2026 MARK INTERSTELLAR VANGUARD • ALL SYSTEMS NOMINAL
      </footer>
    </div>
  );
}
