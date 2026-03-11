export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  GAMEOVER = 'GAMEOVER',
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD',
  RAPID_FIRE = 'RAPID_FIRE',
  SCORE_BOOST = 'SCORE_BOOST',
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Position;
  radius: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  speed: number;
  credits: number;
  invincible: boolean;
  invincibleTimer: number;
  powerUps: {
    tripleShot: number; // duration in ms
    shield: boolean;
    rapidFire: number; // duration in ms
  };
}

export interface Bullet extends Entity {
  velocity: Position;
  damage: number;
  color: string;
}

export interface Enemy extends Entity {
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  scoreValue: number;
  color: string;
  lastShot?: number;
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  color: string;
}

export interface Particle extends Entity {
  velocity: Position;
  life: number; // 0 to 1
  color: string;
  size: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}
