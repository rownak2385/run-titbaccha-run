import { GAME_CONSTANTS } from "../constants";
import { MovingPlatformConfig } from "../objects/MovingPlatform";
import { CheckpointData } from "@/types/game";

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

export interface RoseConfig {
  id: string;
  x: number;
  y: number;
}

export interface HeartConfig {
  id: string;
  x: number;
  y: number;
}

export interface Chapter7LevelDefinition {
  levelWidth: number;
  levelHeight: number;
  groundSegments: GroundSegment[];
  platforms: PlatformConfig[];
  movingPlatforms: MovingPlatformConfig[];
  roses: RoseConfig[];
  hearts: HeartConfig[];
  letterFragment7: { x: number; y: number };
  ronnyLocation: { x: number; y: number };
  checkpoints: CheckpointData[];
}

export const CHAPTER_7_LEVEL_DATA: Chapter7LevelDefinition = {
  levelWidth: 6800,
  levelHeight: GAME_CONSTANTS.LOGICAL_HEIGHT,

  // Gentle grassy clifftops with blooming wildflowers
  groundSegments: [
    { startX: 0, endX: 1300, y: 640 }, // Sunset path entrance
    { startX: 1500, endX: 2800, y: 640 }, // Whispering meadow
    { startX: 3000, endX: 4300, y: 640 }, // High floral plateau
    { startX: 4500, endX: 5800, y: 640 }, // Ocean view summit
    { startX: 6000, endX: 6800, y: 640 }, // Clifftop sanctuary (Reunion clearing)
  ],

  // Flowered stone ledges
  platforms: [
    { x: 850, y: 520, texture: "sunset-meadow-platform" },
    { x: 1850, y: 520, texture: "sunset-meadow-platform" },
    { x: 2350, y: 440, texture: "sunset-meadow-platform" },
    { x: 3100, y: 510, texture: "sunset-meadow-platform" },
    { x: 3600, y: 430, texture: "sunset-meadow-platform" },
    { x: 4400, y: 510, texture: "sunset-meadow-platform" },
    { x: 4900, y: 420, texture: "sunset-meadow-platform" },
    { x: 5600, y: 510, texture: "sunset-meadow-platform" },
    { x: 6200, y: 530, texture: "sunset-meadow-platform" },
  ],

  // Gentle moving platforms
  movingPlatforms: [
    {
      x: 1400,
      y: 600,
      texture: "sunset-meadow-platform",
      axis: "horizontal",
      distance: 70,
      speed: 60,
    },
    {
      x: 2900,
      y: 590,
      texture: "sunset-meadow-platform",
      axis: "vertical",
      distance: 50,
      speed: 55,
    },
    {
      x: 4400,
      y: 590,
      texture: "sunset-meadow-platform",
      axis: "horizontal",
      distance: 80,
      speed: 60,
    },
    {
      x: 5900,
      y: 600,
      texture: "sunset-meadow-platform",
      axis: "vertical",
      distance: 60,
      speed: 55,
    },
  ],

  // Exactly 5 Unique Clifftop Roses
  roses: [
    { id: "rose_01", x: 850, y: 480 },
    { id: "rose_02", x: 1850, y: 480 },
    { id: "rose_03", x: 3100, y: 470 },
    { id: "rose_04", x: 4400, y: 470 },
    { id: "rose_05", x: 5600, y: 470 },
  ],

  // Restorative Vitality Hearts
  hearts: [
    { id: "ch7_heart_01", x: 1100, y: 590 },
    { id: "ch7_heart_02", x: 2350, y: 390 },
    { id: "ch7_heart_03", x: 3600, y: 380 },
    { id: "ch7_heart_04", x: 4900, y: 370 },
    { id: "ch7_heart_05", x: 5750, y: 590 },
  ],

  // Final Letter Fragment (7 of 7) at Summit Threshold
  letterFragment7: { x: 6200, y: 490 },

  // Ronny's Location on the Seaside Clifftop Sanctuary
  ronnyLocation: { x: 6520, y: 600 },

  // Checkpoints
  checkpoints: [
    GAME_CONSTANTS.CHECKPOINTS.CH7_CP1,
    GAME_CONSTANTS.CHECKPOINTS.CH7_CP2,
    GAME_CONSTANTS.CHECKPOINTS.CH7_CP3,
  ],
};
