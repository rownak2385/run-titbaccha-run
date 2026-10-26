import * as Phaser from "phaser";

/**
 * Procedural Asset Generator for "Run Titibaccha, Run!"
 * Generates all original geometric placeholder assets with a cohesive
 * destroyed-garden fantasy aesthetic (scorched earth, lush remnants, stone ruins).
 * Also serves as the robust fallback for the character sprite pipeline.
 */
export class AssetGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    this.createChickSprites(scene);
    this.createRonnySprites(scene);
    this.createFoxSprites(scene);
    this.createEnvironmentTextures(scene);
    this.createObjectTextures(scene);
    this.createChapters234Textures(scene);
    this.createChapters567Textures(scene);
  }

  /**
   * Titibaccha Sprite Frames:
   * idle, run-1, run-2, jump, fall, hurt
   */
  private static createChickSprites(scene: Phaser.Scene): void {
    const size = 48;

    const drawBaseChick = (
      g: Phaser.GameObjects.Graphics,
      footOffsetY1: number,
      footOffsetY2: number,
      bodyTilt: number = 0,
      isHurt: boolean = false
    ) => {
      g.clear();

      // Shadow under feet
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(24, 45, 26, 6);

      // Feet (Orange)
      g.fillStyle(0xff6f00, 1);
      g.fillRect(16, 38 + footOffsetY1, 6, 6);
      g.fillTriangle(14, 44 + footOffsetY1, 24, 44 + footOffsetY1, 19, 41 + footOffsetY1);
      g.fillRect(26, 38 + footOffsetY2, 6, 6);
      g.fillTriangle(24, 44 + footOffsetY2, 34, 44 + footOffsetY2, 29, 41 + footOffsetY2);

      // Plump Yellow Body
      g.fillStyle(isHurt ? 0xff8a80 : 0xfbc02d, 1);
      g.lineStyle(2, isHurt ? 0xb71c1c : 0xe65100, 0.8);
      g.fillCircle(24, 25 + bodyTilt, 16);
      g.strokeCircle(24, 25 + bodyTilt, 16);

      // Belly highlight
      g.fillStyle(isHurt ? 0xffcdd2 : 0xfff59d, 0.9);
      g.fillCircle(21, 27 + bodyTilt, 11);

      // Wing (Cream feather)
      g.fillStyle(0xfff9c4, 1);
      g.lineStyle(1.5, 0xf57f17, 0.7);
      g.fillEllipse(18, 26 + bodyTilt, 12, 8);
      g.strokeEllipse(18, 26 + bodyTilt, 12, 8);

      // Eye
      if (isHurt) {
        // Hurt squint eye (X)
        g.lineStyle(2, 0x212121, 1);
        g.lineBetween(28, 19 + bodyTilt, 33, 23 + bodyTilt);
        g.lineBetween(33, 19 + bodyTilt, 28, 23 + bodyTilt);
      } else {
        // Alert dark eye with cute white shine dot
        g.fillStyle(0x212121, 1);
        g.fillCircle(30, 21 + bodyTilt, 3.5);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(31, 20 + bodyTilt, 1.2);
      }

      // Small Orange Beak
      g.fillStyle(0xff5722, 1);
      g.lineStyle(1, 0xbf360c, 1);
      g.beginPath();
      g.moveTo(37, 21 + bodyTilt);
      g.lineTo(45, 24 + bodyTilt);
      g.lineTo(37, 27 + bodyTilt);
      g.closePath();
      g.fillPath();
      g.strokePath();

      // Top feather crest
      g.fillStyle(0xfbc02d, 1);
      g.fillTriangle(23, 8 + bodyTilt, 27, 8 + bodyTilt, 25, 4 + bodyTilt);
    };

    if (!scene.textures.exists("titibaccha-idle")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, 0, 0, 0, false);
      g.generateTexture("titibaccha-idle", size, size);
      g.destroy();
    }

    if (!scene.textures.exists("titibaccha-run-1")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, -3, 2, 1, false);
      g.generateTexture("titibaccha-run-1", size, size);
      g.destroy();
    }

    if (!scene.textures.exists("titibaccha-run-2")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, 2, -3, 0, false);
      g.generateTexture("titibaccha-run-2", size, size);
      g.destroy();
    }

    if (!scene.textures.exists("titibaccha-jump")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.clear();
      g.fillStyle(0xfbc02d, 1);
      g.lineStyle(2, 0xe65100, 0.8);
      g.fillCircle(24, 21, 15);
      g.strokeCircle(24, 21, 15);
      g.fillStyle(0xfff9c4, 1);
      g.fillEllipse(17, 14, 10, 14);
      g.fillStyle(0x212121, 1);
      g.fillCircle(30, 18, 3.5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(31, 17, 1.2);
      g.fillStyle(0xff5722, 1);
      g.fillTriangle(36, 18, 44, 21, 36, 24);
      g.fillStyle(0xff6f00, 1);
      g.fillRect(16, 32, 6, 5);
      g.fillRect(26, 32, 6, 5);
      g.generateTexture("titibaccha-jump", size, size);
      g.destroy();
    }

    if (!scene.textures.exists("titibaccha-fall")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, 4, 4, -2, false);
      g.generateTexture("titibaccha-fall", size, size);
      g.destroy();
    }

    if (!scene.textures.exists("titibaccha-hurt")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, 2, 2, 0, true);
      g.generateTexture("titibaccha-hurt", size, size);
      g.destroy();
    }

    // 7. Eating Frame (Head low pecking at ground)
    if (!scene.textures.exists("titibaccha-eating")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.clear();
      // Feet
      g.fillStyle(0xff6f00, 1);
      g.fillRect(16, 38, 6, 6);
      g.fillRect(26, 38, 6, 6);
      // Body tilted down forward
      g.fillStyle(0xfbc02d, 1);
      g.lineStyle(2, 0xe65100, 0.8);
      g.fillCircle(24, 28, 16);
      g.strokeCircle(24, 28, 16);
      // Wing
      g.fillStyle(0xfff9c4, 1);
      g.fillEllipse(17, 28, 11, 7);
      // Eye looking down
      g.fillStyle(0x212121, 1);
      g.fillCircle(30, 27, 3);
      // Beak pointed toward ground
      g.fillStyle(0xff5722, 1);
      g.fillTriangle(35, 30, 42, 38, 32, 35);
      // Pecked seeds
      g.fillStyle(0xffd54f, 1);
      g.fillCircle(43, 40, 2);
      g.generateTexture("titibaccha-eating", size, size);
      g.destroy();
    }

    // 8. Shooting Frame (Future chapter slingshot / bow preparation)
    if (!scene.textures.exists("titibaccha-shooting")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, 0, 0, 0, false);
      // Tiny wooden slingshot/bow held in wing
      g.lineStyle(2, 0x8d6e63, 1);
      g.beginPath();
      g.arc(38, 22, 8, -Math.PI * 0.4, Math.PI * 0.4);
      g.strokePath();
      // Bowstring
      g.lineStyle(1, 0xffffff, 0.9);
      g.lineBetween(36, 15, 36, 29);
      g.generateTexture("titibaccha-shooting", size, size);
      g.destroy();
    }

    // 9. Happy Expression (Smiling ^ ^ eyes and fluttering wing)
    if (!scene.textures.exists("titibaccha-happy")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.clear();
      // Feet
      g.fillStyle(0xff6f00, 1);
      g.fillRect(16, 36, 6, 8);
      g.fillRect(26, 36, 6, 8);
      // Body
      g.fillStyle(0xfbc02d, 1);
      g.lineStyle(2, 0xe65100, 0.8);
      g.fillCircle(24, 23, 16);
      g.strokeCircle(24, 23, 16);
      // Cheerful wing
      g.fillStyle(0xfff9c4, 1);
      g.fillEllipse(16, 17, 10, 12);
      // Beak smiling open
      g.fillStyle(0xff5722, 1);
      g.fillTriangle(37, 21, 45, 24, 37, 26);
      // Happy curved eye (^ ^)
      g.lineStyle(2, 0x212121, 1);
      g.beginPath();
      g.arc(30, 21, 3, Math.PI, 0, false);
      g.strokePath();
      // Rosy cheek
      g.fillStyle(0xff8a80, 0.8);
      g.fillCircle(27, 26, 4);
      g.generateTexture("titibaccha-happy", size, size);
      g.destroy();
    }

    // 10. Sad Expression (Drooped head and small blue teardrop)
    if (!scene.textures.exists("titibaccha-sad")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawBaseChick(g, 1, 1, 3, false);
      // Blue teardrop
      g.fillStyle(0x42a5f5, 1);
      g.beginPath();
      g.arc(31, 28, 2.5, 0, Math.PI * 2);
      g.moveTo(31, 24);
      g.lineTo(33.5, 28);
      g.lineTo(28.5, 28);
      g.closePath();
      g.fillPath();
      g.generateTexture("titibaccha-sad", size, size);
      g.destroy();
    }
  }

  /**
   * Ronny Sprite Frames:
   * ronny-idle, ronny-waiting, ronny-sad, ronny-walk-1, ronny-walk-2, etc.
   * Rendered on 192x192 canvas with feet grounded at y = 176px to match production frames.
   * Palette: Cream shirt, muted blue shorts, brown shoes, and emerald green leaf pendant.
   */
  private static createRonnySprites(scene: Phaser.Scene): void {
    const w = 192;
    const h = 192;

    const drawBaseRonny = (
      canvas: HTMLCanvasElement,
      pose:
        | "idle"
        | "waiting"
        | "sad"
        | "walk1"
        | "walk2"
        | "feeding"
        | "surprised"
        | "running"
        | "hugging"
    ) => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);

      // Baseline grounded at y = 176, horizontal center at x = 96
      const cx = 96;

      // 1. Soft ground contact shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(cx, 175, 32, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Brown Shoes (grounded at y = 176)
      ctx.fillStyle = "#4e342e";
      if (pose === "walk1") {
        ctx.fillRect(cx - 18, 160, 14, 16);
        ctx.fillRect(cx + 4, 154, 14, 18);
      } else if (pose === "walk2") {
        ctx.fillRect(cx - 20, 154, 14, 18);
        ctx.fillRect(cx + 4, 160, 14, 16);
      } else if (pose === "running") {
        ctx.fillRect(cx - 24, 156, 16, 16);
        ctx.fillRect(cx + 8, 150, 16, 18);
      } else if (pose === "sad") {
        ctx.fillRect(cx - 14, 160, 13, 16);
        ctx.fillRect(cx + 1, 160, 13, 16);
      } else {
        ctx.fillRect(cx - 16, 160, 14, 16);
        ctx.fillRect(cx + 2, 160, 14, 16);
      }

      // 3. Legs (Skin tone)
      ctx.fillStyle = "#fed7aa";
      ctx.fillRect(cx - 14, 146, 10, 16);
      ctx.fillRect(cx + 4, 146, 10, 16);

      // 4. Muted Blue Shorts
      ctx.fillStyle = "#3b5998";
      ctx.fillRect(cx - 18, 118, 36, 30);
      ctx.fillStyle = "#2d4373";
      ctx.fillRect(cx - 2, 128, 4, 20); // Inseam shadow

      // 5. Cream Shirt (Torso)
      ctx.fillStyle = "#fff8e7";
      ctx.beginPath();
      ctx.moveTo(cx - 22, 68);
      ctx.lineTo(cx + 22, 68);
      ctx.lineTo(cx + 20, 122);
      ctx.lineTo(cx - 20, 122);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e2d7c0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 6. Arms & Hands
      ctx.fillStyle = "#fed7aa";
      if (pose === "waiting") {
        // Hands holding warm golden bowl of chick feed
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(cx - 28, 72, 12, 28); // Left sleeve
        ctx.fillRect(cx + 16, 72, 12, 28); // Right sleeve
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(cx - 24, 98, 10, 14);
        ctx.fillRect(cx + 14, 98, 10, 14);

        // Wooden grain bowl
        ctx.fillStyle = "#6d4c41";
        ctx.beginPath();
        ctx.arc(cx, 106, 18, 0, Math.PI);
        ctx.fill();
        // Warm golden chick feed
        ctx.fillStyle = "#fbc02d";
        ctx.beginPath();
        ctx.ellipse(cx, 104, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff59d";
        ctx.fillRect(cx - 6, 101, 4, 2);
        ctx.fillRect(cx + 2, 102, 3, 2);
      } else if (pose === "feeding") {
        // Kneeling stoop scattering seeds forward
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(cx + 10, 96, 26, 10);
        // Scoop and spilling seeds
        ctx.fillStyle = "#8d6e63";
        ctx.beginPath();
        ctx.arc(cx + 36, 102, 7, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#fbc02d";
        ctx.fillRect(cx + 42, 108, 4, 4);
        ctx.fillRect(cx + 48, 116, 3, 3);
        ctx.fillRect(cx + 54, 124, 3, 3);
      } else if (pose === "surprised") {
        // Arms thrown up in alarm
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(cx - 30, 64, 12, 24);
        ctx.fillRect(cx + 18, 64, 12, 24);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(cx - 32, 54, 12, 12);
        ctx.fillRect(cx + 20, 54, 12, 12);
      } else if (pose === "sad") {
        // Shoulders drooped, hands limp at sides, dropped feed bowl on grass
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(cx - 24, 76, 10, 32);
        ctx.fillRect(cx + 14, 76, 10, 32);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(cx - 23, 108, 8, 14);
        ctx.fillRect(cx + 15, 108, 8, 14);

        // Dropped wooden bowl on ground
        ctx.fillStyle = "#6d4c41";
        ctx.beginPath();
        ctx.arc(cx + 26, 172, 9, 0, Math.PI);
        ctx.fill();
        // Spilled seeds
        ctx.fillStyle = "#fbc02d";
        ctx.fillRect(cx + 20, 173, 3, 2);
        ctx.fillRect(cx + 34, 174, 3, 2);
        ctx.fillRect(cx + 39, 175, 2, 2);
      } else if (pose === "walk1" || pose === "walk2") {
        // Arms swinging during walk
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(cx - 24, 72, 10, 30);
        ctx.fillRect(cx + 14, 72, 10, 30);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(cx - 23, 102, 8, 12);
        ctx.fillRect(cx + 15, 102, 8, 12);
      } else {
        // Relaxed idle arms
        ctx.fillStyle = "#fff8e7";
        ctx.fillRect(cx - 24, 70, 10, 32);
        ctx.fillRect(cx + 14, 70, 10, 32);
        ctx.fillStyle = "#fed7aa";
        ctx.fillRect(cx - 23, 102, 8, 14);
        ctx.fillRect(cx + 15, 102, 8, 14);
      }

      // 7. Green Leaf Pendant Necklace (Approved Emerald Green)
      ctx.strokeStyle = "#4e342e"; // Cord
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 10, 68);
      ctx.quadraticCurveTo(cx, 88, cx + 10, 68);
      ctx.stroke();

      // Leaf pendant
      ctx.fillStyle = "#2e7d32";
      ctx.beginPath();
      ctx.ellipse(cx, 87, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#43a047";
      ctx.beginPath();
      ctx.ellipse(cx - 1, 86, 3, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // 8. Head & Neck
      ctx.fillStyle = "#fed7aa";
      ctx.fillRect(cx - 8, 54, 16, 16); // Neck

      // Head
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      const headY = pose === "sad" ? 44 : 38;
      ctx.arc(cx, headY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Big prominent ears
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(cx - 22, headY, 7, 0, Math.PI * 2);
      ctx.arc(cx + 22, headY, 7, 0, Math.PI * 2);
      ctx.fill();

      // 9. Hair (Warm Dark Brown)
      ctx.fillStyle = "#3e2723";
      ctx.beginPath();
      ctx.arc(cx, headY - 4, 23, Math.PI * 0.85, Math.PI * 2.15);
      ctx.lineTo(cx + 22, headY);
      ctx.lineTo(cx - 22, headY);
      ctx.closePath();
      ctx.fill();

      // Hair tufts
      ctx.beginPath();
      ctx.moveTo(cx - 14, headY - 18);
      ctx.lineTo(cx - 4, headY - 28);
      ctx.lineTo(cx + 6, headY - 20);
      ctx.lineTo(cx + 16, headY - 26);
      ctx.lineTo(cx + 18, headY - 14);
      ctx.closePath();
      ctx.fill();

      // 10. Facial Expressions
      if (pose === "sad") {
        // Downcast sad eyes and drooped mouth
        ctx.strokeStyle = "#3e2723";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, headY + 2);
        ctx.lineTo(cx - 4, headY + 5);
        ctx.moveTo(cx + 4, headY + 5);
        ctx.lineTo(cx + 12, headY + 2);
        ctx.stroke();

        // Drooped sorrowful mouth
        ctx.beginPath();
        ctx.arc(cx, headY + 16, 5, Math.PI * 1.1, Math.PI * 1.9, false);
        ctx.stroke();

        // Teardrop
        ctx.fillStyle = "#42a5f5";
        ctx.beginPath();
        ctx.arc(cx + 10, headY + 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (pose === "surprised") {
        // Big round surprised eyes and open O mouth
        ctx.fillStyle = "#212121";
        ctx.beginPath();
        ctx.arc(cx - 8, headY + 2, 4, 0, Math.PI * 2);
        ctx.arc(cx + 8, headY + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 9, headY + 1, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 7, headY + 1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Open mouth
        ctx.fillStyle = "#d32f2f";
        ctx.beginPath();
        ctx.ellipse(cx, headY + 14, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (pose === "walk1" || pose === "walk2") {
        // Facing away slightly into wilderness
        ctx.fillStyle = "#3e2723";
        ctx.beginPath();
        ctx.arc(cx, headY, 21, 0, Math.PI * 2);
        ctx.fill(); // Back of head
      } else {
        // Friendly open eyes and gentle smile
        ctx.fillStyle = "#212121";
        ctx.beginPath();
        ctx.arc(cx - 7, headY + 2, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 7, headY + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx - 8, headY + 1, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + 6, headY + 1, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Cheerful smile
        ctx.strokeStyle = "#3e2723";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, headY + 9, 6, 0.2, Math.PI - 0.2, false);
        ctx.stroke();
      }
    };

    const poses: (
      | "idle"
      | "waiting"
      | "feeding"
      | "surprised"
      | "sad"
      | "walk1"
      | "walk2"
      | "running"
      | "hugging"
    )[] = [
      "idle",
      "waiting",
      "feeding",
      "surprised",
      "sad",
      "walk1",
      "walk2",
      "running",
      "hugging",
    ];
    poses.forEach((p) => {
      const key = `ronny-${p}`;
      if (!scene.textures.exists(key)) {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        drawBaseRonny(c, p);
        scene.textures.addCanvas(key, c);
      }
    });
  }

  /**
   * Fox Sprite Frames:
   * fox-idle, fox-walking, fox-attract, fox-eating, fox-deceptive
   * Rendered on 192x192 canvas with paws grounded at y = 176px to match production frames.
   * Palette: Rich rust orange coat, cream muzzle/white chest, amber slit eyes, white-tipped bushy tail.
   */
  private static createFoxSprites(scene: Phaser.Scene): void {
    const w = 192;
    const h = 192;

    const drawBaseFox = (
      canvas: HTMLCanvasElement,
      pose: "idle" | "walking" | "attract" | "eating" | "deceptive"
    ) => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);

      const cx = 96;

      // 1. Soft ground contact shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(cx, 175, 48, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Large Bushy Tail (Rust Orange + White tip)
      ctx.fillStyle = "#d84315";
      ctx.beginPath();
      ctx.moveTo(cx - 32, 142);
      ctx.quadraticCurveTo(cx - 72, 110, cx - 64, 75);
      ctx.quadraticCurveTo(cx - 40, 85, cx - 18, 128);
      ctx.closePath();
      ctx.fill();

      // Prominent white tail tip
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(cx - 64, 75);
      ctx.quadraticCurveTo(cx - 74, 98, cx - 52, 98);
      ctx.closePath();
      ctx.fill();

      // 3. Black Paws (grounded at y = 176)
      ctx.fillStyle = "#212121";
      if (pose === "walking") {
        ctx.fillRect(cx - 26, 160, 10, 16);
        ctx.fillRect(cx - 4, 154, 10, 22);
        ctx.fillRect(cx + 14, 160, 10, 16);
        ctx.fillRect(cx + 34, 154, 10, 22);
      } else {
        ctx.fillRect(cx - 22, 162, 10, 14);
        ctx.fillRect(cx - 6, 162, 10, 14);
        ctx.fillRect(cx + 18, 162, 10, 14);
        ctx.fillRect(cx + 32, 162, 10, 14);
      }

      // 4. Sleek Rust Orange Body
      ctx.fillStyle = "#e64a19";
      ctx.beginPath();
      ctx.ellipse(cx + 6, 138, 38, 22, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // 5. White / Cream Chest Fur & Underbelly
      ctx.fillStyle = "#fff8e7";
      ctx.beginPath();
      ctx.ellipse(cx + 26, 136, 16, 18, 0.25, 0, Math.PI * 2);
      ctx.fill();

      // 6. Fox Head & Snout
      ctx.fillStyle = "#e64a19";
      ctx.beginPath();
      ctx.moveTo(cx + 26, 112);
      ctx.lineTo(cx + 68, 122); // Snout tip
      ctx.lineTo(cx + 32, 142);
      ctx.closePath();
      ctx.fill();

      // Cream lower muzzle
      ctx.fillStyle = "#fff8e7";
      ctx.beginPath();
      ctx.moveTo(cx + 36, 126);
      ctx.lineTo(cx + 66, 124);
      ctx.lineTo(cx + 38, 140);
      ctx.closePath();
      ctx.fill();

      // Black nose tip
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.arc(cx + 68, 122, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 7. Pointed Ears
      ctx.fillStyle = "#bf360c";
      ctx.beginPath();
      ctx.moveTo(cx + 22, 104);
      ctx.lineTo(cx + 16, 72);
      ctx.lineTo(cx + 38, 92);
      ctx.closePath();
      ctx.fill();
      // Black ear tip
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.moveTo(cx + 16, 72);
      ctx.lineTo(cx + 22, 78);
      ctx.lineTo(cx + 18, 86);
      ctx.closePath();
      ctx.fill();

      // Second ear
      ctx.fillStyle = "#d84315";
      ctx.beginPath();
      ctx.moveTo(cx + 36, 100);
      ctx.lineTo(cx + 40, 76);
      ctx.lineTo(cx + 50, 96);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.moveTo(cx + 40, 76);
      ctx.lineTo(cx + 44, 82);
      ctx.lineTo(cx + 41, 88);
      ctx.closePath();
      ctx.fill();

      // 8. Expressive Amber Eyes & Facial Features
      if (pose === "deceptive") {
        // Cunning winking slit eye and crooked smirk
        ctx.strokeStyle = "#ffb300";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx + 34, 114);
        ctx.lineTo(cx + 46, 112);
        ctx.stroke();

        // Sly smirk
        ctx.strokeStyle = "#212121";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + 52, 128, 6, 0.1, Math.PI * 0.7, false);
        ctx.stroke();
      } else {
        // Piercing amber eye with vertical black slit pupil
        ctx.fillStyle = "#ffb300";
        ctx.beginPath();
        ctx.ellipse(cx + 38, 114, 5, 3.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#212121";
        ctx.fillRect(cx + 37.5, 111.5, 2, 5); // Slit pupil
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx + 36, 113, 1.5, 1.5); // Specular highlight
      }

      // 9. Pose Specials (Golden Bait Berries)
      if (pose === "attract") {
        // Front paw extended nudging glowing golden berries
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath();
        ctx.arc(cx + 74, 168, 7, 0, Math.PI * 2);
        ctx.arc(cx + 83, 167, 5, 0, Math.PI * 2);
        ctx.arc(cx + 78, 161, 4, 0, Math.PI * 2);
        ctx.fill();

        // Glowing magical aura & sparkles
        ctx.fillStyle = "rgba(255, 238, 88, 0.4)";
        ctx.beginPath();
        ctx.arc(cx + 78, 166, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx + 72, 164, 3, 3);
        ctx.fillRect(cx + 82, 163, 2, 2);
      } else if (pose === "eating") {
        // Feasting on berries
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath();
        ctx.arc(cx + 56, 136, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const poses: ("idle" | "walking" | "attract" | "eating" | "deceptive")[] = [
      "idle",
      "walking",
      "attract",
      "eating",
      "deceptive",
    ];
    poses.forEach((p) => {
      const key = `fox-${p}`;
      if (!scene.textures.exists(key)) {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        drawBaseFox(c, p);
        scene.textures.addCanvas(key, c);
      }
    });
  }

  /**
   * Environment Textures for Destroyed Garden:
   * Sky, midground hills, ground, broken platforms, stone bridge, moving slabs
   */
  private static createEnvironmentTextures(scene: Phaser.Scene): void {
    // 1. Far Sky & Clouds Parallax Layer (1280 x 720)
    if (!scene.textures.exists("garden-sky-bg")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;

      const skyGradient = ctx.createLinearGradient(0, 0, 0, 720);
      skyGradient.addColorStop(0, "#607d8b"); // Muted slate-blue post-meteor atmosphere
      skyGradient.addColorStop(0.45, "#90a4ae");
      skyGradient.addColorStop(0.8, "#ffe082"); // Morning sun breaking through
      skyGradient.addColorStop(1, "#cfd8dc");
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, 1280, 720);

      // Sun
      const sunGradient = ctx.createRadialGradient(240, 140, 10, 240, 140, 100);
      sunGradient.addColorStop(0, "rgba(255, 253, 231, 0.95)");
      sunGradient.addColorStop(0.4, "rgba(255, 224, 130, 0.5)");
      sunGradient.addColorStop(1, "rgba(255, 224, 130, 0)");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(240, 140, 100, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 28 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 30 * scale, cy - 10 * scale, 35 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 70 * scale, cy, 26 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 40 * scale, cy + 12 * scale, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
      };

      drawCloud(140, 160, 1.2);
      drawCloud(560, 130, 1.0);
      drawCloud(940, 190, 1.4);
      scene.textures.addCanvas("garden-sky-bg", canvas);
    }

    // 2. Midground Parallax Layer: Destroyed Hills & Damaged Fences
    if (!scene.textures.exists("garden-hills-mid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;

      // Distant rolling green hills (Seamlessly looping at 1280px boundary)
      ctx.fillStyle = "#689f38";
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(0, 210);
      ctx.bezierCurveTo(320, 160, 640, 260, 960, 170);
      ctx.bezierCurveTo(1120, 130, 1200, 240, 1280, 210);
      ctx.lineTo(1280, 400);
      ctx.closePath();
      ctx.fill();

      // Foreground destroyed picket fence
      ctx.fillStyle = "#e0e0e0";
      for (let x = 20; x < 1280; x += 40) {
        // Vary heights to show broken / tilted fence posts
        const tilt = ((x % 80) - 40) * 0.05;
        ctx.save();
        ctx.translate(x, 280);
        ctx.rotate(tilt);
        ctx.fillRect(-5, 0, 10, 45);
        ctx.restore();
      }
      scene.textures.addCanvas("garden-hills-mid", canvas);
    }

    // 3. Ground Tile (64 x 64) with grass top and loam
    if (!scene.textures.exists("garden-ground")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#4e342e";
      ctx.fillRect(0, 0, 64, 64);

      // Soil texture flecks
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(10, 22, 8, 4);
      ctx.fillRect(38, 36, 10, 5);
      ctx.fillRect(22, 50, 7, 5);

      // Top Grass
      ctx.fillStyle = "#388e3c";
      ctx.fillRect(0, 0, 64, 14);
      ctx.fillStyle = "#4caf50";
      for (let i = 0; i < 64; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 14);
        ctx.lineTo(i + 3, 2);
        ctx.lineTo(i + 6, 14);
        ctx.closePath();
        ctx.fill();
      }
      scene.textures.addCanvas("garden-ground", canvas);
    }

    // 4. Wooden Planter / Trellis Platform (200 x 32)
    if (!scene.textures.exists("garden-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(0, 0, 200, 32);
      ctx.fillStyle = "#a1887f";
      ctx.fillRect(2, 2, 196, 4);
      ctx.fillStyle = "#4e342e";
      ctx.fillRect(0, 30, 200, 2);

      // Trellis marks
      ctx.strokeStyle = "#5d4037";
      ctx.lineWidth = 2;
      for (let x = 20; x < 200; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 6);
        ctx.lineTo(x + 15, 26);
        ctx.moveTo(x + 15, 6);
        ctx.lineTo(x, 26);
        ctx.stroke();
      }
      scene.textures.addCanvas("garden-platform", canvas);
    }

    // 5. Cracked Stone Platform / Bridge Slab (180 x 30)
    if (!scene.textures.exists("stone-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 30;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#78909c";
      ctx.fillRect(0, 0, 180, 30);
      ctx.fillStyle = "#90a4ae";
      ctx.fillRect(2, 2, 176, 4);
      ctx.fillStyle = "#455a64";
      ctx.fillRect(0, 27, 180, 3);

      // Cracks in stone
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 4);
      ctx.lineTo(55, 18);
      ctx.lineTo(70, 26);
      ctx.moveTo(120, 6);
      ctx.lineTo(135, 24);
      ctx.stroke();

      scene.textures.addCanvas("stone-platform", canvas);
    }

    // 6. Fallen Tree Trunk Ramp / Platform (240 x 36)
    if (!scene.textures.exists("log-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#5d4037";
      ctx.beginPath();
      ctx.roundRect(0, 4, 240, 28, 8);
      ctx.fill();

      // Bark rings & texture
      ctx.fillStyle = "#4e342e";
      for (let x = 20; x < 230; x += 35) {
        ctx.fillRect(x, 6, 8, 24);
      }
      // Green moss patch
      ctx.fillStyle = "#66bb6a";
      ctx.fillRect(30, 4, 45, 6);
      ctx.fillRect(140, 4, 30, 5);

      scene.textures.addCanvas("log-platform", canvas);
    }
  }

  /**
   * Objects: Heart, Brambles, Checkpoint (Sun-Dial & Stone Lantern), Chest, Supplies
   */
  private static createObjectTextures(scene: Phaser.Scene): void {
    // 1. Garden Heart Pickup (32 x 32)
    if (!scene.textures.exists("garden-heart")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff1744, 1);
      g.lineStyle(2, 0xffffff, 0.9);
      g.beginPath();
      g.moveTo(16, 26);
      g.lineTo(6, 14);
      g.arc(11, 10, 5.5, Math.PI * 0.8, 0, false);
      g.arc(21, 10, 5.5, Math.PI, Math.PI * 0.2, false);
      g.lineTo(16, 26);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(11, 9, 2);
      g.generateTexture("garden-heart", 32, 32);
      g.destroy();
    }

    // 2. Garden Brambles Hazard (64 x 36)
    if (!scene.textures.exists("garden-hazard")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;

      ctx.strokeStyle = "#3e2723";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(4, 36);
      ctx.bezierCurveTo(16, 10, 24, 28, 40, 8);
      ctx.bezierCurveTo(48, 20, 56, 12, 60, 36);
      ctx.stroke();

      ctx.fillStyle = "#c2185b";
      const drawThorn = (tx: number, ty: number, angle: number) => {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-4, 7);
        ctx.lineTo(4, 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      drawThorn(18, 18, -0.6);
      drawThorn(28, 14, 0.5);
      drawThorn(38, 11, -0.4);
      drawThorn(48, 20, 0.7);
      scene.textures.addCanvas("garden-hazard", canvas);
    }

    // 3. Sun-Dial Checkpoint - Inactive (44 x 60)
    if (!scene.textures.exists("sundial-off")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;

      // Stone pedestal
      ctx.fillStyle = "#78909c";
      ctx.fillRect(8, 40, 28, 20);
      ctx.fillRect(14, 18, 16, 24);
      // Dial plate
      ctx.fillStyle = "#546e7a";
      ctx.beginPath();
      ctx.ellipse(22, 18, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Gnomon needle
      ctx.fillStyle = "#37474f";
      ctx.beginPath();
      ctx.moveTo(22, 18);
      ctx.lineTo(26, 4);
      ctx.lineTo(22, 8);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("sundial-off", canvas);
    }

    // 4. Sun-Dial Checkpoint - Active (44 x 60 with bright golden solar gleam)
    if (!scene.textures.exists("sundial-on")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#90a4ae";
      ctx.fillRect(8, 40, 28, 20);
      ctx.fillRect(14, 18, 16, 24);

      // Dial plate with solar gold aura
      ctx.fillStyle = "#ffd54f";
      ctx.beginPath();
      ctx.ellipse(22, 18, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(22, 18, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden Gnomon
      ctx.fillStyle = "#ff8f00";
      ctx.beginPath();
      ctx.moveTo(22, 18);
      ctx.lineTo(26, 4);
      ctx.lineTo(22, 8);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("sundial-on", canvas);
    }

    // 5. Stone Lantern Checkpoint - Off & On
    if (!scene.textures.exists("garden-checkpoint-off")) {
      const canvas = document.createElement("canvas");
      canvas.width = 36;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78909c";
      ctx.fillRect(4, 48, 28, 16);
      ctx.fillRect(10, 28, 16, 20);
      ctx.fillStyle = "#546e7a";
      ctx.fillRect(6, 14, 24, 14);
      ctx.fillStyle = "#37474f";
      ctx.beginPath();
      ctx.moveTo(18, 2);
      ctx.lineTo(34, 14);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#263238";
      ctx.fillRect(11, 17, 14, 8);
      scene.textures.addCanvas("garden-checkpoint-off", canvas);
    }

    if (!scene.textures.exists("garden-checkpoint-on")) {
      const canvas = document.createElement("canvas");
      canvas.width = 36;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#90a4ae";
      ctx.fillRect(4, 48, 28, 16);
      ctx.fillRect(10, 28, 16, 20);
      ctx.fillStyle = "#607d8b";
      ctx.fillRect(6, 14, 24, 14);
      ctx.fillStyle = "#455a64";
      ctx.beginPath();
      ctx.moveTo(18, 2);
      ctx.lineTo(34, 14);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffd54f";
      ctx.fillRect(11, 17, 14, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(14, 19, 8, 4);
      scene.textures.addCanvas("garden-checkpoint-on", canvas);
    }

    // 6. Ancient Chest Closed & Open
    if (!scene.textures.exists("garden-chest-closed")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(4, 16, 40, 24);
      ctx.fillStyle = "#6d4c41";
      ctx.beginPath();
      ctx.arc(24, 16, 20, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#37474f";
      ctx.fillRect(10, 4, 6, 36);
      ctx.fillRect(32, 4, 6, 36);
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(20, 16, 8, 10);
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.arc(24, 20, 2, 0, Math.PI * 2);
      ctx.rect(23, 20, 2, 4);
      ctx.fill();
      scene.textures.addCanvas("garden-chest-closed", canvas);
    }

    if (!scene.textures.exists("garden-chest-open")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#4e342e";
      ctx.beginPath();
      ctx.arc(24, 12, 18, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#5d4037";
      ctx.fillRect(4, 18, 40, 22);
      ctx.fillStyle = "#ffb300";
      ctx.fillRect(6, 16, 36, 6);
      ctx.fillStyle = "#37474f";
      ctx.fillRect(10, 18, 6, 22);
      ctx.fillRect(32, 18, 6, 22);
      scene.textures.addCanvas("garden-chest-open", canvas);
    }

    // 7. Campfire & Ronny Supply Pack (48 x 36)
    if (!scene.textures.exists("ronny-camp-pack")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;

      // Leather traveler pack
      ctx.fillStyle = "#5d4037";
      ctx.beginPath();
      ctx.roundRect(4, 8, 22, 26, 4);
      ctx.fill();
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(6, 12, 18, 10);
      ctx.fillStyle = "#ffd54f"; // Buckle
      ctx.fillRect(13, 20, 4, 4);

      // Warm Campfire stone ring
      ctx.fillStyle = "#78909c";
      ctx.beginPath();
      ctx.arc(36, 28, 8, 0, Math.PI * 2);
      ctx.fill();
      // Gentle fire flame
      ctx.fillStyle = "#ff9800";
      ctx.beginPath();
      ctx.moveTo(32, 28);
      ctx.lineTo(36, 14);
      ctx.lineTo(40, 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffeb3b";
      ctx.beginPath();
      ctx.moveTo(34, 28);
      ctx.lineTo(36, 18);
      ctx.lineTo(38, 28);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("ronny-camp-pack", canvas);
    }

    // 8. Speed Particle
    if (!scene.textures.exists("speed-particle")) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffeb3b, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("speed-particle", 8, 8);
      g.destroy();
    }
  }

  /**
   * Procedural textures for Chapters 2, 3, and 4
   */
  private static createChapters234Textures(scene: Phaser.Scene): void {
    // -------------------------------------------------------------
    // CHAPTER 2: THE SEARCH (Ruined Garden Perimeter)
    // -------------------------------------------------------------
    if (!scene.textures.exists("ruined-sky-bg")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, "#4a2c58"); // Twilight purple
      grad.addColorStop(0.4, "#9c4d62");
      grad.addColorStop(0.7, "#d97746"); // Sunset orange
      grad.addColorStop(1, "#fcd34d"); // Pale amber horizon
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);
      scene.textures.addCanvas("ruined-sky-bg", canvas);
    }

    if (!scene.textures.exists("ruined-hills-mid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#5c3327";
      ctx.beginPath();
      ctx.moveTo(0, 210);
      ctx.bezierCurveTo(240, 150, 400, 260, 640, 210);
      ctx.bezierCurveTo(880, 160, 1040, 270, 1280, 210);
      ctx.lineTo(1280, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      // Broken fence silhouettes along hills
      ctx.fillStyle = "#3d221a";
      for (let x = 40; x < 1240; x += 90) {
        ctx.fillRect(x, 185, 4, 22);
        ctx.fillRect(x + 12, 190, 4, 18);
        ctx.fillRect(x - 4, 195, 24, 3);
      }
      scene.textures.addCanvas("ruined-hills-mid", canvas);
    }

    if (!scene.textures.exists("ruined-ground")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#4e342e"; // Scorched dark earth
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#795548"; // Cracked stone blocks
      ctx.fillRect(2, 6, 28, 26);
      ctx.fillRect(34, 6, 28, 26);
      ctx.fillRect(2, 36, 28, 26);
      ctx.fillRect(34, 36, 28, 26);
      ctx.fillStyle = "#d7ccc8"; // Stone highlights
      ctx.fillRect(2, 6, 28, 2);
      ctx.fillRect(34, 6, 28, 2);
      scene.textures.addCanvas("ruined-ground", canvas);
    }

    if (!scene.textures.exists("ruined-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(0, 0, 160, 32);
      ctx.fillStyle = "#6d4c41";
      ctx.fillRect(2, 2, 156, 12);
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(2, 2, 156, 3);
      // Weathered cracks
      ctx.strokeStyle = "#271612";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 2);
      ctx.lineTo(45, 14);
      ctx.moveTo(110, 2);
      ctx.lineTo(125, 14);
      ctx.stroke();
      scene.textures.addCanvas("ruined-platform", canvas);
    }

    if (!scene.textures.exists("ruined-fence-hazard")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ff5722"; // Splintered sharp wood
      for (let i = 0; i < 4; i++) {
        const x = i * 16 + 2;
        ctx.beginPath();
        ctx.moveTo(x, 32);
        ctx.lineTo(x + 6, 4);
        ctx.lineTo(x + 12, 32);
        ctx.closePath();
        ctx.fill();
      }
      scene.textures.addCanvas("ruined-fence-hazard", canvas);
    }

    // Checkpoints Chapter 2
    if (!scene.textures.exists("ruined-cp-trellis")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(26, 10, 12, 70);
      ctx.fillStyle = "#ffd54f"; // Glowing lantern
      ctx.beginPath();
      ctx.arc(32, 20, 10, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas("ruined-cp-trellis", canvas);
    }

    // Chapter 2 Chest
    if (!scene.textures.exists("chest-ch2-closed")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#5c6bc0"; // Indigo reinforced chest
      ctx.fillRect(4, 10, 40, 28);
      ctx.fillStyle = "#ffd54f"; // Gold trim
      ctx.fillRect(4, 10, 40, 6);
      ctx.fillRect(20, 16, 8, 10);
      scene.textures.addCanvas("chest-ch2-closed", canvas);
    }

    if (!scene.textures.exists("chest-ch2-open")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3949ab";
      ctx.fillRect(4, 16, 40, 22);
      ctx.fillStyle = "#ffd54f";
      ctx.fillRect(4, 14, 40, 4);
      // Golden glow inside
      ctx.fillStyle = "#fff59d";
      ctx.fillRect(8, 16, 32, 12);
      scene.textures.addCanvas("chest-ch2-open", canvas);
    }

    // -------------------------------------------------------------
    // CHAPTER 3: THE RESCUE (Forest & Bow Combat)
    // -------------------------------------------------------------
    if (!scene.textures.exists("forest-sky-bg")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, "#0b291e"); // Deep forest teal
      grad.addColorStop(0.5, "#164e3b");
      grad.addColorStop(1, "#34d399"); // Misty forest floor
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);
      scene.textures.addCanvas("forest-sky-bg", canvas);
    }

    if (!scene.textures.exists("forest-trees-mid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#064e3b";
      ctx.beginPath();
      ctx.moveTo(0, 210);
      ctx.bezierCurveTo(240, 140, 400, 250, 640, 210);
      ctx.bezierCurveTo(880, 150, 1040, 260, 1280, 210);
      ctx.lineTo(1280, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      // Tree trunks and canopies
      ctx.fillStyle = "#022c22";
      for (let x = 60; x < 1260; x += 110) {
        ctx.fillRect(x, 150, 14, 80);
        ctx.beginPath();
        ctx.arc(x + 7, 140, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      scene.textures.addCanvas("forest-trees-mid", canvas);
    }

    if (!scene.textures.exists("forest-ground")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e3a1e"; // Rich forest soil
      ctx.fillRect(0, 0, 64, 64);
      // Lush green moss top
      ctx.fillStyle = "#15803d";
      ctx.fillRect(0, 0, 64, 12);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(0, 0, 64, 3);
      // Root veins
      ctx.fillStyle = "#78350f";
      ctx.fillRect(10, 12, 6, 40);
      ctx.fillRect(40, 12, 8, 48);
      scene.textures.addCanvas("forest-ground", canvas);
    }

    if (!scene.textures.exists("forest-wood-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#451a03"; // Timber log
      ctx.beginPath();
      ctx.roundRect(0, 0, 160, 32, 6);
      ctx.fill();
      ctx.fillStyle = "#78350f";
      ctx.fillRect(4, 4, 152, 14);
      ctx.fillStyle = "#22c55e"; // Moss patches
      ctx.fillRect(20, 2, 30, 4);
      ctx.fillRect(100, 2, 40, 4);
      scene.textures.addCanvas("forest-wood-platform", canvas);
    }

    if (!scene.textures.exists("forest-root-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#713f12";
      ctx.beginPath();
      ctx.roundRect(0, 4, 128, 26, 8);
      ctx.fill();
      ctx.fillStyle = "#84cc16";
      ctx.fillRect(10, 4, 108, 6);
      scene.textures.addCanvas("forest-root-platform", canvas);
    }

    if (!scene.textures.exists("forest-bramble-hazard")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 22, 64, 10);
      ctx.fillStyle = "#dc2626"; // Blood briar thorns
      for (let i = 0; i < 5; i++) {
        const x = i * 12 + 4;
        ctx.beginPath();
        ctx.moveTo(x, 26);
        ctx.lineTo(x + 5, 2);
        ctx.lineTo(x + 10, 26);
        ctx.closePath();
        ctx.fill();
      }
      scene.textures.addCanvas("forest-bramble-hazard", canvas);
    }

    if (!scene.textures.exists("cave-entrance-prop")) {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext("2d")!;
      // Stone cavern arch
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(80, 100, 70, Math.PI, 0);
      ctx.lineTo(150, 160);
      ctx.lineTo(10, 160);
      ctx.closePath();
      ctx.fill();
      // Pitch black cave mouth
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.arc(80, 110, 50, Math.PI, 0);
      ctx.lineTo(130, 160);
      ctx.lineTo(30, 160);
      ctx.closePath();
      ctx.fill();
      // Glowing mysterious eyes inside
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(70, 125, 4, 0, Math.PI * 2);
      ctx.arc(90, 125, 4, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas("cave-entrance-prop", canvas);
    }

    // Bow & Arrow Combat Assets
    if (!scene.textures.exists("bow-pickup-sprite")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      // Glow aura
      ctx.fillStyle = "rgba(250, 204, 21, 0.4)";
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.fill();
      // Elegant recurve bow
      ctx.strokeStyle = "#854d0e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(24, 24, 16, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
      // Bow string
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, 8);
      ctx.lineTo(24, 40);
      ctx.stroke();
      scene.textures.addCanvas("bow-pickup-sprite", canvas);
    }

    if (!scene.textures.exists("bow-icon")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.strokeStyle = "#38bdf8"; // Reticle
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(16, 30);
      ctx.moveTo(2, 16);
      ctx.lineTo(30, 16);
      ctx.stroke();
      scene.textures.addCanvas("bow-icon", canvas);
    }

    if (!scene.textures.exists("arrow-sprite")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 16;
      const ctx = canvas.getContext("2d")!;
      // Arrow shaft
      ctx.fillStyle = "#a16207";
      ctx.fillRect(4, 7, 22, 2);
      // Arrowhead
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(26, 4);
      ctx.lineTo(32, 8);
      ctx.lineTo(26, 12);
      ctx.closePath();
      ctx.fill();
      // Fletching feathers
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(2, 4);
      ctx.lineTo(8, 8);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 12);
      ctx.lineTo(8, 8);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("arrow-sprite", canvas);
    }

    if (!scene.textures.exists("arrow-bundle")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      // Quiver bundle of 5 arrows
      ctx.fillStyle = "#ca8a04";
      ctx.fillRect(10, 10, 12, 18);
      ctx.fillStyle = "#eab308"; // Arrow feathers sticking up
      ctx.fillRect(8, 2, 4, 8);
      ctx.fillRect(14, 1, 4, 9);
      ctx.fillRect(20, 2, 4, 8);
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 10px monospace";
      ctx.fillText("+5", 8, 24);
      scene.textures.addCanvas("arrow-bundle", canvas);
    }

    // Enemies (Wolf and Hostile Fox)
    if (!scene.textures.exists("enemy-wolf")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      // Body (Timber Wolf)
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.roundRect(14, 14, 38, 22, 6);
      ctx.fill();
      // Wolf Head
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(42, 16);
      ctx.lineTo(60, 22);
      ctx.lineTo(44, 34);
      ctx.closePath();
      ctx.fill();
      // Wolf Ears
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(42, 14);
      ctx.lineTo(46, 4);
      ctx.lineTo(50, 16);
      ctx.closePath();
      ctx.fill();
      // Glowing Yellow Eye
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(50, 20, 3, 0, Math.PI * 2);
      ctx.fill();
      // Bushy tail
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(16, 20);
      ctx.lineTo(2, 34);
      ctx.lineTo(16, 30);
      ctx.closePath();
      ctx.fill();
      // Legs
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(20, 34, 6, 12);
      ctx.fillRect(40, 34, 6, 12);
      scene.textures.addCanvas("enemy-wolf", canvas);
    }

    if (!scene.textures.exists("enemy-fox-hostile")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      // Hostile red fox body
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.roundRect(10, 12, 28, 18, 4);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.moveTo(30, 14);
      ctx.lineTo(46, 18);
      ctx.lineTo(34, 28);
      ctx.closePath();
      ctx.fill();
      // White chest
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(30, 20, 8, 8);
      // Dark ear
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(32, 12);
      ctx.lineTo(36, 4);
      ctx.lineTo(40, 14);
      ctx.closePath();
      ctx.fill();
      // Amber eye
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(38, 17, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(12, 16);
      ctx.lineTo(2, 28);
      ctx.lineTo(12, 24);
      ctx.closePath();
      ctx.fill();
      // Legs
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(16, 28, 4, 10);
      ctx.fillRect(30, 28, 4, 10);
      scene.textures.addCanvas("enemy-fox-hostile", canvas);
    }

    // Photo Puzzle Pieces & Complete Art
    if (!scene.textures.exists("photo-piece-icon")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(6, 6, 20, 20);
      ctx.fillStyle = "#facc15"; // Star emblem
      ctx.beginPath();
      ctx.arc(16, 16, 5, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas("photo-piece-icon", canvas);
    }

    if (!scene.textures.exists("photo-complete-art")) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d")!;
      // Polaroid style border
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, 320, 240);
      // Warm memory landscape
      const grad = ctx.createLinearGradient(0, 10, 0, 200);
      grad.addColorStop(0, "#bae6fd");
      grad.addColorStop(1, "#fef08a");
      ctx.fillStyle = grad;
      ctx.fillRect(15, 15, 290, 180);

      // Ronny and Titi together
      ctx.fillStyle = "#16a34a"; // Green grass
      ctx.fillRect(15, 140, 290, 55);

      // Ronny illustration
      ctx.fillStyle = "#fed7aa"; // Ronny head
      ctx.beginPath();
      ctx.arc(140, 90, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#854d0e"; // Hair
      ctx.beginPath();
      ctx.arc(140, 75, 30, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#38bdf8"; // Shirt
      ctx.fillRect(120, 118, 40, 45);

      // Titi resting happily in Ronny's hands
      ctx.fillStyle = "#facc15"; // Titi chick body
      ctx.beginPath();
      ctx.arc(180, 125, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ea580c"; // Beak
      ctx.beginPath();
      ctx.moveTo(195, 120);
      ctx.lineTo(208, 125);
      ctx.lineTo(195, 130);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1e293b"; // Happy curved eye
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(186, 120, 4, Math.PI, 0);
      ctx.stroke();

      // Caption
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Ronny & Titibaccha — The Garden Days", 26, 222);
      scene.textures.addCanvas("photo-complete-art", canvas);
    }

    // Chapter 3 Chest
    if (!scene.textures.exists("chest-ch3-closed")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#15803d"; // Forest green chest
      ctx.fillRect(4, 10, 40, 28);
      ctx.fillStyle = "#facc15"; // Gold trim
      ctx.fillRect(4, 10, 40, 6);
      ctx.fillRect(20, 16, 8, 10);
      scene.textures.addCanvas("chest-ch3-closed", canvas);
    }

    if (!scene.textures.exists("chest-ch3-open")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#166534";
      ctx.fillRect(4, 16, 40, 22);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(4, 14, 40, 4);
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(8, 16, 32, 12);
      scene.textures.addCanvas("chest-ch3-open", canvas);
    }

    // -------------------------------------------------------------
    // CHAPTER 4: THE DARKNESS (Cavern, Torch & Train Ticket)
    // -------------------------------------------------------------
    if (!scene.textures.exists("cave-bg")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, "#09090b"); // Near pitch black
      grad.addColorStop(0.5, "#18181b");
      grad.addColorStop(1, "#27272a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);
      scene.textures.addCanvas("cave-bg", canvas);
    }

    if (!scene.textures.exists("cave-stalagmites-mid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.moveTo(0, 210);
      ctx.bezierCurveTo(240, 160, 400, 270, 640, 210);
      ctx.bezierCurveTo(880, 150, 1040, 260, 1280, 210);
      ctx.lineTo(1280, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      // Stalactites & Stalagmites
      ctx.fillStyle = "#27272a";
      for (let x = 40; x < 1240; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 400);
        ctx.lineTo(x + 15, 260);
        ctx.lineTo(x + 30, 400);
        ctx.closePath();
        ctx.fill();
      }
      scene.textures.addCanvas("cave-stalagmites-mid", canvas);
    }

    if (!scene.textures.exists("cave-ground")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#18181b"; // Dark subterranean slate
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#27272a";
      ctx.fillRect(2, 2, 60, 14);
      ctx.fillStyle = "#06b6d4"; // Quartz crystal flecks
      ctx.fillRect(14, 8, 4, 4);
      ctx.fillRect(44, 10, 3, 3);
      scene.textures.addCanvas("cave-ground", canvas);
    }

    if (!scene.textures.exists("cave-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#27272a";
      ctx.beginPath();
      ctx.roundRect(0, 0, 160, 32, 4);
      ctx.fill();
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(4, 4, 152, 12);
      ctx.fillStyle = "#a855f7"; // Luminescent cave fungi
      ctx.fillRect(20, 2, 16, 4);
      ctx.fillRect(90, 2, 20, 4);
      scene.textures.addCanvas("cave-platform", canvas);
    }

    if (!scene.textures.exists("cave-stalagmite-hazard")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#52525b";
      for (let i = 0; i < 4; i++) {
        const x = i * 16 + 2;
        ctx.beginPath();
        ctx.moveTo(x, 32);
        ctx.lineTo(x + 6, 2);
        ctx.lineTo(x + 12, 32);
        ctx.closePath();
        ctx.fill();
      }
      scene.textures.addCanvas("cave-stalagmite-hazard", canvas);
    }

    // Sunlight safe zone beam
    if (!scene.textures.exists("sunlight-beam")) {
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(90, 0, 90, 600);
      grad.addColorStop(0, "rgba(253, 224, 71, 0.55)");
      grad.addColorStop(0.7, "rgba(250, 204, 21, 0.35)");
      grad.addColorStop(1, "rgba(250, 204, 21, 0.05)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(140, 0);
      ctx.lineTo(180, 600);
      ctx.lineTo(0, 600);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("sunlight-beam", canvas);
    }

    // Light masks for TorchSystem
    if (!scene.textures.exists("torch-light-mask")) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(160, 160, 20, 160, 160, 160);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.7, "rgba(255, 255, 255, 0.85)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 320);
      scene.textures.addCanvas("torch-light-mask", canvas);
    }

    if (!scene.textures.exists("sunlight-light-mask")) {
      const canvas = document.createElement("canvas");
      canvas.width = 440;
      canvas.height = 440;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(220, 220, 40, 220, 220, 220);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.8, "rgba(255, 255, 255, 0.9)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 440, 440);
      scene.textures.addCanvas("sunlight-light-mask", canvas);
    }

    if (!scene.textures.exists("dim-light-mask")) {
      const canvas = document.createElement("canvas");
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(40, 40, 5, 40, 40, 40);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 80, 80);
      scene.textures.addCanvas("dim-light-mask", canvas);
    }

    // Cave Monster
    if (!scene.textures.exists("enemy-cave-monster")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      // Shadow beast body
      ctx.fillStyle = "#1e1b4b"; // Dark abyss purple
      ctx.beginPath();
      ctx.roundRect(8, 12, 48, 44, 12);
      ctx.fill();
      // Razor teeth
      ctx.fillStyle = "#f8fafc";
      for (let i = 0; i < 5; i++) {
        const x = 18 + i * 6;
        ctx.beginPath();
        ctx.moveTo(x, 42);
        ctx.lineTo(x + 3, 34);
        ctx.lineTo(x + 6, 42);
        ctx.closePath();
        ctx.fill();
      }
      // Glowing eerie purple eyes
      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.arc(24, 26, 5, 0, Math.PI * 2);
      ctx.arc(40, 26, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(24, 26, 2, 0, Math.PI * 2);
      ctx.arc(40, 26, 2, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas("enemy-cave-monster", canvas);
    }

    // Ticket Puzzle Pieces & Assembled Train Ticket
    if (!scene.textures.exists("ticket-piece-icon")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#b45309"; // Brass/bronze ticket scrap
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(6, 6, 20, 20);
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 9px monospace";
      ctx.fillText("TRAIN", 4, 18);
      scene.textures.addCanvas("ticket-piece-icon", canvas);
    }

    if (!scene.textures.exists("train-ticket-art")) {
      const canvas = document.createElement("canvas");
      canvas.width = 280;
      canvas.height = 140;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78350f"; // Vintage card
      ctx.fillRect(0, 0, 280, 140);
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(8, 8, 264, 124);
      // Train ticket header
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(12, 12, 256, 32);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px monospace";
      ctx.fillText("★ AUTUMN HIGHLAND EXPRESS ★", 24, 34);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("PASSENGER: TITIBACCHA (CHICK)", 24, 70);
      ctx.fillText("DESTINATION: CHAPTER 5 — AUTUMN FOREST", 24, 92);
      ctx.font = "italic 11px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("Valid for one passenger following Ronny's path.", 24, 114);
      scene.textures.addCanvas("train-ticket-art", canvas);
    }

    // Chapter 4 Traveler Pouch & Mysterious Note
    if (!scene.textures.exists("traveler-pouch")) {
      const canvas = document.createElement("canvas");
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.roundRect(6, 10, 28, 26, 8);
      ctx.fill();
      ctx.fillStyle = "#facc15"; // Golden drawstring tie
      ctx.fillRect(8, 12, 24, 4);
      ctx.fillStyle = "#ef4444"; // Heart emblem on pouch
      ctx.beginPath();
      ctx.arc(17, 24, 4, 0, Math.PI);
      ctx.arc(23, 24, 4, 0, Math.PI);
      ctx.fill();
      scene.textures.addCanvas("traveler-pouch", canvas);
    }

    if (!scene.textures.exists("mysterious-note-icon")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef08a"; // Parchment scroll
      ctx.fillRect(6, 4, 20, 24);
      ctx.fillStyle = "#dc2626"; // Wax seal
      ctx.beginPath();
      ctx.arc(16, 16, 5, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas("mysterious-note-icon", canvas);
    }

    // Chapter 4 Chest
    if (!scene.textures.exists("chest-ch4-closed")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3b0764"; // Obsidian purple chest
      ctx.fillRect(4, 10, 40, 28);
      ctx.fillStyle = "#e879f9"; // Luminescent amethyst trim
      ctx.fillRect(4, 10, 40, 6);
      ctx.fillRect(20, 16, 8, 10);
      scene.textures.addCanvas("chest-ch4-closed", canvas);
    }

    if (!scene.textures.exists("chest-ch4-open")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#2e1065";
      ctx.fillRect(4, 16, 40, 22);
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(4, 14, 40, 4);
      ctx.fillStyle = "#fdf4ff";
      ctx.fillRect(8, 16, 32, 12);
      scene.textures.addCanvas("chest-ch4-open", canvas);
    }

    // Keys & Letter Fragments
    if (!scene.textures.exists("key-ch3")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#94a3b8"; // Silver key
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(16, 10, 12, 4);
      ctx.fillRect(24, 14, 4, 4);
      scene.textures.addCanvas("key-ch3", canvas);
    }

    if (!scene.textures.exists("key-ch4")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ca8a04"; // Bronze forest key
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(16, 10, 12, 4);
      ctx.fillRect(24, 14, 4, 4);
      scene.textures.addCanvas("key-ch4", canvas);
    }

    if (!scene.textures.exists("key-ch5")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#38bdf8"; // Crystal train pass key
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(16, 10, 12, 4);
      ctx.fillRect(24, 14, 4, 4);
      scene.textures.addCanvas("key-ch5", canvas);
    }

    if (!scene.textures.exists("letter-frag-2")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#b45309";
      ctx.font = "bold 12px serif";
      ctx.fillText("2/7", 8, 20);
      scene.textures.addCanvas("letter-frag-2", canvas);
    }

    if (!scene.textures.exists("letter-frag-3")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#15803d";
      ctx.font = "bold 12px serif";
      ctx.fillText("3/7", 8, 20);
      scene.textures.addCanvas("letter-frag-3", canvas);
    }

    if (!scene.textures.exists("letter-frag-4")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#6b21a8";
      ctx.font = "bold 12px serif";
      ctx.fillText("4/7", 8, 20);
      scene.textures.addCanvas("letter-frag-4", canvas);
    }
  }

  /**
   * Procedural textures for Chapters 5 (The Station), 6 (The Destination), and 7 (The Heaven).
   */
  public static createChapters567Textures(scene: Phaser.Scene): void {
    // ------------------------------------------------------------------------
    // CHAPTER 5: THE STATION & MOVING TRAIN
    // ------------------------------------------------------------------------
    if (!scene.textures.exists("station-bg")) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      // Mountain sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, "#0c4a6e"); // deep mountain twilight
      skyGrad.addColorStop(0.5, "#0284c7");
      skyGrad.addColorStop(1, "#f97316"); // sunset rim
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 512, 720);
      // Distant mountain peaks
      ctx.fillStyle = "#0369a1";
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(120, 320);
      ctx.lineTo(260, 490);
      ctx.lineTo(400, 350);
      ctx.lineTo(512, 480);
      ctx.lineTo(512, 720);
      ctx.lineTo(0, 720);
      ctx.fill();
      // Midground pine hills
      ctx.fillStyle = "#065f46";
      ctx.beginPath();
      ctx.moveTo(0, 560);
      ctx.lineTo(160, 440);
      ctx.lineTo(340, 540);
      ctx.lineTo(512, 470);
      ctx.lineTo(512, 720);
      ctx.lineTo(0, 720);
      ctx.fill();
      scene.textures.addCanvas("station-bg", canvas);
    }

    if (!scene.textures.exists("train-tracks")) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      // Ballast gravel
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 0, 128, 32);
      // Wooden ties
      ctx.fillStyle = "#78350f";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * 32 + 6, 8, 20, 24);
      }
      // Steel rails
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(0, 4, 128, 4);
      ctx.fillRect(0, 12, 128, 4);
      scene.textures.addCanvas("train-tracks", canvas);
    }

    if (!scene.textures.exists("train-car-roof")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      // Passenger train car body
      ctx.fillStyle = "#1e293b"; // dark steel
      ctx.fillRect(0, 0, 64, 64);
      // Top roof edge
      ctx.fillStyle = "#475569";
      ctx.fillRect(0, 0, 64, 12);
      // Rivets
      ctx.fillStyle = "#cbd5e1";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * 16 + 6, 4, 3, 3);
      }
      // Windows along car
      ctx.fillStyle = "#fef08a"; // warm lit interior
      ctx.fillRect(8, 24, 20, 24);
      ctx.fillRect(36, 24, 20, 24);
      scene.textures.addCanvas("train-car-roof", canvas);
    }

    if (!scene.textures.exists("train-engine-roof")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      // Locomotive boiler
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#b45309"; // bronze accents
      ctx.fillRect(0, 0, 64, 8);
      ctx.fillRect(0, 14, 64, 4);
      scene.textures.addCanvas("train-engine-roof", canvas);
    }

    if (!scene.textures.exists("train-obstacle-vent")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      // Roof exhaust chimney / vent
      ctx.fillStyle = "#334155";
      ctx.fillRect(12, 8, 24, 32);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(8, 4, 32, 6);
      scene.textures.addCanvas("train-obstacle-vent", canvas);
    }

    if (!scene.textures.exists("station-ticket-gate")) {
      const canvas = document.createElement("canvas");
      canvas.width = 54;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;
      // Turnstile barrier
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(6, 10, 42, 70);
      // Validator display
      ctx.fillStyle = "#22c55e"; // glowing green slot
      ctx.fillRect(16, 20, 22, 14);
      ctx.fillStyle = "#000000";
      ctx.fillRect(20, 42, 14, 4);
      scene.textures.addCanvas("station-ticket-gate", canvas);
    }

    if (!scene.textures.exists("enemy-dinosaur-flying")) {
      const canvas = document.createElement("canvas");
      canvas.width = 72;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      // Fantasy pterosaur / flying dinosaur
      // Leathery wings
      ctx.fillStyle = "#7c2d12"; // deep rust amber
      ctx.beginPath();
      ctx.moveTo(36, 24);
      ctx.lineTo(8, 4);
      ctx.lineTo(20, 36);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(36, 24);
      ctx.lineTo(64, 4);
      ctx.lineTo(52, 36);
      ctx.closePath();
      ctx.fill();

      // Slender dinosaur body & long beak
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.ellipse(36, 24, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp head crest & beak
      ctx.fillStyle = "#c2410c";
      ctx.beginPath();
      ctx.moveTo(46, 22);
      ctx.lineTo(70, 20); // beak tip
      ctx.lineTo(48, 27);
      ctx.closePath();
      ctx.fill();

      // Fierce glowing eye
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(46, 21, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillRect(46, 20, 1.5, 2);

      scene.textures.addCanvas("enemy-dinosaur-flying", canvas);
    }

    if (!scene.textures.exists("chest-ch5-closed")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a"; // obsidian locomotive safe
      ctx.fillRect(4, 12, 40, 26);
      ctx.fillStyle = "#0284c7"; // electric blue lock
      ctx.fillRect(20, 20, 8, 10);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(4, 8, 40, 6);
      scene.textures.addCanvas("chest-ch5-closed", canvas);
    }

    if (!scene.textures.exists("chest-ch5-open")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(4, 16, 40, 22);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(4, 14, 40, 4);
      ctx.fillStyle = "#f0f9ff";
      ctx.fillRect(8, 16, 32, 12);
      scene.textures.addCanvas("chest-ch5-open", canvas);
    }

    if (!scene.textures.exists("key-ch6")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#06b6d4"; // Cyan coastal pass key
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(16, 10, 12, 4);
      ctx.fillRect(24, 14, 4, 4);
      scene.textures.addCanvas("key-ch6", canvas);
    }

    if (!scene.textures.exists("letter-frag-5")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#0284c7";
      ctx.font = "bold 12px serif";
      ctx.fillText("5/7", 8, 20);
      scene.textures.addCanvas("letter-frag-5", canvas);
    }

    // ------------------------------------------------------------------------
    // CHAPTER 6: THE DESTINATION & COASTAL ESCAPE
    // ------------------------------------------------------------------------
    if (!scene.textures.exists("coastal-bg-sky")) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      const seaGrad = ctx.createLinearGradient(0, 0, 0, 720);
      seaGrad.addColorStop(0, "#082f49"); // storm coastal sky
      seaGrad.addColorStop(0.6, "#0369a1");
      seaGrad.addColorStop(1, "#0284c7");
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 0, 512, 720);
      // Distant sea cliffs
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(140, 380);
      ctx.lineTo(260, 460);
      ctx.lineTo(420, 360);
      ctx.lineTo(512, 450);
      ctx.lineTo(512, 720);
      ctx.lineTo(0, 720);
      ctx.fill();
      scene.textures.addCanvas("coastal-bg-sky", canvas);
    }

    if (!scene.textures.exists("coastal-ocean-mid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 280;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(0, 0, 512, 280);
      // Whitecaps on waves
      ctx.fillStyle = "#e0f2fe";
      for (let y = 30; y < 280; y += 40) {
        for (let x = 0; x < 512; x += 60) {
          ctx.beginPath();
          ctx.arc(x + (y % 80), y, 20, Math.PI, 0);
          ctx.stroke();
        }
      }
      scene.textures.addCanvas("coastal-ocean-mid", canvas);
    }

    if (!scene.textures.exists("coastal-dock-ground")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#451a03"; // dark weathered timber dock
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#78350f";
      ctx.fillRect(0, 0, 64, 6);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(30, 0, 4, 64); // board dividers
      scene.textures.addCanvas("coastal-dock-ground", canvas);
    }

    if (!scene.textures.exists("coastal-cliff-rock")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#0f766e"; // sea moss
      ctx.fillRect(0, 0, 64, 8);
      scene.textures.addCanvas("coastal-cliff-rock", canvas);
    }

    if (!scene.textures.exists("broken-bridge")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 20;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78350f";
      ctx.fillRect(0, 0, 64, 20);
      ctx.fillStyle = "#451a03";
      ctx.fillRect(4, 4, 16, 12);
      ctx.fillRect(26, 4, 14, 12);
      ctx.fillRect(46, 4, 14, 12);
      scene.textures.addCanvas("broken-bridge", canvas);
    }

    if (!scene.textures.exists("ronny-travel-bag")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 44;
      const ctx = canvas.getContext("2d")!;
      // Ronny's brown leather traveler pack
      ctx.fillStyle = "#78350f";
      ctx.fillRect(6, 12, 32, 28);
      // Straps & buckles
      ctx.fillStyle = "#b45309";
      ctx.fillRect(10, 8, 6, 32);
      ctx.fillRect(28, 8, 6, 32);
      ctx.fillStyle = "#fef08a"; // gold buckles
      ctx.fillRect(10, 22, 6, 4);
      ctx.fillRect(28, 22, 6, 4);
      // Small blue canteen
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(36, 16, 6, 14);
      scene.textures.addCanvas("ronny-travel-bag", canvas);
    }

    if (!scene.textures.exists("train-wreckage-exploded")) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 96;
      const ctx = canvas.getContext("2d")!;
      // Charred exploded locomotive
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 20, 128, 76);
      // Ruptured boiler cracks
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(50, 45);
      ctx.lineTo(40, 60);
      ctx.lineTo(70, 75);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ea580c";
      ctx.stroke();
      ctx.fillStyle = "#f97316";
      ctx.fillRect(80, 24, 20, 10);
      scene.textures.addCanvas("train-wreckage-exploded", canvas);
    }

    if (!scene.textures.exists("map-piece-icon")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fed7aa"; // parchment
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#c2410c"; // compass rose needle
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(20, 16);
      ctx.lineTo(16, 26);
      ctx.lineTo(12, 16);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("map-piece-icon", canvas);
    }

    if (!scene.textures.exists("waypoint-marker")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      // Glowing golden forward arrow
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(22, 16);
      ctx.lineTo(8, 26);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas("waypoint-marker", canvas);
    }

    if (!scene.textures.exists("chest-ch6-closed")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(4, 12, 40, 26);
      ctx.fillStyle = "#10b981"; // Emerald clifftop lock
      ctx.fillRect(20, 20, 8, 10);
      ctx.fillStyle = "#34d399";
      ctx.fillRect(4, 8, 40, 6);
      scene.textures.addCanvas("chest-ch6-closed", canvas);
    }

    if (!scene.textures.exists("chest-ch6-open")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(4, 16, 40, 22);
      ctx.fillStyle = "#34d399";
      ctx.fillRect(4, 14, 40, 4);
      ctx.fillStyle = "#ecfdf5";
      ctx.fillRect(8, 16, 32, 12);
      scene.textures.addCanvas("chest-ch6-open", canvas);
    }

    if (!scene.textures.exists("key-ch7")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#10b981"; // Emerald Heaven key
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(16, 10, 12, 4);
      ctx.fillRect(24, 14, 4, 4);
      scene.textures.addCanvas("key-ch7", canvas);
    }

    if (!scene.textures.exists("letter-frag-6")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#0f766e";
      ctx.font = "bold 12px serif";
      ctx.fillText("6/7", 8, 20);
      scene.textures.addCanvas("letter-frag-6", canvas);
    }

    // ------------------------------------------------------------------------
    // CHAPTER 7: THE HEAVEN & SUNSET REUNION
    // ------------------------------------------------------------------------
    if (!scene.textures.exists("sunset-sky-bg")) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 720;
      const ctx = canvas.getContext("2d")!;
      // Breathtaking golden rose sunset
      const sunGrad = ctx.createLinearGradient(0, 0, 0, 720);
      sunGrad.addColorStop(0, "#4a044e"); // twilight violet
      sunGrad.addColorStop(0.3, "#9d174d"); // deep rose
      sunGrad.addColorStop(0.6, "#ea580c"); // bright amber orange
      sunGrad.addColorStop(0.85, "#facc15"); // golden horizon
      sunGrad.addColorStop(1, "#38bdf8"); // reflections
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, 512, 720);

      // Low golden sun on the horizon
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(256, 440, 50, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas("sunset-sky-bg", canvas);
    }

    if (!scene.textures.exists("sunset-ocean-mid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 240;
      const ctx = canvas.getContext("2d")!;
      // Golden shimmering ocean
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 240);
      oceanGrad.addColorStop(0, "#ca8a04");
      oceanGrad.addColorStop(0.4, "#0284c7");
      oceanGrad.addColorStop(1, "#0369a1");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 512, 240);
      scene.textures.addCanvas("sunset-ocean-mid", canvas);
    }

    if (!scene.textures.exists("sunset-cliff-ground")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 64, 64);
      // Lush sunset clifftop grass
      ctx.fillStyle = "#15803d";
      ctx.fillRect(0, 0, 64, 12);
      // Small flowering blooms
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(10, 4, 4, 4);
      ctx.fillRect(36, 6, 4, 4);
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(24, 5, 3, 3);
      ctx.fillRect(52, 4, 3, 3);
      scene.textures.addCanvas("sunset-cliff-ground", canvas);
    }

    if (!scene.textures.exists("sunset-meadow-platform")) {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 24;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 4, 96, 20);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(0, 0, 96, 6);
      scene.textures.addCanvas("sunset-meadow-platform", canvas);
    }

    if (!scene.textures.exists("rose-collectible")) {
      const canvas = document.createElement("canvas");
      canvas.width = 36;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;
      // Green stem & leaves
      ctx.fillStyle = "#15803d";
      ctx.fillRect(16, 16, 4, 18);
      ctx.beginPath();
      ctx.ellipse(12, 24, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.ellipse(24, 22, 6, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Crimson blooming petals
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(18, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(18, 11, 6, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas("rose-collectible", canvas);
    }

    if (!scene.textures.exists("bouquet-item")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 44;
      const ctx = canvas.getContext("2d")!;
      // Five gathered roses
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(22, 12, 8, 0, Math.PI * 2);
      ctx.arc(14, 16, 7, 0, Math.PI * 2);
      ctx.arc(30, 16, 7, 0, Math.PI * 2);
      ctx.arc(18, 22, 6, 0, Math.PI * 2);
      ctx.arc(26, 22, 6, 0, Math.PI * 2);
      ctx.fill();
      // Golden ribbon
      ctx.fillStyle = "#facc15";
      ctx.fillRect(18, 28, 8, 6);
      // Stems
      ctx.fillStyle = "#15803d";
      ctx.fillRect(19, 34, 6, 8);
      scene.textures.addCanvas("bouquet-item", canvas);
    }

    if (!scene.textures.exists("letter-frag-7")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fef08a"; // Radiant final golden fragment
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = "#b45309";
      ctx.font = "bold 12px serif";
      ctx.fillText("7/7", 8, 20);
      scene.textures.addCanvas("letter-frag-7", canvas);
    }

    if (!scene.textures.exists("necklace-glow-aura")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      // Emerald radial glow
      const glow = ctx.createRadialGradient(24, 24, 2, 24, 24, 24);
      glow.addColorStop(0, "rgba(52, 211, 153, 0.9)");
      glow.addColorStop(0.5, "rgba(16, 185, 129, 0.45)");
      glow.addColorStop(1, "rgba(5, 150, 105, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 48, 48);
      scene.textures.addCanvas("necklace-glow-aura", canvas);
    }
  }
}
