import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { SaveSystem } from "./SaveSystem";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { CheckpointData } from "@/types/game";

export interface ChapterInfo {
  id: number;
  title: string;
  sceneKey: string;
  levelWidth: number;
  spawnCheckpoint: CheckpointData;
  requiredKeyId?: string;
}

export class ChapterManager {
  private static instance: ChapterManager;

  private chapters: Map<number, ChapterInfo> = new Map([
    [
      1,
      {
        id: 1,
        title: "The Betrayal",
        sceneKey: "Chapter1GardenScene",
        levelWidth: 6800,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.DEFAULT_SPAWN,
      },
    ],
    [
      2,
      {
        id: 2,
        title: "The Search",
        sceneKey: "Chapter2SearchScene",
        levelWidth: 6800,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.CH2_SPAWN,
        requiredKeyId: GAME_CONSTANTS.IDENTIFIERS.CHAPTER_2_KEY_ID,
      },
    ],
    [
      3,
      {
        id: 3,
        title: "The Rescue",
        sceneKey: "Chapter3RescueScene",
        levelWidth: 7200,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.CH3_SPAWN,
        requiredKeyId: GAME_CONSTANTS.IDENTIFIERS.CHAPTER_3_KEY_ID,
      },
    ],
    [
      4,
      {
        id: 4,
        title: "The Darkness",
        sceneKey: "Chapter4DarknessScene",
        levelWidth: 6800,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.CH4_SPAWN,
        requiredKeyId: GAME_CONSTANTS.IDENTIFIERS.CHAPTER_4_KEY_ID,
      },
    ],
    [
      5,
      {
        id: 5,
        title: "The Station",
        sceneKey: "Chapter5StationScene",
        levelWidth: 6800,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.CH5_SPAWN,
        requiredKeyId: GAME_CONSTANTS.IDENTIFIERS.CHAPTER_5_KEY_ID,
      },
    ],
    [
      6,
      {
        id: 6,
        title: "The Destination",
        sceneKey: "Chapter6DestinationScene",
        levelWidth: 6800,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.CH6_SPAWN,
        requiredKeyId: GAME_CONSTANTS.IDENTIFIERS.CHAPTER_6_KEY_ID,
      },
    ],
    [
      7,
      {
        id: 7,
        title: "The Heaven",
        sceneKey: "Chapter7HeavenScene",
        levelWidth: 6800,
        spawnCheckpoint: GAME_CONSTANTS.CHECKPOINTS.CH7_SPAWN,
        requiredKeyId: GAME_CONSTANTS.IDENTIFIERS.CHAPTER_7_KEY_ID,
      },
    ],
  ]);

  public static getInstance(): ChapterManager {
    if (!ChapterManager.instance) {
      ChapterManager.instance = new ChapterManager();
    }
    return ChapterManager.instance;
  }

  public getChapterInfo(chapterNum: number): ChapterInfo | undefined {
    return this.chapters.get(chapterNum);
  }

  public getAllChapters(): ChapterInfo[] {
    return Array.from(this.chapters.values());
  }

  public isChapterUnlocked(chapterNum: number): boolean {
    if (chapterNum === 1) return true;
    const save = SaveSystem.load();
    if (!save) return false;
    return save.unlockedChapters.includes(chapterNum);
  }

  public getInitialSceneKey(): string {
    const save = SaveSystem.load();
    const chapterNum = save?.chapter || 1;
    const chapterInfo = this.getChapterInfo(chapterNum);
    return chapterInfo?.sceneKey || "Chapter1GardenScene";
  }

  /**
   * Transition from current Phaser scene to a target chapter.
   */
  public transitionToChapter(currentScene: Phaser.Scene, targetChapter: number): boolean {
    const info = this.getChapterInfo(targetChapter);
    if (!info) {
      console.error(`Chapter ${targetChapter} does not exist.`);
      return false;
    }

    if (!this.isChapterUnlocked(targetChapter)) {
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        `Chapter ${targetChapter} is locked. You need the ${info.requiredKeyId || "key"}.`
      );
      return false;
    }

    // Save active chapter & default spawn
    SaveSystem.setChapter(targetChapter, info.spawnCheckpoint);

    // Stop current scene and start target scene
    currentScene.scene.stop();
    currentScene.scene.start(info.sceneKey);

    EventBus.emit(GAME_EVENTS.NOTIFICATION, `Entered Chapter ${targetChapter}: ${info.title}`);
    return true;
  }
}
