
export type EntityType = 'player' | 'goblin' | 'hobgoblin' | 'dragon' | 'boss' | 'npc' | 'item' | 'portal' | 'chest' | 'giant_crab';
export type ElementType = 'none' | 'fire' | 'ice' | 'lightning';

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  exp: number;
  gold: number;
}

export interface Item {
  id: string;
  baseId?: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'accessory';
  value: number;
  description: string;
  sprite?: string;
  element?: ElementType;
  stats?: {
    attack?: number;
    defense?: number;
    hp?: number;
    gold?: number;
    exp?: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: {
    gold: number;
    exp: number;
    item?: Item;
  };
  status: 'available' | 'active' | 'completed';
  type: 'main' | 'side';
  objective: string;
  targetId?: string;
  targetCount?: number;
  currentCount?: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  pos: Position;
  stats?: Stats;
  element?: ElementType;
  resistances?: Partial<Record<ElementType, number>>;
  sprite?: string;
  dialogue?: string[];
  isDead?: boolean;
  loot?: Item[];
  questId?: string; // Quest this NPC gives
}

export type GameState = 'start' | 'playing' | 'dialogue' | 'combat' | 'town' | 'gameover' | 'victory' | 'inventory' | 'shop' | 'quests' | 'boss_rush';

export interface WorldMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][]; // 0: floor, 1: wall, 2: water, 3: grass
  entities: Entity[];
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
