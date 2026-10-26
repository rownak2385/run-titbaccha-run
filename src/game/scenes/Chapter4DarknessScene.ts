import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PlayerController } from "../systems/PlayerController";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { MovingPlatform } from "../objects/MovingPlatform";
import { TorchSystem } from "../systems/TorchSystem";
import { PuzzleManager } from "../systems/PuzzleManager";
import { CHAPTER_4_LEVEL_DATA } from "../data/Chapter4LevelData";

export class Chapter4DarknessScene extends Phaser.Scene {
  public player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  // Torch & Darkness System
  private torchSystem!: TorchSystem;

  // Ticket Pieces Group (Combat-Free Exploration)
  private ticketPickupsGroup!: Phaser.Physics.Arcade.Group;
  private ticketPieceSprites: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // Background parallax layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgHills!: Phaser.GameObjects.TileSprite;

  // Checkpoints
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private activeCheckpointId: string | null = null;

  // Collectibles & Pouch
  private pouchSprite?: Phaser.Physics.Arcade.Sprite;
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // End Chest
  private chestSprite!: Phaser.GameObjects.Sprite;
  private chestPromptText!: Phaser.GameObjects.Text;
  private isChestUnlocked: boolean = false;

  // State flags
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter4DarknessScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint =
      (currentSave?.chapter === 4 && currentSave.activeCheckpoint) ||
      GAME_CONSTANTS.CHECKPOINTS.CH4_SPAWN;

    const collectedItems = new Set(currentSave?.collectedItems || []);
    const unlockedChests = new Set(currentSave?.unlockedChests || []);

    // 1. World & Physics Bounds
    this.physics.world.setBounds(0, 0, CHAPTER_4_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds (Subterranean Cavern & Stalagmites)
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "cave-bg")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgHills = this.add
      .tileSprite(0, 320, GAME_CONSTANTS.LOGICAL_WIDTH, 400, "cave-stalagmites-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Sunlight Safe Zones - Visual Beams
    CHAPTER_4_LEVEL_DATA.sunlightZones.forEach((zone) => {
      this.add
        .sprite(zone.x + zone.width / 2, 300, "sunlight-beam")
        .setDepth(2)
        .setAlpha(0.7);
    });

    // 4. Ground Segments
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_4_LEVEL_DATA.groundSegments.forEach((segment) => {
      const segWidth = segment.endX - segment.startX;
      const count = Math.ceil(segWidth / 64);
      for (let i = 0; i < count; i++) {
        const x = segment.startX + i * 64 + 32;
        if (x <= segment.endX) {
          const g = this.platforms.create(x, segment.y, "cave-ground") as Phaser.Physics.Arcade.Sprite;
          g.refreshBody();
          g.setDepth(2);
        }
      }
    });

    // 5. Elevated Cavern Ledges
    CHAPTER_4_LEVEL_DATA.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, p.texture) as Phaser.Physics.Arcade.Sprite;
      plat.refreshBody();
      plat.setDepth(3);
    });

    // 6. Moving Platforms
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_4_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 7. Hazards (Sharp Stalagmites)
    this.hazards = this.physics.add.staticGroup();
    CHAPTER_4_LEVEL_DATA.hazards.forEach((h) => {
      const hazard = this.hazards.create(h.x, h.y, "cave-stalagmite-hazard") as Phaser.Physics.Arcade.Sprite;
      hazard.setSize(52, 28);
      hazard.setOffset(6, 4);
      hazard.refreshBody();
      hazard.setDepth(3);
    });

    // 8. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 9. Torch & Cave Darkness System
    this.torchSystem = new TorchSystem(this, this.player, CHAPTER_4_LEVEL_DATA.sunlightZones);

    // 10. Traveler's Pouch at Entrance (Grants 3 Life Hearts & Mysterious Note)
    const pouchCollected = collectedItems.has("traveler_pouch_ch4");
    if (!pouchCollected) {
      const pLoc = CHAPTER_4_LEVEL_DATA.travelerPouch;
      this.pouchSprite = this.physics.add.sprite(pLoc.x, pLoc.y, "traveler-pouch");
      this.pouchSprite.setDepth(4);
      const b = this.pouchSprite.body as Phaser.Physics.Arcade.Body;
      if (b) b.setAllowGravity(false);

      this.physics.add.overlap(this.player.sprite, this.pouchSprite, () => {
        if (!this.pouchSprite) return;
        SaveSystem.collectItem("traveler_pouch_ch4");
        SaveSystem.collectItem(GAME_CONSTANTS.IDENTIFIERS.CAVE_NOTE_ID);
        this.player.heal(90); // 3 life-restoring items worth of vitality
        SoundEffects.playFanfare();

        EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, GAME_CONSTANTS.IDENTIFIERS.CAVE_NOTE_ID, "Mysterious Cave Note");
        EventBus.emit(
          GAME_EVENTS.NOTIFICATION,
          "🎒 Found Ronny's Lost Pouch! +3 Life-Restoring Items (Full Vitality) & Mysterious Note!"
        );

        this.tweens.add({
          targets: this.pouchSprite,
          scaleX: 1.8,
          scaleY: 1.8,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.pouchSprite?.destroy();
            this.pouchSprite = undefined;
          },
        });
      });
    }

    // 12. Train Ticket Pieces (3 Reachable World Collectibles in the Cavern)
    this.ticketPickupsGroup = this.physics.add.group();
    this.ticketPieceSprites.clear();
    CHAPTER_4_LEVEL_DATA.ticketPieces.forEach((piece) => {
      if (PuzzleManager.getInstance().isTicketPieceCollected(piece.id)) return;

      const tSprite = this.physics.add.sprite(piece.x, piece.y, "ticket-piece-icon");
      tSprite.setDepth(4);
      const bBody = tSprite.body as Phaser.Physics.Arcade.Body;
      if (bBody) {
        bBody.setAllowGravity(false);
        bBody.setImmovable(true);
      }

      this.tweens.add({
        targets: tSprite,
        y: piece.y - 8,
        duration: 900 + Math.random() * 300,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.physics.add.overlap(this.player.sprite, tSprite, () => {
        if (!this.ticketPieceSprites.has(piece.id)) return;
        SoundEffects.playPickup();
        PuzzleManager.getInstance().collectTicketPiece(piece.id);
        tSprite.destroy();
        this.ticketPieceSprites.delete(piece.id);
      });

      this.ticketPickupsGroup.add(tSprite);
      this.ticketPieceSprites.set(piece.id, tSprite);
    });

    // 13. Checkpoints (In / adjacent to Sunlight Safe Zones)
    this.checkpointSprites.clear();
    this.activeCheckpointId = currentSave?.activeCheckpoint?.id || null;

    CHAPTER_4_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
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
          this.player.setCheckpoint(cpConfig, 4);
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

    // 15. Heart Pickups
    this.heartPickups.clear();
    CHAPTER_4_LEVEL_DATA.hearts.forEach((heart) => {
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
          EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heart.id, "Cavern Heart Vitality");

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

    // 16. End Chest (Requires Assembled Train Ticket)
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_4_ID;
    this.isChestUnlocked = unlockedChests.has(chestId);

    this.chestSprite = this.add
      .sprite(
        CHAPTER_4_LEVEL_DATA.chest.x,
        CHAPTER_4_LEVEL_DATA.chest.y,
        this.isChestUnlocked ? "chest-ch4-open" : "chest-ch4-closed"
      )
      .setDepth(4);

    this.chestPromptText = this.add
      .text(
        CHAPTER_4_LEVEL_DATA.chest.x,
        CHAPTER_4_LEVEL_DATA.chest.y - 44,
        "Press [E] to Open Cavern Vault Chest",
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

    // 17. Collisions & Camera
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    this.physics.add.overlap(this.player.sprite, this.hazards, (_p, hazardObj) => {
      const hazard = hazardObj as Phaser.Physics.Arcade.Sprite;
      const knockbackDirX = this.player.sprite.x < hazard.x ? -1 : 1;
      this.player.takeDamage(GAME_CONSTANTS.RESOURCE.HAZARD_DAMAGE, knockbackDirX, -1);
    });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, CHAPTER_4_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 18. Input & EventBus
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.setupEventBus();

    // Ready signal
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Chapter 4: The Darkness — Light your torch [F] and beware deep cave beasts!");

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

    // Update moving platforms
    this.movingPlatformsList.forEach((mp) => mp.updatePlatform());

    // Update player
    this.player.update(time, delta);

    // Update torch & darkness system
    this.torchSystem.update(time, delta);

    // Parallax scroll
    const scrollX = this.cameras.main.scrollX;
    this.bgSky.tilePositionX = scrollX * 0.1;
    this.bgHills.tilePositionX = scrollX * 0.35;

    // Chest interaction
    const distToChest = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.chestSprite.x,
      this.chestSprite.y
    );

    if (distToChest < 90 && !this.isChestUnlocked) {
      const isTicketComplete = PuzzleManager.getInstance().isTicketComplete();
      if (!isTicketComplete) {
        const count = PuzzleManager.getInstance().getTicketPieces().length;
        this.chestPromptText.setText(`[Locked: Collect all 3 Train Ticket Fragments (${count}/3)]`);
      } else {
        this.chestPromptText.setText("Press [E] to Unlock Highland Cavern Vault");
      }
      this.chestPromptText.setVisible(true);

      if (this.player.isInteractPressed()) {
        if (isTicketComplete) {
          this.unlockChest();
        } else {
          SoundEffects.playHazard();
          const count = PuzzleManager.getInstance().getTicketPieces().length;
          EventBus.emit(
            GAME_EVENTS.NOTIFICATION,
            `The Cavern Vault is sealed! Collect all 3 Train Ticket Fragments from the ledges first! (${count}/3 found)`
          );
        }
      }
    } else {
      this.chestPromptText.setVisible(false);
    }
  }

  public unlockChest(): void {
    this.isChestUnlocked = true;
    this.chestSprite.setTexture("chest-ch4-open");
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

    const keyId = GAME_CONSTANTS.IDENTIFIERS.CHAPTER_5_KEY_ID;
    const letterId = GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_4_ID;
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_4_ID;

    // Unlock chest and award chapter 5 key + letter fragment 4 (Chapter 5 unlocked!)
    SaveSystem.unlockChest(chestId, 4);

    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, keyId, "Chapter 5 Autumn Pass Key");
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, letterId, "Secret Letter Fragment 4 of 7");
    EventBus.emit(GAME_EVENTS.CHEST_OPENED, chestId, [keyId, letterId]);
    EventBus.emit(GAME_EVENTS.CHAPTER_UNLOCKED, 5);

    // Launch Chapter 4 Outro Story sequence
    this.time.delayedCall(700, () => {
      EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, "chapter4_darkness");
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
    if (this.torchSystem) {
      try {
        this.torchSystem.destroy();
      } catch {
        // Ignored during shutdown
      }
    }
  }
}
