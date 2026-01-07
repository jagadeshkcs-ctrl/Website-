
import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import { GameStatus, Difficulty, GameState } from './types';
import { Trophy, Play, RotateCcw, Pause, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('neon-nitro-highscore') || '0'),
    difficulty: Difficulty.MEDIUM,
    status: GameStatus.START
  });

  useEffect(() => {
    localStorage.setItem('neon-nitro-highscore', gameState.highScore.toString());
  }, [gameState.highScore]);

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center gap-6">
        
        {/* Title Section */}
        <div className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            NEON NITRO
          </h1>
          <p className="text-gray-500 uppercase tracking-[0.2em] text-xs font-semibold">Speed Demon Protocol</p>
        </div>

        {/* Game Area */}
        <div className="relative group">
          <Game gameState={gameState} setGameState={setGameState} />

          {/* Overlays */}
          {gameState.status === GameStatus.START && (
            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
              <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-orbitron mb-6">READY TO RACE?</h2>
              
              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                  {Object.values(Difficulty).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setGameState(prev => ({ ...prev, difficulty: diff }))}
                      className={`py-2 text-xs font-bold rounded transition-all ${
                        gameState.difficulty === diff 
                          ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                          : 'hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }))}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors group"
                >
                  <Play className="fill-current" size={20} />
                  IGNITION START
                </button>
              </div>
              
              <div className="mt-8 text-gray-500 text-[10px] leading-relaxed">
                USE ARROW KEYS OR WASD TO NAVIGATE<br/>
                AVOID OBSTACLES • SURVIVE LONGER • SCORE HIGHER
              </div>
            </div>
          )}

          {gameState.status === GameStatus.PAUSED && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <h2 className="text-4xl font-orbitron text-white mb-8 tracking-widest">PAUSED</h2>
              <button 
                onClick={togglePause}
                className="bg-cyan-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Play className="fill-current" /> RESUME
              </button>
            </div>
          )}

          {gameState.status === GameStatus.GAME_OVER && (
            <div className="absolute inset-0 z-10 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in zoom-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                <RotateCcw className="text-white w-10 h-10" />
              </div>
              <h2 className="text-3xl font-orbitron font-bold text-white mb-2">SYSTEM CRASH</h2>
              <p className="text-red-300 text-sm uppercase tracking-widest mb-8 font-semibold">Totaled Engine</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-black/40 p-4 rounded-lg border border-red-500/30">
                  <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Final Distance</p>
                  <p className="text-2xl font-orbitron text-white">{gameState.score}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-red-500/30">
                  <p className="text-[10px] text-red-400 font-bold uppercase mb-1">High Score</p>
                  <p className="text-2xl font-orbitron text-white">{gameState.highScore}</p>
                </div>
              </div>

              <button 
                onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, score: 0 }))}
                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
              >
                REDEPLOY UNIT
              </button>
              
              <button 
                onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.START }))}
                className="mt-4 text-white/50 hover:text-white text-sm font-semibold uppercase tracking-wider"
              >
                Return to Base
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="w-full flex justify-between items-center px-2">
          <div className="flex gap-4">
             {gameState.status === GameStatus.PLAYING && (
               <button 
                 onClick={togglePause}
                 className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
               >
                 <Pause size={20} className="text-white" />
               </button>
             )}
          </div>
          <div className="flex gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>&copy; 2024 NEON LABS</span>
            <span className="text-white/20">|</span>
            <span>V 1.0.4-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
