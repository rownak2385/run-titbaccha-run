# Character Sprite Production Import Workflow

> **Project**: *Run Titibaccha, Run!*  
> **Document**: Character Art Slicing, Alignment, and Import Standard  
> **Audience**: Technical Artists, 2D Animators, and Game Developers  
> **Manifest Reference**: `public/assets/characters/manifest.json`

---

## 1. Golden Rule: Concept Sheet ≠ Animation Sprite Sheet

> [!CAUTION]
> **Never import a character concept sheet, turnaround sheet, or reference art directly into the game engine.**  
> Concept art contains non-uniform canvas margins, varying character heights, text annotations, lighting studies, and multiple camera angles.
> Feeding raw concept sheets directly into Phaser will cause distorted hitboxes, erratic sprite jumping, and misaligned feet.

Every character sprite must be converted into **standardized, uniform-dimension animation frames** following the strict rules below before integration.

---

## 2. Standardized Sprite Frame Dimensions

All animation frames for a given character must share the **exact same canvas pixel dimensions**, centered with a fixed feet-ground baseline.

| Character ID | Name & Role | Uniform Frame Dimensions | Baseline Y (Feet Contact) | Anchor Origin `(x, y)` |
| :--- | :--- | :--- | :--- | :--- |
| `titibaccha` | Titibaccha (Chick Protagonist) | **48 × 48 px** | `y = 44 px` | `(0.5, 0.5)` |
| `ronny` | Ronny (Human Companion) | **64 × 80 px** | `y = 76 px` | `(0.5, 0.5)` |
| `fox` | The Fox (Predator / Baiter) | **80 × 56 px** | `y = 52 px` | `(0.5, 0.5)` |

### Why Canvas Dimensions Include Padding:
The canvas is larger than the core character body to allow dynamic visual flourishes without clipping:
- **Titi (48×48)**: Accommodates flapping wingtips, jumping leg tucks, and crest feathers.
- **Ronny (64×80)**: Accommodates kneeling for feeding, outstretched grain bowl, and walking strides.
- **Fox (80×56)**: Accommodates low stalking crouches, bushy tail flourishes, and golden bait berries.

---

## 3. Fixed Feet-Ground Alignment Standard

To prevent sprites from "jittering" vertically or "sinking" into platforms when transitioning between animations (e.g. idle $\rightarrow$ run $\rightarrow$ jump $\rightarrow$ land):

```
+------------------------------------------+  ^
|                                          |  |
|            [ CHARACTER ART ]             |  | Uniform Frame Height
|                                          |  | (e.g. 48px for Titi)
|       _O_                                |  |
|        |                                 |  |
|       / \                                |  |
|-------(o)-(o)----------------------------|  v  <-- Fixed Ground Baseline (y = 44px)
|         [4px ground shadow margin]       |
+------------------------------------------+
<------- Uniform Frame Width (48px) ------->
```

1. **Establish the Baseline**: Align the soles of the character's feet to the designated baseline Y coordinate across every frame.
2. **Jump & Fall Frames**: The feet should lift *upward* away from the baseline within the uniform canvas, rather than shifting the image origin.
3. **Crouch & Recoil Frames**: The head and torso compress downward toward the baseline while feet remain planted.

---

## 4. Facing Direction & Automatic Horizontal Flipping

To avoid creating redundant left and right sprite sheets, the game engine automatically flips sprites via `sprite.setFlipX(true)`.

- **Titibaccha**: Draw facing **RIGHT** by default.
  - When moving right: `sprite.setFlipX(false)`
  - When moving left: `sprite.setFlipX(true)`
- **Ronny**: Draw facing **LEFT** by default (facing inward toward the garden path and approaching Titi).
- **The Fox**: Draw facing **LEFT** by default (facing toward the approaching chick).

---

## 5. PNG Export & Transparency Standard

All exported frames must strictly conform to:
- **Format**: PNG-32 (Truecolor with 8-bit Alpha channel, Color Type 6).
- **Background**: 100% transparent alpha. No solid color background, matte color, or checkered background.
- **Pixel Art Filtering**: Nearest-neighbor scaling. Do not apply bilinear filtering, bicubic smoothing, or anti-aliased edge blurring on pixel art.
- **Color Depth**: 8 bits per channel (RGBA 32-bit).

---

## 6. Two Supported Import Formats

The game supports two integration formats. Choose the format that best fits your animation export tools:

### Option A: Master Sprite Sheet (Recommended for Release)
Combine all animation frames into a single master PNG image laid out in a single horizontal strip or regular grid:

```
public/assets/characters/
├── titibaccha.png    # 48px width per frame x 48px height (Horizontal strip: 18 frames = 864 x 48 px)
├── ronny.png          # 64px width per frame x 80px height (Horizontal strip: 20 frames = 1280 x 80 px)
└── fox.png            # 80px width per frame x 56px height (Horizontal strip: 12 frames = 960 x 56 px)
```

### Option B: Transparent Individual Frame Sequences (Recommended for Active Production)
Place individual PNG frame files into dedicated character subdirectories:

```
public/assets/characters/
├── titibaccha/
│   ├── idle_0.png, idle_1.png
│   ├── run_0.png, run_1.png, run_2.png, run_3.png
│   ├── jump_0.png, fall_0.png, hurt_0.png, hurt_1.png
│   ├── eating_0.png, eating_1.png
│   ├── happy_0.png, happy_1.png
│   └── sad_0.png, sad_1.png
├── ronny/
│   ├── idle_0.png, idle_1.png
│   ├── waiting_0.png, waiting_1.png
│   ├── feeding_0.png, feeding_1.png
│   ├── surprised_0.png, surprised_1.png
│   ├── sad_0.png, sad_1.png
│   └── walk_away_0.png, walk_away_1.png, walk_away_2.png, walk_away_3.png
└── fox/
    ├── idle_0.png, idle_1.png
    ├── walk_0.png, walk_1.png, walk_2.png, walk_3.png
    ├── attract_0.png, attract_1.png
    ├── eating_0.png, eating_1.png
    └── deceptive_0.png, deceptive_1.png
```

---

## 7. Decoupled Physics Guarantee

> [!IMPORTANT]
> **Sprite visual dimensions never alter gameplay mechanics.**  
> The Arcade Physics collision body is configured separately in `manifest.json`:
> - **Titibaccha**: Body `32 × 36 px` (Offset `x=8`, `y=10`)
> - **Ronny**: Body `40 × 70 px` (Offset `x=12`, `y=8`)
> - **Fox**: Body `60 × 40 px` (Offset `x=10`, `y=12`)
>
> If an artist adjusts sprite frame size or adds new feather flourishes, platform jump clearances, obstacle collisions, and gravity will remain 100% stable and intact.

---

## 8. Asset Validation Procedure

Before committing or pushing new character art:
1. Save PNG files into `public/assets/characters/<characterId>/`.
2. Run the asset validator:
   ```bash
   npm run validate:assets
   ```
3. The validator will check:
   - File existence
   - Correct PNG binary headers
   - Expected canvas dimensions
   - Alpha transparency channels
   - Frame count completeness
4. Run the production build to ensure clean bundling:
   ```bash
   npm run typecheck && npm run build
   ```
