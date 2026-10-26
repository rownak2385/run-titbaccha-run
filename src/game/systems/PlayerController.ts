import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { CheckpointData } from "@/types/game";
import { SaveSystem } from "./SaveSystem";
import { SoundEffects } from "./SoundEffects";
import { CharacterAssetManager } from "./CharacterAssetManager";

export class PlayerController {
  // Canonical constant: distance in pixels from Titi's sprite center (anchor 0.5, 0.5) to the bottom of the feet and physics body
  public static readonly FOOT_OFFSET_Y: number = 57;

  /**
   * Calculates the exact sprite center Y required for Titi's feet to rest precisely on a walkable surface at surfaceY.
   */
  public static getGroundedCenterY(surfaceY: number): number {
    return surfaceY - PlayerController.FOOT_OFFSET_Y;
  }

  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    Space: Phaser.Input.Keyboard.Key;
  };

  // State
  private health: number = GAME_CONSTANTS.RESOURCE.INITIAL_HEALTH;
  private isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;
  private speedBoostTimer: number = 0;
  private isDead: boolean = false;
  private activeCheckpoint: CheckpointData;
  private particleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, spawnX: number, spawnY: number, initialCheckpoint?: CheckpointData) {
    this.scene = scene;
    this.activeCheckpoint = initialCheckpoint || GAME_CONSTANTS.CHECKPOINTS.DEFAULT_SPAWN;

    // Create Arcade Physics sprite with data-driven physics body
    const initialTexture = scene.textures.exists("frame_titibaccha_idle_0")
      ? "frame_titibaccha_idle_0"
      : "titibaccha-idle";
    this.sprite = scene.physics.add.sprite(spawnX, spawnY, initialTexture);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(GAME_CONSTANTS.PLAYER.BOUNCE_Y);
    CharacterAssetManager.getInstance().setupPhysicsBody(this.sprite, "titibaccha");
    this.sprite.setDepth(10);

    // Setup input keys
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      Space: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Setup animations
    this.setupAnimations();

    // Setup speed boost particle emitter
    if (scene.textures.exists("speed-particle")) {
      this.particleEmitter = scene.add.particles(0, 0, "speed-particle", {
        speed: { min: 20, max: 50 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 250,
        frequency: 60,
        emitting: false,
      });
      this.particleEmitter.setDepth(9);
      this.particleEmitter.startFollow(this.sprite, 0, 10);
    }

    // Initial event emission
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.health, GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
  }

  private setupAnimations(): void {
    const anims = this.scene.anims;

    if (!anims.exists("titibaccha_idle")) {
      anims.create({
        key: "titibaccha_idle",
        frames: [{ key: "titibaccha-idle" }],
        frameRate: 1,
        repeat: -1,
      });
    }

    if (!anims.exists("titibaccha_run")) {
      anims.create({
        key: "titibaccha_run",
        frames: [{ key: "titibaccha-run-1" }, { key: "titibaccha-run-2" }],
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!anims.exists("titibaccha_jump")) {
      anims.create({
        key: "titibaccha_jump",
        frames: [{ key: "titibaccha-jump" }],
        frameRate: 1,
      });
    }

    if (!anims.exists("titibaccha_fall")) {
      anims.create({
        key: "titibaccha_fall",
        frames: [{ key: "titibaccha-fall" }],
        frameRate: 1,
      });
    }
  }

  public update(time: number, delta: number): void {
    if (this.isDead) return;

    // Handle Timers
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      // Visual flashing / blinking with hurt frame
      const isBlink = Math.floor(time / 100) % 2 === 0;
      this.sprite.setAlpha(isBlink ? 0.4 : 0.95);
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.sprite.setAlpha(1.0);
      }
    }

    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= delta;
      if (this.particleEmitter && !this.particleEmitter.emitting) {
        this.particleEmitter.start();
      }
      EventBus.emit(GAME_EVENTS.SPEED_BOOST_UPDATED, true, Math.ceil(this.speedBoostTimer / 1000));
      if (this.speedBoostTimer <= 0) {
        this.speedBoostTimer = 0;
        if (this.particleEmitter) this.particleEmitter.stop();
        EventBus.emit(GAME_EVENTS.SPEED_BOOST_UPDATED, false, 0);
      }
    }

    // Horizontal Movement
    const isMovingLeft = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const isMovingRight = this.cursors.right.isDown || this.wasdKeys.D.isDown;
    const currentMaxSpeed = this.speedBoostTimer > 0 ? GAME_CONSTANTS.PLAYER.BOOSTED_SPEED : GAME_CONSTANTS.PLAYER.BASE_SPEED;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const isGrounded = body.blocked.down || body.touching.down;

    if (isMovingLeft) {
      body.setVelocityX(-currentMaxSpeed);
      this.sprite.setFlipX(true);
    } else if (isMovingRight) {
      body.setVelocityX(currentMaxSpeed);
      this.sprite.setFlipX(false);
    } else {
      // Smooth deceleration
      body.setVelocityX(Phaser.Math.Linear(body.velocity.x, 0, 0.3));
    }

    // Jump
    const isJumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasdKeys.W) ||
      Phaser.Input.Keyboard.JustDown(this.wasdKeys.Space);

    if (isJumpPressed && isGrounded) {
      body.setVelocityY(GAME_CONSTANTS.PLAYER.JUMP_IMPULSE);
      SoundEffects.playJump();
    }

    // Animation / Motion state selection
    if (!isGrounded) {
      if (body.velocity.y < -50) {
        this.sprite.anims.play("titibaccha_jump", true);
      } else {
        this.sprite.anims.play("titibaccha_fall", true);
      }
    } else {
      if (Math.abs(body.velocity.x) > 20) {
        this.sprite.anims.play("titibaccha_run", true);
      } else {
        this.sprite.anims.play("titibaccha_idle", true);
      }
    }

    // Boundary pit check: if player falls below bottom of world
    if (this.sprite.y > GAME_CONSTANTS.LEVEL_HEIGHT - 30) {
      this.takeDamage(GAME_CONSTANTS.RESOURCE.MAX_HEALTH, 0, 0);
    }
  }

  public takeDamage(amount: number, knockbackDirX: number = 0, knockbackDirY: number = -1): void {
    if (this.isInvulnerable || this.isDead) return;

    this.health = Math.max(0, this.health - amount);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.health, GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    SoundEffects.playHazard();

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      knockbackDirX * GAME_CONSTANTS.RESOURCE.KNOCKBACK_FORCE_X,
      knockbackDirY * Math.abs(GAME_CONSTANTS.RESOURCE.KNOCKBACK_FORCE_Y)
    );

    if (this.health <= 0) {
      this.handleDeath();
    } else {
      this.isInvulnerable = true;
      this.invulnerableTimer = GAME_CONSTANTS.RESOURCE.INVULNERABILITY_DURATION_MS;
      EventBus.emit(GAME_EVENTS.NOTIFICATION, `Ouch! Bramble prickle (-${amount} HP)`);
    }
  }

  public heal(amount: number): void {
    if (this.isDead) return;
    this.health = Math.min(GAME_CONSTANTS.RESOURCE.MAX_HEALTH, this.health + amount);
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.health, GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
  }

  public applySpeedBoost(durationMs: number = GAME_CONSTANTS.HEART_PICKUP.BOOST_DURATION_MS): void {
    this.speedBoostTimer = durationMs;
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Heart Vitality Surge! Speed Boost Activated!");
  }

  public setCheckpoint(checkpoint: CheckpointData, chapter?: number): void {
    this.activeCheckpoint = checkpoint;
    SaveSystem.updateCheckpoint(checkpoint, this.health, chapter);
    EventBus.emit(GAME_EVENTS.CHECKPOINT_ACTIVATED, checkpoint);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, `Checkpoint reached: ${checkpoint.label}`);
  }

  public respawnAtCheckpoint(): void {
    this.isDead = false;
    this.health = Math.max(
      GAME_CONSTANTS.RESOURCE.MIN_RESPAWN_HEALTH,
      GAME_CONSTANTS.RESOURCE.INITIAL_HEALTH
    );
    this.isInvulnerable = true;
    this.invulnerableTimer = 1500; // Safe window upon respawn
    this.speedBoostTimer = 0;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.reset(this.activeCheckpoint.x, this.activeCheckpoint.y);
    this.sprite.setPosition(this.activeCheckpoint.x, this.activeCheckpoint.y);
    this.sprite.setAlpha(1.0);
    this.sprite.setVisible(true);

    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.health, GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
    EventBus.emit(GAME_EVENTS.SPEED_BOOST_UPDATED, false, 0);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, `Respawned at ${this.activeCheckpoint.label}`);
  }

  private handleDeath(): void {
    this.isDead = true;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.sprite.setVisible(false);

    if (this.particleEmitter) {
      this.particleEmitter.stop();
    }

    EventBus.emit(GAME_EVENTS.PLAYER_DEATH);
    EventBus.emit(GAME_EVENTS.NOTIFICATION, "Titibaccha stumbled! Respawning at checkpoint...");

    // Auto respawn after short delay
    this.scene.time.delayedCall(1200, () => {
      this.respawnAtCheckpoint();
    });
  }

  public getHealth(): number {
    return this.health;
  }

  public setHealth(val: number): void {
    this.health = Math.max(0, Math.min(GAME_CONSTANTS.RESOURCE.MAX_HEALTH, val));
    EventBus.emit(GAME_EVENTS.HEALTH_UPDATED, this.health, GAME_CONSTANTS.RESOURCE.MAX_HEALTH);
  }

  public getActiveCheckpoint(): CheckpointData {
    return this.activeCheckpoint;
  }

  public isInteractPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.wasdKeys.E);
  }

  public destroy(): void {
    if (this.particleEmitter) {
      this.particleEmitter.destroy();
    }
  }
}
