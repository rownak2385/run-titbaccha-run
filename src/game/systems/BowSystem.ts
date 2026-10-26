import * as Phaser from "phaser";
import { Arrow } from "../objects/Arrow";
import { Enemy } from "../objects/Enemy";
import { SaveSystem } from "./SaveSystem";
import { SoundEffects } from "./SoundEffects";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { GAME_CONSTANTS } from "../constants";

export class BowSystem {
  private scene: Phaser.Scene;
  private playerSprite: Phaser.Physics.Arcade.Sprite;
  public arrowsGroup: Phaser.Physics.Arcade.Group;
  private crosshairSprite?: Phaser.GameObjects.Sprite;
  private lastFireTime: number = 0;
  private isEnabled: boolean = false;
  private isCombatAllowed: boolean = true;

  constructor(scene: Phaser.Scene, playerSprite: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.playerSprite = playerSprite;
    this.arrowsGroup = scene.physics.add.group({
      classType: Arrow,
      runChildUpdate: false,
    });

    this.checkBowStatus();

    // Create aiming crosshair sprite
    if (scene.textures.exists("bow-icon")) {
      this.crosshairSprite = scene.add.sprite(0, 0, "bow-icon");
      this.crosshairSprite.setDepth(20);
      this.crosshairSprite.setScale(0.8);
      this.crosshairSprite.setAlpha(0.7);
      this.crosshairSprite.setVisible(this.isEnabled);
    }

    // Pointer input for mouse aiming and left-click shooting
    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptShoot(pointer);
      }
    });

    // Listen for bow acquisition event
    EventBus.on(GAME_EVENTS.BOW_ACQUIRED, () => {
      this.checkBowStatus();
    });
  }

  public setCombatAllowed(allowed: boolean): void {
    this.isCombatAllowed = allowed;
    this.isEnabled = this.isCombatAllowed && Boolean(SaveSystem.load()?.hasBow);
    if (this.crosshairSprite) {
      this.crosshairSprite.setVisible(this.isEnabled);
    }
  }

  public getIsCombatAllowed(): boolean {
    return this.isCombatAllowed;
  }

  public checkBowStatus(): void {
    const save = SaveSystem.load();
    this.isEnabled = Boolean(save?.hasBow) && this.isCombatAllowed;
    if (this.crosshairSprite) {
      this.crosshairSprite.setVisible(this.isEnabled);
    }
  }

  public update(time: number, delta: number): void {
    // Check bow status if recently acquired
    if (!this.isEnabled) {
      this.checkBowStatus();
    }

    // Update crosshair to follow pointer in world coordinates
    const pointer = this.scene.input.activePointer;
    if (pointer && this.crosshairSprite && this.isEnabled) {
      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.crosshairSprite.setPosition(worldPoint.x, worldPoint.y);
    }

    // Update active arrows
    const children = this.arrowsGroup.getChildren() as Arrow[];
    for (let i = children.length - 1; i >= 0; i--) {
      const arrow = children[i];
      if (arrow && arrow.active) {
        arrow.updateArrow(delta);
      }
    }
  }

  public attemptShoot(pointer: Phaser.Input.Pointer): boolean {
    if (!this.isEnabled || !this.isCombatAllowed) return false;

    // Check cooldown
    const now = this.scene.time.now;
    if (now - this.lastFireTime < GAME_CONSTANTS.COMBAT.FIRE_COOLDOWN_MS) {
      return false;
    }

    // World pointer position
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const originX = this.playerSprite.x;
    const originY = this.playerSprite.y - 4;

    const angle = Phaser.Math.Angle.Between(originX, originY, worldPoint.x, worldPoint.y);

    // Consume ammo from SaveSystem
    const consumed = SaveSystem.consumeArrow();
    if (!consumed) {
      SoundEffects.playHazard();
      EventBus.emit(GAME_EVENTS.NOTIFICATION, "Quiver Empty! Search for arrow bundles!");
      return false;
    }

    this.lastFireTime = now;
    SoundEffects.playBowShoot();

    // Spawn Arrow projectile
    const arrow = new Arrow(this.scene, originX, originY, angle);
    this.arrowsGroup.add(arrow);

    const remaining = SaveSystem.load()?.arrowCount || 0;
    EventBus.emit(GAME_EVENTS.AMMO_UPDATED, remaining);

    return true;
  }

  /**
   * Bind collision detection between arrows and static/moving platforms
   */
  public setupPlatformCollisions(platforms: Phaser.Physics.Arcade.StaticGroup | Phaser.Physics.Arcade.Group): void {
    this.scene.physics.add.collider(this.arrowsGroup, platforms, (arrowObj) => {
      const arrow = arrowObj as Arrow;
      if (!arrow.getIsStuck()) {
        arrow.stick();
      }
    });
  }

  /**
   * Bind overlap detection between arrows and hostile enemies
   */
  public setupEnemyCollisions(enemiesGroup: Phaser.Physics.Arcade.Group): void {
    this.scene.physics.add.overlap(this.arrowsGroup, enemiesGroup, (arrowObj, enemyObj) => {
      const arrow = arrowObj as Arrow;
      const enemy = enemyObj as Enemy;

      if (!arrow.getIsStuck() && !enemy.getIsDefeated()) {
        const knockbackDirX = arrow.body?.velocity.x && arrow.body.velocity.x > 0 ? 1 : -1;
        enemy.takeDamage(GAME_CONSTANTS.COMBAT.ARROW_DAMAGE, knockbackDirX);
        arrow.destroy();
      }
    });
  }

  public destroy(): void {
    if (this.crosshairSprite) {
      try {
        this.crosshairSprite.destroy();
      } catch {
        // Ignore if already destroyed
      }
    }
    try {
      if (this.arrowsGroup && this.arrowsGroup.children) {
        this.arrowsGroup.clear(true, true);
      }
    } catch {
      // Group may already be dismantled by scene manager during shutdown
    }
  }
}
