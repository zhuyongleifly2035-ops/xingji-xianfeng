import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  Bullet, 
  Enemy, 
  EnemyType, 
  PowerUp, 
  PowerUpType, 
  Particle,
  Position
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_RADIUS, 
  PLAYER_SPEED, 
  PLAYER_MAX_HEALTH,
  INVINCIBILITY_DURATION,
  BULLET_RADIUS,
  BULLET_SPEED,
  ENEMY_CONFIGS,
  POWERUP_RADIUS,
  POWERUP_DURATION
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number, level: number) => void;
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onLevelUpdate: (level: number) => void;
  onAchievementUnlock: (id: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameOver,
  onScoreUpdate,
  onHealthUpdate,
  onLevelUpdate,
  onAchievementUnlock,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const enemyImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const pImg = new Image();
    pImg.src = '/player.png';
    pImg.onload = () => { playerImgRef.current = pImg; };

    const eImg = new Image();
    eImg.src = '/enemy.png';
    eImg.onload = () => { enemyImgRef.current = eImg; };
  }, []);
  
  // Game State Refs (to avoid closure issues in the loop)
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100 },
    radius: PLAYER_RADIUS,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    speed: PLAYER_SPEED,
    invincible: false,
    invincibleTimer: 0,
    powerUps: { tripleShot: 0, shield: false, rapidFire: 0 },
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const keysRef = useRef<Set<string>>(new Set());
  const lastShotTimeRef = useRef(0);
  const lastEnemySpawnRef = useRef(0);
  const lastPowerUpSpawnRef = useRef(0);
  const frameCountRef = useRef(0);

  // Stats for achievements
  const enemiesKilledRef = useRef(0);
  const damageTakenRef = useRef(0);

  const resetGame = useCallback(() => {
    playerRef.current = {
      id: 'player',
      pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 100 },
      radius: PLAYER_RADIUS,
      health: PLAYER_MAX_HEALTH,
      maxHealth: PLAYER_MAX_HEALTH,
      speed: PLAYER_SPEED,
      invincible: false,
      invincibleTimer: 0,
      powerUps: { tripleShot: 0, shield: false, rapidFire: 0 },
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    levelRef.current = 1;
    enemiesKilledRef.current = 0;
    damageTakenRef.current = 0;
    keysRef.current.clear(); // Clear keys on reset
    
    onScoreUpdate(0);
    onHealthUpdate(PLAYER_MAX_HEALTH);
    onLevelUpdate(1);
  }, [onScoreUpdate, onHealthUpdate, onLevelUpdate]);

  useEffect(() => {
    if (gameState === GameState.START) {
      resetGame();
    }
  }, [gameState, resetGame]);

  const spawnEnemy = useCallback(() => {
    const types = [EnemyType.BASIC, EnemyType.BASIC, EnemyType.BASIC, EnemyType.FAST, EnemyType.HEAVY];
    const type = types[Math.floor(Math.random() * Math.min(types.length, 2 + levelRef.current))];
    const config = ENEMY_CONFIGS[type];
    
    const enemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pos: { x: Math.random() * (CANVAS_WIDTH - config.radius * 2) + config.radius, y: -config.radius },
      radius: config.radius,
      health: config.health + Math.floor(levelRef.current / 3),
      maxHealth: config.health + Math.floor(levelRef.current / 3),
      speed: config.speed * (1 + levelRef.current * 0.1),
      scoreValue: config.score,
      color: config.color,
    };
    enemiesRef.current.push(enemy);
  }, []);

  const spawnPowerUp = useCallback(() => {
    const types = [
      PowerUpType.TRIPLE_SHOT, 
      PowerUpType.SHIELD, 
      PowerUpType.RAPID_FIRE, 
      PowerUpType.SCORE_BOOST
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const config = (window as any).POWERUP_CONFIGS?.[type] || { color: '#ffffff' };
    
    // Fallback colors if config not available in scope
    const colors: Record<string, string> = {
      [PowerUpType.TRIPLE_SHOT]: '#f43f5e',
      [PowerUpType.SHIELD]: '#10b981',
      [PowerUpType.RAPID_FIRE]: '#facc15',
      [PowerUpType.SCORE_BOOST]: '#a855f7',
    };

    const powerUp: PowerUp = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pos: { x: Math.random() * (CANVAS_WIDTH - POWERUP_RADIUS * 2) + POWERUP_RADIUS, y: -POWERUP_RADIUS },
      radius: POWERUP_RADIUS,
      color: colors[type] || '#ffffff',
    };
    powerUpsRef.current.push(powerUp);
  }, []);

  const createExplosion = (pos: Position, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random().toString(36).substr(2, 9),
        pos: { ...pos },
        radius: Math.random() * 3 + 1,
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
        },
        life: 1,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  };

  const update = (deltaTime: number) => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;

    // Movement - Using lowercase for better compatibility
    const keys = keysRef.current;
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
      player.pos.x = Math.max(player.radius, player.pos.x - player.speed);
    }
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
      player.pos.x = Math.min(CANVAS_WIDTH - player.radius, player.pos.x + player.speed);
    }
    if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
      player.pos.y = Math.max(player.radius, player.pos.y - player.speed);
    }
    if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
      player.pos.y = Math.min(CANVAS_HEIGHT - player.radius, player.pos.y + player.speed);
    }

    // Shooting
    const now = Date.now();
    const shotDelay = player.powerUps.rapidFire > 0 ? 100 : 200;
    if (keys.has(' ') && now - lastShotTimeRef.current > shotDelay) {
      const shoot = (vx: number, vy: number, offset = 0) => {
        bulletsRef.current.push({
          id: Math.random().toString(36).substr(2, 9),
          pos: { x: player.pos.x + offset, y: player.pos.y - player.radius },
          radius: BULLET_RADIUS,
          velocity: { x: vx, y: vy },
          damage: 1,
          color: '#60a5fa',
        });
      };

      shoot(0, -BULLET_SPEED);
      if (player.powerUps.tripleShot > 0) {
        shoot(-2, -BULLET_SPEED, -15);
        shoot(2, -BULLET_SPEED, 15);
      }
      lastShotTimeRef.current = now;
    }

    // Update Invincibility
    if (player.invincible) {
      player.invincibleTimer -= deltaTime;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
      }
    }

    // Update Power-ups duration
    if (player.powerUps.tripleShot > 0) player.powerUps.tripleShot -= deltaTime;
    if (player.powerUps.rapidFire > 0) player.powerUps.rapidFire -= deltaTime;

    // Update Bullets
    bulletsRef.current = bulletsRef.current.filter(b => {
      b.pos.x += b.velocity.x;
      b.pos.y += b.velocity.y;
      return b.pos.y > -20 && b.pos.x > -20 && b.pos.x < CANVAS_WIDTH + 20;
    });

    // Update Enemies
    enemiesRef.current = enemiesRef.current.filter(e => {
      e.pos.y += e.speed;
      
      // Collision with player
      const dist = Math.hypot(e.pos.x - player.pos.x, e.pos.y - player.pos.y);
      if (dist < e.radius + player.radius) {
        if (!player.invincible) {
          if (player.powerUps.shield) {
            player.powerUps.shield = false;
            createExplosion(player.pos, '#10b981', 20);
          } else {
            player.health--;
            damageTakenRef.current++;
            onHealthUpdate(player.health);
            createExplosion(player.pos, '#ef4444', 15);
            if (player.health <= 0) {
              onGameOver(scoreRef.current, levelRef.current);
            }
          }
          player.invincible = true;
          player.invincibleTimer = INVINCIBILITY_DURATION;
        }
        createExplosion(e.pos, e.color, 10);
        return false;
      }

      // Escaped
      if (e.pos.y > CANVAS_HEIGHT + e.radius) {
        scoreRef.current = Math.max(0, scoreRef.current - 50);
        onScoreUpdate(scoreRef.current);
        return false;
      }
      return true;
    });

    // Update PowerUps
    powerUpsRef.current = powerUpsRef.current.filter(p => {
      p.pos.y += 2;
      const dist = Math.hypot(p.pos.x - player.pos.x, p.pos.y - player.pos.y);
      if (dist < p.radius + player.radius) {
        if (p.type === PowerUpType.TRIPLE_SHOT) {
          player.powerUps.tripleShot = POWERUP_DURATION;
        } else if (p.type === PowerUpType.SHIELD) {
          player.powerUps.shield = true;
        } else if (p.type === PowerUpType.RAPID_FIRE) {
          player.powerUps.rapidFire = POWERUP_DURATION;
        } else if (p.type === PowerUpType.SCORE_BOOST) {
          scoreRef.current += 500;
          onScoreUpdate(scoreRef.current);
        }
        
        if (player.powerUps.tripleShot > 0 && player.powerUps.shield) {
          onAchievementUnlock('power_hungry');
        }
        
        createExplosion(p.pos, p.color, 15);
        return false;
      }
      return p.pos.y < CANVAS_HEIGHT + p.radius;
    });

    // Bullet-Enemy Collision
    bulletsRef.current = bulletsRef.current.filter(b => {
      let bulletHit = false;
      enemiesRef.current = enemiesRef.current.filter(e => {
        if (bulletHit) return true;
        const dist = Math.hypot(b.pos.x - e.pos.x, b.pos.y - e.pos.y);
        if (dist < b.radius + e.radius) {
          e.health -= b.damage;
          bulletHit = true;
          if (e.health <= 0) {
            scoreRef.current += e.scoreValue;
            enemiesKilledRef.current++;
            onScoreUpdate(scoreRef.current);
            createExplosion(e.pos, e.color, 20);
            
            if (enemiesKilledRef.current === 1) onAchievementUnlock('first_blood');
            if (scoreRef.current >= 10000) onAchievementUnlock('ace');
            
            return false;
          }
          createExplosion(b.pos, '#ffffff', 3);
          return true;
        }
        return true;
      });
      return !bulletHit;
    });

    // Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.pos.x += p.velocity.x;
      p.pos.y += p.velocity.y;
      p.life -= 0.02;
      return p.life > 0;
    });

    // Spawning
    if (now - lastEnemySpawnRef.current > Math.max(500, 2000 - levelRef.current * 100)) {
      spawnEnemy();
      lastEnemySpawnRef.current = now;
    }

    if (now - lastPowerUpSpawnRef.current > 15000) {
      spawnPowerUp();
      lastPowerUpSpawnRef.current = now;
    }

    // Level Up
    if (scoreRef.current >= levelRef.current * 2000) {
      levelRef.current++;
      onLevelUpdate(levelRef.current);
      createExplosion({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }, '#facc15', 50);
      enemiesRef.current = []; // Clear current enemies
      
      if (levelRef.current === 5) onAchievementUnlock('survivor');
      if (levelRef.current === 4 && damageTakenRef.current === 0) onAchievementUnlock('untouchable');
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const player = playerRef.current;

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw PowerUps
    powerUpsRef.current.forEach(p => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner detail
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Bullets
    bulletsRef.current.forEach(b => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = e.color;
      
      if (enemyImgRef.current) {
        ctx.save();
        ctx.translate(e.pos.x, e.pos.y);
        ctx.rotate(Math.PI); // Rotate 180 degrees to face down
        ctx.drawImage(
          enemyImgRef.current, 
          -e.radius * 1.5, 
          -e.radius * 1.5, 
          e.radius * 3, 
          e.radius * 3
        );
        ctx.restore();
      } else {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        if (e.type === EnemyType.FAST) {
          ctx.moveTo(e.pos.x, e.pos.y + e.radius);
          ctx.lineTo(e.pos.x - e.radius, e.pos.y - e.radius);
          ctx.lineTo(e.pos.x + e.radius, e.pos.y - e.radius);
        } else if (e.type === EnemyType.HEAVY) {
          ctx.rect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius * 2, e.radius * 2);
        } else {
          ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Health bar
      if (e.health < e.maxHealth) {
        const barWidth = e.radius * 2;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(e.pos.x - e.radius, e.pos.y - e.radius - 10, barWidth, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(e.pos.x - e.radius, e.pos.y - e.radius - 10, barWidth * (e.health / e.maxHealth), 4);
      }
    });

    // Draw Player
    if (!player.invincible || frameCountRef.current % 10 < 5) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#3b82f6';
      
      if (playerImgRef.current) {
        ctx.drawImage(
          playerImgRef.current, 
          player.pos.x - player.radius * 1.5, 
          player.pos.y - player.radius * 1.5, 
          player.radius * 3, 
          player.radius * 3
        );
      } else {
        // Ship body
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(player.pos.x, player.pos.y - player.radius);
        ctx.lineTo(player.pos.x - player.radius, player.pos.y + player.radius);
        ctx.lineTo(player.pos.x + player.radius, player.pos.y + player.radius);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.arc(player.pos.x, player.pos.y + 5, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shield
      if (player.powerUps.shield) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(player.pos.x, player.pos.y, player.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;
  };

  const loop = (time: number) => {
    const deltaTime = 16.67; // Approx 60fps
    frameCountRef.current++;
    
    update(deltaTime);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
    
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    const handleBlur = () => keysRef.current.clear(); // Clear all keys when window loses focus
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Touch controls for mobile
  const handleTouch = (e: React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((touch.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((touch.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    
    playerRef.current.pos.x = Math.max(playerRef.current.radius, Math.min(CANVAS_WIDTH - playerRef.current.radius, x));
    playerRef.current.pos.y = Math.max(playerRef.current.radius, Math.min(CANVAS_HEIGHT - playerRef.current.radius, y));
    
    // Auto-shoot on touch
    keysRef.current.add(' ');
  };

  const handleTouchEnd = () => {
    keysRef.current.delete(' ');
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full max-h-full object-contain bg-black/20 rounded-2xl shadow-2xl border border-white/5"
        onTouchMove={handleTouch}
        onTouchStart={handleTouch}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};
