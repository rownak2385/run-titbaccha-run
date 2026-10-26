import * as Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { Chapter1GardenScene } from "./scenes/Chapter1GardenScene";
import { Chapter2SearchScene } from "./scenes/Chapter2SearchScene";
import { Chapter3RescueScene } from "./scenes/Chapter3RescueScene";
import { Chapter4DarknessScene } from "./scenes/Chapter4DarknessScene";
import { Chapter5StationScene } from "./scenes/Chapter5StationScene";
import { Chapter6DestinationScene } from "./scenes/Chapter6DestinationScene";
import { Chapter7HeavenScene } from "./scenes/Chapter7HeavenScene";
import { GAME_CONSTANTS } from "./constants";

export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_CONSTANTS.LOGICAL_WIDTH,
    height: GAME_CONSTANTS.LOGICAL_HEIGHT,
    backgroundColor: "#18181b",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_CONSTANTS.LOGICAL_WIDTH,
      height: GAME_CONSTANTS.LOGICAL_HEIGHT,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: GAME_CONSTANTS.PLAYER.GRAVITY_Y, x: 0 },
        debug: false,
      },
    },
    input: {
      keyboard: true,
      mouse: true,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      powerPreference: "high-performance",
    },
    scene: [
      BootScene,
      Chapter1GardenScene,
      Chapter2SearchScene,
      Chapter3RescueScene,
      Chapter4DarknessScene,
      Chapter5StationScene,
      Chapter6DestinationScene,
      Chapter7HeavenScene,
    ],
  };
}
