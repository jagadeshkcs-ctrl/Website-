
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameStatus, 
  Difficulty, 
  GameObject, 
  GameState 
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  CAR_WIDTH, 
  CAR_HEIGHT, 
  ROAD_COLOR, 
  PLAYER_COLOR, 
  OBSTACLE_COLORS,
  DIFFICULTY_SETTINGS 
} from '../constants';
import { audio } from '../utils/audio';

interface GameProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const Game: React.FC<GameProps> = ({ gameState, setGameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Player state
  const playerRef = useRef<GameObject>({
    x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2,
    y: CANVAS_HEIGHT - CAR_HEIGHT - 20,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    color: PLAYER_COLOR,
    speedMultiplier: 1
  });

  // Game engine state refs
  const obstaclesRef = useRef<GameObject[]>([]);
  const roadOffsetRef = useRef(0);
  const currentSpeedRef = useRef(DIFFICULTY_SETTINGS[gameState.difficulty].baseSpeed);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const spawnObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * 3);
    const laneWidth = CANVAS_WIDTH / 3;
    const x = lane * laneWidth + (laneWidth - CAR_WIDTH) / 2;
    
    const newObstacle: GameObject = {
      x,
      y: -CAR_HEIGHT,
      width: CAR_WIDTH,
      height: CAR_HEIGHT,
      color: OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)],
      speedMultiplier: 0.5 + Math.random() * 0.5
    };

    obstaclesRef.current.push(newObstacle);
  }, []);

  const resetGame = useCallback(() => {
    playerRef.current.x = CANVAS_WIDTH / 2 - CAR_WIDTH / 2;
    obstaclesRef.current = [];
    roadOffsetRef.current = 0;
    currentSpeedRef.current = DIFFICULTY_SETTINGS[gameState.difficulty].baseSpeed;
    setGameState(prev => ({ ...prev, score: 0 }));
  }, [gameState.difficulty, setGameState]);

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING) {
      resetGame();
    }
  }, [gameState.status === GameStatus.PLAYING]);

  const drawCar = (ctx: CanvasRenderingContext2D, car: GameObject, isPlayer: boolean) => {
    ctx.save();
    
    // Shadow
    ctx.shadowBlur = 15;
    ctx.shadowColor = car.color;

    // Body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.roundRect(car.x, car.y, car.width, car.height, 10);
    ctx.fill();

    // Windshield
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(car.x + 5, car.y + 15, car.width - 10, 20);

    // Headlights
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(car.x + 5, car.y + 5, 10, 5);
    ctx.fillRect(car.x + car.width - 15, car.y + 5, 10, 5);

    // Tail lights
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(car.x + 5, car.y + car.height - 10, 10, 5);
    ctx.fillRect(car.x + car.width - 15, car.y + car.height - 10, 10, 5);

    ctx.restore();
  };

  const drawRoad = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = ROAD_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Side markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, 0); ctx.lineTo(5, CANVAS_HEIGHT);
    ctx.moveTo(CANVAS_WIDTH - 5, 0); ctx.lineTo(CANVAS_WIDTH - 5, CANVAS_HEIGHT);
    ctx.stroke();

    // Lanes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -roadOffsetRef.current;
    
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 3, 0); ctx.lineTo(CANVAS_WIDTH / 3, CANVAS_HEIGHT);
    ctx.moveTo((CANVAS_WIDTH / 3) * 2, 0); ctx.lineTo((CANVAS_WIDTH / 3) * 2, CANVAS_HEIGHT);
    ctx.stroke();
  };

  const update = () => {
    if (gameState.status !== GameStatus.PLAYING) return;

    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    
    // Increase speed
    currentSpeedRef.current += settings.speedIncrement;
    roadOffsetRef.current = (roadOffsetRef.current + currentSpeedRef.current) % 80;

    // Movement
    const moveSpeed = 7;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      playerRef.current.x = Math.max(10, playerRef.current.x - moveSpeed);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      playerRef.current.x = Math.min(CANVAS_WIDTH - CAR_WIDTH - 10, playerRef.current.x + moveSpeed);
    }

    // Spawn obstacles
    if (Math.random() < settings.spawnRate) {
      spawnObstacle();
    }

    // Update obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obs => {
      obs.y += currentSpeedRef.current * obs.speedMultiplier;

      // Collision Detection
      const buffer = 5;
      if (
        playerRef.current.x < obs.x + obs.width - buffer &&
        playerRef.current.x + playerRef.current.width > obs.x + buffer &&
        playerRef.current.y < obs.y + obs.height - buffer &&
        playerRef.current.y + playerRef.current.height > obs.y + buffer
      ) {
        audio.playCrash();
        setGameState(prev => ({ 
          ...prev, 
          status: GameStatus.GAME_OVER,
          highScore: Math.max(prev.highScore, prev.score)
        }));
      }

      return obs.y < CANVAS_HEIGHT;
    });

    // Score update
    setGameState(prev => ({ ...prev, score: prev.score + Math.floor(currentSpeedRef.current / 5) }));
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawRoad(ctx);
    drawCar(ctx, playerRef.current, true);
    obstaclesRef.current.forEach(obs => drawCar(ctx, obs, false));

    update();
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    requestRef.current = requestAnimationFrame(render);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState.status, gameState.difficulty]);

  return (
    <div className="relative w-full max-w-[400px] aspect-[2/3] bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block"
      />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Score</p>
          <p className="text-xl font-orbitron text-white">{gameState.score}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">High Score</p>
          <p className="text-xl font-orbitron text-cyan-400">{gameState.highScore}</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
