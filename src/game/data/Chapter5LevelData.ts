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

export interface ArrowBundleConfig {
  id: string;
  x: number;
  y: number;
  amount: number;
}

export interface Chapter5LevelDefinition {
  levelWidth: number;
  levelHeight: number;
  groundSegments: GroundSegment[];
  trainCarPlatforms: PlatformConfig[];
  movingPlatforms: MovingPlatformConfig[];
  hazards: HazardConfig[];
  ticketGate: { x: number; y: number };
  hearts: HeartConfig[];
  checkpoints: CheckpointData[];
  chest: { x: number; y: number };
}

export const CHAPTER_5_LEVEL_DATA: Chapter5LevelDefinition = {
  levelWidth: 6800,
  levelHeight: GAME_CONSTANTS.LOGICAL_HEIGHT,

  // Ground segments:
  // 1. Station Platform (x = 0 to 1350)
  // 2. Track bed underneath moving train (visual track running along bottom)
  groundSegments: [
    { startX: 0, endX: 1350, y: 640 }, // Station boarding platform
    { startX: 1350, endX: 6800, y: 670 }, // Ground tracks underneath train
  ],

  // Train Car Roofs (The primary platforming surface from x = 1400 to 6600)
  // Each train carriage is 600-750px wide with a gap between cars
  trainCarPlatforms: [
    // Car 1: Baggage Car (x = 1450 to 2050)
    { x: 1750, y: 530, texture: "train-car-roof" },
    // Car 2: Passenger Coach A (x = 2200 to 2850)
    { x: 2525, y: 530, texture: "train-car-roof" },
    // Car 3: Dining Car (x = 3000 to 3700)
    { x: 3350, y: 530, texture: "train-car-roof" },
    // Car 4: Passenger Coach B (x = 3850 to 4550)
    { x: 4200, y: 530, texture: "train-car-roof" },
    // Car 5: Sleeper Express (x = 4700 to 5400)
    { x: 5050, y: 530, texture: "train-car-roof" },
    // Car 6: Coal Tender & Heavy Engine (x = 5550 to 6650)
    { x: 6100, y: 530, texture: "train-engine-roof" },
  ],

  // Moving Platforms spanning gaps between cars or elevator platforms
  movingPlatforms: [
    {
      x: 2125,
      y: 520,
      texture: "broken-bridge",
      axis: "vertical",
      distance: 60,
      speed: 70,
    },
    {
      x: 2925,
      y: 510,
      texture: "broken-bridge",
      axis: "horizontal",
      distance: 90,
      speed: 80,
    },
    {
      x: 3775,
      y: 520,
      texture: "broken-bridge",
      axis: "vertical",
      distance: 70,
      speed: 75,
    },
    {
      x: 4625,
      y: 500,
      texture: "broken-bridge",
      axis: "horizontal",
      distance: 85,
      speed: 80,
    },
    {
      x: 5475,
      y: 510,
      texture: "broken-bridge",
      axis: "vertical",
      distance: 60,
      speed: 70,
    },
  ],

  // Rooftop Vent & Pipe Hazards
  hazards: [
    { x: 1850, y: 495 },
    { x: 2650, y: 495 },
    { x: 3500, y: 495 },
    { x: 4350, y: 495 },
    { x: 5200, y: 495 },
    { x: 5850, y: 495 },
  ],

  ticketGate: { x: 1180, y: 595 },

  // Restorative Hearts on the train
  hearts: [
    { id: "ch5_heart_01", x: 650, y: 590 },
    { id: "ch5_heart_02", x: 1650, y: 460 },
    { id: "ch5_heart_03", x: 2450, y: 460 },
    { id: "ch5_heart_04", x: 3300, y: 460 },
    { id: "ch5_heart_05", x: 4150, y: 460 },
    { id: "ch5_heart_06", x: 5000, y: 460 },
    { id: "ch5_heart_07", x: 5900, y: 460 },
  ],

  // Checkpoints
  checkpoints: [
    GAME_CONSTANTS.CHECKPOINTS.CH5_CP1,
    GAME_CONSTANTS.CHECKPOINTS.CH5_CP2,
    GAME_CONSTANTS.CHECKPOINTS.CH5_CP3,
  ],

  // End Chest on the Locomotive Observation Roof
  chest: { x: 6640, y: 485 },
};
