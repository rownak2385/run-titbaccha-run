import { GAME_CONSTANTS } from "../constants";
import { SaveData, CheckpointData } from "@/types/game";

export class SaveSystem {
  private static get isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  public static getDefaultSave(): SaveData {
    return {
      version: GAME_CONSTANTS.SAVE.SCHEMA_VERSION, // 4
      chapter: 1,
      unlockedChapters: [1],
      completedChapters: [],
      activeCheckpoint: GAME_CONSTANTS.CHECKPOINTS.DEFAULT_SPAWN,
      health: GAME_CONSTANTS.RESOURCE.INITIAL_HEALTH,
      maxHealth: GAME_CONSTANTS.RESOURCE.MAX_HEALTH,
      collectedItems: [],
      unlockedChests: [],
      defeatedEnemies: [],
      puzzles: {
        photoPieces: [],
        isPhotoComplete: false,
        ticketPieces: [],
        isTicketComplete: false,
        mapPieces: [],
        isMapComplete: false,
      },
      hasBow: false,
      arrowCount: 0,
      maxArrows: GAME_CONSTANTS.COMBAT.MAX_ARROWS,
      hasChapter2Key: false,
      hasChapter3Key: false,
      hasChapter4Key: false,
      hasChapter5Key: false,
      hasChapter6Key: false,
      hasChapter7Key: false,
      letterFragments: [],
      hasLetterFragment1: false,
      hasLetterFragment2: false,
      hasLetterFragment3: false,
      hasLetterFragment4: false,
      hasLetterFragment5: false,
      hasLetterFragment6: false,
      hasLetterFragment7: false,
      hasTrainTicket: false,
      hasCaveNote: false,
      hasRonnyBag: false,
      trainExploded: false,
      roses: [],
      hasBouquet: false,
      necklaceActivated: false,
      reunionCompleted: false,
      finalLetterRevealed: false,
      gameCompleted: false,
      settings: {
        muted: false,
        masterVolume: 1.0,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Loads save data with explicit version migration from V1 / V2 / V3 / V4 to V5.
   */
  public static load(): SaveData | null {
    if (!this.isBrowser) return null;

    try {
      // 1. Try reading V5 save
      const serializedV5 = localStorage.getItem(GAME_CONSTANTS.SAVE.STORAGE_KEY);
      if (serializedV5) {
        try {
          const parsed = JSON.parse(serializedV5) as Partial<SaveData>;
          if (parsed && parsed.version === GAME_CONSTANTS.SAVE.SCHEMA_VERSION) {
            return this.sanitizeSaveData(parsed);
          }
        } catch (jsonErr) {
          console.warn("Corrupted V5 save payload encountered. Recovering to clean default save:", jsonErr);
          const recovered = this.getDefaultSave();
          this.save(recovered);
          return recovered;
        }
      }

      // 2. Try migrating V4 save
      const serializedV4 = localStorage.getItem(GAME_CONSTANTS.SAVE.V4_STORAGE_KEY);
      if (serializedV4) {
        try {
          console.info("Found V4 save data. Performing seamless migration to V5...");
          const v4Parsed = JSON.parse(serializedV4) as Partial<SaveData>;
          const migratedSave = this.sanitizeSaveData({
            ...v4Parsed,
            version: GAME_CONSTANTS.SAVE.SCHEMA_VERSION,
          });
          this.save(migratedSave);
          return migratedSave;
        } catch (v4Err) {
          console.warn("Corrupted V4 save encountered during migration:", v4Err);
        }
      }

      // 3. Try migrating V3 save
      const serializedV3 = localStorage.getItem(GAME_CONSTANTS.SAVE.V3_STORAGE_KEY);
      if (serializedV3) {
        try {
          console.info("Found V3 save data. Performing seamless migration to V5...");
          const v3Parsed = JSON.parse(serializedV3) as Partial<SaveData>;
          const migratedSave = this.sanitizeSaveData({
            ...v3Parsed,
            version: GAME_CONSTANTS.SAVE.SCHEMA_VERSION,
          });
          this.save(migratedSave);
          return migratedSave;
        } catch (v3Err) {
          console.warn("Corrupted V3 save encountered during migration:", v3Err);
        }
      }

      // 4. Try migrating V2 save
      const serializedV2 = localStorage.getItem(GAME_CONSTANTS.SAVE.V2_STORAGE_KEY);
      if (serializedV2) {
        try {
          console.info("Found V2 save data. Performing seamless migration to V5...");
          const v2Parsed = JSON.parse(serializedV2) as Record<string, unknown>;
          const migratedSave = this.migrateFromV2(v2Parsed);
          this.save(migratedSave);
          return migratedSave;
        } catch (v2Err) {
          console.warn("Corrupted V2 save encountered during migration:", v2Err);
        }
      }

      // 5. Try migrating Legacy V1 save
      const serializedV1 = localStorage.getItem(GAME_CONSTANTS.SAVE.LEGACY_STORAGE_KEY);
      if (serializedV1) {
        try {
          console.info("Found legacy V1 save data. Performing seamless migration to V5...");
          const v1Parsed = JSON.parse(serializedV1) as Record<string, unknown>;
          const migratedSave = this.migrateFromV1(v1Parsed);
          this.save(migratedSave);
          return migratedSave;
        } catch (v1Err) {
          console.warn("Corrupted V1 save encountered during migration:", v1Err);
        }
      }

      return null;
    } catch (err) {
      console.error("Failed to load or migrate save data:", err);
      const recovered = this.getDefaultSave();
      this.save(recovered);
      return recovered;
    }
  }

  private static migrateFromV2(v2: Record<string, unknown>): SaveData {
    const defaults = this.getDefaultSave();
    const collected = Array.isArray(v2.collectedItems) ? (v2.collectedItems as string[]) : [];
    const chests = Array.isArray(v2.unlockedChests) ? (v2.unlockedChests as string[]) : [];
    const hasCh2Key = Boolean(v2.hasChapter2Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_2_KEY_ID);
    const hasFrag1 = Boolean(v2.hasLetterFragment1) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_1_ID);

    const unlockedChapters = [1];
    const completedChapters: number[] = [];
    if (hasCh2Key) {
      unlockedChapters.push(2);
      completedChapters.push(1);
    }

    const fragments: number[] = [];
    if (hasFrag1) fragments.push(1);

    return {
      ...defaults,
      chapter: typeof v2.chapter === "number" ? v2.chapter : defaults.chapter,
      unlockedChapters,
      completedChapters,
      activeCheckpoint: (v2.activeCheckpoint as CheckpointData) || defaults.activeCheckpoint,
      health: typeof v2.health === "number" && v2.health > 0 ? v2.health : defaults.health,
      collectedItems: collected,
      unlockedChests: chests,
      hasChapter2Key: hasCh2Key,
      letterFragments: fragments,
      hasLetterFragment1: hasFrag1,
      settings: {
        muted: Boolean((v2.settings as { muted?: boolean })?.muted),
        masterVolume: 1.0,
      },
      timestamp: Date.now(),
    };
  }

  private static migrateFromV1(v1: Record<string, unknown>): SaveData {
    return this.migrateFromV2(v1);
  }

  private static sanitizeSaveData(parsed: Partial<SaveData>): SaveData {
    const defaults = this.getDefaultSave();
    const collected = Array.isArray(parsed.collectedItems) ? parsed.collectedItems : [];
    const chests = Array.isArray(parsed.unlockedChests) ? parsed.unlockedChests : [];
    const defeated = Array.isArray(parsed.defeatedEnemies) ? parsed.defeatedEnemies : [];

    const hasCh2Key = Boolean(parsed.hasChapter2Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_2_KEY_ID);
    const hasCh3Key = Boolean(parsed.hasChapter3Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_3_KEY_ID);
    const hasCh4Key = Boolean(parsed.hasChapter4Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_4_KEY_ID);
    const hasCh5Key = Boolean(parsed.hasChapter5Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_5_KEY_ID);
    const hasCh6Key = Boolean(parsed.hasChapter6Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_6_KEY_ID);
    const hasCh7Key = Boolean(parsed.hasChapter7Key) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_7_KEY_ID);

    const fragments = Array.isArray(parsed.letterFragments) ? parsed.letterFragments : [];
    const hasFrag1 = Boolean(parsed.hasLetterFragment1) || fragments.includes(1) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_1_ID);
    const hasFrag2 = Boolean(parsed.hasLetterFragment2) || fragments.includes(2) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_2_ID);
    const hasFrag3 = Boolean(parsed.hasLetterFragment3) || fragments.includes(3) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_3_ID);
    const hasFrag4 = Boolean(parsed.hasLetterFragment4) || fragments.includes(4) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_4_ID);
    const hasFrag5 = Boolean(parsed.hasLetterFragment5) || fragments.includes(5) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_5_ID);
    const hasFrag6 = Boolean(parsed.hasLetterFragment6) || fragments.includes(6) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_6_ID);
    const hasFrag7 = Boolean(parsed.hasLetterFragment7) || fragments.includes(7) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_7_ID);

    const resolvedFrags = Array.from(new Set([
      ...(hasFrag1 ? [1] : []),
      ...(hasFrag2 ? [2] : []),
      ...(hasFrag3 ? [3] : []),
      ...(hasFrag4 ? [4] : []),
      ...(hasFrag5 ? [5] : []),
      ...(hasFrag6 ? [6] : []),
      ...(hasFrag7 ? [7] : []),
    ]));

    const unlocked = Array.isArray(parsed.unlockedChapters) && parsed.unlockedChapters.length > 0
      ? Array.from(new Set([...parsed.unlockedChapters, 1]))
      : [1];

    if (hasCh2Key && !unlocked.includes(2)) unlocked.push(2);
    if (hasCh3Key && !unlocked.includes(3)) unlocked.push(3);
    if (hasCh4Key && !unlocked.includes(4)) unlocked.push(4);
    if (hasCh5Key && !unlocked.includes(5)) unlocked.push(5);
    if (hasCh6Key && !unlocked.includes(6)) unlocked.push(6);
    if (hasCh7Key && !unlocked.includes(7)) unlocked.push(7);

    const completed = Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [];

    const hasBow = Boolean(parsed.hasBow) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.BOW_ITEM_ID);
    const hasTicket = Boolean(parsed.hasTrainTicket) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.TRAIN_TICKET_ID);
    const hasNote = Boolean(parsed.hasCaveNote) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.CAVE_NOTE_ID);
    const hasBag = Boolean(parsed.hasRonnyBag) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.RONNY_BAG_ID);
    const hasBouquet = Boolean(parsed.hasBouquet) || collected.includes(GAME_CONSTANTS.IDENTIFIERS.BOUQUET_ITEM_ID);

    const photoPieces = parsed.puzzles?.photoPieces || [];
    const ticketPieces = parsed.puzzles?.ticketPieces || [];
    const mapPieces = parsed.puzzles?.mapPieces || [];
    const roses = Array.isArray(parsed.roses) ? parsed.roses : [];

    let activeCheckpoint = parsed.activeCheckpoint ?? defaults.activeCheckpoint;
    if (activeCheckpoint) {
      const ch = typeof parsed.chapter === "number" ? parsed.chapter : defaults.chapter;
      // Auto-recalibrate older checkpoint coordinates if y was sunken (prior to Master Prompt 12)
      if ((ch === 2 || ch === 3 || ch === 4) && activeCheckpoint.y > 550) {
        activeCheckpoint = { ...activeCheckpoint, y: 550 };
      } else if ((ch === 5 || ch === 6 || ch === 7) && activeCheckpoint.y > 530 && activeCheckpoint.y < 600) {
        activeCheckpoint = { ...activeCheckpoint, y: 530 };
      }
    }

    return {
      version: GAME_CONSTANTS.SAVE.SCHEMA_VERSION,
      chapter: typeof parsed.chapter === "number" ? parsed.chapter : defaults.chapter,
      unlockedChapters: unlocked,
      completedChapters: completed,
      activeCheckpoint,
      health:
        typeof parsed.health === "number" && parsed.health > 0
          ? parsed.health
          : defaults.health,
      maxHealth: defaults.maxHealth,
      collectedItems: collected,
      unlockedChests: chests,
      defeatedEnemies: defeated,
      puzzles: {
        photoPieces,
        isPhotoComplete: Boolean(parsed.puzzles?.isPhotoComplete) || photoPieces.length >= 9,
        ticketPieces,
        isTicketComplete: Boolean(parsed.puzzles?.isTicketComplete) || ticketPieces.length >= 3 || hasTicket,
        mapPieces,
        isMapComplete: Boolean(parsed.puzzles?.isMapComplete) || mapPieces.length >= 4,
      },
      hasBow,
      arrowCount: typeof parsed.arrowCount === "number" ? parsed.arrowCount : (hasBow ? GAME_CONSTANTS.COMBAT.INITIAL_QUIVER : 0),
      maxArrows: typeof parsed.maxArrows === "number" ? parsed.maxArrows : defaults.maxArrows,
      hasChapter2Key: hasCh2Key,
      hasChapter3Key: hasCh3Key,
      hasChapter4Key: hasCh4Key,
      hasChapter5Key: hasCh5Key,
      hasChapter6Key: hasCh6Key,
      hasChapter7Key: hasCh7Key,
      letterFragments: resolvedFrags,
      hasLetterFragment1: hasFrag1,
      hasLetterFragment2: hasFrag2,
      hasLetterFragment3: hasFrag3,
      hasLetterFragment4: hasFrag4,
      hasLetterFragment5: hasFrag5,
      hasLetterFragment6: hasFrag6,
      hasLetterFragment7: hasFrag7,
      hasTrainTicket: hasTicket,
      hasCaveNote: hasNote,
      hasRonnyBag: hasBag,
      trainExploded: Boolean(parsed.trainExploded),
      roses,
      hasBouquet: hasBouquet || roses.length >= 5,
      necklaceActivated: Boolean(parsed.necklaceActivated),
      reunionCompleted: Boolean(parsed.reunionCompleted),
      finalLetterRevealed: Boolean(parsed.finalLetterRevealed),
      gameCompleted: Boolean(parsed.gameCompleted),
      settings: {
        muted: Boolean(parsed.settings?.muted),
        masterVolume:
          typeof parsed.settings?.masterVolume === "number"
            ? parsed.settings.masterVolume
            : 1.0,
      },
      timestamp: parsed.timestamp || Date.now(),
    };
  }

  public static save(data: SaveData): boolean {
    if (!this.isBrowser) return false;

    try {
      const toStore: SaveData = {
        ...data,
        version: GAME_CONSTANTS.SAVE.SCHEMA_VERSION,
        timestamp: Date.now(),
      };
      localStorage.setItem(GAME_CONSTANTS.SAVE.STORAGE_KEY, JSON.stringify(toStore));
      return true;
    } catch (err) {
      console.error("Failed to write save data to localStorage:", err);
      return false;
    }
  }

  public static hasSave(): boolean {
    const data = this.load();
    return data !== null;
  }

  public static createNewSave(): SaveData {
    const defaultData = this.getDefaultSave();
    this.save(defaultData);
    return defaultData;
  }

  public static clearSave(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(GAME_CONSTANTS.SAVE.STORAGE_KEY);
      localStorage.removeItem(GAME_CONSTANTS.SAVE.V4_STORAGE_KEY);
      localStorage.removeItem(GAME_CONSTANTS.SAVE.V3_STORAGE_KEY);
      localStorage.removeItem(GAME_CONSTANTS.SAVE.V2_STORAGE_KEY);
      localStorage.removeItem(GAME_CONSTANTS.SAVE.LEGACY_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear save data:", err);
    }
  }

  public static updateCheckpoint(checkpoint: CheckpointData, health?: number, chapter?: number): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.activeCheckpoint = checkpoint;
    if (typeof chapter === "number") {
      current.chapter = chapter;
      if (!current.unlockedChapters.includes(chapter)) {
        current.unlockedChapters.push(chapter);
      }
    }
    if (typeof health === "number") {
      current.health = Math.max(GAME_CONSTANTS.RESOURCE.MIN_RESPAWN_HEALTH, health);
    }
    this.save(current);
    return current;
  }

  public static setChapter(chapter: number, spawnCheckpoint: CheckpointData): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.chapter = chapter;
    current.activeCheckpoint = spawnCheckpoint;
    if (!current.unlockedChapters.includes(chapter)) {
      current.unlockedChapters.push(chapter);
    }
    this.save(current);
    return current;
  }

  public static unlockChapter(chapterNum: number): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.unlockedChapters.includes(chapterNum)) {
      current.unlockedChapters.push(chapterNum);
    }
    this.save(current);
    return current;
  }

  public static completeChapter(chapterNum: number): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.completedChapters.includes(chapterNum)) {
      current.completedChapters.push(chapterNum);
    }
    const nextChapter = chapterNum + 1;
    if (nextChapter <= 7 && !current.unlockedChapters.includes(nextChapter)) {
      current.unlockedChapters.push(nextChapter);
    }
    this.save(current);
    return current;
  }

  public static recordEnemyDefeated(enemyId: string): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.defeatedEnemies.includes(enemyId)) {
      current.defeatedEnemies.push(enemyId);
    }
    this.save(current);
    return current;
  }

  public static isEnemyDefeated(enemyId: string): boolean {
    const current = this.load() || this.getDefaultSave();
    return current.defeatedEnemies.includes(enemyId);
  }

  public static updatePuzzlePiece(type: "photo" | "ticket" | "map", pieceId: string): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.collectedItems.includes(pieceId)) {
      current.collectedItems.push(pieceId);
    }

    if (type === "photo") {
      if (!current.puzzles.photoPieces.includes(pieceId)) {
        current.puzzles.photoPieces.push(pieceId);
      }
      if (current.puzzles.photoPieces.length >= 9) {
        current.puzzles.isPhotoComplete = true;
      }
    } else if (type === "ticket") {
      if (!current.puzzles.ticketPieces.includes(pieceId)) {
        current.puzzles.ticketPieces.push(pieceId);
      }
      if (current.puzzles.ticketPieces.length >= 3) {
        current.puzzles.isTicketComplete = true;
        current.hasTrainTicket = true;
        if (!current.collectedItems.includes(GAME_CONSTANTS.IDENTIFIERS.TRAIN_TICKET_ID)) {
          current.collectedItems.push(GAME_CONSTANTS.IDENTIFIERS.TRAIN_TICKET_ID);
        }
      }
    } else if (type === "map") {
      if (!current.puzzles.mapPieces.includes(pieceId)) {
        current.puzzles.mapPieces.push(pieceId);
      }
      if (current.puzzles.mapPieces.length >= 4) {
        current.puzzles.isMapComplete = true;
      }
    }

    this.save(current);
    return current;
  }

  public static collectRose(roseId: string): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.roses.includes(roseId)) {
      current.roses.push(roseId);
    }
    if (!current.collectedItems.includes(roseId)) {
      current.collectedItems.push(roseId);
    }
    if (current.roses.length >= 5) {
      current.hasBouquet = true;
      if (!current.collectedItems.includes(GAME_CONSTANTS.IDENTIFIERS.BOUQUET_ITEM_ID)) {
        current.collectedItems.push(GAME_CONSTANTS.IDENTIFIERS.BOUQUET_ITEM_ID);
      }
    }
    this.save(current);
    return current;
  }

  public static setNecklaceActivated(active: boolean): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.necklaceActivated = active;
    this.save(current);
    return current;
  }

  public static setReunionCompleted(): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.reunionCompleted = true;
    this.save(current);
    return current;
  }

  public static setFinalLetterRevealed(): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.finalLetterRevealed = true;
    this.save(current);
    return current;
  }

  public static setGameCompleted(completed: boolean = true): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.gameCompleted = completed;
    if (!current.completedChapters.includes(7)) {
      current.completedChapters.push(7);
    }
    this.save(current);
    return current;
  }

  public static setBowAcquired(startingArrows: number = GAME_CONSTANTS.COMBAT.INITIAL_QUIVER): SaveData {
    const current = this.load() || this.getDefaultSave();
    current.hasBow = true;
    current.arrowCount = Math.min(current.maxArrows, Math.max(current.arrowCount, startingArrows));
    if (!current.collectedItems.includes(GAME_CONSTANTS.IDENTIFIERS.BOW_ITEM_ID)) {
      current.collectedItems.push(GAME_CONSTANTS.IDENTIFIERS.BOW_ITEM_ID);
    }
    this.save(current);
    return current;
  }

  public static consumeArrow(): boolean {
    const current = this.load() || this.getDefaultSave();
    if (!current.hasBow || current.arrowCount <= 0) return false;

    current.arrowCount -= 1;
    this.save(current);
    return true;
  }

  public static addArrows(count: number): number {
    const current = this.load() || this.getDefaultSave();
    current.arrowCount = Math.min(current.maxArrows, current.arrowCount + count);
    this.save(current);
    return current.arrowCount;
  }

  public static collectItem(itemId: string): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.collectedItems.includes(itemId)) {
      current.collectedItems.push(itemId);
    }

    // Keys
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CHAPTER_2_KEY_ID || itemId === GAME_CONSTANTS.IDENTIFIERS.DEMO_KEY_LEGACY_ID) {
      current.hasChapter2Key = true;
      if (!current.unlockedChapters.includes(2)) current.unlockedChapters.push(2);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CHAPTER_3_KEY_ID) {
      current.hasChapter3Key = true;
      if (!current.unlockedChapters.includes(3)) current.unlockedChapters.push(3);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CHAPTER_4_KEY_ID) {
      current.hasChapter4Key = true;
      if (!current.unlockedChapters.includes(4)) current.unlockedChapters.push(4);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CHAPTER_5_KEY_ID) {
      current.hasChapter5Key = true;
      if (!current.unlockedChapters.includes(5)) current.unlockedChapters.push(5);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CHAPTER_6_KEY_ID) {
      current.hasChapter6Key = true;
      if (!current.unlockedChapters.includes(6)) current.unlockedChapters.push(6);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CHAPTER_7_KEY_ID) {
      current.hasChapter7Key = true;
      if (!current.unlockedChapters.includes(7)) current.unlockedChapters.push(7);
    }

    // Letter Fragments
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_1_ID) {
      current.hasLetterFragment1 = true;
      if (!current.letterFragments.includes(1)) current.letterFragments.push(1);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_2_ID) {
      current.hasLetterFragment2 = true;
      if (!current.letterFragments.includes(2)) current.letterFragments.push(2);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_3_ID) {
      current.hasLetterFragment3 = true;
      if (!current.letterFragments.includes(3)) current.letterFragments.push(3);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_4_ID) {
      current.hasLetterFragment4 = true;
      if (!current.letterFragments.includes(4)) current.letterFragments.push(4);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_5_ID) {
      current.hasLetterFragment5 = true;
      if (!current.letterFragments.includes(5)) current.letterFragments.push(5);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_6_ID) {
      current.hasLetterFragment6 = true;
      if (!current.letterFragments.includes(6)) current.letterFragments.push(6);
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_7_ID) {
      current.hasLetterFragment7 = true;
      if (!current.letterFragments.includes(7)) current.letterFragments.push(7);
    }

    // Special items
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.BOW_ITEM_ID) {
      current.hasBow = true;
      if (current.arrowCount === 0) current.arrowCount = GAME_CONSTANTS.COMBAT.INITIAL_QUIVER;
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.CAVE_NOTE_ID) {
      current.hasCaveNote = true;
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.TRAIN_TICKET_ID) {
      current.hasTrainTicket = true;
      current.puzzles.isTicketComplete = true;
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.RONNY_BAG_ID || itemId === "ronny_travel_bag" || itemId === "ronnys_traveler_bag") {
      current.hasRonnyBag = true;
    }
    if (itemId === GAME_CONSTANTS.IDENTIFIERS.BOUQUET_ITEM_ID) {
      current.hasBouquet = true;
    }

    // Photo puzzle pieces
    if (itemId.startsWith("photo_piece_")) {
      if (!current.puzzles.photoPieces.includes(itemId)) {
        current.puzzles.photoPieces.push(itemId);
      }
      if (current.puzzles.photoPieces.length >= 9) {
        current.puzzles.isPhotoComplete = true;
      }
    }

    // Ticket puzzle pieces
    if (itemId.startsWith("ticket_piece_")) {
      if (!current.puzzles.ticketPieces.includes(itemId)) {
        current.puzzles.ticketPieces.push(itemId);
      }
      if (current.puzzles.ticketPieces.length >= 3) {
        current.puzzles.isTicketComplete = true;
        current.hasTrainTicket = true;
        if (!current.collectedItems.includes(GAME_CONSTANTS.IDENTIFIERS.TRAIN_TICKET_ID)) {
          current.collectedItems.push(GAME_CONSTANTS.IDENTIFIERS.TRAIN_TICKET_ID);
        }
      }
    }

    // Map puzzle pieces
    if (itemId.startsWith("map_piece_")) {
      if (!current.puzzles.mapPieces.includes(itemId)) {
        current.puzzles.mapPieces.push(itemId);
      }
      if (current.puzzles.mapPieces.length >= 4) {
        current.puzzles.isMapComplete = true;
      }
    }

    // Roses
    if (itemId.startsWith("rose_")) {
      if (!current.roses.includes(itemId)) {
        current.roses.push(itemId);
      }
      if (current.roses.length >= 5) {
        current.hasBouquet = true;
        if (!current.collectedItems.includes(GAME_CONSTANTS.IDENTIFIERS.BOUQUET_ITEM_ID)) {
          current.collectedItems.push(GAME_CONSTANTS.IDENTIFIERS.BOUQUET_ITEM_ID);
        }
      }
    }

    this.save(current);
    return current;
  }

  public static unlockChest(chestId: string, chapter: number = 1): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (!current.unlockedChests.includes(chestId)) {
      current.unlockedChests.push(chestId);
    }

    // Award items and completions based on chapter
    if (chapter === 1) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_2_KEY_ID);
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_1_ID);
      this.completeChapter(1);
    } else if (chapter === 2) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_3_KEY_ID);
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_2_ID);
      this.completeChapter(2);
    } else if (chapter === 3) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_4_KEY_ID);
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_3_ID);
      this.completeChapter(3);
    } else if (chapter === 4) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_5_KEY_ID);
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_4_ID);
      this.completeChapter(4);
    } else if (chapter === 5) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_6_KEY_ID);
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_5_ID);
      this.completeChapter(5);
    } else if (chapter === 6) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.CHAPTER_7_KEY_ID);
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_6_ID);
      this.completeChapter(6);
    } else if (chapter === 7) {
      this.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_7_ID);
      this.completeChapter(7);
    }

    return this.load() || current;
  }

  public static updateSettings(settings: { muted?: boolean; masterVolume?: number }): SaveData {
    const current = this.load() || this.getDefaultSave();
    if (settings.muted !== undefined) current.settings.muted = settings.muted;
    if (settings.masterVolume !== undefined) current.settings.masterVolume = settings.masterVolume;
    this.save(current);
    return current;
  }
}
