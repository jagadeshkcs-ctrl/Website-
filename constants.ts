
import { Difficulty } from './types';

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const CAR_WIDTH = 50;
export const CAR_HEIGHT = 90;

export const ROAD_COLOR = '#1a1a1a';
export const PLAYER_COLOR = '#00ffcc';
export const OBSTACLE_COLORS = ['#ff0055', '#ffcc00', '#aa00ff', '#ffffff'];

export const DIFFICULTY_SETTINGS = {
  [Difficulty.EASY]: {
    baseSpeed: 5,
    spawnRate: 0.01,
    speedIncrement: 0.0001,
  },
  [Difficulty.MEDIUM]: {
    baseSpeed: 8,
    spawnRate: 0.02,
    speedIncrement: 0.0002,
  },
  [Difficulty.HARD]: {
    baseSpeed: 12,
    spawnRate: 0.03,
    speedIncrement: 0.0004,
  },
};
