import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PlayerController } from "../systems/PlayerController";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { MovingPlatform } from "../objects/MovingPlatform";
import { BowSystem } from "../systems/BowSystem";
import { Enemy } from "../objects/Enemy";
import { PuzzleManager } from "../systems/PuzzleManager";
import { CHAPTER_5_LEVEL_DATA } from "../data/Chapter5LevelData";

export class Chapter5StationScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  // Combat System
  private bowSystem!: BowSystem;
  private dinosaursGroup!: Phaser.Physics.Arcade.Group;
  private dinosaursList: Enemy[] = [];

  // Parallax Backgrounds
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgTracks!: Phaser.GameObjects.TileSprite;

  // Station Ticket Inspection Gate
  private ticketGateSprite!: Phaser.GameObjects.Sprite;
  private ticketBarrier!: Phaser.Physics.Arcade.Sprite;
  private isTicketValidated: boolean = false;
  private gatePromptText!: Phaser.GameObjects.Text;

  // Checkpoints
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private activeCheckpointId: string | null = null;

  // Pickups
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private arrowBundlePickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // End Chest
  private chestSprite!: Phaser.GameObjects.Sprite;
  private chestPromptText!: Phaser.GameObjects.Text;
  private isChestUnlocked: boolean = false;

  // State
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter5StationScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint =
      (currentSave?.chapter === 5 && currentSave.activeCheckpoint) ||
      GAME_CONSTANTS.CHECKPOINTS.CH5_SPAWN;

    const collectedItems = new Set(currentSave?.collectedItems || []);
    const unlockedChests = new Set(currentSave?.unlockedChests || []);

    // 1. World Bounds
    this.physics.world.setBounds(0, 0, CHAPTER_5_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds (Mountain Ranges & Rushing Train Tracks)
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "station-bg")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgTracks = this.add
      .tileSprite(0, 650, GAME_CONSTANTS.LOGICAL_WIDTH, 40, "train-tracks")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Ground & Station Platforms
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_5_LEVEL_DATA.groundSegments.forEach((segment) => {
      const segWidth = segment.endX - segment.startX;
      const count = Math.ceil(segWidth / 64);
      for (let i = 0; i < count; i++) {
        const x = segment.startX + i * 64 + 32;
        if (x <= segment.endX) {
          const g = this.platforms.create(x, segment.y, "garden-ground") as Phaser.Physics.Arcade.Sprite;
          g.refreshBody();
          g.setDepth(2);
        }
      }
    });

    // 4. Train Car Roof Platforms
    // Build solid train carriage bodies and walkable roofs
    CHAPTER_5_LEVEL_DATA.trainCarPlatforms.forEach((car) => {
      // 9 roof blocks per car = 576px wide
      for (let i = -4; i <= 4; i++) {
        const block = this.platforms.create(car.x + i * 64, car.y, car.texture) as Phaser.Physics.Arcade.Sprite;
        block.refreshBody();
        block.setDepth(3);
      }
    });

    // 5. Moving Platforms (Bridging Train Car Gaps)
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_5_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 6. Hazards (Rooftop Vents & Steam Exhausts)
    this.hazards = this.physics.add.staticGroup();
    CHAPTER_5_LEVEL_DATA.hazards.forEach((h) => {
      const hazard = this.hazards.create(h.x, h.y, "train-obstacle-vent") as Phaser.Physics.Arcade.Sprite;
      hazard.setSize(40, 24);
      hazard.setOffset(4, 8);
      hazard.refreshBody();
      hazard.setDepth(3);
    });

    // 7. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 8. Bow & Combat System
    this.bowSystem = new BowSystem(this, this.player.sprite);
    this.bowSystem.setupPlatformCollisions(this.platforms);

    // 9. Station Ticket Inspection Gate (x = 1180)
    const gateLoc = CHAPTER_5_LEVEL_DATA.ticketGate;
    this.ticketGateSprite = this.add.sprite(gateLoc.x, gateLoc.y, "station-ticket-gate").setDepth(4);
    this.ticketBarrier = this.physics.add.staticSprite(gateLoc.x + 30, gateLoc.y - 10, "broken-bridge");
    this.ticketBarrier.setSize(16, 120);
    this.ticketBarrier.refreshBody();
    this.ticketBarrier.setVisible(false);

    const barrierCollider = this.physics.add.collider(this.player.sprite, this.ticketBarrier);

    this.gatePromptText = this.add
      .text(gateLoc.x, gateLoc.y - 60, "Press [E] to Show Train Ticket", {
        fontSize: "13px",
        fontFamily: "monospace",
        color: "#fef08a",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(5)
      .setVisible(false);

    // If ticket was already validated earlier in level
    const hasTicket = Boolean(currentSave?.hasTrainTicket) || PuzzleManager.getInstance().isTicketComplete();
    if (collectedItems.has("ch5_ticket_validated")) {
      this.isTicketValidated = true;
      barrierCollider.destroy();
      this.ticketBarrier.destroy();
      this.ticketGateSprite.setAlpha(0.6);
    }

    // 10. Flying Dinosaurs (Pterosaur Aerial Threats)
    this.dinosaursGroup = this.physics.add.group();
    this.dinosaursList = [];

    CHAPTER_5_LEVEL_DATA.dinosaurs.forEach((dinoConfig) => {
      if (SaveSystem.isEnemyDefeated(dinoConfig.id)) return;

      const dino = new Enemy(this, dinoConfig);
      this.dinosaursGroup.add(dino);
      this.dinosaursList.push(dino);

      this.physics.add.overlap(this.player.sprite, dino, () => {
        if (!dino.getIsDefeated()) {
          const knockbackDirX = this.player.sprite.x < dino.x ? -1 : 1;
          this.player.takeDamage(20, knockbackDirX, -1);
        }
      });
    });

    this.bowSystem.setupEnemyCollisions(this.dinosaursGroup);

    // 11. Checkpoints
    this.checkpointSprites.clear();
    this.activeCheckpointId = currentSave?.activeCheckpoint?.id || null;

    CHAPTER_5_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
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
          this.player.setCheckpoint(cpConfig, 5);
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

    // 12. Arrow Bundles (Replenishment for bow combat)
    this.arrowBundlePickups.clear();
    CHAPTER_5_LEVEL_DATA.arrowBundles.forEach((bundle) => {
      if (!collectedItems.has(bundle.id)) {
        const abSprite = this.physics.add.sprite(bundle.x, bundle.y, "arrow-bundle");
        abSprite.setDepth(4);
        const b = abSprite.body as Phaser.Physics.Arcade.Body;
        if (b) b.setAllowGravity(false);

        this.physics.add.overlap(this.player.sprite, abSprite, () => {
          if (!this.arrowBundlePickups.has(bundle.id)) return;
          SaveSystem.collectItem(bundle.id);
          const newAmmo = SaveSystem.addArrows(bundle.amount);
          SoundEffects.playPickup();

          EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, bundle.id, `+${bundle.amount} Arrows`);
          EventBus.emit(GAME_EVENTS.AMMO_UPDATED, newAmmo);
          EventBus.emit(GAME_EVENTS.NOTIFICATION, `Found Quiver (+${bundle.amount} Arrows)!`);

          abSprite.destroy();
          this.arrowBundlePickups.delete(bundle.id);
        });

        this.arrowBundlePickups.set(bundle.id, abSprite);
      }
    });

    // 13. Heart Pickups
    this.heartPickups.clear();
    CHAPTER_5_LEVEL_DATA.hearts.forEach((heart) => {
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
          EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heart.id, "Highland Train Heart");

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

    // 14. End Chest on Locomotive Observation Roof
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_5_ID;
    this.isChestUnlocked = unlockedChests.has(chestId);

    this.chestSprite = this.add
      .sprite(
        CHAPTER_5_LEVEL_DATA.chest.x,
        CHAPTER_5_LEVEL_DATA.chest.y,
        this.isChestUnlocked ? "chest-ch5-open" : "chest-ch5-closed"
      )
      .setDepth(4);

    this.chestPromptText = this.add
      .text(
        CHAPTER_5_LEVEL_DATA.chest.x,
        CHAPTER_5_LEVEL_DATA.chest.y - 44,
        "Press [E] to Open Locomotive Safe",
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

    // 15. Collisions & Camera
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    this.physics.add.overlap(this.player.sprite, this.hazards, (_p, hazardObj) => {
      const hazard = hazardObj as Phaser.Physics.Arcade.Sprite;
      const knockbackDirX = this.player.sprite.x < hazard.x ? -1 : 1;
      this.player.takeDamage(GAME_CONSTANTS.RESOURCE.HAZARD_DAMAGE, knockbackDirX, -1);
    });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, CHAPTER_5_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 16. Input & EventBus
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.setupEventBus();

    // Ready signal
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Chapter 5: The Station — Show your ticket [E] to board the moving train!");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanUpScene());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanUpScene());
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

    // Update bow & arrow system
    this.bowSystem.update(time, delta);

    // Update flying dinosaurs
    for (let i = this.dinosaursList.length - 1; i >= 0; i--) {
      const dino = this.dinosaursList[i];
      if (dino && dino.active) {
        dino.updateEnemy(time, delta);
      }
    }

    // Parallax scroll with simulated train motion sensation
    const scrollX = this.cameras.main.scrollX;
    this.bgSky.tilePositionX = scrollX * 0.15;
    this.bgTracks.tilePositionX = scrollX * 0.75 + time * 0.08;

    // Ticket Gate Interaction
    const distToGate = Math.abs(this.player.sprite.x - CHAPTER_5_LEVEL_DATA.ticketGate.x);
    if (distToGate < 80 && !this.isTicketValidated) {
      this.gatePromptText.setVisible(true);
      if (this.player.isInteractPressed()) {
        const hasTicket = Boolean(SaveSystem.load()?.hasTrainTicket) || PuzzleManager.getInstance().isTicketComplete();
        if (hasTicket) {
          this.validateTicket();
        } else {
          SoundEffects.playHazard();
          EventBus.emit(
            GAME_EVENTS.NOTIFICATION,
            "Ticket Gate Locked! You must assemble the 3-piece Train Ticket from Chapter 4 first!"
          );
        }
      }
    } else {
      this.gatePromptText.setVisible(false);
    }

    // Chest interaction
    const distToChest = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.chestSprite.x,
      this.chestSprite.y
    );

    if (distToChest < 90 && !this.isChestUnlocked) {
      this.chestPromptText.setVisible(true);
      if (this.player.isInteractPressed()) {
        this.unlockChest();
      }
    } else {
      this.chestPromptText.setVisible(false);
    }
  }

  public validateTicket(): void {
    this.isTicketValidated = true;
    SaveSystem.collectItem("ch5_ticket_validated");
    SoundEffects.playFanfare();
    EventBus.emit(
      GAME_EVENTS.NOTIFICATION,
      "🎫 Ticket Verified! Gate open! Leap aboard the Autumn Highland Express!"
    );

    if (this.ticketBarrier) {
      this.ticketBarrier.destroy();
    }
    this.ticketGateSprite.setAlpha(0.5);
    this.gatePromptText.setVisible(false);
  }

  public unlockChest(): void {
    this.isChestUnlocked = true;
    this.chestSprite.setTexture("chest-ch5-open");
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

    const keyId = GAME_CONSTANTS.IDENTIFIERS.CHAPTER_6_KEY_ID;
    const letterId = GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_5_ID;
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_5_ID;

    // Save chest unlock, chapter 6 key, letter fragment 5, and unlock Chapter 6
    SaveSystem.unlockChest(chestId, 5);

    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, keyId, "Chapter 6 Coastal Key");
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, letterId, "Secret Letter Fragment 5 of 7");
    EventBus.emit(GAME_EVENTS.CHEST_OPENED, chestId, [keyId, letterId]);
    EventBus.emit(GAME_EVENTS.CHAPTER_UNLOCKED, 6);

    // Launch Chapter 5 Outro Story sequence
    this.time.delayedCall(700, () => {
      EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, "chapter5_station");
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
    if (this.bowSystem) {
      try {
        this.bowSystem.destroy();
      } catch {
        // Ignored during shutdown
      }
    }
  }
}
