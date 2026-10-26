import * as Phaser from "phaser";
import { SaveSystem } from "../systems/SaveSystem";
import { SoundEffects } from "../systems/SoundEffects";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { PuzzleManager } from "../systems/PuzzleManager";

export interface EnemyConfig {
  id: string;
  x: number;
  y: number;
  archetype: "wolf" | "fox" | "monster" | "dinosaur";
  patrolMinX: number;
  patrolMaxX: number;
  maxHp?: number;
  speed?: number;
  dropItemId?: string;
  dropItemType?: "photo" | "ticket" | "map" | "arrow" | "heart";
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public readonly enemyId: string;
  public readonly archetype: "wolf" | "fox" | "monster" | "dinosaur";
  private patrolMinX: number;
  private patrolMaxX: number;
  private moveSpeed: number;
  private hp: number;
  private maxHp: number;
  private dropItemId?: string;
  private dropItemType?: "photo" | "ticket" | "map" | "arrow" | "heart";
  private isDefeated: boolean = false;
  private isStunned: boolean = false;
  private stunTimer: number = 0;
  private initialY: number;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    let textureKey = "enemy-wolf";
    if (config.archetype === "fox") textureKey = "enemy-fox-hostile";
    if (config.archetype === "monster") textureKey = "enemy-cave-monster";
    if (config.archetype === "dinosaur") textureKey = "enemy-dinosaur-flying";

    super(scene, config.x, config.y, textureKey);
    this.enemyId = config.id;
    this.archetype = config.archetype;
    this.patrolMinX = config.patrolMinX;
    this.patrolMaxX = config.patrolMaxX;
    this.initialY = config.y;
    this.moveSpeed = config.speed ?? (config.archetype === "monster" ? 50 : config.archetype === "dinosaur" ? 110 : 80);
    this.maxHp = config.maxHp ?? (config.archetype === "monster" ? 100 : 50);
    this.hp = this.maxHp;
    this.dropItemId = config.dropItemId;
    this.dropItemType = config.dropItemType;

    // Check if already defeated in persistent save
    if (SaveSystem.isEnemyDefeated(this.enemyId)) {
      this.isDefeated = true;
      this.setVisible(false);
      this.setActive(false);
      return;
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(8);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (config.archetype === "dinosaur") {
      this.setSize(64, 44);
      this.setOffset(4, 6);
      if (body) {
        body.setAllowGravity(false);
      }
    } else if (config.archetype === "monster") {
      this.setSize(52, 60);
      this.setOffset(6, 4);
    } else if (config.archetype === "wolf") {
      this.setSize(64, 40);
      this.setOffset(4, 12);
    } else {
      this.setSize(48, 36);
      this.setOffset(6, 10);
    }

    // Initial patrol direction
    this.setVelocityX(this.moveSpeed);
  }

  public updateEnemy(time: number, delta: number): void {
    if (this.isDefeated || !this.active) return;

    if (this.isStunned) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.clearTint();
      } else {
        return;
      }
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Dinosaur flight swoop
    if (this.archetype === "dinosaur") {
      const wobble = Math.sin(time * 0.0035 + this.patrolMinX) * 45;
      body.setVelocityY(wobble);
    }

    // Patrol back and forth
    if (this.x <= this.patrolMinX) {
      body.setVelocityX(Math.abs(this.moveSpeed));
      this.setFlipX(false);
    } else if (this.x >= this.patrolMaxX) {
      body.setVelocityX(-Math.abs(this.moveSpeed));
      this.setFlipX(true);
    } else if (body.velocity.x === 0) {
      body.setVelocityX(this.moveSpeed);
    }
  }

  public takeDamage(amount: number, knockbackDirX: number = 0): void {
    if (this.isDefeated || !this.active) return;

    this.hp -= amount;
    this.isStunned = true;
    this.stunTimer = 250;
    this.setTint(0xff4444);

    SoundEffects.playEnemyHit();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(knockbackDirX * 180, this.archetype === "dinosaur" ? -40 : -140);
    }

    if (this.hp <= 0) {
      this.defeat();
    }
  }

  private defeat(): void {
    if (this.isDefeated) return;
    this.isDefeated = true;

    SoundEffects.playEnemyDefeat();
    SaveSystem.recordEnemyDefeated(this.enemyId);
    EventBus.emit(GAME_EVENTS.ENEMY_DEFEATED, this.enemyId);

    // Disable physics body immediately
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setEnable(false);
    }

    // Spawn guaranteed puzzle drop at enemy location
    if (this.dropItemId || this.dropItemType) {
      this.spawnDrop(this.x, this.y);
    }

    // Defeat death animation: tumble, fade and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      angle: 90,
      duration: 350,
      ease: "Power2",
      onComplete: () => {
        this.destroy();
      },
    });
  }

  private spawnDrop(x: number, y: number): void {
    const dropId = this.dropItemId || `${this.enemyId}_drop`;
    const dropType = this.dropItemType || "heart";

    // Determine drop icon texture
    let textureKey = "garden-heart";
    if (dropType === "photo") textureKey = "photo-piece-icon";
    else if (dropType === "ticket") textureKey = "ticket-piece-icon";
    else if (dropType === "map") textureKey = "map-piece-icon";
    else if (dropType === "arrow") textureKey = "arrow-bundle";

    const drop = this.scene.physics.add.sprite(x, y - 10, textureKey);
    drop.setDepth(12);
    const dropBody = drop.body as Phaser.Physics.Arcade.Body;
    if (dropBody) {
      dropBody.setAllowGravity(false);
    }

    // Gentle hover animation
    this.scene.tweens.add({
      targets: drop,
      y: y - 22,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Player overlap collection
    const sceneAny = this.scene as unknown as {
      player?: {
        sprite: Phaser.Physics.Arcade.Sprite;
        heal: (amount: number) => void;
        applySpeedBoost: (durationMs: number) => void;
      };
    };

    if (sceneAny.player?.sprite) {
      const overlapCollider = this.scene.physics.add.overlap(
        sceneAny.player.sprite,
        drop,
        () => {
          overlapCollider.destroy();
          SoundEffects.playPickup();

          if (dropType === "photo") {
            PuzzleManager.getInstance().collectPhotoPiece(dropId);
          } else if (dropType === "ticket") {
            PuzzleManager.getInstance().collectTicketPiece(dropId);
          } else if (dropType === "map") {
            PuzzleManager.getInstance().collectMapPiece(dropId);
          } else if (dropType === "heart") {
            sceneAny.player?.heal(30);
            sceneAny.player?.applySpeedBoost(4000);
            EventBus.emit(GAME_EVENTS.NOTIFICATION, "Restored +30 Vitality & Speed Boost!");
          } else if (dropType === "arrow") {
            SaveSystem.addArrows(5);
            EventBus.emit(GAME_EVENTS.NOTIFICATION, "Found 5 Arrows!");
            EventBus.emit(GAME_EVENTS.AMMO_UPDATED, SaveSystem.load()?.arrowCount || 0);
          }

          // Collection effect
          this.scene.tweens.add({
            targets: drop,
            scaleX: 1.6,
            scaleY: 1.6,
            alpha: 0,
            duration: 200,
            onComplete: () => drop.destroy(),
          });
        }
      );
    }
  }

  public getIsDefeated(): boolean {
    return this.isDefeated;
  }
}
