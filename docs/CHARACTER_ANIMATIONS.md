# Character Animation & Physics Body Specification

> **Project**: *Run Titibaccha, Run!*  
> **Document**: Character Animation Technical Reference  
> **Author**: Technical Art Director & Principal Phaser Developer  
> **Reference File**: `src/types/characterAsset.ts` & `public/assets/characters/manifest.json`

---

## 1. Character Identity & Physics Architecture

To guarantee competitive platforming precision and prevent animation changes from altering jump clearances, platform landings, or damage zones, **visual sprite animations and physics collision bodies are completely decoupled**.

- Visual sprites can vary in dimension (e.g. 32px for Titi, 56px for Ronny, 56px for Fox).
- The Arcade Physics body is pinned explicitly via `CharacterAssetManager.setupPhysicsBody(sprite, characterId)` using values configured in `manifest.json`.
- All textures are filtered using **nearest-neighbor sampling** (`Phaser.Textures.FilterMode.NEAREST`) to prevent blurring and maintain crisp pixel art edges.

---

## 2. Titibaccha (`titibaccha`)

**Visual Dimensions**: 48 × 48 px (Baseline at y = 44 px)  
**Anchor (Origin)**: `(0.5, 0.5)`  
**Arcade Physics Body**: `32 × 36 px` (Offset: `x = 8`, `y = 10`)  
**Default Facing**: Right (mirrored with `setFlipX(true)` when facing Left)

| Animation Key | Animation Key Alias | Frames | FPS | Repeat | Description & Narrative Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `titi_idle` | `titibaccha_idle` | [0, 1] | 2 | Loop (-1) | Gentle breathing bob with small beak and orange feet visible. |
| `titi_running`| `titibaccha_run` | [2, 3, 4, 5]| 10 | Loop (-1) | Fast pitter-patter stride with wing flutter and dust puffs. |
| `titi_jumping`| `titibaccha_jump`| [6] | 1 | Once (0) | Upward wing tuck, legs angled downward. |
| `titi_falling`| `titibaccha_fall`| [7] | 1 | Once (0) | Flapping descent posture, wide eyes focused downward. |
| `titi_hurt` | `titibaccha_hurt`| [8, 9] | 8 | 2 loops | Stagger recoil with ruffled feathers upon hazard damage. |
| `titi_eating` | `titibaccha_eating`| [10, 11] | 4 | Loop (-1) | Hungry pecking at grain or berries (used in campsite & betrayal). |
| `titi_shooting`| `titibaccha_shooting`| [12, 13]| 6 | Once (0) | Bow drawing & release posture (*reserved for future chapters*). |
| `titi_happy` | `titibaccha_happy`| [14, 15] | 4 | Loop (-1) | Joyful wing flap, tiny hop, and cheerful expression. |
| `titi_sad` | `titibaccha_sad` | [16, 17] | 2 | Loop (-1) | Drooped head, wings lowered, slow blinking sorrow. |

---

## 3. Ronny (`ronny`)

**Visual Dimensions**: 64 × 80 px (Baseline at y = 76 px)  
**Anchor (Origin)**: `(0.5, 0.5)`  
**Arcade Physics Body**: `40 × 70 px` (Offset: `x = 12`, `y = 8`)  
**Default Facing**: Left (facing inward toward the garden path)

| Animation Key | Animation Key Alias | Frames | FPS | Repeat | Description & Narrative Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ronny_idle` | — | [0, 1] | 2 | Loop (-1) | Standing watchfully at camp, soft coat folds moving. |
| `ronny_waiting_food`| `ronny_waiting`| [2, 3] | 3 | Loop (-1) | Holding a warm grain bowl, waving gently toward Titi. |
| `ronny_feeding`| — | [4, 5] | 4 | Loop (-1) | Kneeling down and offering food seeds forward. |
| `ronny_surprised`| — | [6, 7] | 4 | Once (0) | Shocked posture as he spots Titi turning toward the Fox. |
| `ronny_sad` | — | [8, 9] | 2 | Loop (-1) | Head lowered in disbelief and heartbreak; eyes filled with grief. |
| `ronny_walking_away`| `ronny_walk` | [10, 11, 12, 13]| 4 | Loop (-1) | Walking into the misty rightward woods alone. |
| `ronny_running`| — | [14, 15, 16, 17]| 8 | Loop (-1) | Urgent fleeing or running stride. |
| `ronny_hugging`| — | [18, 19] | 2 | Loop (-1) | Warm embrace kneeling down (*reserved for Chapter 7 reunion*).|

---

## 4. The Fox (`fox`)

**Visual Dimensions**: 80 × 56 px (Baseline at y = 52 px)  
**Anchor (Origin)**: `(0.5, 0.5)`  
**Arcade Physics Body**: `60 × 40 px` (Offset: `x = 10`, `y = 12`)  
**Default Facing**: Left (facing toward approaching Titi)

| Animation Key | Animation Key Alias | Frames | FPS | Repeat | Description & Narrative Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fox_idle` | — | [0, 1] | 2 | Loop (-1) | Low stalking crouch, bushy tail swaying slowly. |
| `fox_walking` | `fox_walk` | [2, 3, 4, 5] | 6 | Loop (-1) | Sleek, silent predator prowl across the overgrown grass. |
| `fox_attracting`| `fox_attract` | [6, 7] | 4 | Loop (-1) | Nudging glowing berries forward to deceive hungry Titi. |
| `fox_eating` | — | [8, 9] | 4 | Loop (-1) | Chewing nonchalantly while observing Ronny's reaction. |
| `fox_deceptive`| — | [10, 11] | 3 | Loop (-1) | Narrowed amber eyes, sly cunning grin in shadow. |

---

## 5. Animation Registration & Lifecycle

Animations are registered during game bootstrap via `CharacterAssetManager.getInstance().initializeCharacters(scene)`:

```typescript
const animDef = char.animations[animName];
if (!scene.anims.exists(animDef.key)) {
  scene.anims.create({
    key: animDef.key,
    frames: animDef.frames
      ? animDef.frames.map((frameIdx) => ({
          key: char.defaultTexture,
          frame: frameIdx,
        }))
      : scene.anims.generateFrameNumbers(char.defaultTexture, {}),
    frameRate: animDef.frameRate,
    repeat: animDef.repeat,
  });
}
```

### Facing Direction Control:
To ensure characters face the intended direction regardless of sprite sheet base orientation:
- When moving right: `sprite.setFlipX(false)`
- When moving left: `sprite.setFlipX(true)`
- For stationary NPCs (Ronny & Fox), default facing is set via `setFlipX(defaultFacing === "left")` on spawn.

---

## 6. Procedural Fallback System

If production art is missing:
1. `AssetGenerator.generateAllPlaceholders(scene)` renders deterministic canvas textures with correct dimensions and frame counts.
2. Distinct visual markers ensure immediate readability during playtesting:
   - **Titi**: Yellow chick body, bright orange beak, two orange feet, wing details, emotion indicators.
   - **Ronny**: Tall earthen tunic, leather belt, hair/hat, camp bag, food bowl.
   - **Fox**: Sleek russet body, white chest patch, dark paws, amber eyes, bushy tail.
3. Once approved production sprite sheets or frame sequences are placed in `/public/assets/characters/`, the manifest will seamlessly use the real art files with zero code changes required.
