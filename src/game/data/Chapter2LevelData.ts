import { GAME_CONSTANTS } from "../constants";
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

export const CHAPTER_2_LEVEL_DATA = {
  // Ground Segments across 6,800 pixels with broken chasms/pits
  groundSegments: [
    { startX: 0, endX: 1200, y: 656 },
    // Gap 1200 - 1380 (180px pit)
    { startX: 1380, endX: 2350, y: 656 }, // Checkpoint 1 at 1950
    // Gap 2350 - 2560 (210px pit)
    { startX: 2560, endX: 3500, y: 656 },
    // Gap 3500 - 3720 (220px pit)
    { startX: 3720, endX: 4700, y: 656 }, // Checkpoint 2 at 3900
    // Gap 4700 - 4950 (250px pit with moving platforms)
    { startX: 4950, endX: 5800, y: 656 }, // Checkpoint 3 at 5500
    // Gap 5800 - 6000 (200px pit)
    { startX: 6000, endX: GAME_CONSTANTS.LEVEL_WIDTH, y: 656 }, // Chest clearing
  ] as GroundSegment[],

  // Elevated Terraces & Ruined Masonry
  platforms: [
    // Segment 1: Perimeter Fences
    { x: 450, y: 550, texture: "ruined-platform" },
    { x: 680, y: 460, texture: "ruined-platform" },
    { x: 920, y: 530, texture: "ruined-platform" },

    // Segment 2: Over Pit 1 & Sun-Dial Plaza
    { x: 1290, y: 520, texture: "ruined-platform" },
    { x: 1540, y: 440, texture: "ruined-platform" },
    { x: 1780, y: 510, texture: "ruined-platform" },
    { x: 2150, y: 460, texture: "ruined-platform" },

    // Segment 3: Stepped Colonnade
    { x: 2450, y: 520, texture: "ruined-platform" },
    { x: 2750, y: 450, texture: "ruined-platform" },
    { x: 3050, y: 380, texture: "ruined-platform" },
    { x: 3350, y: 460, texture: "ruined-platform" },

    // Segment 4: Fountain Terraces
    { x: 3610, y: 530, texture: "ruined-platform" },
    { x: 4150, y: 480, texture: "ruined-platform" },
    { x: 4420, y: 420, texture: "ruined-platform" },

    // Segment 5: High Canopy Overlook
    { x: 5150, y: 470, texture: "ruined-platform" },
    { x: 5380, y: 400, texture: "ruined-platform" },
    { x: 5650, y: 480, texture: "ruined-platform" },

    // Segment 6: Final Approach
    { x: 5900, y: 520, texture: "ruined-platform" },
    { x: 6250, y: 530, texture: "ruined-platform" },
    { x: 6450, y: 460, texture: "ruined-platform" },
  ] as PlatformConfig[],

  // Moving Platforms
  movingPlatforms: [
    // Horizontal Moving Trellis over Pit 2
    {
      x: 2360,
      y: 530,
      axis: "horizontal",
      distance: 180,
      speed: 70,
      texture: "garden-platform-moving",
    },
    // Vertical Stone Elevator over Pit 4
    {
      x: 4720,
      y: 410,
      axis: "vertical",
      distance: 160,
      speed: 65,
      texture: "garden-platform-stone",
    },
    // Horizontal Moving Trellis over Pit 4
    {
      x: 4790,
      y: 420,
      axis: "horizontal",
      distance: 140,
      speed: 80,
      texture: "garden-platform-moving",
    },
    // Floating Ruin Platform near final pit
    {
      x: 5820,
      y: 540,
      axis: "horizontal",
      distance: 160,
      speed: 75,
      texture: "garden-platform-stone",
    },
  ] as MovingPlatformConfig[],

  // Thorn & Briar Hazards
  hazards: [
    { x: 550, y: 642 },
    { x: 800, y: 642 },
    { x: 1650, y: 642 },
    { x: 2200, y: 642 },
    { x: 2850, y: 642 },
    { x: 3200, y: 642 },
    { x: 4250, y: 642 },
    { x: 4550, y: 642 },
    { x: 5250, y: 642 },
    { x: 6150, y: 642 },
    { x: 6350, y: 642 },
  ] as HazardConfig[],

  // Ronny's Dropped Heart Trails (Vitality + Speed Boosts)
  hearts: [
    { id: "heart_ch2_01", x: 680, y: 410 },
    { id: "heart_ch2_02", x: 1540, y: 390 },
    { id: "heart_ch2_03", x: 2750, y: 400 },
    { id: "heart_ch2_04", x: 3050, y: 330 },
    { id: "heart_ch2_05", x: 4420, y: 370 },
    { id: "heart_ch2_06", x: 5380, y: 350 },
    { id: "heart_ch2_07", x: 6250, y: 480 },
    { id: "heart_ch2_08", x: 6450, y: 410 },
  ] as CollectibleHeartConfig[],

  // Checkpoints
  checkpoints: [
    GAME_CONSTANTS.CHECKPOINTS.CH2_CP1,
    GAME_CONSTANTS.CHECKPOINTS.CH2_CP2,
    GAME_CONSTANTS.CHECKPOINTS.CH2_CP3,
  ],

  // Ancient Chest Position
  chest: {
    x: 6650,
    y: 638,
  },
};
