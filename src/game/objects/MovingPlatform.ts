import * as Phaser from "phaser";

export interface MovingPlatformConfig {
  x: number;
  y: number;
  texture: string;
  axis: "horizontal" | "vertical";
  distance: number;
  speed: number;
}

export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  private axis: "horizontal" | "vertical";
  private startCoord: number;
  private targetCoord: number;
  private moveSpeed: number;
  private movingForward: boolean = true;

  constructor(scene: Phaser.Scene, config: MovingPlatformConfig) {
    super(scene, config.x, config.y, config.texture);

    this.axis = config.axis;
    this.moveSpeed = config.speed;
    this.startCoord = config.axis === "horizontal" ? config.x : config.y;
    this.targetCoord = this.startCoord + config.distance;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.friction.x = 1;
    body.friction.y = 1;

    if (this.axis === "horizontal") {
      body.setVelocityX(this.moveSpeed);
    } else {
      body.setVelocityY(this.moveSpeed);
    }
  }

  public updatePlatform(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.axis === "horizontal") {
      if (this.movingForward && this.x >= this.targetCoord) {
        this.movingForward = false;
        body.setVelocityX(-this.moveSpeed);
      } else if (!this.movingForward && this.x <= this.startCoord) {
        this.movingForward = true;
        body.setVelocityX(this.moveSpeed);
      }
    } else {
      if (this.movingForward && this.y >= this.targetCoord) {
        this.movingForward = false;
        body.setVelocityY(-this.moveSpeed);
      } else if (!this.movingForward && this.y <= this.startCoord) {
        this.movingForward = true;
        body.setVelocityY(this.moveSpeed);
      }
    }
  }
}
