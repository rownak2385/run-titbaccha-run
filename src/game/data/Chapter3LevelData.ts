import { GAME_CONSTANTS } from "../constants";
import { EnemyConfig } from "../objects/Enemy";
import { MovingPlatformConfig } from "../objects/MovingPlatform";

export interface GroundSegment {
  startX: number;
  endX: number;
  y: number;
}

export interface PlatformConfig {
  x: number;
  y: number;
  texture: string;
}

export interface HazardConfig {
  x: number;
  y: number;
}

export interface CollectibleHeartConfig {
  id: string;
  x: number;
  y: number;
}

export interface ArrowBundleConfig {
  id: string;
  x: number;
  y: number;
  amount: number;
}

export const CHAPTER_3_LEVEL_DATA = {
  levelWidth: 7200,

  // Ground Segments across 7,200 pixels
  groundSegments: [
    { startX: 0, endX: 1400, y: 656 },
    // Ravine 1400 - 1580
    { startX: 1580, endX: 2500, y: 656 }, // CP1 at 2150
    // Ravine 2500 - 2750
    { startX: 2750, endX: 3700, y: 656 },
    // Ravine 3700 - 3950
    { startX: 3950, endX: 4700, y: 656 }, // CP2 at 4350
    // Ravine 4700 - 4950
    { startX: 4950, endX: 5900, y: 656 },
    // Ravine 5900 - 6120
    { startX: 6120, endX: 7200, y: 656 }, // CP3 at 6250, Cave & Chest
  ] as GroundSegment[],

  // Raised roots & wooden platforms
  platforms: [
    // Early platforming & bow pedestal
    { x: 500, y: 540, texture: "forest-wood-platform" },
    { x: 850, y: 480, texture: "forest-wood-platform" }, // Bow pedestal
    { x: 1100, y: 430, texture: "forest-root-platform" },

    // Over Ravine 1
    { x: 1490, y: 520, texture: "forest-wood-platform" },
    { x: 1750, y: 470, texture: "forest-root-platform" },

    // Middle Encounter Platforms
    { x: 2350, y: 510, texture: "forest-wood-platform" },
    { x: 2620, y: 530, texture: "forest-wood-platform" },
    { x: 2950, y: 460, texture: "forest-root-platform" },
    { x: 3250, y: 400, texture: "forest-wood-platform" },
    { x: 3550, y: 480, texture: "forest-root-platform" },

    // Over Ravine 3 & 4
    { x: 3820, y: 520, texture: "forest-wood-platform" },
    { x: 4150, y: 460, texture: "forest-root-platform" },
    { x: 4550, y: 510, texture: "forest-wood-platform" },
    { x: 4820, y: 520, texture: "forest-root-platform" },
    { x: 5200, y: 450, texture: "forest-wood-platform" },
    { x: 5550, y: 390, texture: "forest-root-platform" },
    { x: 5800, y: 480, texture: "forest-wood-platform" },

    // Approach to Cave
    { x: 6020, y: 530, texture: "forest-wood-platform" },
    { x: 6450, y: 520, texture: "forest-root-platform" },
    { x: 6700, y: 470, texture: "forest-wood-platform" },
  ] as PlatformConfig[],

  // Moving Platforms
  movingPlatforms: [
    {
      x: 2510,
      y: 540,
      axis: "horizontal",
      distance: 220,
      speed: 75,
      texture: "garden-platform-moving",
    },
    {
      x: 4710,
      y: 420,
      axis: "vertical",
      distance: 140,
      speed: 65,
      texture: "garden-platform-stone",
    },
    {
      x: 5910,
      y: 530,
      axis: "horizontal",
      distance: 190,
      speed: 80,
      texture: "garden-platform-moving",
    },
  ] as MovingPlatformConfig[],

  // Bramble Hazards
  hazards: [
    { x: 650, y: 642 },
    { x: 1250, y: 642 },
    { x: 1850, y: 642 },
    { x: 2850, y: 642 },
    { x: 3450, y: 642 },
    { x: 4250, y: 642 },
    { x: 5350, y: 642 },
    { x: 6350, y: 642 },
  ] as HazardConfig[],

  // Bow Pedestal Location
  bowLocation: {
    x: 850,
    y: 440,
  },

  // Guaranteed Arrow Replenishment Quivers (before & between encounters)
  arrowBundles: [
    { id: "bundle_ch3_01", x: 920, y: 440, amount: 5 },
    { id: "bundle_ch3_02", x: 1650, y: 620, amount: 5 },
    { id: "bundle_ch3_03", x: 2800, y: 620, amount: 5 },
    { id: "bundle_ch3_04", x: 3600, y: 620, amount: 5 },
    { id: "bundle_ch3_05", x: 4400, y: 420, amount: 5 },
    { id: "bundle_ch3_06", x: 5050, y: 620, amount: 5 },
    { id: "bundle_ch3_07", x: 5850, y: 620, amount: 5 },
    { id: "bundle_ch3_08", x: 6200, y: 620, amount: 5 },
  ] as ArrowBundleConfig[],

  // Exactly 9 Mandatory Hostile Encounters (Dropping photo pieces 01 to 09)
  enemies: [
    {
      id: "ch3_enemy_01",
      x: 1200,
      y: 620,
      archetype: "wolf",
      patrolMinX: 1050,
      patrolMaxX: 1350,
      maxHp: 50,
      speed: 70,
      dropItemId: "photo_piece_01",
      dropItemType: "photo",
    },
    {
      id: "ch3_enemy_02",
      x: 1750,
      y: 620,
      archetype: "fox",
      patrolMinX: 1650,
      patrolMaxX: 1950,
      maxHp: 50,
      speed: 85,
      dropItemId: "photo_piece_02",
      dropItemType: "photo",
    },
    {
      id: "ch3_enemy_03",
      x: 2300,
      y: 620,
      archetype: "wolf",
      patrolMinX: 2150,
      patrolMaxX: 2450,
      maxHp: 50,
      speed: 75,
      dropItemId: "photo_piece_03",
      dropItemType: "photo",
    },
    // Checkpoint 1 placed at 2150

    {
      id: "ch3_enemy_04",
      x: 2950,
      y: 620,
      archetype: "fox",
      patrolMinX: 2800,
      patrolMaxX: 3150,
      maxHp: 50,
      speed: 90,
      dropItemId: "photo_piece_04",
      dropItemType: "photo",
    },
    {
      id: "ch3_enemy_05",
      x: 3450,
      y: 620,
      archetype: "wolf",
      patrolMinX: 3300,
      patrolMaxX: 3650,
      maxHp: 50,
      speed: 70,
      dropItemId: "photo_piece_05",
      dropItemType: "photo",
    },
    {
      id: "ch3_enemy_06",
      x: 4100,
      y: 620,
      archetype: "fox",
      patrolMinX: 3980,
      patrolMaxX: 4300,
      maxHp: 50,
      speed: 85,
      dropItemId: "photo_piece_06",
      dropItemType: "photo",
    },
    // Checkpoint 2 placed at 4350

    {
      id: "ch3_enemy_07",
      x: 5150,
      y: 620,
      archetype: "wolf",
      patrolMinX: 5000,
      patrolMaxX: 5350,
      maxHp: 50,
      speed: 75,
      dropItemId: "photo_piece_07",
      dropItemType: "photo",
    },
    {
      id: "ch3_enemy_08",
      x: 5650,
      y: 620,
      archetype: "fox",
      patrolMinX: 5450,
      patrolMaxX: 5850,
      maxHp: 50,
      speed: 90,
      dropItemId: "photo_piece_08",
      dropItemType: "photo",
    },
    {
      id: "ch3_enemy_09",
      x: 6550,
      y: 620,
      archetype: "wolf", // Cave Entrance Alpha Wolf
      patrolMinX: 6350,
      patrolMaxX: 6720,
      maxHp: 100, // 2 arrow hits
      speed: 80,
      dropItemId: "photo_piece_09",
      dropItemType: "photo",
    },
    // Checkpoint 3 placed at 6250
  ] as EnemyConfig[],

  // Ronny's Dropped Heart Trail
  hearts: [
    { id: "heart_ch3_01", x: 450, y: 620 },
    { id: "heart_ch3_02", x: 1100, y: 390 },
    { id: "heart_ch3_03", x: 2100, y: 620 },
    { id: "heart_ch3_04", x: 3250, y: 360 },
    { id: "heart_ch3_05", x: 4400, y: 620 },
    { id: "heart_ch3_06", x: 5550, y: 350 },
    { id: "heart_ch3_07", x: 6700, y: 430 },
  ] as CollectibleHeartConfig[],

  // Checkpoints
  checkpoints: [
    GAME_CONSTANTS.CHECKPOINTS.CH3_CP1,
    GAME_CONSTANTS.CHECKPOINTS.CH3_CP2,
    GAME_CONSTANTS.CHECKPOINTS.CH3_CP3,
  ],

  // Cave Entrance & Ancient Chest
  caveEntrance: {
    x: 6750,
    y: 576,
  },
  chest: {
    x: 6980,
    y: 638,
  },
};
