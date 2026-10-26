import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PlayerController } from "../systems/PlayerController";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { MovingPlatform } from "../objects/MovingPlatform";
import { CHAPTER_2_LEVEL_DATA } from "../data/Chapter2LevelData";

export class Chapter2SearchScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  // Background parallax layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgHills!: Phaser.GameObjects.TileSprite;

  // Checkpoints
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private activeCheckpointId: string | null = null;

  // Collectibles
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // End Chest
  private chestSprite!: Phaser.GameObjects.Sprite;
  private chestPromptText!: Phaser.GameObjects.Text;
  private isChestUnlocked: boolean = false;

  // State flags
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter2SearchScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint =
      (currentSave?.chapter === 2 && currentSave.activeCheckpoint) ||
      GAME_CONSTANTS.CHECKPOINTS.CH2_SPAWN;

    const collectedItems = new Set(currentSave?.collectedItems || []);
    const unlockedChests = new Set(currentSave?.unlockedChests || []);

    // 1. World & Physics Bounds
    this.physics.world.setBounds(0, 0, GAME_CONSTANTS.LEVEL_WIDTH, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds (Ruined Sunset & Scorched Hills)
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "ruined-sky-bg")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgHills = this.add
      .tileSprite(0, 320, GAME_CONSTANTS.LOGICAL_WIDTH, 400, "ruined-hills-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Ground Segments
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_2_LEVEL_DATA.groundSegments.forEach((segment) => {
      const segWidth = segment.endX - segment.startX;
      const count = Math.ceil(segWidth / 64);
      for (let i = 0; i < count; i++) {
        const x = segment.startX + i * 64 + 32;
        if (x <= segment.endX) {
          const g = this.platforms.create(x, segment.y, "ruined-ground") as Phaser.Physics.Arcade.Sprite;
          g.refreshBody();
          g.setDepth(2);
        }
      }
    });

    // 4. Elevated Platforms
    CHAPTER_2_LEVEL_DATA.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, p.texture) as Phaser.Physics.Arcade.Sprite;
      plat.refreshBody();
      plat.setDepth(3);
    });

    // 5. Moving Platforms
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_2_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 6. Hazards (Ruined Fences & Briars)
    this.hazards = this.physics.add.staticGroup();
    CHAPTER_2_LEVEL_DATA.hazards.forEach((h) => {
      const hazard = this.hazards.create(h.x, h.y, "ruined-fence-hazard") as Phaser.Physics.Arcade.Sprite;
      hazard.setSize(52, 28);
      hazard.setOffset(6, 4);
      hazard.refreshBody();
      hazard.setDepth(3);
    });

    // 7. Checkpoints
    this.checkpointSprites.clear();
    this.activeCheckpointId = currentSave?.activeCheckpoint?.id || null;

    CHAPTER_2_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
      const isActive = this.activeCheckpointId === cpConfig.id;
      const cpSprite = this.add
        .sprite(cpConfig.x, cpConfig.y, "ruined-cp-trellis")
        .setDepth(3);

      if (isActive) {
        cpSprite.setTint(0x38bdf8);
      }
      this.checkpointSprites.set(cpConfig.id, cpSprite);

      const zone = this.add.zone(cpConfig.x, cpConfig.y, 70, 90);
      this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);

      this.physics.add.overlap(this.player?.sprite || zone, zone, () => {
        if (this.activeCheckpointId !== cpConfig.id) {
          this.activeCheckpointId = cpConfig.id;
          cpSprite.setTint(0x38bdf8);
          this.player.setCheckpoint(cpConfig, 2);
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

    // 8. Collectible Heart Trail
    this.heartPickups.clear();
    CHAPTER_2_LEVEL_DATA.hearts.forEach((heart) => {
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

        this.heartPickups.set(heart.id, hpSprite);
      }
    });

    // 9. End Chest (Contains Chapter 3 Key & Letter Fragment 2)
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_2_ID;
    this.isChestUnlocked = unlockedChests.has(chestId);

    this.chestSprite = this.add
      .sprite(
        CHAPTER_2_LEVEL_DATA.chest.x,
        CHAPTER_2_LEVEL_DATA.chest.y,
        this.isChestUnlocked ? "chest-ch2-open" : "chest-ch2-closed"
      )
      .setDepth(4);

    this.chestPromptText = this.add
      .text(
        CHAPTER_2_LEVEL_DATA.chest.x,
        CHAPTER_2_LEVEL_DATA.chest.y - 44,
        "Press [E] to Open Traveler's Chest",
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

    // 10. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 11. Physics Collisions & Overlaps
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    // Hazard overlap
    this.physics.add.overlap(this.player.sprite, this.hazards, (_p, hazardObj) => {
      const hazard = hazardObj as Phaser.Physics.Arcade.Sprite;
      const knockbackDirX = this.player.sprite.x < hazard.x ? -1 : 1;
      this.player.takeDamage(GAME_CONSTANTS.RESOURCE.HAZARD_DAMAGE, knockbackDirX, -1);
    });

    // Heart pickups overlap
    this.heartPickups.forEach((hpSprite, heartId) => {
      this.physics.add.overlap(this.player.sprite, hpSprite, () => {
        if (!this.heartPickups.has(heartId)) return;

        this.player.heal(GAME_CONSTANTS.HEART_PICKUP.HEAL_AMOUNT);
        this.player.applySpeedBoost(GAME_CONSTANTS.HEART_PICKUP.BOOST_DURATION_MS);
        SoundEffects.playPickup();

        SaveSystem.collectItem(heartId);
        EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heartId, "Ronny's Clue Heart");

        this.tweens.add({
          targets: hpSprite,
          scaleX: 1.8,
          scaleY: 1.8,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            hpSprite.destroy();
            this.heartPickups.delete(heartId);
          },
        });
      });
    });

    // Checkpoint Overlaps with player
    CHAPTER_2_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
      const zone = this.add.zone(cpConfig.x, cpConfig.y, 70, 90);
      this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);

      this.physics.add.overlap(this.player.sprite, zone, () => {
        if (this.activeCheckpointId !== cpConfig.id) {
          this.activeCheckpointId = cpConfig.id;
          const cpSprite = this.checkpointSprites.get(cpConfig.id);
          if (cpSprite) {
            cpSprite.setTint(0x38bdf8);
            this.tweens.add({
              targets: cpSprite,
              scaleX: 1.25,
              scaleY: 1.25,
              duration: 200,
              yoyo: true,
              ease: "Quad.easeOut",
            });
          }
          this.player.setCheckpoint(cpConfig, 2);
          SoundEffects.playPickup();
        }
      });
    });

    // 12. Smooth Follow Camera
    const camera = this.cameras.main;
    camera.setBounds(0, 0, GAME_CONSTANTS.LEVEL_WIDTH, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 13. Input & EventBus
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.setupEventBus();

    // Signal Ready
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Chapter 2: The Search — Follow Ronny's heart trail!");

    // Lifecycle cleanups
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

    if (distToChest < 80 && !this.isChestUnlocked) {
      this.chestPromptText.setVisible(true);
      if (this.player.isInteractPressed()) {
        this.unlockChest();
      }
    } else {
      this.chestPromptText.setVisible(false);
    }
  }

  private unlockChest(): void {
    this.isChestUnlocked = true;
    this.chestSprite.setTexture("chest-ch2-open");
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

    const keyId = GAME_CONSTANTS.IDENTIFIERS.CHAPTER_3_KEY_ID;
    const letterId = GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_2_ID;
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_2_ID;

    // Unlock chest and award chapter 3 key + fragment 2
    SaveSystem.unlockChest(chestId, 2);

    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, keyId, "Chapter 3 Unlock Key");
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, letterId, "Secret Letter Fragment 2 of 7");
    EventBus.emit(GAME_EVENTS.CHEST_OPENED, chestId, [keyId, letterId]);

    // Launch Chapter 2 Outro Story sequence
    this.time.delayedCall(700, () => {
      EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, "chapter2_search");
    });
  }

  private cleanupEvents(): void {
    this.eventCleanups.forEach((cleanup) => cleanup());
    this.eventCleanups = [];
  }

  public cleanUpScene(): void {
    this.cleanupEvents();
    if (this.player) {
      this.player.destroy();
    }
  }
}
