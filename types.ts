
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speedMultiplier: number;
}

export interface GameState {
  score: number;
  highScore: number;
  difficulty: Difficulty;
  status: GameStatus;
}
