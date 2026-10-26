import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PlayerController } from "../systems/PlayerController";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { MovingPlatform } from "../objects/MovingPlatform";
import { PuzzleManager } from "../systems/PuzzleManager";
import { CHAPTER_6_LEVEL_DATA } from "../data/Chapter6LevelData";

export class Chapter6DestinationScene extends Phaser.Scene {
  public player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  // Parallax Backgrounds
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgOcean!: Phaser.GameObjects.TileSprite;

  // Scripted Opening: Ronny's Bag & Train Explosion
  private ronnyBagSprite?: Phaser.Physics.Arcade.Sprite;
  private trainWreckageSprite!: Phaser.GameObjects.Sprite;
  private hasTriggeredExplosion: boolean = false;
  private smokeEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  // Destination Map Waypoints & Pickups
  private mapPickupsGroup!: Phaser.Physics.Arcade.Group;
  private mapPieceSprites: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private waypointSprites: Phaser.GameObjects.Sprite[] = [];
  private summitGateBarrier?: Phaser.Physics.Arcade.Sprite;

  // Checkpoints
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private activeCheckpointId: string | null = null;

  // Pickups
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // End Chest
  private chestSprite!: Phaser.GameObjects.Sprite;
  private chestPromptText!: Phaser.GameObjects.Text;
  private isChestUnlocked: boolean = false;

  // State
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter6DestinationScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint =
      (currentSave?.chapter === 6 && currentSave.activeCheckpoint) ||
      GAME_CONSTANTS.CHECKPOINTS.CH6_SPAWN;

    const collectedItems = new Set(currentSave?.collectedItems || []);
    const unlockedChests = new Set(currentSave?.unlockedChests || []);

    // 1. World Bounds
    this.physics.world.setBounds(0, 0, CHAPTER_6_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds (Ocean & Sea Cliffs)
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "coastal-bg-sky")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgOcean = this.add
      .tileSprite(0, 440, GAME_CONSTANTS.LOGICAL_WIDTH, 280, "coastal-ocean-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Ground Segments (Dock Planks & Crags)
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_6_LEVEL_DATA.groundSegments.forEach((segment) => {
      const segWidth = segment.endX - segment.startX;
      const count = Math.ceil(segWidth / 64);
      for (let i = 0; i < count; i++) {
        const x = segment.startX + i * 64 + 32;
        if (x <= segment.endX) {
          const g = this.platforms.create(x, segment.y, "coastal-dock-ground") as Phaser.Physics.Arcade.Sprite;
          g.refreshBody();
          g.setDepth(2);
        }
      }
    });

    // 4. Elevated Ledges
    CHAPTER_6_LEVEL_DATA.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, p.texture) as Phaser.Physics.Arcade.Sprite;
      plat.refreshBody();
      plat.setDepth(3);
    });

    // 5. Moving Platforms
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_6_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 6. Hazards (Sea Urchins & Sharp Crags)
    this.hazards = this.physics.add.staticGroup();
    CHAPTER_6_LEVEL_DATA.hazards.forEach((h) => {
      const hazard = this.hazards.create(h.x, h.y, "garden-hazard") as Phaser.Physics.Arcade.Sprite;
      hazard.setSize(48, 24);
      hazard.setOffset(8, 8);
      hazard.refreshBody();
      hazard.setDepth(3);
    });

    // 7. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 8. Opening Train Engine & Explosion Setup
    const trainLoc = CHAPTER_6_LEVEL_DATA.trainWreckage;
    this.trainWreckageSprite = this.add
      .sprite(trainLoc.x, trainLoc.y, currentSave?.trainExploded ? "train-wreckage-exploded" : "train-engine-roof")
      .setDepth(3)
      .setScale(1.2);

    // Ronny's Bag Discovery at Entrance (x = 380)
    const bagCollected = Boolean(currentSave?.hasRonnyBag) || collectedItems.has(GAME_CONSTANTS.IDENTIFIERS.RONNY_BAG_ID);
    if (!bagCollected) {
      const bagLoc = CHAPTER_6_LEVEL_DATA.ronnyBag;
      this.ronnyBagSprite = this.physics.add.sprite(bagLoc.x, bagLoc.y, "ronny-travel-bag");
      this.ronnyBagSprite.setDepth(4);
      const b = this.ronnyBagSprite.body as Phaser.Physics.Arcade.Body;
      if (b) b.setAllowGravity(false);

      this.physics.add.overlap(this.player.sprite, this.ronnyBagSprite, () => {
        if (!this.ronnyBagSprite) return;

        SaveSystem.collectItem(GAME_CONSTANTS.IDENTIFIERS.RONNY_BAG_ID);
        this.player.heal(100); // Full vitality restoration
        SoundEffects.playFanfare();

        EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, GAME_CONSTANTS.IDENTIFIERS.RONNY_BAG_ID, "Ronny's Traveler Pack");
        EventBus.emit(
          GAME_EVENTS.NOTIFICATION,
          "🎒 Found Ronny's Traveling Pack! Restored Full Vitality!"
        );

        this.tweens.add({
          targets: this.ronnyBagSprite,
          scaleX: 1.8,
          scaleY: 1.8,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.ronnyBagSprite?.destroy();
            this.ronnyBagSprite = undefined;
          },
        });

        // Trigger scripted train explosion after finding the bag
        if (!this.hasTriggeredExplosion) {
          this.triggerTrainExplosion();
        }
      });
    }

    // 9. Destination Map Fragments (4 Coastal Pieces)
    this.mapPickupsGroup = this.physics.add.group();
    this.mapPieceSprites.clear();

    const collectedMapPieces = new Set(PuzzleManager.getInstance().getMapPieces());
    CHAPTER_6_LEVEL_DATA.mapPieces.forEach((piece) => {
      if (collectedMapPieces.has(piece.id)) return;

      const pieceSprite = this.physics.add.sprite(piece.x, piece.y, "map-piece-icon");
      pieceSprite.setDepth(4);
      const b = pieceSprite.body as Phaser.Physics.Arcade.Body;
      if (b) b.setAllowGravity(false);

      this.tweens.add({
        targets: pieceSprite,
        y: piece.y - 8,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.physics.add.overlap(this.player.sprite, pieceSprite, () => {
        if (!this.mapPieceSprites.has(piece.id)) return;

        SoundEffects.playPickup();
        PuzzleManager.getInstance().collectMapPiece(piece.id);

        this.tweens.add({
          targets: pieceSprite,
          scaleX: 1.6,
          scaleY: 1.6,
          alpha: 0,
          duration: 220,
          onComplete: () => {
            pieceSprite.destroy();
            this.mapPieceSprites.delete(piece.id);
          },
        });
      });

      this.mapPickupsGroup.add(pieceSprite);
      this.mapPieceSprites.set(piece.id, pieceSprite);
    });

    // 10. Destination Map Waypoints & Summit Route Gate (x = 5800)
    const isMapDone = PuzzleManager.getInstance().isMapComplete();
    this.summitGateBarrier = this.physics.add.staticSprite(5800, 560, "broken-bridge");
    this.summitGateBarrier.setSize(20, 160);
    this.summitGateBarrier.refreshBody();
    this.summitGateBarrier.setVisible(false);

    const gateCollider = this.physics.add.collider(this.player.sprite, this.summitGateBarrier);
    if (isMapDone) {
      gateCollider.destroy();
      this.summitGateBarrier.destroy();
    }

    this.waypointSprites = [];
    CHAPTER_6_LEVEL_DATA.waypointPositions.forEach((pos) => {
      const wp = this.add
        .sprite(pos.x, pos.y, "waypoint-marker")
        .setDepth(4)
        .setVisible(isMapDone);

      this.tweens.add({
        targets: wp,
        y: pos.y - 12,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.waypointSprites.push(wp);
    });

    // 12. Checkpoints
    this.checkpointSprites.clear();
    this.activeCheckpointId = currentSave?.activeCheckpoint?.id || null;

    CHAPTER_6_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
      const isActive = this.activeCheckpointId === cpConfig.id;
      const cpSprite = this.add
        .sprite(cpConfig.x, cpConfig.y, "garden-checkpoint-off")
        .setDepth(3);

      if (isActive) {
        cpSprite.setTexture("garden-checkpoint-on");
      }
      this.checkpointSprites.set(cpConfig.id, cpSprite);

      const zone = this.add.zone(cpConfig.x, cpConfig.y, 70, 90);
      this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);

      this.physics.add.overlap(this.player.sprite, zone, () => {
        if (this.activeCheckpointId !== cpConfig.id) {
          this.activeCheckpointId = cpConfig.id;
          cpSprite.setTexture("garden-checkpoint-on");
          this.player.setCheckpoint(cpConfig, 6);
          SoundEffects.playPickup();

          this.tweens.add({
            targets: cpSprite,
            scaleX: 1.25,
            scaleY: 1.25,
            duration: 200,
            yoyo: true,
            ease: "Quad.easeOut",
          });
        }
      });
    });

    // 12. Heart Pickups
    this.heartPickups.clear();
    CHAPTER_6_LEVEL_DATA.hearts.forEach((heart) => {
      if (!collectedItems.has(heart.id)) {
        const hpSprite = this.physics.add.sprite(heart.x, heart.y, "garden-heart");
        hpSprite.setDepth(4);
        const b = hpSprite.body as Phaser.Physics.Arcade.Body;
        if (b) b.setAllowGravity(false);

        this.tweens.add({
          targets: hpSprite,
          y: heart.y - 10,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.physics.add.overlap(this.player.sprite, hpSprite, () => {
          if (!this.heartPickups.has(heart.id)) return;

          this.player.heal(GAME_CONSTANTS.HEART_PICKUP.HEAL_AMOUNT);
          this.player.applySpeedBoost(GAME_CONSTANTS.HEART_PICKUP.BOOST_DURATION_MS);
          SoundEffects.playPickup();

          SaveSystem.collectItem(heart.id);
          EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heart.id, "Coastal Heart");

          this.tweens.add({
            targets: hpSprite,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0,
            duration: 250,
            onComplete: () => {
              hpSprite.destroy();
              this.heartPickups.delete(heart.id);
            },
          });
        });

        this.heartPickups.set(heart.id, hpSprite);
      }
    });

    // 15. Coastal Summit Chest
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_6_ID;
    this.isChestUnlocked = unlockedChests.has(chestId);

    this.chestSprite = this.add
      .sprite(
        CHAPTER_6_LEVEL_DATA.chest.x,
        CHAPTER_6_LEVEL_DATA.chest.y,
        this.isChestUnlocked ? "chest-ch6-open" : "chest-ch6-closed"
      )
      .setDepth(4);

    this.chestPromptText = this.add
      .text(
        CHAPTER_6_LEVEL_DATA.chest.x,
        CHAPTER_6_LEVEL_DATA.chest.y - 44,
        "Press [E] to Open Coastal Summit Chest",
        {
          fontSize: "13px",
          fontFamily: "monospace",
          color: "#fef08a",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          padding: { x: 8, y: 4 },
        }
      )
      .setOrigin(0.5)
      .setDepth(5)
      .setVisible(false);

    // 16. Collisions & Camera
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    this.physics.add.overlap(this.player.sprite, this.hazards, (_p, hazardObj) => {
      const hazard = hazardObj as Phaser.Physics.Arcade.Sprite;
      const knockbackDirX = this.player.sprite.x < hazard.x ? -1 : 1;
      this.player.takeDamage(GAME_CONSTANTS.RESOURCE.HAZARD_DAMAGE, knockbackDirX, -1);
    });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, CHAPTER_6_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 17. Input & EventBus
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.setupEventBus();

    // Ready signal
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Chapter 6: The Destination — Check the coastal terminus!");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanUpScene());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanUpScene());
  }

  public triggerTrainExplosion(): void {
    this.hasTriggeredExplosion = true;
    SoundEffects.playExplosion();

    // Camera shake
    this.cameras.main.shake(600, 0.025);

    // Texture swap to exploded wreckage
    this.trainWreckageSprite.setTexture("train-wreckage-exploded");

    // Persist explosion state
    const save = SaveSystem.load();
    if (save) {
      save.trainExploded = true;
      SaveSystem.save(save);
    }

    EventBus.emit(GAME_EVENTS.EXPLOSION_TRIGGERED);
    EventBus.emit(
      GAME_EVENTS.NOTIFICATION,
      "💥 KABOOM! The locomotive boiler exploded! Escape along the coastal cliffs!"
    );
  }

  private setupEventBus(): void {
    this.cleanupEvents();

    this.eventCleanups.push(
      EventBus.on(GAME_EVENTS.PAUSE_GAME, () => this.setPaused(true)),
      EventBus.on(GAME_EVENTS.RESUME_GAME, () => this.setPaused(false)),
      EventBus.on(GAME_EVENTS.RESTART_CHECKPOINT, () => {
        this.player.respawnAtCheckpoint();
        this.setPaused(false);
      }),
      EventBus.on(GAME_EVENTS.MAP_COMPLETED, () => {
        // Unlock summit gate and display golden waypoints
        if (this.summitGateBarrier) {
          this.summitGateBarrier.destroy();
        }
        this.waypointSprites.forEach((wp) => wp.setVisible(true));
      }),
      EventBus.on(GAME_EVENTS.SET_MUTED, (isMuted: boolean) => {
        this.sound.mute = isMuted;
        SoundEffects.setMuted(isMuted);
        SaveSystem.updateSettings({ muted: isMuted });
      }),
      EventBus.on(GAME_EVENTS.RELOAD_SAVE, () => {
        this.scene.restart();
      })
    );
  }

  private setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (paused) {
      this.physics.pause();
      this.anims.pauseAll();
    } else {
      this.physics.resume();
      this.anims.resumeAll();
    }
  }

  private togglePause(): void {
    const nextState = !this.isPaused;
    this.setPaused(nextState);
    if (nextState) {
      EventBus.emit(GAME_EVENTS.PAUSE_GAME);
    } else {
      EventBus.emit(GAME_EVENTS.RESUME_GAME);
    }
  }

  override update(time: number, delta: number): void {
    if (this.isPaused) return;

    // Moving platforms
    this.movingPlatformsList.forEach((mp) => mp.updatePlatform());

    // Update player
    this.player.update(time, delta);

    // Parallax scroll
    const scrollX = this.cameras.main.scrollX;
    this.bgSky.tilePositionX = scrollX * 0.12;
    this.bgOcean.tilePositionX = scrollX * 0.45;

    // Chest interaction
    const distToChest = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.chestSprite.x,
      this.chestSprite.y
    );

    if (distToChest < 90 && !this.isChestUnlocked) {
      const isMapComplete = PuzzleManager.getInstance().isMapComplete();
      if (!isMapComplete) {
        const count = PuzzleManager.getInstance().getMapPieces().length;
        this.chestPromptText.setText(`[Locked: Collect all 4 Coastal Map Fragments (${count}/4)]`);
      } else {
        this.chestPromptText.setText("Press [E] to Open Coastal Summit Chest");
      }
      this.chestPromptText.setVisible(true);

      if (this.player.isInteractPressed()) {
        if (isMapComplete) {
          this.unlockChest();
        } else {
          SoundEffects.playHazard();
          EventBus.emit(
            GAME_EVENTS.NOTIFICATION,
            "The summit path is sealed! Collect all 4 Coastal Map Fragments to reveal the way!"
          );
        }
      }
    } else {
      this.chestPromptText.setVisible(false);
    }
  }

  public unlockChest(): void {
    this.isChestUnlocked = true;
    this.chestSprite.setTexture("chest-ch6-open");
    this.chestPromptText.setVisible(false);
    SoundEffects.playFanfare();

    this.tweens.add({
      targets: this.chestSprite,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 180,
      yoyo: true,
      ease: "Back.easeOut",
    });

    const keyId = GAME_CONSTANTS.IDENTIFIERS.CHAPTER_7_KEY_ID;
    const letterId = GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_6_ID;
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_6_ID;

    // Save chest unlock, chapter 7 key, letter fragment 6, and unlock Chapter 7
    SaveSystem.unlockChest(chestId, 6);

    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, keyId, "Chapter 7 Sanctuary Key");
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, letterId, "Secret Letter Fragment 6 of 7");
    EventBus.emit(GAME_EVENTS.CHEST_OPENED, chestId, [keyId, letterId]);
    EventBus.emit(GAME_EVENTS.CHAPTER_UNLOCKED, 7);

    // Launch Chapter 6 Outro Story sequence
    this.time.delayedCall(700, () => {
      EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, "chapter6_destination");
    });
  }

  private cleanupEvents(): void {
    this.eventCleanups.forEach((cleanup) => cleanup());
    this.eventCleanups = [];
  }

  public cleanUpScene(): void {
    this.cleanupEvents();
    if (this.player) {
      try {
        this.player.destroy();
      } catch {
        // Ignored during shutdown
      }
    }
  }
}
