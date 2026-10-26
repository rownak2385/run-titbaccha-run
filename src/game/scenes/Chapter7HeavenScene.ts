import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PlayerController } from "../systems/PlayerController";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { MovingPlatform } from "../objects/MovingPlatform";
import { BowSystem } from "../systems/BowSystem";
import { PuzzleManager } from "../systems/PuzzleManager";
import { CHAPTER_7_LEVEL_DATA } from "../data/Chapter7LevelData";

export class Chapter7HeavenScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];

  // Bow System (Disabled in Chapter 7 - NO COMBAT)
  public bowSystem!: BowSystem;

  // Parallax Backgrounds (Golden Sunset & Glistening Ocean)
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgOcean!: Phaser.GameObjects.TileSprite;

  // Synchronized Matching Necklaces Glow
  public titiNecklaceGlow!: Phaser.GameObjects.Sprite;
  public ronnyNecklaceGlow!: Phaser.GameObjects.Sprite;

  // Ronny Character Sprite
  public ronnySprite!: Phaser.GameObjects.Sprite;
  private reunionPromptText!: Phaser.GameObjects.Text;
  public isReunionTriggered: boolean = false;

  // 5 Collectible Roses & 7th Letter Fragment
  public roseSprites: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  public letter7Sprite?: Phaser.Physics.Arcade.Sprite;

  // Checkpoints
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private activeCheckpointId: string | null = null;

  // Pickups
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // State
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter7HeavenScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint =
      (currentSave?.chapter === 7 && currentSave.activeCheckpoint) ||
      GAME_CONSTANTS.CHECKPOINTS.CH7_SPAWN;

    const collectedItems = new Set(currentSave?.collectedItems || []);

    // 1. World Bounds
    this.physics.world.setBounds(0, 0, CHAPTER_7_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds (Warm Golden Sunset & Shimmering Ocean Tide)
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "sunset-sky-bg")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgOcean = this.add
      .tileSprite(0, 480, GAME_CONSTANTS.LOGICAL_WIDTH, 240, "sunset-ocean-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Ground Segments (Verdant Clifftop Grass & Wildflowers)
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_7_LEVEL_DATA.groundSegments.forEach((segment) => {
      const segWidth = segment.endX - segment.startX;
      const count = Math.ceil(segWidth / 64);
      for (let i = 0; i < count; i++) {
        const x = segment.startX + i * 64 + 32;
        if (x <= segment.endX) {
          const g = this.platforms.create(x, segment.y, "sunset-cliff-ground") as Phaser.Physics.Arcade.Sprite;
          g.refreshBody();
          g.setDepth(2);
        }
      }
    });

    // 4. Elevated Platforms
    CHAPTER_7_LEVEL_DATA.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, p.texture) as Phaser.Physics.Arcade.Sprite;
      plat.refreshBody();
      plat.setDepth(3);
    });

    // 5. Gentle Moving Platforms
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_7_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 6. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 7. Bow System: Strictly DISABLED IN CHAPTER 7 (NO COMBAT)
    this.bowSystem = new BowSystem(this, this.player.sprite);
    this.bowSystem.setCombatAllowed(false); // Shooting disabled, crosshair hidden

    // 8. SYNCHRONIZED MATCHING NECKLACE ACTIVATION (Exclusive to Chapter 7!)
    SaveSystem.setNecklaceActivated(true);
    SoundEffects.playNecklaceGlow();
    EventBus.emit(GAME_EVENTS.NECKLACE_GLOW_TOGGLED, true);

    // Titi's glowing leaf necklace aura
    this.titiNecklaceGlow = this.add
      .sprite(this.player.sprite.x, this.player.sprite.y - 6, "necklace-glow-aura")
      .setDepth(11)
      .setScale(1.2)
      .setAlpha(0.85);

    this.tweens.add({
      targets: this.titiNecklaceGlow,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 9. Ronny on the Seaside Clifftop Sanctuary (x = 6520)
    const ronnyLoc = CHAPTER_7_LEVEL_DATA.ronnyLocation;
    const ronnyTex = this.textures.exists("frame_ronny_idle_0") ? "frame_ronny_idle_0" : "ronny-idle";
    this.ronnySprite = this.add.sprite(ronnyLoc.x, ronnyLoc.y - 20, ronnyTex).setDepth(4);
    this.ronnySprite.setFlipX(true); // Facing toward Titi (left)

    // Ronny's glowing leaf necklace aura
    this.ronnyNecklaceGlow = this.add
      .sprite(ronnyLoc.x - 4, ronnyLoc.y - 45, "necklace-glow-aura")
      .setDepth(11)
      .setScale(1.3)
      .setAlpha(0.85);

    this.tweens.add({
      targets: this.ronnyNecklaceGlow,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.reunionPromptText = this.add
      .text(ronnyLoc.x, ronnyLoc.y - 90, "Press [E] to Offer Five-Rose Bouquet & Reunite", {
        fontSize: "13px",
        fontFamily: "monospace",
        color: "#fef08a",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(12)
      .setVisible(false);

    // 10. Exactly 5 Collectible Wild Clifftop Roses
    this.roseSprites.clear();
    CHAPTER_7_LEVEL_DATA.roses.forEach((rose) => {
      if (!collectedItems.has(rose.id)) {
        const rSprite = this.physics.add.sprite(rose.x, rose.y, "rose-collectible");
        rSprite.setDepth(4);
        const b = rSprite.body as Phaser.Physics.Arcade.Body;
        if (b) b.setAllowGravity(false);

        this.tweens.add({
          targets: rSprite,
          y: rose.y - 10,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.physics.add.overlap(this.player.sprite, rSprite, () => {
          if (!this.roseSprites.has(rose.id)) return;
          PuzzleManager.getInstance().collectRose(rose.id);

          this.tweens.add({
            targets: rSprite,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0,
            duration: 250,
            onComplete: () => {
              rSprite.destroy();
              this.roseSprites.delete(rose.id);
            },
          });
        });

        this.roseSprites.set(rose.id, rSprite);
      }
    });

    // 11. Final Secret Letter Fragment (7 of 7) at Summit Threshold (x = 6200)
    const frag7Collected = collectedItems.has(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_7_ID);
    if (!frag7Collected) {
      const fLoc = CHAPTER_7_LEVEL_DATA.letterFragment7;
      this.letter7Sprite = this.physics.add.sprite(fLoc.x, fLoc.y, "letter-frag-7");
      this.letter7Sprite.setDepth(4);
      const b = this.letter7Sprite.body as Phaser.Physics.Arcade.Body;
      if (b) b.setAllowGravity(false);

      this.tweens.add({
        targets: this.letter7Sprite,
        y: fLoc.y - 12,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.physics.add.overlap(this.player.sprite, this.letter7Sprite, () => {
        if (!this.letter7Sprite) return;

        SaveSystem.collectItem(GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_7_ID);
        SoundEffects.playFanfare();

        EventBus.emit(
          GAME_EVENTS.ITEM_COLLECTED,
          GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_7_ID,
          "Secret Letter Fragment 7 of 7"
        );
        EventBus.emit(
          GAME_EVENTS.NOTIFICATION,
          "📜 Found the final fragment! All 7 Secret Letter Fragments gathered!"
        );

        this.tweens.add({
          targets: this.letter7Sprite,
          scaleX: 2.0,
          scaleY: 2.0,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.letter7Sprite?.destroy();
            this.letter7Sprite = undefined;
          },
        });
      });
    }

    // 12. Checkpoints
    this.checkpointSprites.clear();
    this.activeCheckpointId = currentSave?.activeCheckpoint?.id || null;

    CHAPTER_7_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
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
          this.player.setCheckpoint(cpConfig, 7);
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

    // 13. Heart Pickups
    this.heartPickups.clear();
    CHAPTER_7_LEVEL_DATA.hearts.forEach((heart) => {
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
          EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heart.id, "Sunset Heart");

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

    // 14. Collisions & Camera
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, CHAPTER_7_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 15. Input & EventBus
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.setupEventBus();

    // Ready signal
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(
      GAME_EVENTS.NOTIFICATION,
      "Chapter 7: The Heaven — Matching necklaces glow! Gather 5 roses for Ronny!"
    );

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

    // Update necklace glow position to follow Titi's chest
    if (this.titiNecklaceGlow) {
      this.titiNecklaceGlow.setPosition(this.player.sprite.x, this.player.sprite.y - 4);
    }

    // Parallax scroll
    const scrollX = this.cameras.main.scrollX;
    this.bgSky.tilePositionX = scrollX * 0.1;
    this.bgOcean.tilePositionX = scrollX * 0.35;

    // Approach Ronny & Reunion Interaction (x = 6520)
    const distToRonny = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.ronnySprite.x,
      this.ronnySprite.y
    );

    if (distToRonny < 110 && !this.isReunionTriggered) {
      const hasBouquet = PuzzleManager.getInstance().hasBouquet();
      if (!hasBouquet) {
        const rosesCount = PuzzleManager.getInstance().getRoses().length;
        this.reunionPromptText.setText(`[Gather All 5 Clifftop Roses for Ronny (${rosesCount}/5)]`);
      } else {
        this.reunionPromptText.setText("Press [E] to Offer Five-Rose Bouquet & Reunite!");
      }
      this.reunionPromptText.setVisible(true);

      if (this.player.isInteractPressed()) {
        if (hasBouquet) {
          this.triggerReunionSequence();
        } else {
          SoundEffects.playHazard();
          EventBus.emit(
            GAME_EVENTS.NOTIFICATION,
            "Gather all 5 wild roses along the cliffs to make a bouquet for Ronny first!"
          );
        }
      }
    } else {
      this.reunionPromptText.setVisible(false);
    }
  }

  public triggerReunionSequence(): void {
    if (this.isReunionTriggered) return;
    this.isReunionTriggered = true;
    this.reunionPromptText.setVisible(false);

    // 1. Titi reaches Ronny & necklaces glow intensely
    SoundEffects.playNecklaceGlow();
    this.tweens.add({
      targets: [this.titiNecklaceGlow, this.ronnyNecklaceGlow],
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 1.0,
      duration: 500,
      yoyo: true,
      repeat: 2,
    });

    // 2. Ronny turns and recognizes Titi; Titi hops close
    this.tweens.add({
      targets: this.player.sprite,
      x: this.ronnySprite.x - 36,
      duration: 600,
      ease: "Quad.easeOut",
    });

    // 3. Offer bouquet & accept
    this.time.delayedCall(700, () => {
      SoundEffects.playBouquetAssembled();
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        "💐 Titi offers the Five-Rose Bouquet! Ronny kneels in tears of joy!"
      );
    });

    // 4. Warm hug embrace
    this.time.delayedCall(1500, () => {
      SoundEffects.playFanfare();
      SaveSystem.setReunionCompleted();

      // Lift Titi into Ronny's arms
      this.tweens.add({
        targets: this.player.sprite,
        y: this.ronnySprite.y - 25,
        duration: 400,
        ease: "Back.easeOut",
      });

      // 5. Letter reveal overlay triggered immediately after hug!
      this.time.delayedCall(1200, () => {
        SaveSystem.setFinalLetterRevealed();
        EventBus.emit(GAME_EVENTS.LETTER_REVEAL_TRIGGERED);
      });
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
    if (this.titiNecklaceGlow) {
      try {
        this.titiNecklaceGlow.destroy();
      } catch {
        // Ignored during shutdown
      }
    }
    if (this.ronnyNecklaceGlow) {
      try {
        this.ronnyNecklaceGlow.destroy();
      } catch {
        // Ignored during shutdown
      }
    }
  }
}
