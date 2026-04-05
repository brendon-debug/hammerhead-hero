
import { WorldMap, Entity, Item, Quest } from './types';

export const TILE_SIZE = 48;

export const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  attack: 15,
  defense: 5,
  level: 1,
  exp: 0,
  gold: 150,
};

export const ITEMS: Record<string, Item> = {
  rusty_sword: {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    type: 'weapon',
    value: 10,
    description: 'A bit dull, but it cuts. Grants +5 Attack.',
    sprite: '🗡️',
    stats: { attack: 5 }
  },
  steel_blade: {
    id: 'steel_blade',
    name: 'Steel Blade',
    type: 'weapon',
    value: 100,
    description: 'A finely crafted shark-sword. Grants +15 Attack.',
    sprite: '⚔️',
    stats: { attack: 15 }
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Vest',
    type: 'armor',
    value: 50,
    description: 'Basic protection for a shark. Grants +5 Defense.',
    sprite: '🛡️',
    stats: { defense: 5 }
  },
  pearl_armor: {
    id: 'pearl_armor',
    name: 'Pearl Plate',
    type: 'armor',
    value: 300,
    description: 'Shimmering armor made of giant pearls. Grants +20 Defense.',
    sprite: '💎',
    stats: { defense: 20 }
  },
  flame_blade: {
    id: 'flame_blade',
    name: 'Flame Blade',
    type: 'weapon',
    value: 500,
    description: 'A sword that burns with eternal fire. Deals Fire damage.',
    sprite: '🔥',
    element: 'fire',
    stats: { attack: 40 }
  },
  lightning_trident: {
    id: 'lightning_trident',
    name: 'Lightning Trident',
    type: 'weapon',
    value: 800,
    description: 'A trident crackling with electricity. Deals Lightning damage.',
    sprite: '⚡',
    element: 'lightning',
    stats: { attack: 60 }
  },
  sword_of_the_tides: {
    id: 'sword_of_the_tides',
    name: 'Sword of the Tides',
    type: 'weapon',
    value: 10000,
    description: 'A legendary blade that controls the currents. Deals Ice damage.',
    sprite: '🗡️',
    element: 'ice',
    stats: { attack: 1000 }
  },
  sword_holder: {
    id: 'sword_holder',
    name: 'Sword Holder',
    type: 'accessory',
    value: 100,
    description: 'A sturdy leather strap. Allows you to equip two weapons at once!',
    sprite: '🎒'
  },
  ancient_lore_book: {
    id: 'ancient_lore_book',
    name: 'Ancient Lore Book',
    type: 'quest',
    value: 0,
    description: 'A dusty book detailing the history of the Hammerhead Hero.',
    sprite: '📖'
  },
  poison_steel_sword: {
    id: 'poison_steel_sword',
    name: 'Poison Steel Sword',
    type: 'weapon',
    value: 2000,
    description: 'A blade forged from sea-vines. Grants +25 Attack and stacking poison damage.',
    sprite: '⚔️',
    stats: { attack: 25 }
  },
  kelp: {
    id: 'kelp',
    name: 'Gourmet Kelp',
    type: 'consumable',
    value: 5,
    description: 'A nutritious sea snack. Restores 100 HP.',
    sprite: '🌿',
    stats: { hp: 100 }
  },
  sea_grapes: {
    id: 'sea_grapes',
    name: 'Sea Grapes',
    type: 'consumable',
    value: 25,
    description: 'Crunchy grapes that boost your strength. Grants +10 Attack for this battle.',
    sprite: '🍇',
    stats: { attack: 10 }
  },
  glowing_kelp: {
    id: 'glowing_kelp',
    name: 'Glowing Kelp',
    type: 'consumable',
    value: 25,
    description: 'Bioluminescent kelp that hardens your skin. Grants +10 Defense for this battle.',
    sprite: '🎋',
    stats: { defense: 10 }
  },
  spicy_coral: {
    id: 'spicy_coral',
    name: 'Spicy Coral',
    type: 'consumable',
    value: 50,
    description: 'Extremely spicy! Grants +25 Attack for this battle.',
    sprite: '🌶️',
    stats: { attack: 25 }
  },
  bubble_soda: {
    id: 'bubble_soda',
    name: 'Bubble Soda',
    type: 'consumable',
    value: 30,
    description: 'Refreshing bubbles. Restores 50 HP and grants +5 Defense for this battle.',
    sprite: '🥤',
    stats: { hp: 50, defense: 5 }
  },
  starfish_cookie: {
    id: 'starfish_cookie',
    name: 'Starfish Cookie',
    type: 'consumable',
    value: 60,
    description: 'A lucky treat. Grants +15 Attack and +15 Defense for this battle.',
    sprite: '🍪',
    stats: { attack: 15, defense: 15 }
  },
  electric_jerky: {
    id: 'electric_jerky',
    name: 'Electric Jerky',
    type: 'consumable',
    value: 80,
    description: 'Shockingly delicious. Grants +40 Attack for this battle.',
    sprite: '⚡',
    stats: { attack: 40 }
  },
  ancient_ring: {
    id: 'ancient_ring',
    name: 'Ancient Ring',
    type: 'accessory',
    value: 500,
    description: 'A shimmering ring. Grants +10 Attack and +10 Defense.',
    sprite: '💍',
    stats: { attack: 10, defense: 10 }
  }
};

export const FUNNY_DEATH_MESSAGES = [
  "You're officially shark bait. Hoo ha ha!",
  "The ocean is now 0.0001% more salty from your tears.",
  "You forgot that sharks can't actually use swords. Wait, you were doing it anyway.",
  "A goldfish is currently laughing at your grave.",
  "You've been demoted to 'Plankton Hero'.",
  "The Goblin Queen is using your fin as a backscratcher.",
  "Bob the Dragon thinks you tasted like chicken. Sea chicken.",
  "You've been served. With a side of tartar sauce.",
  "Wasted. Should've stayed in the reef.",
  "Your sword is now a very expensive toothpick for a crab.",
  "You're sleeping with the fishes. Literally.",
  "The Diamond Gorilla just made a necklace out of your teeth.",
  "Azeran is looking for a new shark to carry his bags.",
  "You just became part of the food chain. The bottom part.",
  "Maybe try biting things next time? Just a thought."
];

export const SHARK_JOKES = [
  "Shark Fact: Sharks never run out of teeth, but you just ran out of HP.",
  "Shark Fact: Hammerhead sharks have 360-degree vision, yet you didn't see that coming.",
  "Shark Fact: Sharks have been around for 400 million years. You lasted about 5 minutes.",
  "Shark Fact: Some sharks can live for 400 years. You... not so much.",
  "Shark Fact: Sharks don't have bones. Now you don't either.",
  "Shark Fact: Great Whites can smell a single drop of blood. And they're coming for your loot.",
  "Shark Fact: Sharks are apex predators. Except for you, apparently."
];

export const QUESTS: Record<string, Quest> = {
  main_1: {
    id: 'main_1',
    title: 'The Goblin Menace',
    description: 'Defeat the Goblin Queen in the Grotto.',
    reward: { gold: 200, exp: 500 },
    status: 'available',
    type: 'main',
    objective: 'Defeat Goblin Queen',
    targetId: 'boss_1'
  },
  side_1: {
    id: 'side_1',
    title: 'Pest Control',
    description: 'The tavern is overrun with small cave goblins. Defeat 3 of them.',
    reward: { gold: 50, exp: 100 },
    status: 'available',
    type: 'side',
    objective: 'Defeat 3 Goblins',
    targetId: 'goblin',
    targetCount: 3,
    currentCount: 0
  },
  side_2: {
    id: 'side_2',
    title: 'Shiny Things',
    description: 'Find a Giant Pearl in a chest in the Grotto.',
    reward: { gold: 100, exp: 200 },
    status: 'available',
    type: 'side',
    objective: 'Find Giant Pearl',
    targetId: 'giant_pearl'
  },
  portal_quest: {
    id: 'portal_quest',
    title: 'The Green Portal Mystery',
    description: 'The green portal hums with energy. Explore the dungeons and defeat 5 Hobgoblins to prove your worth.',
    reward: { gold: 500, exp: 1000 },
    status: 'available',
    type: 'side',
    objective: 'Defeat 5 Hobgoblins',
    targetId: 'hobgoblin',
    targetCount: 5,
    currentCount: 0
  },
  dragon_slayer: {
    id: 'dragon_slayer',
    title: 'Dragon Slayer',
    description: 'The Lesser Dragons are a nuisance. Defeat 3 of them to clear the path.',
    reward: { gold: 1000, exp: 2000 },
    status: 'available',
    type: 'side',
    objective: 'Defeat 3 Lesser Dragons',
    targetId: 'dragon',
    targetCount: 3,
    currentCount: 0
  },
  treasure_hunter: {
    id: 'treasure_hunter',
    title: 'Treasure Hunter',
    description: 'The dungeons are filled with lost loot. Open 5 treasure chests.',
    reward: { gold: 300, exp: 600 },
    status: 'available',
    type: 'side',
    objective: 'Open 5 Chests',
    targetId: 'chest',
    targetCount: 5,
    currentCount: 0
  },
  kelp_collector: {
    id: 'kelp_collector',
    title: 'Gourmet Gathering',
    description: 'Bubbles wants to try a new recipe. Collect 5 pieces of Gourmet Kelp.',
    reward: { gold: 150, exp: 300 },
    status: 'available',
    type: 'side',
    objective: 'Collect 5 Kelp',
    targetId: 'kelp',
    targetCount: 5,
    currentCount: 0
  },
  lost_ring: {
    id: 'lost_ring',
    title: 'The Lost Heirloom',
    description: 'Old Man Finnegan lost his ring in Diamond Peak. Find it!',
    reward: { gold: 400, exp: 800 },
    status: 'available',
    type: 'side',
    objective: 'Find Ancient Ring',
    targetId: 'ancient_ring'
  },
  boss_slayer_2: {
    id: 'boss_slayer_2',
    title: 'Peak Performance',
    description: 'The Diamond Gorilla is terrorizing the peaks. Take him down!',
    reward: { gold: 1000, exp: 2000 },
    status: 'available',
    type: 'side',
    objective: 'Defeat Diamond Gorilla',
    targetId: 'boss_2'
  },
  boss_slayer_fish: {
    id: 'boss_slayer_fish',
    title: 'Deep Sea Terror',
    description: 'The Corrupted Abyssal Maw is the true source of the oceans darkness. End its reign!',
    reward: { gold: 5000, exp: 10000 },
    status: 'available',
    type: 'side',
    objective: 'Defeat Corrupted Abyssal Maw',
    targetId: 'boss_fish'
  },
  boss_slayer_3: {
    id: 'boss_slayer_3',
    title: 'Dragon Tamer',
    description: 'Bob the Dragon is guarding the path to the deep. Show him who is boss!',
    reward: { gold: 2000, exp: 4000 },
    status: 'available',
    type: 'side',
    objective: 'Defeat Bob the Dragon',
    targetId: 'boss_3'
  },
  level_5: {
    id: 'level_5',
    title: 'Shark Strength',
    description: 'Prove your potential by reaching Level 5.',
    reward: { gold: 500, exp: 1000 },
    status: 'available',
    type: 'side',
    objective: 'Reach Level 5',
    targetId: 'level_5'
  }
};

export const TOWNS: WorldMap[] = [
  {
    id: 'town_1',
    name: 'Coral Cove',
    width: 20,
    height: 15,
    tiles: Array(15).fill(0).map(() => Array(20).fill(0)),
    entities: [
      {
        id: 'azeran',
        type: 'npc',
        name: 'Azeran',
        pos: { x: 7, y: 5 },
        dialogue: [
          "Greetings, sharp-headed one! I am Azeran, the wizard of these parts.",
          "Long ago, the Hammerhead Hero protected our reefs from the Abyssal Maw.",
          "But the hero vanished, and the darkness returned. You bear the same mark...",
          "Head north to the Goblin Grotto if you seek adventure. Beware the Queen, she holds the first key!"
        ],
        sprite: '🐱',
        questId: 'main_1'
      },
      {
        id: 'shop_1',
        type: 'npc',
        name: 'Barnaby the Blacksmith',
        pos: { x: 3, y: 3 },
        dialogue: ["Need a sharper edge? I've got the best steel in the ocean."],
        sprite: '🦀'
      },
      {
        id: 'tavern_keeper',
        type: 'npc',
        name: 'Bubbles the Barkeep',
        pos: { x: 16, y: 4 },
        dialogue: [
          "Welcome to the Salty Fin! Best kelp beer in the seven seas.",
          "I've also got a fresh batch of Gourmet Kelp if you're heading out.",
          "If you're looking for work, I've got a pest problem in the cellar.",
          "I'm also looking for some Gourmet Kelp for a new snack. Check the green Quest Portal!"
        ],
        sprite: '🐡',
        questId: 'side_1'
      },
      {
        id: 'old_shark',
        type: 'npc',
        name: 'Old Man Finnegan',
        pos: { x: 17, y: 10 },
        dialogue: [
          "Back in my day, we didn't have fancy swords. We used our teeth!",
          "I remember the Great Calamity... the sky turned black and the sea boiled.",
          "The Abyssal Maw was sealed by the Hero, but the seal is weakening.",
          "I lost my Ancient Ring in Diamond Peak... it was a gift from the Hero himself."
        ],
        sprite: '🦈',
        questId: 'side_2'
      },
      {
        id: 'portal_1',
        type: 'portal',
        name: 'To Goblin Grotto',
        pos: { x: 10, y: 0 },
        sprite: '🌀'
      },
      {
        id: 'quest_portal',
        type: 'portal',
        name: 'Quest Portal',
        pos: { x: 14, y: 10 },
        sprite: '🌀'
      },
      {
        id: 'portal_tests',
        type: 'portal',
        name: 'To Coral Castle',
        pos: { x: 15, y: 10 },
        sprite: '🌀'
      }
    ]
  }
];

// Simple wall generation for town
for(let i=0; i<20; i++) {
  TOWNS[0].tiles[0][i] = 1;
  TOWNS[0].tiles[14][i] = 1;
}
for(let i=0; i<15; i++) {
  TOWNS[0].tiles[i][0] = 1;
  TOWNS[0].tiles[i][19] = 1;
}
TOWNS[0].tiles[0][10] = 0; // Exit

// Tavern area walls
for(let y=2; y<7; y++) {
  TOWNS[0].tiles[y][14] = 1;
}
for(let x=14; x<20; x++) {
  TOWNS[0].tiles[7][x] = 1;
}
TOWNS[0].tiles[7][16] = 0; // Tavern entrance

// Reachability Helper
function getReachablePositions(tiles: number[][], start: { x: number, y: number }): { x: number, y: number }[] {
  const reachable: { x: number, y: number }[] = [];
  const queue: { x: number, y: number }[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!curr) continue;
    const { x, y } = curr;
    reachable.push({ x, y });

    const neighbors = [
      { x: x + 1, y }, { x: x - 1, y },
      { x, y: y + 1 }, { x, y: y - 1 }
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < tiles[0].length && n.y >= 0 && n.y < tiles.length &&
          tiles[n.y][n.x] === 0 && !visited.has(`${n.x},${n.y}`)) {
        visited.add(`${n.x},${n.y}`);
        queue.push(n);
      }
    }
  }
  return reachable;
}

export const DUNGEONS: WorldMap[] = [
  {
    id: 'dungeon_1',
    name: 'Goblin Grotto',
    width: 20,
    height: 20,
    tiles: Array(20).fill(0).map(() => Array(20).fill(1)),
    entities: []
  }
];

// Procedural-ish dungeon 1
for(let y=1; y<19; y++) {
  for(let x=1; x<19; x++) {
    if (Math.random() > 0.2) DUNGEONS[0].tiles[y][x] = 0;
  }
}
DUNGEONS[0].tiles[1][10] = 0; // Entrance
DUNGEONS[0].tiles[2][10] = 0; // Spawn

const reachable1 = getReachablePositions(DUNGEONS[0].tiles, { x: 10, y: 1 });

// Ensure boss is reachable by clearing a path if needed
if (!reachable1.some(p => p.x === 10 && p.y === 18)) {
  for(let y=1; y<=18; y++) DUNGEONS[0].tiles[y][10] = 0;
}

const finalReachable1 = getReachablePositions(DUNGEONS[0].tiles, { x: 10, y: 1 });

const occupied1 = new Set<string>();
const addEntity1 = (entity: Entity) => {
  DUNGEONS[0].entities.push(entity);
  occupied1.add(`${entity.pos.x},${entity.pos.y}`);
};

// Place entrance portal first
addEntity1({
  id: 'portal_back_1',
  type: 'portal',
  name: 'Back to Coral Cove',
  pos: { x: 10, y: 1 },
  sprite: '🌀'
});

// Place boss on a reachable tile
const bossPos1 = finalReachable1.find(p => p.y === 18) || finalReachable1[finalReachable1.length - 1];
addEntity1({
  id: 'boss_1',
  type: 'boss',
  name: 'Goblin Queen',
  pos: bossPos1,
  stats: { hp: 400, maxHp: 400, attack: 50, defense: 10, level: 5, exp: 500, gold: 200 },
  sprite: '👺',
  loot: [ITEMS.steel_blade]
});

// Place chests on reachable tiles
for(let i=0; i<3; i++) {
  const available = finalReachable1.filter(p => !occupied1.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntity1({
    id: `chest_1_${i}`,
    type: 'chest',
    name: 'Treasure Chest',
    pos: pos,
    sprite: '🎁',
    loot: [ITEMS.kelp, Math.random() > 0.5 ? ITEMS.leather_armor : ITEMS.rusty_sword]
  });
}

for(let i=0; i<25; i++) {
  const available = finalReachable1.filter(p => !occupied1.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntity1({
    id: `goblin_${i}`,
    type: 'goblin',
    name: 'Goblin',
    pos: pos,
    stats: { hp: 40, maxHp: 40, attack: 10, defense: 2, level: 2, exp: 50, gold: 20 },
    sprite: '👺',
    loot: [ITEMS.kelp]
  });
}

export const DUNGEON_2: WorldMap = {
  id: 'dungeon_2',
  name: 'Diamond Peak',
  width: 20,
  height: 20,
  tiles: Array(20).fill(0).map(() => Array(20).fill(1)),
  entities: []
};

for(let y=1; y<19; y++) {
  for(let x=1; x<19; x++) {
    if (Math.random() > 0.3) DUNGEON_2.tiles[y][x] = 0;
  }
}
DUNGEON_2.tiles[1][10] = 0; // Entrance
DUNGEON_2.tiles[2][10] = 0; // Spawn

// Ensure boss is reachable
for(let y=1; y<=15; y++) DUNGEON_2.tiles[y][10] = 0;

const reachable2 = getReachablePositions(DUNGEON_2.tiles, { x: 10, y: 1 });
const occupied2 = new Set<string>();
const addEntity2 = (entity: Entity) => {
  DUNGEON_2.entities.push(entity);
  occupied2.add(`${entity.pos.x},${entity.pos.y}`);
};

addEntity2({
  id: 'portal_back_2',
  type: 'portal',
  name: 'Back to Coral Cove',
  pos: { x: 10, y: 1 },
  sprite: '🌀'
});

const bossPos2 = reachable2.find(p => p.y === 15) || reachable2[reachable2.length - 1];
addEntity2({
  id: 'boss_2',
  type: 'boss',
  name: 'Diamond Gorilla',
  pos: bossPos2,
  stats: { hp: 1000, maxHp: 1000, attack: 90, defense: 30, level: 10, exp: 2000, gold: 1000 },
  sprite: '🦍',
  loot: [ITEMS.pearl_armor]
});

for(let i=0; i<3; i++) {
  const available = reachable2.filter(p => !occupied2.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntity2({
    id: `chest_2_${i}`,
    type: 'chest',
    name: 'Treasure Chest',
    pos: pos,
    sprite: '🎁',
    loot: [i === 0 ? ITEMS.ancient_ring : ITEMS.kelp, Math.random() > 0.5 ? ITEMS.kelp : ITEMS.kelp]
  });
}

// Crabs removed as per request

for(let i=0; i<20; i++) {
  const available = reachable2.filter(p => !occupied2.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntity2({
    id: `hobgoblin_${i}`,
    type: 'hobgoblin',
    name: 'Hobgoblin',
    pos: pos,
    stats: { hp: 80, maxHp: 80, attack: 20, defense: 4, level: 5, exp: 150, gold: 50 },
    sprite: '👺',
    loot: Math.random() > 0.5 ? [ITEMS.kelp] : []
  });
}

export const DUNGEON_ABYSS: WorldMap = {
  id: 'dungeon_abyss',
  name: 'Abyssal Trench',
  width: 22,
  height: 22,
  tiles: Array(22).fill(0).map(() => Array(22).fill(1)),
  entities: []
};

for(let y=1; y<21; y++) {
  for(let x=1; x<21; x++) {
    if (Math.random() > 0.25) DUNGEON_ABYSS.tiles[y][x] = 0;
  }
}
DUNGEON_ABYSS.tiles[1][11] = 0; // Entrance
DUNGEON_ABYSS.tiles[2][11] = 0; // Spawn

// Ensure boss is reachable
for(let y=1; y<=18; y++) DUNGEON_ABYSS.tiles[y][11] = 0;

const reachableAbyss = getReachablePositions(DUNGEON_ABYSS.tiles, { x: 11, y: 1 });
const occupiedAbyss = new Set<string>();
const addEntityAbyss = (entity: Entity) => {
  DUNGEON_ABYSS.entities.push(entity);
  occupiedAbyss.add(`${entity.pos.x},${entity.pos.y}`);
};

addEntityAbyss({
  id: 'portal_back_abyss',
  type: 'portal',
  name: 'Back to Coral Cove',
  pos: { x: 11, y: 1 },
  sprite: '🌀'
});

const bossPosAbyss = reachableAbyss.find(p => p.y === 18) || reachableAbyss[reachableAbyss.length - 1];
addEntityAbyss({
  id: 'boss_fish',
  type: 'boss',
  name: 'THE CORRUPTED ABYSSAL MAW',
  pos: bossPosAbyss,
  stats: { hp: 5000, maxHp: 5000, attack: 500, defense: 300, level: 25, exp: 15000, gold: 5000 },
  element: 'ice',
  resistances: { ice: 0.5, fire: 2.0 },
  sprite: '👹', // Back to a fish but with the purple aura
  loot: []
});

for(let i=0; i<3; i++) {
  const available = reachableAbyss.filter(p => !occupiedAbyss.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntityAbyss({
    id: `chest_abyss_${i}`,
    type: 'chest',
    name: 'Treasure Chest',
    pos: pos,
    sprite: '🎁',
    loot: [ITEMS.kelp, ITEMS.kelp]
  });
}

// Sirens removed as per request

for(let i=0; i<20; i++) {
  const available = reachableAbyss.filter(p => !occupiedAbyss.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntityAbyss({
    id: `angler_${i}`,
    type: 'goblin', // Reusing goblin type for simplicity in combat logic
    name: 'Angler Fish',
    pos: pos,
    stats: { hp: 120, maxHp: 120, attack: 35, defense: 15, level: 12, exp: 300, gold: 100 },
    element: 'lightning',
    sprite: '🐟',
    loot: Math.random() > 0.4 ? [ITEMS.kelp] : []
  });
}

export const DUNGEON_3: WorldMap = {
  id: 'dungeon_3',
  name: 'Dragons Lair',
  width: 25,
  height: 25,
  tiles: Array(25).fill(0).map(() => Array(25).fill(1)),
  entities: []
};

for(let y=1; y<24; y++) {
  for(let x=1; x<24; x++) {
    if (Math.random() > 0.2) DUNGEON_3.tiles[y][x] = 0;
  }
}
DUNGEON_3.tiles[1][12] = 0; // Entrance
DUNGEON_3.tiles[2][12] = 0; // Spawn

// Ensure boss is reachable
for(let y=1; y<=20; y++) DUNGEON_3.tiles[y][12] = 0;

const reachable3 = getReachablePositions(DUNGEON_3.tiles, { x: 12, y: 1 });
const occupied3 = new Set<string>();
const addEntity3 = (entity: Entity) => {
  DUNGEON_3.entities.push(entity);
  occupied3.add(`${entity.pos.x},${entity.pos.y}`);
};

addEntity3({
  id: 'portal_back_3',
  type: 'portal',
  name: 'Back to Coral Cove',
  pos: { x: 12, y: 1 },
  sprite: '🌀'
});

const bossPos3 = reachable3.find(p => p.y === 20) || reachable3[reachable3.length - 1];
addEntity3({
  id: 'boss_3',
  type: 'boss',
  name: 'Bob the Dragon',
  pos: bossPos3,
  stats: { hp: 2400, maxHp: 2400, attack: 150, defense: 45, level: 18, exp: 8000, gold: 3000 },
  element: 'fire',
  resistances: { fire: 0.5, ice: 2.0 },
  sprite: '🐲',
  loot: [ITEMS.poison_steel_sword]
});

for(let i=0; i<4; i++) {
  const available = reachable3.filter(p => !occupied3.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntity3({
    id: `chest_3_${i}`,
    type: 'chest',
    name: 'Treasure Chest',
    pos: pos,
    sprite: '🎁',
    loot: [ITEMS.kelp, ITEMS.kelp]
  });
}

for(let i=0; i<15; i++) {
  const available = reachable3.filter(p => !occupied3.has(`${p.x},${p.y}`));
  if (available.length === 0) break;
  const pos = available[Math.floor(Math.random() * available.length)];
  addEntity3({
    id: `dragon_minion_${i}`,
    type: 'dragon',
    name: 'Lesser Dragon',
    pos: pos,
    stats: { hp: 160, maxHp: 160, attack: 40, defense: 8, level: 10, exp: 400, gold: 150 },
    element: 'fire',
    sprite: '🐲'
  });
}

export const CORAL_CASTLE: WorldMap = {
  id: 'coral_castle',
  name: 'Coral Castle',
  width: 30,
  height: 30,
  tiles: Array(30).fill(0).map(() => Array(30).fill(1)),
  entities: []
};

// Larger arena
for(let y=2; y<28; y++) {
  for(let x=2; x<28; x++) {
    CORAL_CASTLE.tiles[y][x] = 0;
  }
}

// Back portal
CORAL_CASTLE.entities.push({
  id: 'portal_back_castle',
  type: 'portal',
  name: 'Back to Coral Cove',
  pos: { x: 15, y: 2 },
  sprite: '🌀'
});

// Hard enemies
for(let i=0; i<10; i++) {
  CORAL_CASTLE.entities.push({
    id: `test_enemy_${i}`,
    type: 'boss',
    name: 'Castle Guardian',
    pos: { x: 5 + (i % 5) * 4, y: 10 + Math.floor(i / 5) * 5 },
    stats: { hp: 1000, maxHp: 1000, attack: 100, defense: 50, level: 20, exp: 1000, gold: 500 },
    sprite: '⚔️'
  });
}

// The Boss that drops the sword
CORAL_CASTLE.entities.push({
  id: 'boss_tests',
  type: 'boss',
  name: 'Trial Master',
  pos: { x: 15, y: 25 },
  stats: { hp: 2500, maxHp: 2500, attack: 300, defense: 100, level: 30, exp: 5000, gold: 2000 },
  sprite: '🔱',
  loot: [ITEMS.sword_of_the_tides]
});
