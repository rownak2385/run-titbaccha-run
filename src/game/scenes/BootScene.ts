import * as Phaser from "phaser";
import { AssetGenerator } from "../systems/AssetGenerator";
import { CharacterAssetManager } from "../systems/CharacterAssetManager";
import { ChapterManager } from "../systems/ChapterManager";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    // 1. Generate all procedural geometric placeholder assets as baseline fallback
    AssetGenerator.generateAll(this);

    // 2. Queue external production character assets (if present on disk)
    CharacterAssetManager.getInstance().queueCharacterAssets(this);
  }

  create(): void {
    // 3. Initialize characters, apply nearest-neighbor filtering, bind animations & log diagnostics
    CharacterAssetManager.getInstance().initializeCharacters(this);

    // 4. Start active chapter level according to SaveSystem & ChapterManager
    const initialSceneKey = ChapterManager.getInstance().getInitialSceneKey();
    this.scene.start(initialSceneKey);
  }
}
