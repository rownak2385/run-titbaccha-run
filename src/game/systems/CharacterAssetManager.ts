import * as Phaser from "phaser";
import { CharacterId, CharacterManifest, CharacterMetadata } from "@/types/characterAsset";
import manifestJson from "../../../public/assets/characters/manifest.json";
import { AssetGenerator } from "./AssetGenerator";
import { AssetValidator } from "./AssetValidator";

export class CharacterAssetManager {
  private static instance: CharacterAssetManager;
  private manifest: CharacterManifest;

  private constructor() {
    this.manifest = manifestJson as unknown as CharacterManifest;
  }

  public static getInstance(): CharacterAssetManager {
    if (!CharacterAssetManager.instance) {
      CharacterAssetManager.instance = new CharacterAssetManager();
    }
    return CharacterAssetManager.instance;
  }

  public getCharacterMetadata(id: CharacterId): CharacterMetadata {
    return this.manifest.characters[id];
  }

  public getAllMetadata(): Record<CharacterId, CharacterMetadata> {
    return this.manifest.characters;
  }

  /**
   * Queues external character sprite sheets and individual frame sequences in Phaser's Loader.
   * If assets are missing or 404, Phaser's loaderror is caught gracefully,
   * allowing the procedural vector fallback system to take over without halting.
   */
  public queueCharacterAssets(scene: Phaser.Scene): void {
    // Non-fatal error handling for external assets
    scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: any) => {
      // Suppress hard crash on missing production artwork; procedural fallback is active
      if (file && file.key && (file.key.startsWith("prod_") || file.key.startsWith("frame_"))) {
        console.info(
          `[CharacterAssetManager] Optional production asset "${file.key}" not found on disk. Seamless procedural fallback remains active.`
        );
      }
    });

    const characters = this.manifest.characters;
    (Object.keys(characters) as CharacterId[]).forEach((charId) => {
      // MASTER PROMPT 12 MANDATE: Only Titibaccha uses external PNG frame sequences.
      // Ronny, Fox, and all supporting NPCs use lightweight procedural vector illustrations.
      if (charId !== "titibaccha") return;

      const meta = characters[charId];

      // 1. Queue master sprite sheet if declared
      if (meta.spritesheetPath) {
        scene.load.spritesheet(`prod_${charId}_spritesheet`, meta.spritesheetPath, {
          frameWidth: meta.frameWidth,
          frameHeight: meta.frameHeight,
        });
      }

      // 2. Queue individual frame sequences
      if (meta.animations) {
        Object.entries(meta.animations).forEach(([animName, animDef]) => {
          if (animDef.framePaths && animDef.framePaths.length > 0) {
            animDef.framePaths.forEach((framePath, idx) => {
              const frameKey = `frame_${charId}_${animName}_${idx}`;
              scene.load.image(frameKey, framePath);
            });
          }
        });
      }
    });
  }

  /**
   * Initializes character textures and registers animations in Phaser.
   * Evaluates whether production artwork was successfully loaded;
   * if not, automatically binds to the procedural fallback vector textures.
   */
  public initializeCharacters(scene: Phaser.Scene): void {
    // 1. Ensure all procedural vector textures exist as reliable fallback
    AssetGenerator.generateAll(scene);

    // 2. Apply nearest-neighbor texture filtering to all character textures
    this.applyNearestNeighborFiltering(scene);

    // 3. Register all animations defined in manifest (supporting canonical & alias keys)
    this.registerAnimations(scene);

    // 4. Log validation diagnostics to browser console
    AssetValidator.logDiagnostics(scene);
  }

  private applyNearestNeighborFiltering(scene: Phaser.Scene): void {
    scene.textures.each((texture: Phaser.Textures.Texture) => {
      if (
        texture.key.startsWith("frame_") ||
        texture.key.startsWith("prod_") ||
        texture.key.startsWith("titibaccha") ||
        texture.key.startsWith("ronny") ||
        texture.key.startsWith("fox")
      ) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }, this);
  }

  private registerAnimations(scene: Phaser.Scene): void {
    const anims = scene.anims;

    // Helper to register an animation with both primary key and optional aliases
    const createAnim = (
      primaryKey: string,
      aliases: string[],
      frames: Phaser.Types.Animations.AnimationFrame[],
      frameRate: number,
      repeat: number = -1
    ) => {
      [primaryKey, ...aliases].forEach((key) => {
        if (!anims.exists(key)) {
          anims.create({
            key,
            frames,
            frameRate,
            repeat,
          });
        }
      });
    };

    const hasTitiProdSheet = scene.textures.exists("prod_titibaccha_spritesheet");
    const hasRonnyProd = scene.textures.exists("prod_ronny_spritesheet");
    const hasFoxProd = scene.textures.exists("prod_fox_spritesheet");

    // Helper to resolve individual frame sequences for any character
    const getCharacterFrameSequence = (
      charId: CharacterId,
      animName: string,
      count: number
    ): string[] | null => {
      const keys: string[] = [];
      for (let i = 0; i < count; i++) {
        const k = `frame_${charId}_${animName}_${i}`;
        if (!scene.textures.exists(k)) return null;
        keys.push(k);
      }
      return keys;
    };

    // ==========================================
    // 1. TITIBACCHA ANIMATIONS
    // ==========================================
    // Idle (8 frames in prototype pack, 6 fps, loop)
    const titiIdleFrames = getCharacterFrameSequence("titibaccha", "idle", 8);
    createAnim(
      "titi_idle",
      ["titibaccha_idle"],
      titiIdleFrames
        ? titiIdleFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [0, 1] })
        : [{ key: "titibaccha-idle" }],
      6,
      -1
    );

    // Running (8 frames in prototype pack, 10 fps, loop)
    const titiRunFrames = getCharacterFrameSequence("titibaccha", "running", 8);
    createAnim(
      "titi_running",
      ["titi_run", "titibaccha_run"],
      titiRunFrames
        ? titiRunFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [2, 3, 4, 5] })
        : [{ key: "titibaccha-run-1" }, { key: "titibaccha-run-2" }],
      10,
      -1
    );

    // Jumping (6 frames in prototype pack, 8 fps, once)
    const titiJumpFrames = getCharacterFrameSequence("titibaccha", "jumping", 6);
    createAnim(
      "titi_jumping",
      ["titi_jump", "titibaccha_jump"],
      titiJumpFrames
        ? titiJumpFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [6] })
        : [{ key: "titibaccha-jump" }],
      8,
      0
    );

    // Falling (6 frames in prototype pack, 6 fps, loop)
    const titiFallFrames = getCharacterFrameSequence("titibaccha", "falling", 6);
    createAnim(
      "titi_falling",
      ["titi_fall", "titibaccha_fall"],
      titiFallFrames
        ? titiFallFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [7] })
        : [{ key: "titibaccha-fall" }],
      6,
      -1
    );

    // Hurt (6 frames in prototype pack, 8 fps, once)
    const titiHurtFrames = getCharacterFrameSequence("titibaccha", "hurt", 6);
    createAnim(
      "titi_hurt",
      ["titibaccha_hurt"],
      titiHurtFrames
        ? titiHurtFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [8, 9] })
        : [{ key: "titibaccha-hurt" }, { key: "titibaccha-idle" }],
      8,
      0
    );

    // Eating (6 frames in prototype pack, 6 fps, loop)
    const titiEatFrames = getCharacterFrameSequence("titibaccha", "eating", 6);
    createAnim(
      "titi_eating",
      ["titibaccha_eating"],
      titiEatFrames
        ? titiEatFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [10, 11] })
        : [{ key: "titibaccha-eating" }, { key: "titibaccha-idle" }],
      6,
      -1
    );

    // Shooting (reserved for future chapters - procedural fallback active)
    createAnim(
      "titi_shooting",
      ["titibaccha_shooting"],
      hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [12, 13] })
        : [{ key: "titibaccha-shooting" }, { key: "titibaccha-idle" }],
      6,
      0
    );

    // Happy (3 frames in prototype pack, 6 fps, loop)
    const titiHappyFrames = getCharacterFrameSequence("titibaccha", "happy", 3);
    createAnim(
      "titi_happy",
      ["titibaccha_happy"],
      titiHappyFrames
        ? titiHappyFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [14, 15] })
        : [{ key: "titibaccha-happy" }, { key: "titibaccha-idle" }],
      6,
      -1
    );

    // Sad (3 frames in prototype pack, 3 fps, loop)
    const titiSadFrames = getCharacterFrameSequence("titibaccha", "sad", 3);
    createAnim(
      "titi_sad",
      ["titibaccha_sad"],
      titiSadFrames
        ? titiSadFrames.map((key) => ({ key }))
        : hasTitiProdSheet
        ? anims.generateFrameNumbers("prod_titibaccha_spritesheet", { frames: [16, 17] })
        : [{ key: "titibaccha-sad" }],
      3,
      -1
    );

    // ==========================================
    // 2. RONNY ANIMATIONS
    // ==========================================
    // Idle (8 frames from approved prototype pack: cream shirt, blue shorts, green leaf pendant)
    const ronnyIdleFrames = getCharacterFrameSequence("ronny", "idle", 8);
    createAnim(
      "ronny_idle",
      [],
      ronnyIdleFrames
        ? ronnyIdleFrames.map((key) => ({ key }))
        : hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [0, 1] })
        : [{ key: "ronny-idle" }],
      5,
      -1
    );

    // Waiting with Food (4 frames from approved prototype pack: holding chick feed bowl)
    const ronnyWaitingFrames = getCharacterFrameSequence("ronny", "waiting_food", 4);
    createAnim(
      "ronny_waiting_food",
      ["ronny_waiting"],
      ronnyWaitingFrames
        ? ronnyWaitingFrames.map((key) => ({ key }))
        : hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [2, 3] })
        : [{ key: "ronny-waiting" }],
      4,
      -1
    );

    // Surprised (5 frames from approved prototype pack: recoiling in alarm)
    const ronnySurprisedFrames = getCharacterFrameSequence("ronny", "surprised", 5);
    createAnim(
      "ronny_surprised",
      [],
      ronnySurprisedFrames
        ? ronnySurprisedFrames.map((key) => ({ key }))
        : hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [6, 7] })
        : [{ key: "ronny-surprised" }],
      4,
      0
    );

    // Feeding (Procedural fallback active: scooping seeds forward)
    createAnim(
      "ronny_feeding",
      [],
      hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [4, 5] })
        : [{ key: "ronny-feeding" }],
      4,
      -1
    );

    // Sad (Procedural fallback active: head hung in heartbreak, dropping feed scoop)
    createAnim(
      "ronny_sad",
      [],
      hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [8, 9] })
        : [{ key: "ronny-sad" }],
      2,
      -1
    );

    // Walking Away (Procedural fallback active: walking into wilderness path)
    createAnim(
      "ronny_walking_away",
      ["ronny_walk"],
      hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [10, 11, 12, 13] })
        : [{ key: "ronny-walk1" }, { key: "ronny-walk2" }],
      4,
      -1
    );

    // Running (Procedural fallback active: reserved for meteor disaster)
    createAnim(
      "ronny_running",
      [],
      hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [14, 15, 16, 17] })
        : [{ key: "ronny-running" }],
      8,
      -1
    );

    // Hugging (Procedural fallback active: Chapter 7 reunion)
    createAnim(
      "ronny_hugging",
      [],
      hasRonnyProd
        ? anims.generateFrameNumbers("prod_ronny_spritesheet", { frames: [18, 19] })
        : [{ key: "ronny-hugging" }],
      2,
      -1
    );

    // ==========================================
    // 3. FOX ANIMATIONS
    // ==========================================
    // Idle (1 frame from approved prototype pack: sitting alert fox with orange fur, cream muzzle, and bushy tail)
    const foxIdleFrames = getCharacterFrameSequence("fox", "idle", 1);
    createAnim(
      "fox_idle",
      [],
      foxIdleFrames
        ? foxIdleFrames.map((key) => ({ key }))
        : hasFoxProd
        ? anims.generateFrameNumbers("prod_fox_spritesheet", { frames: [0, 1] })
        : [{ key: "fox-idle" }],
      2,
      -1
    );

    // Eating (1 frame from approved prototype pack: crouching and feasting on treats)
    const foxEatingFrames = getCharacterFrameSequence("fox", "eating", 1);
    createAnim(
      "fox_eating",
      [],
      foxEatingFrames
        ? foxEatingFrames.map((key) => ({ key }))
        : hasFoxProd
        ? anims.generateFrameNumbers("prod_fox_spritesheet", { frames: [8, 9] })
        : [{ key: "fox-eating" }],
      4,
      -1
    );

    // Walking (Procedural fallback active: animated quadruped prowl across grass)
    createAnim(
      "fox_walking",
      ["fox_walk"],
      hasFoxProd
        ? anims.generateFrameNumbers("prod_fox_spritesheet", { frames: [2, 3, 4, 5] })
        : [{ key: "fox-walking" }],
      6,
      -1
    );

    // Attracting Titi with Food (Procedural fallback active: nudging glowing golden berries)
    createAnim(
      "fox_attracting",
      ["fox_attract"],
      hasFoxProd
        ? anims.generateFrameNumbers("prod_fox_spritesheet", { frames: [6, 7] })
        : [{ key: "fox-attract" }],
      4,
      -1
    );

    // Deceptive Expression (Procedural fallback active: sly winking slit eye and crooked smirk)
    createAnim(
      "fox_deceptive",
      [],
      hasFoxProd
        ? anims.generateFrameNumbers("prod_fox_spritesheet", { frames: [10, 11] })
        : [{ key: "fox-deceptive" }],
      3,
      -1
    );
  }

  /**
   * Applies metadata-driven physics collision body and anchor configuration
   * to ensure sprite visual changes NEVER alter physics boundaries or jump mechanics.
   */
  public setupPhysicsBody(
    sprite: Phaser.Physics.Arcade.Sprite,
    characterId: CharacterId
  ): void {
    const meta = this.getCharacterMetadata(characterId);
    if (!meta) return;

    sprite.setOrigin(meta.anchorX, meta.anchorY);

    const body = sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(meta.physics.width, meta.physics.height);
      body.setOffset(meta.physics.offsetX, meta.physics.offsetY);
    }
  }

  /**
   * Applies metadata-driven anchor configuration to narrative NPC sprites.
   */
  public configureNpcSprite(
    sprite: Phaser.GameObjects.Sprite,
    characterId: CharacterId
  ): void {
    const meta = this.getCharacterMetadata(characterId);
    if (!meta) return;
    sprite.setOrigin(meta.anchorX, meta.anchorY);
    if (typeof meta.scale === "number") {
      sprite.setScale(meta.scale);
    }
  }
}
