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
import { CHAPTER_3_LEVEL_DATA } from "../data/Chapter3LevelData";

export class Chapter3RescueScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  // Combat System
  private bowSystem!: BowSystem;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private enemiesList: Enemy[] = [];
  private bowPickupSprite?: Phaser.Physics.Arcade.Sprite;

  // Background parallax layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgHills!: Phaser.GameObjects.TileSprite;

  // Checkpoints
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private activeCheckpointId: string | null = null;

  // Collectibles
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private arrowBundlePickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // End Chest & Cave Entrance
  private chestSprite!: Phaser.GameObjects.Sprite;
  private chestPromptText!: Phaser.GameObjects.Text;
  private isChestUnlocked: boolean = false;

  // State flags
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter3RescueScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint =
      (currentSave?.chapter === 3 && currentSave.activeCheckpoint) ||
      GAME_CONSTANTS.CHECKPOINTS.CH3_SPAWN;

    const collectedItems = new Set(currentSave?.collectedItems || []);
    const unlockedChests = new Set(currentSave?.unlockedChests || []);

    // 1. World & Physics Bounds
    this.physics.world.setBounds(0, 0, CHAPTER_3_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds (Emerald Canopy & Forest Trees)
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "forest-sky-bg")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgHills = this.add
      .tileSprite(0, 320, GAME_CONSTANTS.LOGICAL_WIDTH, 400, "forest-trees-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Ground Segments
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_3_LEVEL_DATA.groundSegments.forEach((segment) => {
      const segWidth = segment.endX - segment.startX;
      const count = Math.ceil(segWidth / 64);
      for (let i = 0; i < count; i++) {
        const x = segment.startX + i * 64 + 32;
        if (x <= segment.endX) {
          const g = this.platforms.create(x, segment.y, "forest-ground") as Phaser.Physics.Arcade.Sprite;
          g.refreshBody();
          g.setDepth(2);
        }
      }
    });

    // 4. Elevated Timber & Root Platforms
    CHAPTER_3_LEVEL_DATA.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, p.texture) as Phaser.Physics.Arcade.Sprite;
      plat.refreshBody();
      plat.setDepth(3);
    });

    // 5. Moving Platforms
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_3_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 6. Hazards (Forest Briars)
    this.hazards = this.physics.add.staticGroup();
    CHAPTER_3_LEVEL_DATA.hazards.forEach((h) => {
      const hazard = this.hazards.create(h.x, h.y, "forest-bramble-hazard") as Phaser.Physics.Arcade.Sprite;
      hazard.setSize(52, 28);
      hazard.setOffset(6, 4);
      hazard.refreshBody();
      hazard.setDepth(3);
    });

    // 7. Cave Entrance Prop at Section 6
    this.add
      .sprite(
        CHAPTER_3_LEVEL_DATA.caveEntrance.x,
        CHAPTER_3_LEVEL_DATA.caveEntrance.y,
        "cave-entrance-prop"
      )
      .setDepth(2);

    // 8. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 9. Bow System & Weapon Acquisition Pedestal
    this.bowSystem = new BowSystem(this, this.player.sprite);
    this.bowSystem.setupPlatformCollisions(this.platforms);

    const hasBowAlready = Boolean(currentSave?.hasBow);
    if (!hasBowAlready) {
      const bowLoc = CHAPTER_3_LEVEL_DATA.bowLocation;
      this.bowPickupSprite = this.physics.add.sprite(bowLoc.x, bowLoc.y, "bow-pickup-sprite");
      this.bowPickupSprite.setDepth(4);
      const bBody = this.bowPickupSprite.body as Phaser.Physics.Arcade.Body;
      if (bBody) bBody.setAllowGravity(false);

      this.tweens.add({
        targets: this.bowPickupSprite,
        y: bowLoc.y - 12,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.physics.add.overlap(this.player.sprite, this.bowPickupSprite, () => {
        if (!this.bowPickupSprite) return;
        SoundEffects.playFanfare();
        SaveSystem.setBowAcquired(GAME_CONSTANTS.COMBAT.INITIAL_QUIVER);

        EventBus.emit(GAME_EVENTS.BOW_ACQUIRED);
        EventBus.emit(
          GAME_EVENTS.NOTIFICATION,
          "🏹 Ronny's Hunting Bow Acquired! Mouse aims, Left-Click fires arrows!"
        );
        EventBus.emit(GAME_EVENTS.AMMO_UPDATED, GAME_CONSTANTS.COMBAT.INITIAL_QUIVER);

        this.tweens.add({
          targets: this.bowPickupSprite,
          scaleX: 1.8,
          scaleY: 1.8,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.bowPickupSprite?.destroy();
            this.bowPickupSprite = undefined;
          },
        });
      });
    }

    // 10. Arrow Bundle Pickups (Quivers)
    this.arrowBundlePickups.clear();
    CHAPTER_3_LEVEL_DATA.arrowBundles.forEach((bundle) => {
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

    // 11. 9 Mandatory Hostile Encounters
    this.enemiesGroup = this.physics.add.group();
    this.enemiesList = [];

    CHAPTER_3_LEVEL_DATA.enemies.forEach((enemyCfg) => {
      // Check if already permanently defeated
      if (SaveSystem.isEnemyDefeated(enemyCfg.id)) return;

      const enemy = new Enemy(this, enemyCfg);
      this.enemiesGroup.add(enemy);
      this.enemiesList.push(enemy);

      // Collide enemies with platforms
      this.physics.add.collider(enemy, this.platforms);
      this.physics.add.collider(enemy, this.movingPlatformsGroup);

      // Contact damage with player
      this.physics.add.overlap(this.player.sprite, enemy, () => {
        if (!enemy.getIsDefeated()) {
          const knockbackDirX = this.player.sprite.x < enemy.x ? -1 : 1;
          this.player.takeDamage(20, knockbackDirX, -1);
        }
      });
    });

    // Link arrows to enemies
    this.bowSystem.setupEnemyCollisions(this.enemiesGroup);

    // 12. Checkpoints
    this.checkpointSprites.clear();
    this.activeCheckpointId = currentSave?.activeCheckpoint?.id || null;

    CHAPTER_3_LEVEL_DATA.checkpoints.forEach((cpConfig) => {
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
          this.player.setCheckpoint(cpConfig, 3);
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

    // 13. Collectible Heart Trail
    this.heartPickups.clear();
    CHAPTER_3_LEVEL_DATA.hearts.forEach((heart) => {
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
          EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heart.id, "Forest Heart Vitality");

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

    // 14. Ancient Chest at End (Near Cave Mouth)
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_3_ID;
    this.isChestUnlocked = unlockedChests.has(chestId);

    this.chestSprite = this.add
      .sprite(
        CHAPTER_3_LEVEL_DATA.chest.x,
        CHAPTER_3_LEVEL_DATA.chest.y,
        this.isChestUnlocked ? "chest-ch3-open" : "chest-ch3-closed"
      )
      .setDepth(4);

    this.chestPromptText = this.add
      .text(
        CHAPTER_3_LEVEL_DATA.chest.x,
        CHAPTER_3_LEVEL_DATA.chest.y - 44,
        "Press [E] to Open Forest Chest",
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

    // 15. Collisions & Follow Camera
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    this.physics.add.overlap(this.player.sprite, this.hazards, (_p, hazardObj) => {
      const hazard = hazardObj as Phaser.Physics.Arcade.Sprite;
      const knockbackDirX = this.player.sprite.x < hazard.x ? -1 : 1;
      this.player.takeDamage(GAME_CONSTANTS.RESOURCE.HAZARD_DAMAGE, knockbackDirX, -1);
    });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, CHAPTER_3_LEVEL_DATA.levelWidth, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 16. Keyboard & EventBus
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.setupEventBus();

    // Ready signal
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Chapter 3: The Rescue — Venture through the predator forest!");

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

    // Update combat & bow system
    this.bowSystem.update(time, delta);

    // Update enemies
    for (let i = this.enemiesList.length - 1; i >= 0; i--) {
      const enemy = this.enemiesList[i];
      if (enemy && enemy.active) {
        enemy.updateEnemy(time, delta);
      }
    }

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
      const isPhotoComplete = PuzzleManager.getInstance().isPhotoComplete();
      if (!isPhotoComplete) {
        const count = PuzzleManager.getInstance().getPhotoPieces().length;
        this.chestPromptText.setText(`[Locked: Defeat 9 Beasts for Memory Photo (${count}/9)]`);
      } else {
        this.chestPromptText.setText("Press [E] to Open Ancient Forest Chest");
      }
      this.chestPromptText.setVisible(true);

      if (this.player.isInteractPressed()) {
        if (isPhotoComplete) {
          this.unlockChest();
        } else {
          SoundEffects.playHazard();
          EventBus.emit(
            GAME_EVENTS.NOTIFICATION,
            "The chest remains sealed! You must defeat all 9 beasts and assemble the Memory Photo first!"
          );
        }
      }
    } else {
      this.chestPromptText.setVisible(false);
    }
  }

  private unlockChest(): void {
    this.isChestUnlocked = true;
    this.chestSprite.setTexture("chest-ch3-open");
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

    const keyId = GAME_CONSTANTS.IDENTIFIERS.CHAPTER_4_KEY_ID;
    const letterId = GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_3_ID;
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_3_ID;

    // Unlock chest and award chapter 4 key + letter fragment 3
    SaveSystem.unlockChest(chestId, 3);

    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, keyId, "Chapter 4 Unlock Key");
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, letterId, "Secret Letter Fragment 3 of 7");
    EventBus.emit(GAME_EVENTS.CHEST_OPENED, chestId, [keyId, letterId]);

    // Launch Chapter 3 Outro Story sequence
    this.time.delayedCall(700, () => {
      EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, "chapter3_rescue");
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
