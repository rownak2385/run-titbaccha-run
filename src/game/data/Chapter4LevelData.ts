import { GAME_CONSTANTS } from "../constants";
import { SunlightZone } from "../systems/TorchSystem";
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

export interface TicketPieceConfig {
  id: string;
  x: number;
  y: number;
  label: string;
}

export const CHAPTER_4_LEVEL_DATA = {
  levelWidth: 6800,

  // Ground Segments across 6,800 pixels with underground pits
  groundSegments: [
    { startX: 0, endX: 1200, y: 656 },
    // Chasm 1200 - 1380
    { startX: 1380, endX: 2350, y: 656 }, // Sunlight Zone 1 & CP1 at 1950
    // Chasm 2350 - 2580
    { startX: 2580, endX: 3500, y: 656 },
    // Chasm 3500 - 3750
    { startX: 3750, endX: 4700, y: 656 }, // Sunlight Zone 2 & CP2 at 3950
    // Chasm 4700 - 4950
    { startX: 4950, endX: 5850, y: 656 }, // Sunlight Zone 3 & CP3 at 5650
    // Chasm 5850 - 6100
    { startX: 6100, endX: 6800, y: 656 }, // Cave Exit & Chest Clearing
  ] as GroundSegment[],

  // Cavern Platforms & Stone Ledges
  platforms: [
    // Entrance Shaft
    { x: 450, y: 550, texture: "cave-platform" },
    { x: 720, y: 470, texture: "cave-platform" },
    { x: 980, y: 520, texture: "cave-platform" },

    // Over Chasm 1
    { x: 1290, y: 530, texture: "cave-platform" },
    { x: 1650, y: 460, texture: "cave-platform" },

    // Over Chasm 2 & Grotto
    { x: 2460, y: 530, texture: "cave-platform" },
    { x: 2800, y: 460, texture: "cave-platform" },
    { x: 3150, y: 390, texture: "cave-platform" },
    { x: 3400, y: 480, texture: "cave-platform" },

    // Over Chasm 3
    { x: 3620, y: 530, texture: "cave-platform" },
    { x: 4200, y: 480, texture: "cave-platform" },
    { x: 4500, y: 420, texture: "cave-platform" },

    // Over Chasm 4
    { x: 4820, y: 530, texture: "cave-platform" },
    { x: 5200, y: 470, texture: "cave-platform" },
    { x: 5500, y: 410, texture: "cave-platform" },

    // Exit Approach
    { x: 5980, y: 530, texture: "cave-platform" },
    { x: 6300, y: 500, texture: "cave-platform" },
    { x: 6500, y: 450, texture: "cave-platform" },
  ] as PlatformConfig[],

  // Moving Platforms
  movingPlatforms: [
    {
      x: 2370,
      y: 540,
      axis: "horizontal",
      distance: 190,
      speed: 70,
      texture: "garden-platform-stone",
    },
    {
      x: 4720,
      y: 410,
      axis: "vertical",
      distance: 150,
      speed: 65,
      texture: "garden-platform-stone",
    },
    {
      x: 5870,
      y: 540,
      axis: "horizontal",
      distance: 210,
      speed: 75,
      texture: "garden-platform-moving",
    },
  ] as MovingPlatformConfig[],

  // Stalagmite Hazards
  hazards: [
    { x: 600, y: 642 },
    { x: 900, y: 642 },
    { x: 1750, y: 642 },
    { x: 2200, y: 642 },
    { x: 2950, y: 642 },
    { x: 3350, y: 642 },
    { x: 4300, y: 642 },
    { x: 4550, y: 642 },
    { x: 5300, y: 642 },
    { x: 6250, y: 642 },
  ] as HazardConfig[],

  // Natural Sunlight Safe Zones (No torch vitality drain, illuminated)
  sunlightZones: [
    { x: 1800, y: 0, width: 300, height: 720 }, // Sunlight Zone 1 (around CP1 at 1950)
    { x: 3800, y: 0, width: 300, height: 720 }, // Sunlight Zone 2 (around CP2 at 3950)
    { x: 5500, y: 0, width: 300, height: 720 }, // Sunlight Zone 3 (around CP3 at 5650)
    { x: 6400, y: 0, width: 400, height: 720 }, // Cave Exit & Chest Clearing
  ] as SunlightZone[],

  // Traveler's Pouch at Cave Entrance (contains 3 hearts & note)
  travelerPouch: {
    x: 280,
    y: 620,
  },

  // Exactly 3 Unique Reachable Train Ticket Fragments (Combat-Free Exploration)
  ticketPieces: [
    { id: "ticket_piece_01", x: 1650, y: 420, label: "Ticket Scrap 1 of 3" },
    { id: "ticket_piece_02", x: 3150, y: 350, label: "Ticket Scrap 2 of 3" },
    { id: "ticket_piece_03", x: 5200, y: 430, label: "Ticket Scrap 3 of 3" },
  ] as TicketPieceConfig[],

  // Heart pickups for vitality recovery
  hearts: [
    { id: "heart_ch4_01", x: 720, y: 430 },
    { id: "heart_ch4_02", x: 1950, y: 480 },
    { id: "heart_ch4_03", x: 3150, y: 350 },
    { id: "heart_ch4_04", x: 3950, y: 500 },
    { id: "heart_ch4_05", x: 5500, y: 370 },
    { id: "heart_ch4_06", x: 6500, y: 410 },
  ] as CollectibleHeartConfig[],

  // Checkpoints
  checkpoints: [
    GAME_CONSTANTS.CHECKPOINTS.CH4_CP1,
    GAME_CONSTANTS.CHECKPOINTS.CH4_CP2,
    GAME_CONSTANTS.CHECKPOINTS.CH4_CP3,
  ],

  // End Chest
  chest: {
    x: 6650,
    y: 638,
  },
};
