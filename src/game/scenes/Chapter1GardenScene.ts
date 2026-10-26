import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PlayerController } from "../systems/PlayerController";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { MovingPlatform } from "../objects/MovingPlatform";
import { CHAPTER_1_LEVEL_DATA } from "../data/Chapter1LevelData";
import { CheckpointData } from "@/types/game";
import { CharacterAssetManager } from "../systems/CharacterAssetManager";

export class Chapter1GardenScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformsGroup!: Phaser.Physics.Arcade.Group;
  private movingPlatformsList: MovingPlatform[] = [];
  private hazards!: Phaser.Physics.Arcade.StaticGroup;

  // Background parallax layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgHills!: Phaser.GameObjects.TileSprite;

  // Checkpoints
  private checkpoint1Sprite!: Phaser.GameObjects.Sprite;
  private checkpoint2Sprite!: Phaser.GameObjects.Sprite;
  private isCheckpoint1Active: boolean = false;
  private isCheckpoint2Active: boolean = false;

  // Collectibles
  private heartPickups: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

  // Narrative NPCs & Objects
  private ronnySprite!: Phaser.GameObjects.Sprite;
  private ronnyPackSprite!: Phaser.GameObjects.Sprite;
  private foxSprite!: Phaser.GameObjects.Sprite;
  private chestSprite!: Phaser.GameObjects.Sprite;
  private chestPromptText!: Phaser.GameObjects.Text;

  // Developer Debug Mode Overlay
  private isDebugOverlayActive: boolean = false;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private debugLabelsGroup!: Phaser.GameObjects.Group;
  private debugPlayerLabel!: Phaser.GameObjects.Text;
  private debugRonnyLabel!: Phaser.GameObjects.Text;
  private debugFoxLabel!: Phaser.GameObjects.Text;
  private debugCp1Label!: Phaser.GameObjects.Text;
  private debugCp2Label!: Phaser.GameObjects.Text;

  // State flags
  private isChestUnlocked: boolean = false;
  private isBetrayalScriptTriggered: boolean = false;
  private isPaused: boolean = false;
  private eventCleanups: (() => void)[] = [];

  constructor() {
    super("Chapter1GardenScene");
  }

  create(): void {
    const currentSave = SaveSystem.load();
    const spawnCheckpoint = currentSave?.activeCheckpoint || GAME_CONSTANTS.CHECKPOINTS.DEFAULT_SPAWN;
    const collectedItems = new Set(currentSave?.collectedItems || []);
    const unlockedChests = new Set(currentSave?.unlockedChests || []);

    // 1. World & Physics Bounds
    this.physics.world.setBounds(0, 0, GAME_CONSTANTS.LEVEL_WIDTH, GAME_CONSTANTS.LEVEL_HEIGHT);

    // 2. Parallax Backgrounds
    this.bgSky = this.add
      .tileSprite(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT, "garden-sky-bg")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    this.bgHills = this.add
      .tileSprite(0, 320, GAME_CONSTANTS.LOGICAL_WIDTH, 400, "garden-hills-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 3. Ground Segments (with broken pits over hazard chasms)
    this.platforms = this.physics.add.staticGroup();
    CHAPTER_1_LEVEL_DATA.groundSegments.forEach((segment) => {
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

    // 4. Elevated Static Platforms
    CHAPTER_1_LEVEL_DATA.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, p.texture) as Phaser.Physics.Arcade.Sprite;
      plat.refreshBody();
      plat.setDepth(3);
    });

    // 5. Moving Platforms
    this.movingPlatformsGroup = this.physics.add.group();
    this.movingPlatformsList = [];
    CHAPTER_1_LEVEL_DATA.movingPlatforms.forEach((mpConfig) => {
      const mp = new MovingPlatform(this, mpConfig);
      mp.setDepth(3);
      this.movingPlatformsGroup.add(mp);
      this.movingPlatformsList.push(mp);
    });

    // 6. Bramble Briar Hazards
    this.hazards = this.physics.add.staticGroup();
    CHAPTER_1_LEVEL_DATA.hazards.forEach((h) => {
      const hazard = this.hazards.create(h.x, h.y, "garden-hazard") as Phaser.Physics.Arcade.Sprite;
      hazard.setSize(52, 28);
      hazard.setOffset(6, 6);
      hazard.refreshBody();
      hazard.setDepth(3);
    });

    // 7. Checkpoints
    // Checkpoint 1: Sun-Dial Plaza (x = 1950)
    const cp1Config = GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_1;
    this.isCheckpoint1Active = currentSave?.activeCheckpoint?.id === cp1Config.id;
    this.checkpoint1Sprite = this.add
      .sprite(cp1Config.x, cp1Config.y, this.isCheckpoint1Active ? "sundial-on" : "sundial-off")
      .setDepth(3);

    const cp1Zone = this.add.zone(cp1Config.x, cp1Config.y, 70, 90);
    this.physics.world.enable(cp1Zone, Phaser.Physics.Arcade.STATIC_BODY);

    // Checkpoint 2: Weathered Stone Lantern (x = 4250)
    const cp2Config = GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_2;
    this.isCheckpoint2Active = currentSave?.activeCheckpoint?.id === cp2Config.id;
    this.checkpoint2Sprite = this.add
      .sprite(cp2Config.x, cp2Config.y, this.isCheckpoint2Active ? "garden-checkpoint-on" : "garden-checkpoint-off")
      .setDepth(3);

    const cp2Zone = this.add.zone(cp2Config.x, cp2Config.y, 70, 90);
    this.physics.world.enable(cp2Zone, Phaser.Physics.Arcade.STATIC_BODY);

    // 8. Collectible Hearts
    this.heartPickups.clear();
    CHAPTER_1_LEVEL_DATA.hearts.forEach((heart) => {
      if (!collectedItems.has(heart.id)) {
        const hpSprite = this.physics.add.sprite(heart.x, heart.y, "garden-heart");
        hpSprite.setDepth(4);
        (hpSprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

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

    // 9. Narrative NPCs at the Clearing
    // Ground surface at campsite is at y = 656
    const groundContactY = 656;
    const ronnyGroundedY = groundContactY - 80; // y = 576: shoes firmly resting on grass
    const foxGroundedY = groundContactY - 44;   // y = 612: paws firmly resting on grass (at 0.55 scale)

    // Ronny's Campsite: Supplies pack resting on grass
    this.ronnyPackSprite = this.add
      .sprite(GAME_CONSTANTS.NARRATIVE.RONNY_CAMP_X - 45, groundContactY - 20, "ronny-camp-pack")
      .setDepth(3);

    // Ronny waiting with bowl of feed
    const ronnyInitKey = this.textures.exists("frame_ronny_waiting_food_0")
      ? "frame_ronny_waiting_food_0"
      : "ronny-waiting";
    this.ronnySprite = this.add
      .sprite(GAME_CONSTANTS.NARRATIVE.RONNY_CAMP_X, ronnyGroundedY, ronnyInitKey)
      .setDepth(4);
    CharacterAssetManager.getInstance().configureNpcSprite(this.ronnySprite, "ronny");
    if (this.anims.exists("ronny_waiting_food")) {
      this.ronnySprite.play("ronny_waiting_food");
    }

    // The Fox in the brush (scaled 0.55 in manifest to preserve natural animal-to-human proportions)
    const foxInitKey = this.textures.exists("frame_fox_idle_0")
      ? "frame_fox_idle_0"
      : "fox-idle";
    this.foxSprite = this.add
      .sprite(GAME_CONSTANTS.NARRATIVE.FOX_ENCOUNTER_X, foxGroundedY, foxInitKey)
      .setDepth(4);
    CharacterAssetManager.getInstance().configureNpcSprite(this.foxSprite, "fox");
    if (this.anims.exists("fox_idle")) {
      this.foxSprite.play("fox_idle");
    }

    // 10. Ancient Chest
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_1_ID;
    const legacyChestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_LEGACY_ID;
    this.isChestUnlocked = unlockedChests.has(chestId) || unlockedChests.has(legacyChestId);

    this.chestSprite = this.add
      .sprite(
        GAME_CONSTANTS.NARRATIVE.CHEST_X,
        GAME_CONSTANTS.NARRATIVE.CHEST_Y,
        this.isChestUnlocked ? "garden-chest-open" : "garden-chest-closed"
      )
      .setDepth(4);

    this.chestPromptText = this.add
      .text(
        GAME_CONSTANTS.NARRATIVE.CHEST_X,
        GAME_CONSTANTS.NARRATIVE.CHEST_Y - 44,
        "Press [E] to Open Ancient Chest",
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

    // 11. Player Controller
    this.player = new PlayerController(this, spawnCheckpoint.x, spawnCheckpoint.y, spawnCheckpoint);
    if (currentSave && typeof currentSave.health === "number") {
      this.player.setHealth(currentSave.health);
    }

    // 12. Physics Collisions & Overlaps
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.movingPlatformsGroup);

    // Hazard overlap
    this.physics.add.overlap(this.player.sprite, this.hazards, (_p, hazardObj) => {
      const hazard = hazardObj as Phaser.Physics.Arcade.Sprite;
      const knockbackDirX = this.player.sprite.x < hazard.x ? -1 : 1;
      this.player.takeDamage(GAME_CONSTANTS.RESOURCE.HAZARD_DAMAGE, knockbackDirX, -1);
    });

    // Checkpoint 1 overlap
    this.physics.add.overlap(this.player.sprite, cp1Zone, () => {
      if (!this.isCheckpoint1Active) {
        this.isCheckpoint1Active = true;
        this.checkpoint1Sprite.setTexture("sundial-on");
        this.player.setCheckpoint(cp1Config);
        SoundEffects.playPickup();

        this.tweens.add({
          targets: this.checkpoint1Sprite,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 200,
          yoyo: true,
          ease: "Quad.easeOut",
        });
      }
    });

    // Checkpoint 2 overlap
    this.physics.add.overlap(this.player.sprite, cp2Zone, () => {
      if (!this.isCheckpoint2Active) {
        this.isCheckpoint2Active = true;
        this.checkpoint2Sprite.setTexture("garden-checkpoint-on");
        this.player.setCheckpoint(cp2Config);
        SoundEffects.playPickup();

        this.tweens.add({
          targets: this.checkpoint2Sprite,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 200,
          yoyo: true,
          ease: "Quad.easeOut",
        });
      }
    });

    // Heart Pickups Overlap
    this.heartPickups.forEach((hpSprite, heartId) => {
      this.physics.add.overlap(this.player.sprite, hpSprite, () => {
        if (!this.heartPickups.has(heartId)) return;

        this.player.heal(GAME_CONSTANTS.HEART_PICKUP.HEAL_AMOUNT);
        this.player.applySpeedBoost(GAME_CONSTANTS.HEART_PICKUP.BOOST_DURATION_MS);
        SoundEffects.playPickup();

        SaveSystem.collectItem(heartId);
        EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, heartId, "Garden Heart Vitality");

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

    // 13. Smooth Follow Camera
    const camera = this.cameras.main;
    camera.setBounds(0, 0, GAME_CONSTANTS.LEVEL_WIDTH, GAME_CONSTANTS.LEVEL_HEIGHT);
    camera.startFollow(this.player.sprite, true, 0.08, 0.08);
    camera.setDeadzone(80, 50);

    // 14. Keyboard & EventBus listeners
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    // 15. Developer-Only Visual Debug Overlay (F3 or backtick)
    this.setupDebugOverlay();

    this.setupEventBus();

    // Signal ready
    EventBus.emit(GAME_EVENTS.GAME_READY);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.player.getHealth(), GAME_CONSTANTS.RESOURCE.MAX_HEALTH);

    // Lifecycle cleanup hooks
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

    // Parallax scroll sync
    const scrollX = this.cameras.main.scrollX;
    this.bgSky.tilePositionX = scrollX * 0.1;
    this.bgHills.tilePositionX = scrollX * 0.35;

    // Narrative trigger: approach Ronny and Fox encounter
    if (!this.isBetrayalScriptTriggered && this.player.sprite.x >= 5950) {
      this.triggerBetrayalEncounter();
    }

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

    // Developer debug overlay update
    if (this.isDebugOverlayActive) {
      this.updateDebugOverlay();
    }
  }

  /**
   * Deterministic scripted encounter for the Fox Betrayal
   */
  private triggerBetrayalEncounter(): void {
    this.isBetrayalScriptTriggered = true;

    // 1. Fox begins baiting Titi with golden treats
    if (this.anims.exists("fox_attracting")) {
      this.foxSprite.play("fox_attracting");
    } else {
      this.foxSprite.setTexture("fox-attract");
    }
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "A sly rustle in the hedge... The Fox lays out golden berries!");

    // 2. Ronny notices Titi stepping toward the Fox: first surprised in alarm, then heartbroken
    this.time.delayedCall(1600, () => {
      if (this.anims.exists("ronny_surprised")) {
        this.ronnySprite.play("ronny_surprised");
      }
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        "Ronny gasps in surprise... seeing Titi drawn toward the Fox!"
      );

      this.time.delayedCall(1000, () => {
        if (this.anims.exists("ronny_sad")) {
          this.ronnySprite.play("ronny_sad");
        } else {
          this.ronnySprite.setTexture("ronny-sad");
        }
        EventBus.emit(
          GAME_EVENTS.NOTIFICATION,
          "Ronny drops his scoop in heartbreak... eyes filled with tears."
        );
      });
    });

    // 3. Ronny turns and leaves
    this.time.delayedCall(3800, () => {
      if (this.anims.exists("ronny_walking_away")) {
        this.ronnySprite.play("ronny_walking_away");
      } else {
        this.ronnySprite.setTexture("ronny-walk1");
      }
      this.tweens.add({
        targets: this.ronnySprite,
        x: GAME_CONSTANTS.NARRATIVE.RONNY_CAMP_X - 180,
        alpha: 0,
        duration: 3000,
        ease: "Linear",
      });
      // Fox smirks and retreats into darkness
      if (this.anims.exists("fox_eating")) {
        this.foxSprite.play("fox_eating");
      } else {
        this.foxSprite.setTexture("fox-eating");
      }
      this.tweens.add({
        targets: this.foxSprite,
        x: GAME_CONSTANTS.NARRATIVE.FOX_ENCOUNTER_X + 100,
        alpha: 0,
        duration: 2500,
        ease: "Linear",
      });
    });
  }

  private unlockChest(): void {
    this.isChestUnlocked = true;
    this.chestSprite.setTexture("garden-chest-open");
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

    const keyId = GAME_CONSTANTS.IDENTIFIERS.CHAPTER_2_KEY_ID;
    const letterId = GAME_CONSTANTS.IDENTIFIERS.LETTER_FRAGMENT_1_ID;
    const chestId = GAME_CONSTANTS.IDENTIFIERS.CHEST_CHAPTER_1_ID;

    // Persist items in save system
    SaveSystem.unlockChest(chestId);
    SaveSystem.collectItem(keyId);
    SaveSystem.collectItem(letterId);

    // Emit event notifications
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, keyId, "Chapter 2 Unlock Key");
    EventBus.emit(GAME_EVENTS.ITEM_COLLECTED, letterId, "Secret Letter Fragment 1 of 7");
    EventBus.emit(GAME_EVENTS.CHEST_OPENED, chestId, [keyId, letterId]);

    // Launch Chapter 1 Climax Cinematic Player
    this.time.delayedCall(600, () => {
      EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, "chapter1_betrayal");
    });
  }

  private cleanupEvents(): void {
    this.eventCleanups.forEach((cleanup) => cleanup());
    this.eventCleanups = [];
  }

  /**
   * Setup developer-only visual debug overlay (F3 or backtick to toggle)
   */
  private setupDebugOverlay(): void {
    this.debugGraphics = this.add.graphics().setDepth(999);
    this.debugLabelsGroup = this.add.group();

    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "11px",
      fontFamily: "monospace",
      color: "#38bdf8",
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      padding: { x: 4, y: 2 },
    };

    this.debugPlayerLabel = this.add.text(0, 0, "", labelStyle).setDepth(1000).setOrigin(0.5, 1);
    this.debugRonnyLabel = this.add.text(0, 0, "", labelStyle).setDepth(1000).setOrigin(0.5, 1);
    this.debugFoxLabel = this.add.text(0, 0, "", labelStyle).setDepth(1000).setOrigin(0.5, 1);
    this.debugCp1Label = this.add.text(0, 0, "", labelStyle).setDepth(1000).setOrigin(0.5, 1);
    this.debugCp2Label = this.add.text(0, 0, "", labelStyle).setDepth(1000).setOrigin(0.5, 1);

    this.debugLabelsGroup.addMultiple([
      this.debugPlayerLabel,
      this.debugRonnyLabel,
      this.debugFoxLabel,
      this.debugCp1Label,
      this.debugCp2Label,
    ]);

    // Initial state: hidden
    this.debugGraphics.clear();
    this.debugLabelsGroup.setVisible(false);

    // Keyboard listeners for developer toggle
    this.input.keyboard?.on("keydown-F3", () => this.toggleDebugOverlay());
    this.input.keyboard?.on("keydown-BACKTICK", () => this.toggleDebugOverlay());
    this.input.keyboard?.on("keydown-TILDE", () => this.toggleDebugOverlay());

    // EventBus listener for UI or integration tests
    this.eventCleanups.push(
      EventBus.on("TOGGLE_DEBUG_OVERLAY", () => this.toggleDebugOverlay())
    );
  }

  /**
   * Toggle visual debug overlay displaying physics bodies, sprite bounds, anchors, and metadata
   */
  public toggleDebugOverlay(): void {
    this.isDebugOverlayActive = !this.isDebugOverlayActive;
    this.debugLabelsGroup.setVisible(this.isDebugOverlayActive);

    if (!this.isDebugOverlayActive) {
      this.debugGraphics.clear();
    } else {
      this.updateDebugOverlay();
    }

    EventBus.emit(
      GAME_EVENTS.NOTIFICATION,
      `[Dev Debug Overlay] ${this.isDebugOverlayActive ? "ENABLED (F3 / ~ to toggle)" : "DISABLED"}`
    );
  }

  /**
   * Render debug visuals on each frame when debug overlay is active
   */
  private updateDebugOverlay(): void {
    if (!this.isDebugOverlayActive) return;

    this.debugGraphics.clear();

    // 1. Sprite Bounds (Cyan rectangle)
    this.debugGraphics.lineStyle(1, 0x06b6d4, 0.85);

    const spritesToTrack = [
      this.player.sprite,
      this.ronnySprite,
      this.foxSprite,
      this.chestSprite,
      this.ronnyPackSprite,
    ];

    spritesToTrack.forEach((sprite) => {
      if (sprite && sprite.active && sprite.visible) {
        const bounds = sprite.getBounds();
        this.debugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
    });

    // 2. Physics Bodies (Green for player, Red for hazards, Blue for moving platforms)
    const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    if (playerBody) {
      this.debugGraphics.lineStyle(1, 0x22c55e, 0.95);
      this.debugGraphics.strokeRect(playerBody.x, playerBody.y, playerBody.width, playerBody.height);
    }

    this.hazards.getChildren().forEach((hazard) => {
      const b = (hazard as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
      if (b) {
        this.debugGraphics.lineStyle(1, 0xef4444, 0.8);
        this.debugGraphics.strokeRect(b.x, b.y, b.width, b.height);
      }
    });

    this.movingPlatformsGroup.getChildren().forEach((mp) => {
      const b = (mp as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
      if (b) {
        this.debugGraphics.lineStyle(1, 0x3b82f6, 0.8);
        this.debugGraphics.strokeRect(b.x, b.y, b.width, b.height);
      }
    });

    // 3. Anchor Points (Yellow Crosshairs)
    this.debugGraphics.lineStyle(2, 0xfacc15, 1.0);
    this.drawCrosshair(this.player.sprite.x, this.player.sprite.y, 6);
    this.drawCrosshair(this.ronnySprite.x, this.ronnySprite.y, 6);
    this.drawCrosshair(this.foxSprite.x, this.foxSprite.y, 6);
    this.drawCrosshair(this.chestSprite.x, this.chestSprite.y, 6);

    // 4. Update Dynamic Text Labels
    const playerAnimKey = this.player.sprite.anims.currentAnim?.key ?? "procedural";
    const playerFrameIdx = this.player.sprite.anims.currentFrame?.index ?? 0;
    this.debugPlayerLabel.setText(
      `[Titi] (${Math.round(this.player.sprite.x)}, ${Math.round(this.player.sprite.y)}) | Anim: ${playerAnimKey} [f:${playerFrameIdx}] | HP: ${this.player.getHealth()}`
    );
    this.debugPlayerLabel.setPosition(this.player.sprite.x, this.player.sprite.y - 38);

    const ronnyAnimKey = this.ronnySprite.anims.currentAnim?.key ?? this.ronnySprite.texture.key;
    this.debugRonnyLabel.setText(
      `[Ronny] (${Math.round(this.ronnySprite.x)}, ${Math.round(this.ronnySprite.y)}) | Anim: ${ronnyAnimKey} | Scale: ${this.ronnySprite.scaleX.toFixed(2)}`
    );
    this.debugRonnyLabel.setPosition(this.ronnySprite.x, this.ronnySprite.y - 94);

    const foxAnimKey = this.foxSprite.anims.currentAnim?.key ?? this.foxSprite.texture.key;
    this.debugFoxLabel.setText(
      `[Fox] (${Math.round(this.foxSprite.x)}, ${Math.round(this.foxSprite.y)}) | Anim: ${foxAnimKey} | Scale: ${this.foxSprite.scaleX.toFixed(2)}`
    );
    this.debugFoxLabel.setPosition(this.foxSprite.x, this.foxSprite.y - 52);

    this.debugCp1Label.setText(
      `[CP1: Sun-Dial] (${GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_1.x}, ${GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_1.y}) | Active: ${this.isCheckpoint1Active}`
    );
    this.debugCp1Label.setPosition(GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_1.x, GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_1.y - 50);

    this.debugCp2Label.setText(
      `[CP2: Stone Lantern] (${GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_2.x}, GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_2.y) | Active: ${this.isCheckpoint2Active}`
    );
    this.debugCp2Label.setPosition(GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_2.x, GAME_CONSTANTS.CHECKPOINTS.CHECKPOINT_2.y - 50);
  }

  private drawCrosshair(x: number, y: number, size = 6): void {
    this.debugGraphics.lineBetween(x - size, y, x + size, y);
    this.debugGraphics.lineBetween(x, y - size, x, y + size);
  }

  public cleanUpScene(): void {
    this.cleanupEvents();
    if (this.player) {
      this.player.destroy();
    }
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
    if (this.debugLabelsGroup) {
      this.debugLabelsGroup.destroy(true);
    }
  }
}
