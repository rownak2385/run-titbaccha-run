import { GAME_CONSTANTS } from "../constants";
import { MovingPlatformConfig } from "../objects/MovingPlatform";
import { EnemyConfig } from "../objects/Enemy";
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

export interface HazardConfig {
  x: number;
  y: number;
}

export interface HeartConfig {
  id: string;
  x: number;
  y: number;
}

export interface MapPieceConfig {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Chapter6LevelDefinition {
  levelWidth: number;
  levelHeight: number;
  groundSegments: GroundSegment[];
  platforms: PlatformConfig[];
  movingPlatforms: MovingPlatformConfig[];
  hazards: HazardConfig[];
  ronnyBag: { x: number; y: number };
  trainWreckage: { x: number; y: number };
  hearts: HeartConfig[];
  mapPieces: MapPieceConfig[];
  waypointPositions: { x: number; y: number }[];
  checkpoints: CheckpointData[];
  chest: { x: number; y: number };
}

export const CHAPTER_6_LEVEL_DATA: Chapter6LevelDefinition = {
  levelWidth: 6800,
  levelHeight: GAME_CONSTANTS.LOGICAL_HEIGHT,

  // Ground segments across the coastal cliffs and broken bridges
  groundSegments: [
    { startX: 0, endX: 1100, y: 640 }, // Coastal terminus dock
    { startX: 1300, endX: 2200, y: 640 }, // Seaside pebble shore
    { startX: 2400, endX: 3300, y: 640 }, // Rocky bluff base
    { startX: 3500, endX: 4500, y: 640 }, // Ocean spray crags
    { startX: 4700, endX: 5700, y: 640 }, // High mountain terrace
    { startX: 5900, endX: 6800, y: 640 }, // Final summit approach
  ],

  // Elevated clifftop ledges and stone bridges
  platforms: [
    { x: 1550, y: 530, texture: "coastal-cliff-rock" },
    { x: 1750, y: 450, texture: "coastal-cliff-rock" },
    { x: 2650, y: 520, texture: "coastal-cliff-rock" },
    { x: 2900, y: 440, texture: "coastal-cliff-rock" },
    { x: 3800, y: 530, texture: "coastal-cliff-rock" },
    { x: 4100, y: 440, texture: "coastal-cliff-rock" },
    { x: 5000, y: 520, texture: "coastal-cliff-rock" },
    { x: 5300, y: 430, texture: "coastal-cliff-rock" },
    { x: 6150, y: 530, texture: "coastal-cliff-rock" },
    { x: 6400, y: 470, texture: "coastal-cliff-rock" },
  ],

  // Moving Platforms spanning coastal gaps
  movingPlatforms: [
    {
      x: 1200,
      y: 620,
      texture: "broken-bridge",
      axis: "horizontal",
      distance: 80,
      speed: 70,
    },
    {
      x: 2300,
      y: 610,
      texture: "broken-bridge",
      axis: "vertical",
      distance: 60,
      speed: 75,
    },
    {
      x: 3400,
      y: 600,
      texture: "broken-bridge",
      axis: "horizontal",
      distance: 90,
      speed: 80,
    },
    {
      x: 4600,
      y: 610,
      texture: "broken-bridge",
      axis: "vertical",
      distance: 70,
      speed: 75,
    },
    {
      x: 5800,
      y: 600,
      texture: "broken-bridge",
      axis: "horizontal",
      distance: 85,
      speed: 80,
    },
  ],

  // Sea urchin briars & fallen sharp rocks
  hazards: [
    { x: 1850, y: 625 },
    { x: 2800, y: 625 },
    { x: 3950, y: 625 },
    { x: 5100, y: 625 },
    { x: 6250, y: 625 },
  ],

  // Ronny's Bag & Exploded Train Engine at opening
  ronnyBag: { x: 380, y: 618 },
  trainWreckage: { x: 180, y: 590 },

  // Restorative Hearts
  hearts: [
    { id: "ch6_heart_01", x: 750, y: 590 },
    { id: "ch6_heart_02", x: 1750, y: 390 },
    { id: "ch6_heart_03", x: 2900, y: 380 },
    { id: "ch6_heart_04", x: 4100, y: 380 },
    { id: "ch6_heart_05", x: 5300, y: 370 },
    { id: "ch6_heart_06", x: 6400, y: 410 },
  ],

  // Exactly 4 Unique Reachable Destination Map Fragments (Combat-Free Exploration)
  mapPieces: [
    { id: "map_piece_01", x: 1750, y: 410, label: "Map Fragment 1 of 4" },
    { id: "map_piece_02", x: 2900, y: 400, label: "Map Fragment 2 of 4" },
    { id: "map_piece_03", x: 4100, y: 400, label: "Map Fragment 3 of 4" },
    { id: "map_piece_04", x: 5300, y: 390, label: "Map Fragment 4 of 4" },
  ] as MapPieceConfig[],

  // Glowing waypoints that become active once the 4-piece map is assembled
  waypointPositions: [
    { x: 5750, y: 550 },
    { x: 6000, y: 510 },
    { x: 6250, y: 470 },
    { x: 6500, y: 440 },
  ],

  // Checkpoints
  checkpoints: [
    GAME_CONSTANTS.CHECKPOINTS.CH6_CP1,
    GAME_CONSTANTS.CHECKPOINTS.CH6_CP2,
    GAME_CONSTANTS.CHECKPOINTS.CH6_CP3,
  ],

  // Coastal Summit Chest
  chest: { x: 6650, y: 595 },
};
