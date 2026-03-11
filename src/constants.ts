import { PowerUpType } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 900;

export const PLAYER_RADIUS = 25;
export const PLAYER_SPEED = 5;
export const PLAYER_MAX_HEALTH = 3;
export const INVINCIBILITY_DURATION = 2000;

export const BULLET_RADIUS = 6;
export const BULLET_SPEED = 8;

export const ENEMY_CONFIGS = {
  BASIC: {
    radius: 28,
    speed: 1.4,
    health: 1,
    score: 100,
    color: '#3b82f6', // blue-500
  },
  FAST: {
    radius: 22,
    speed: 2.5,
    health: 1,
    score: 150,
    color: '#f59e0b', // amber-500
  },
  HEAVY: {
    radius: 40,
    speed: 0.8,
    health: 3,
    score: 300,
    color: '#ef4444', // red-500
  },
};

export const POWERUP_RADIUS = 15;
export const POWERUP_DURATION = 10000; // 10 seconds

export const POWERUP_CONFIGS = {
  [PowerUpType.TRIPLE_SHOT]: { color: '#f43f5e', label: '3-WAY' },
  [PowerUpType.SHIELD]: { color: '#10b981', label: 'SHIELD' },
  [PowerUpType.RAPID_FIRE]: { color: '#facc15', label: 'RAPID' },
  [PowerUpType.SCORE_BOOST]: { color: '#a855f7', label: 'BONUS' },
};

export const ACHIEVEMENTS = [
  { id: 'first_blood', title: '第一滴血', description: '击毁第一架敌机', icon: 'Target' },
  { id: 'survivor', title: '生存者', description: '达到第5关', icon: 'Shield' },
  { id: 'ace', title: '王牌飞行员', description: '单局得分超过10000', icon: 'Trophy' },
  { id: 'power_hungry', title: '能量狂人', description: '同时拥有两种道具', icon: 'Zap' },
  { id: 'untouchable', title: '不可触碰', description: '满血通关前3关', icon: 'Star' },
];
