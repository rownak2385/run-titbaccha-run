import { MovingPlatformConfig } from "../objects/MovingPlatform";

export interface PlatformData {
  x: number;
  y: number;
  texture: "garden-platform" | "stone-platform" | "log-platform";
  width?: number;
  height?: number;
}

export interface HazardData {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface HeartPickupData {
  id: string;
  x: number;
  y: number;
}

export interface GroundSegment {
  startX: number;
  endX: number;
  y: number;
}

export const CHAPTER_1_LEVEL_DATA = {
  levelWidth: 6800,
  levelHeight: 720,

  // Traversable ground segments with broken pits in hazard areas
  groundSegments: [
    { startX: 0, endX: 1350, y: 688 }, // Segment 1: Entrance
    { startX: 1650, endX: 3250, y: 688 }, // Segment 2 & 3: Flowerbeds & Fallen Trees
    { startX: 4150, endX: 4500, y: 688 }, // Post-bridge terrace
    { startX: 5200, endX: 6800, y: 688 }, // Segment 6 & 7: Ronny campsite & Chest clearing
  ] as GroundSegment[],

  // Static Elevated Platforms across the 7 segments
  platforms: [
    // --- Segment 1: Entrance ---
    { x: 520, y: 550, texture: "garden-platform" },
    { x: 850, y: 440, texture: "garden-platform" },

    // --- Segment 2: Broken Flowerbed Terraces ---
    { x: 1320, y: 560, texture: "garden-platform" },
    { x: 1520, y: 440, texture: "garden-platform" },
    { x: 1750, y: 340, texture: "garden-platform" },

    // --- Segment 3: Fallen Trees & Damaged Fences ---
    { x: 2350, y: 540, texture: "log-platform" },
    { x: 2680, y: 420, texture: "log-platform" },
    { x: 3020, y: 530, texture: "garden-platform" },

    // --- Segment 4: Cracked Stone Bridge & Moving Platforms ---
    { x: 3250, y: 550, texture: "stone-platform" },
    { x: 3880, y: 460, texture: "stone-platform" },

    // --- Segment 5: Hazardous Garden Ruins ---
    { x: 4550, y: 540, texture: "stone-platform" },
    { x: 4800, y: 420, texture: "stone-platform" },
    { x: 5050, y: 350, texture: "stone-platform" },
    { x: 5320, y: 490, texture: "garden-platform" },
  ] as PlatformData[],

  // Moving Platforms requiring timing
  movingPlatforms: [
    // Moving Platform 1: Horizontal Trellis across left gorge of cracked stone bridge
    {
      x: 3420,
      y: 500,
      texture: "garden-platform",
      axis: "horizontal",
      distance: 300,
      speed: 85,
    },
    // Moving Platform 2: Vertical Stone Elevator slab reaching upper terrace
    {
      x: 4040,
      y: 350,
      texture: "stone-platform",
      axis: "vertical",
      distance: 180,
      speed: 75,
    },
  ] as MovingPlatformConfig[],

  // Environmental Hazards (Bramble Briar Clusters)
  hazards: [
    // Entrance
    { x: 680, y: 650 },
    // Pit under flowerbeds
    { x: 1480, y: 650 },
    { x: 1600, y: 650 },
    // Hurdle area
    { x: 2850, y: 650 },
    // Ravine under stone bridge
    { x: 3480, y: 650 },
    { x: 3720, y: 650 },
    // Ruins gap
    { x: 4680, y: 650 },
    { x: 4950, y: 650 },
  ] as HazardData[],

  // Heart Pickups (Heals + Speed Surge)
  hearts: [
    { id: "heart_garden_01", x: 850, y: 390 }, // Segment 1
    { id: "heart_garden_02", x: 2680, y: 370 }, // Segment 3 (High canopy log)
    { id: "heart_garden_03", x: 4800, y: 370 }, // Segment 5 (Ruins pillar)
  ] as HeartPickupData[],
} as const;
