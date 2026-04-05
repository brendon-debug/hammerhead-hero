
import React, { useEffect, useRef, useState } from 'react';
import { TILE_SIZE } from '../constants';
import { Position, WorldMap, Entity, Item } from '../types';
import { sounds } from '../lib/sounds';

interface OtherPlayer {
  id: string;
  name: string;
  level: number;
  pos: { x: number; y: number };
  mapId: string;
}

interface GameCanvasProps {
  map: WorldMap;
  playerPos: Position;
  otherPlayers?: OtherPlayer[];
  azeranJoined?: boolean;
  finneganJoined?: boolean;
  equippedWeapon?: Item | null;
  secondaryWeapon?: Item | null;
  onMove: (pos: Position) => void;
  onInteract: (entity: Entity) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ map, playerPos, otherPlayers = [], azeranJoined, finneganJoined, equippedWeapon, secondaryWeapon, onMove, onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [moveHistory, setMoveHistory] = useState<Position[]>([playerPos]);

  useEffect(() => {
    setMoveHistory(prev => {
      const last = prev[prev.length - 1];
      if (last.x === playerPos.x && last.y === playerPos.y) return prev;
      return [...prev, playerPos].slice(-3);
    });
  }, [playerPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = map.width * TILE_SIZE;
    const displayHeight = map.height * TILE_SIZE;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const render = () => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw tiles
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const tile = map.tiles[y][x];
          const isWall = tile === 1;
          
          let floorColor = '#0ea5e9';
          let wallColor = '#0369a1';
          let borderColor = '#0ea5e9';
          let glowColor = 'transparent';

          if (map.id === 'dungeon_1') {
            floorColor = '#334155';
            wallColor = '#1e293b';
            borderColor = '#475569';
          } else if (map.id === 'dungeon_2') {
            floorColor = '#4338ca';
            wallColor = '#312e81';
            borderColor = '#818cf8';
            glowColor = 'rgba(129, 140, 248, 0.2)';
          } else if (map.id === 'dungeon_abyss') {
            floorColor = '#1e1b4b';
            wallColor = '#020617';
            borderColor = '#a855f7';
            glowColor = 'rgba(168, 85, 247, 0.2)';
          } else if (map.id === 'dungeon_3') {
            floorColor = '#991b1b';
            wallColor = '#7f1d1d';
            borderColor = '#f59e0b';
            glowColor = 'rgba(245, 158, 11, 0.2)';
          }

          ctx.fillStyle = isWall ? wallColor : floorColor;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          
          if (isWall) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE + TILE_SIZE * 0.8, TILE_SIZE, TILE_SIZE * 0.2);
          } else {
            // Decorations
            if (map.id === 'dungeon_2' && (x + y) % 9 === 0) {
              ctx.fillStyle = '#cffafe';
              ctx.beginPath();
              ctx.moveTo(x * TILE_SIZE + 24, y * TILE_SIZE + 15);
              ctx.lineTo(x * TILE_SIZE + 30, y * TILE_SIZE + 24);
              ctx.lineTo(x * TILE_SIZE + 24, y * TILE_SIZE + 33);
              ctx.lineTo(x * TILE_SIZE + 18, y * TILE_SIZE + 24);
              ctx.closePath();
              ctx.fill();
            } else if (map.id === 'dungeon_3' && (x * y) % 13 === 0) {
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.arc(x * TILE_SIZE + 24, y * TILE_SIZE + 24, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      const visibleEntities: { type: string; sprite: string; pos: Position; id?: string }[] = [];
      map.entities.forEach(entity => {
        if (entity.isDead) return;
        if (entity.id === 'azeran' && azeranJoined) return;
        visibleEntities.push({ 
          type: entity.type, 
          sprite: entity.sprite || (entity.type === 'chest' ? '📦' : '?'), 
          pos: entity.pos,
          id: entity.id
        });
      });

      if (azeranJoined && moveHistory.length > 1) {
        visibleEntities.push({ type: 'companion', sprite: '🐱', pos: moveHistory[moveHistory.length - 2] });
      }
      if (finneganJoined && moveHistory.length > 2) {
        visibleEntities.push({ type: 'companion', sprite: '🦈', pos: moveHistory[moveHistory.length - 3] });
      }

      // Add other players
      otherPlayers.forEach(p => {
        visibleEntities.push({ type: 'other_player', sprite: '🦈', pos: p.pos, id: p.id });
      });

      visibleEntities.push({ type: 'player', sprite: '🦈', pos: playerPos });
      visibleEntities.sort((a, b) => a.pos.y - b.pos.y);

      visibleEntities.forEach(entity => {
        const drawX = entity.pos.x * TILE_SIZE + TILE_SIZE / 2;
        const drawY = entity.pos.y * TILE_SIZE + TILE_SIZE / 2;
        
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + 10, 14, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        ctx.font = 'bold 36px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const yOffset = -5;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.strokeText(entity.sprite, drawX, drawY + TILE_SIZE / 2 + yOffset);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'black';
        
        if (entity.id === 'boss_fish') {
          ctx.save();
          ctx.filter = 'sepia(1) saturate(10) hue-rotate(240deg) brightness(0.7) contrast(1.5)';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 35;
          ctx.fillText(entity.sprite, drawX, drawY + TILE_SIZE / 2 + yOffset);
          ctx.restore();
        } else if (entity.type === 'goblin' || entity.type === 'hobgoblin') {
          ctx.save();
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillText(entity.sprite, drawX, drawY + TILE_SIZE / 2 + yOffset);
          ctx.restore();
        } else if (entity.type === 'giant_crab') {
          ctx.save();
          ctx.shadowColor = '#fb923c';
          ctx.shadowBlur = 10;
          ctx.fillText(entity.sprite, drawX, drawY + TILE_SIZE / 2 + yOffset);
          ctx.restore();
        } else if (entity.type === 'other_player') {
          ctx.save();
          ctx.shadowColor = '#0ea5e9';
          ctx.shadowBlur = 15;
          ctx.fillText(entity.sprite, drawX, drawY + TILE_SIZE / 2 + yOffset);
          
          // Draw name tag
          const otherPlayer = otherPlayers.find(p => p.id === entity.id);
          if (otherPlayer) {
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = 'white';
            ctx.shadowBlur = 0;
            ctx.fillText(otherPlayer.name, drawX, drawY - 25);
          }
          ctx.restore();
        } else {
          ctx.fillText(entity.sprite, drawX, drawY + TILE_SIZE / 2 + yOffset);
        }

        if (entity.type === 'player') {
          ctx.save();
          if (equippedWeapon?.id === 'poison_steel_sword') {
            ctx.filter = 'hue-rotate(90deg) saturate(2) brightness(1.1) sepia(0.3)';
          } else if (equippedWeapon?.id === 'sword_of_the_tides') {
            ctx.filter = 'hue-rotate(180deg) saturate(3) brightness(1.2) drop-shadow(0 0 5px #0ea5e9)';
          }
          ctx.font = 'bold 24px serif';
          ctx.strokeText('🗡️', drawX + 22, drawY + TILE_SIZE / 2 + yOffset - 15);
          ctx.fillText('🗡️', drawX + 22, drawY + TILE_SIZE / 2 + yOffset - 15);
          ctx.restore();

          if (secondaryWeapon) {
            ctx.save();
            if (secondaryWeapon.id === 'poison_steel_sword') {
              ctx.filter = 'hue-rotate(90deg) saturate(2) brightness(1.1) sepia(0.3)';
            } else if (secondaryWeapon.id === 'sword_of_the_tides') {
              ctx.filter = 'hue-rotate(180deg) saturate(3) brightness(1.2) drop-shadow(0 0 5px #0ea5e9)';
            }
            ctx.font = 'bold 24px serif';
            ctx.scale(-1, 1);
            ctx.strokeText('🗡️', -(drawX - 22), drawY + TILE_SIZE / 2 + yOffset - 15);
            ctx.fillText('🗡️', -(drawX - 22), drawY + TILE_SIZE / 2 + yOffset - 15);
            ctx.restore();
          }
        }
      });
    };

    render();
  }, [map, playerPos, azeranJoined, finneganJoined, moveHistory, equippedWeapon, secondaryWeapon]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let nextPos = { ...playerPos };
      if (e.key === 'ArrowUp' || e.key === 'w') nextPos.y--;
      if (e.key === 'ArrowDown' || e.key === 's') nextPos.y++;
      if (e.key === 'ArrowLeft' || e.key === 'a') nextPos.x--;
      if (e.key === 'ArrowRight' || e.key === 'd') nextPos.x++;

      if (nextPos.x < 0 || nextPos.x >= map.width || nextPos.y < 0 || nextPos.y >= map.height) return;
      if (map.tiles[nextPos.y][nextPos.x] === 1) return;

      const entity = map.entities.find(en => 
        en.pos.x === nextPos.x && 
        en.pos.y === nextPos.y && 
        !en.isDead &&
        !(en.id === 'azeran' && azeranJoined) &&
        !(en.id === 'old_shark' && finneganJoined)
      );
      if (entity) {
        sounds.playInteract();
        onInteract(entity);
      } else {
        if (nextPos.x !== playerPos.x || nextPos.y !== playerPos.y) {
          sounds.playMove();
          onMove(nextPos);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, map, onMove, onInteract, azeranJoined, finneganJoined]);

  return (
    <div className="relative overflow-hidden border-4 border-slate-800 rounded-lg shadow-2xl bg-slate-950 p-2">
      <div className="underwater-wavy relative">
        <canvas
          ref={canvasRef}
          className="block mx-auto relative z-10"
        />
        <div className="absolute inset-0 caustics-overlay z-20 mix-blend-overlay opacity-40" />
        <div className="absolute inset-0 bg-sky-500/10 z-30 pointer-events-none" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="bubble" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              width: `${Math.random() * 10 + 5}px`, 
              height: `${Math.random() * 10 + 5}px`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `${Math.random() * 10}s`
            }} 
          />
        ))}
      </div>
    </div>
  );
};
