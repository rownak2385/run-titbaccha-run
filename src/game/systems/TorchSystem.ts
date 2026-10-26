import * as Phaser from "phaser";
import { PlayerController } from "./PlayerController";
import { SoundEffects } from "./SoundEffects";
import { EventBus, GAME_EVENTS } from "../EventBus";
import { GAME_CONSTANTS } from "../constants";

export interface SunlightZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class TorchSystem {
  private scene: Phaser.Scene;
  private player: PlayerController;
  private sunlightZones: SunlightZone[] = [];
  private isTorchLit: boolean = true;
  private isInSunlight: boolean = false;
  private drainTimer: number = GAME_CONSTANTS.TORCH.VITALITY_DRAIN_INTERVAL_MS;

  // Visual darkness overlay
  private darknessRt: Phaser.GameObjects.RenderTexture;
  private lightBrush: Phaser.GameObjects.Image;
  private sunBrush: Phaser.GameObjects.Image;
  private dimBrush: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, player: PlayerController, sunlightZones: SunlightZone[]) {
    this.scene = scene;
    this.player = player;
    this.sunlightZones = sunlightZones;

    // Create render texture matching viewport
    this.darknessRt = scene.add
      .renderTexture(0, 0, GAME_CONSTANTS.LOGICAL_WIDTH, GAME_CONSTANTS.LOGICAL_HEIGHT)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(25);

    // Prepare light brushes for erase blend mode
    this.lightBrush = scene.make.image({ key: "torch-light-mask", add: false });
    this.sunBrush = scene.make.image({ key: "sunlight-light-mask", add: false });
    this.dimBrush = scene.make.image({ key: "dim-light-mask", add: false });

    // Keyboard toggle for torch (F key or T key)
    scene.input.keyboard?.on("keydown-F", () => this.toggleTorch());
    scene.input.keyboard?.on("keydown-T", () => this.toggleTorch());

    // Listen to EventBus for UI button toggle
    EventBus.on(GAME_EVENTS.TORCH_TOGGLED, (forceState?: boolean) => {
      if (typeof forceState === "boolean") {
        this.setTorchState(forceState);
      } else {
        this.toggleTorch();
      }
    });

    // Notify player on init
    EventBus.emit(
      GAME_EVENTS.NOTIFICATION,
      "🔦 Cave is dark! Press [F] to toggle Torch. Stay in sunlight zones to conserve vitality!"
    );
  }

  public toggleTorch(): void {
    this.setTorchState(!this.isTorchLit);
  }

  public setTorchState(lit: boolean): void {
    this.isTorchLit = lit;
    SoundEffects.playTorchToggle();
    EventBus.emit(
      GAME_EVENTS.NOTIFICATION,
      this.isTorchLit ? "🔦 Torch Lit (Vitality drains in deep dark)" : "🌑 Torch Extinguished (Darkness descends)"
    );
  }

  public isLit(): boolean {
    return this.isTorchLit;
  }

  public getInSunlight(): boolean {
    return this.isInSunlight;
  }

  public update(_time: number, delta: number): void {
    const playerX = this.player.sprite.x;
    const playerY = this.player.sprite.y;

    // Check if player is inside any sunlight zone
    let inSun = false;
    for (const zone of this.sunlightZones) {
      if (
        playerX >= zone.x &&
        playerX <= zone.x + zone.width &&
        playerY >= zone.y &&
        playerY <= zone.y + zone.height
      ) {
        inSun = true;
        break;
      }
    }

    if (inSun !== this.isInSunlight) {
      this.isInSunlight = inSun;
      if (inSun) {
        EventBus.emit(GAME_EVENTS.SUNLIGHT_ENTERED);
        EventBus.emit(GAME_EVENTS.NOTIFICATION, "☀️ Sunlight Safe Zone! Vitality is safe here.");
      } else {
        EventBus.emit(GAME_EVENTS.SUNLIGHT_EXITED);
      }
    }

    // Handle vitality drain when torch is lit in dark areas
    if (this.isTorchLit && !this.isInSunlight) {
      this.drainTimer -= delta;
      if (this.drainTimer <= 0) {
        this.drainTimer = GAME_CONSTANTS.TORCH.VITALITY_DRAIN_INTERVAL_MS;
        // Direct non-knockback vitality drain
        const currentHp = this.player.getHealth();
        if (currentHp > 1) {
          this.player.setHealth(currentHp - GAME_CONSTANTS.TORCH.VITALITY_DRAIN_AMOUNT);
        }
      }
    } else {
      this.drainTimer = GAME_CONSTANTS.TORCH.VITALITY_DRAIN_INTERVAL_MS;
    }

    // Render darkness layer with light cutout
    this.renderDarkness();
  }

  private renderDarkness(): void {
    this.darknessRt.clear();
    // Fill with deep cavern shadow
    this.darknessRt.fill(0x06060c, 0.94);

    const camera = this.scene.cameras.main;
    const screenX = this.player.sprite.x - camera.scrollX;
    const screenY = this.player.sprite.y - camera.scrollY;

    // Also draw static sunlight beams on screen if visible
    for (const zone of this.sunlightZones) {
      const zoneScreenX = zone.x + zone.width / 2 - camera.scrollX;
      const zoneScreenY = zone.y + zone.height / 2 - camera.scrollY;
      if (
        zoneScreenX > -200 &&
        zoneScreenX < GAME_CONSTANTS.LOGICAL_WIDTH + 200 &&
        zoneScreenY > -200 &&
        zoneScreenY < GAME_CONSTANTS.LOGICAL_HEIGHT + 200
      ) {
        this.darknessRt.erase(this.sunBrush, zoneScreenX, zoneScreenY);
      }
    }

    // Cutout around player
    if (this.isInSunlight) {
      this.darknessRt.erase(this.sunBrush, screenX, screenY);
    } else if (this.isTorchLit) {
      this.darknessRt.erase(this.lightBrush, screenX, screenY);
    } else {
      // Dim silhouette brush when torch is off so player isn't completely blind
      this.darknessRt.erase(this.dimBrush, screenX, screenY);
    }
  }

  public destroy(): void {
    try {
      this.darknessRt?.destroy();
      this.lightBrush?.destroy();
      this.sunBrush?.destroy();
      this.dimBrush?.destroy();
    } catch {
      // Scene manager may have already destroyed textures during shutdown
    }
  }
}
