import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "../constants";

export class Arrow extends Phaser.Physics.Arcade.Sprite {
  private isStuck: boolean = false;
  private lifeTimer: number = 4000; // 4 seconds max life

  constructor(scene: Phaser.Scene, x: number, y: number, angleRad: number) {
    super(scene, x, y, "arrow-sprite");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(15);
    this.setSize(24, 6);
    this.setOffset(4, 5);

    const speed = GAME_CONSTANTS.COMBAT.ARROW_SPEED;
    this.setVelocity(Math.cos(angleRad) * speed, Math.sin(angleRad) * speed);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setGravityY(GAME_CONSTANTS.COMBAT.ARROW_GRAVITY_Y);
    }
    this.setRotation(angleRad);
  }

  public updateArrow(delta: number): void {
    if (this.isStuck) return;

    this.lifeTimer -= delta;
    if (this.lifeTimer <= 0) {
      this.destroy();
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body && (Math.abs(body.velocity.x) > 5 || Math.abs(body.velocity.y) > 5)) {
      this.setRotation(Math.atan2(body.velocity.y, body.velocity.x));
    }
  }

  public stick(): void {
    if (this.isStuck) return;
    this.isStuck = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAllowGravity(false);
      body.setEnable(false);
    }

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        if (this.active) {
          this.destroy();
        }
      },
    });
  }

  public getIsStuck(): boolean {
    return this.isStuck;
  }
}
