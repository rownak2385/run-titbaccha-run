# Character Asset Manifest Specification

> **Project**: *Run Titibaccha, Run!*  
> **Document**: Character Asset Manifest Architecture & Integration Guide  
> **File Location**: `public/assets/characters/manifest.json`  
> **Schema Version**: `2.0.0`

---

## 1. Overview & Architectural Goals

The **Character Asset Manifest** is the data-driven single source of truth for all visual sprites and animation definitions in *Run Titibaccha, Run!*.

### Key Design Pillars:
1. **Decoupled Physics & Visual Dimensions**: Visual sprite dimensions never dictate Arcade Physics hitboxes. Changing an art frame or adding a lavish tail feathers animation never affects jump clearance, gravity, or collision detection.
2. **Nearest-Neighbor Filtering**: Retro pixel-art aesthetics require crisp rendering. All textures loaded via `CharacterAssetManager` apply `Phaser.Textures.FilterMode.NEAREST` with integer pixel alignment.
3. **Dual Source Support**:
   - **Sprite Sheets**: Single texture with uniform grid dimensions (`frameWidth`, `frameHeight`).
   - **Transparent Individual Frame Sequences**: Dynamic directory frames (`walk_00.png`, `walk_01.png`, etc.) for complex animations.
4. **Procedural Fallback Pipeline**: Until final production pixel art is supplied by Google Flow / art pipeline, `AssetGenerator` produces identical, deterministically dimensioned vector textures so gameplay, physics, and cutscene sequencing can be tested and verified immediately.

---

## 2. Directory Layout

All character assets reside in `/public/assets/characters/`:

```
public/assets/characters/
├── manifest.json                  # Data-driven configuration manifest (v2.0.0)
├── titibaccha/
│   ├── spritesheet.png            # Master sprite sheet (optional)
│   ├── idle_0.png                 # Individual frames (supported)
│   ├── idle_1.png
│   ├── run_0.png
│   └── ...
├── ronny/
│   ├── spritesheet.png
│   └── ...
└── fox/
    ├── spritesheet.png
    └── ...
```

---

## 3. Manifest Schema Definition

The manifest is defined by TypeScript interfaces in `src/types/characterAsset.ts`:

```typescript
export interface PhysicsBodyConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface AnimationDefinition {
  key: string;
  sourceType: "spritesheet" | "frame_sequence";
  spriteSheetKey?: string;
  frames?: number[];
  frameFiles?: string[];
  frameRate: number;
  repeat: number; // -1 for loop, 0 for play once
  defaultFacing?: "left" | "right";
}

export interface CharacterMetadata {
  id: "titibaccha" | "ronny" | "fox";
  name: string;
  defaultTexture: string;
  dimensions: {
    frameWidth: number;
    frameHeight: number;
  };
  anchor: {
    x: number;
    y: number;
  };
  physics: PhysicsBodyConfig;
  animations: Record<string, AnimationDefinition>;
}

export interface CharacterManifest {
  version: string;
  characters: Record<string, CharacterMetadata>;
}
```

---

## 4. Current Registered Characters

### 4.1 Titibaccha (`titibaccha`)
- **Default Visual Size**: 48 × 48 px (Canvas baseline at y = 44 px)
- **Physics Collision Box**: 32 × 36 px (offset: x=8, y=10)
- **Anchor (Origin)**: `(0.5, 0.5)`
- **Texture Key**: `prod_titibaccha_spritesheet` (fallback: `titibaccha-idle`)
- **Registered Animation Keys**:
  - `titi_idle` (key: `titi_idle`, alias: `titibaccha_idle`, 2 fps, repeat -1)
  - `titi_running` (key: `titi_running`, alias: `titibaccha_run`, 10 fps, repeat -1)
  - `titi_jumping` (key: `titi_jumping`, alias: `titibaccha_jump`, 1 fps, repeat 0)
  - `titi_falling` (key: `titi_falling`, alias: `titibaccha_fall`, 1 fps, repeat 0)
  - `titi_hurt` (key: `titi_hurt`, alias: `titibaccha_hurt`, 8 fps, repeat 2)
  - `titi_eating` (key: `titi_eating`, alias: `titibaccha_eating`, 4 fps, repeat -1)
  - `titi_shooting` (key: `titi_shooting`, alias: `titibaccha_shooting`, 6 fps, repeat 0) — *future chapters*
  - `titi_happy` (key: `titi_happy`, alias: `titibaccha_happy`, 4 fps, repeat -1)
  - `titi_sad` (key: `titi_sad`, alias: `titibaccha_sad`, 2 fps, repeat -1)

### 4.2 Ronny (`ronny`)
- **Default Visual Size**: 64 × 80 px (Canvas baseline at y = 76 px)
- **Physics Collision Box**: 40 × 70 px (offset: x=12, y=8)
- **Anchor (Origin)**: `(0.5, 0.5)`
- **Texture Key**: `prod_ronny_spritesheet` (fallback: `ronny-idle`)
- **Registered Animation Keys**:
  - `ronny_idle` (2 fps, repeat -1)
  - `ronny_waiting_food` (alias: `ronny_waiting`, 3 fps, repeat -1)
  - `ronny_feeding` (4 fps, repeat -1)
  - `ronny_surprised` (4 fps, repeat 0)
  - `ronny_sad` (2 fps, repeat -1)
  - `ronny_walking_away` (alias: `ronny_walk`, 4 fps, repeat -1)
  - `ronny_running` (8 fps, repeat -1) — *future chapters*
  - `ronny_hugging` (2 fps, repeat -1) — *Chapter 7 reunion*

### 4.3 Fox (`fox`)
- **Default Visual Size**: 80 × 56 px (Canvas baseline at y = 52 px)
- **Physics Collision Box**: 60 × 40 px (offset: x=10, y=12)
- **Anchor (Origin)**: `(0.5, 0.5)`
- **Texture Key**: `prod_fox_spritesheet` (fallback: `fox-idle`)
- **Registered Animation Keys**:
  - `fox_idle` (2 fps, repeat -1)
  - `fox_walking` (alias: `fox_walk`, 6 fps, repeat -1)
  - `fox_attracting` (alias: `fox_attract`, 4 fps, repeat -1)
  - `fox_eating` (4 fps, repeat -1)
  - `fox_deceptive` (3 fps, repeat -1)

---

## 5. Texture Filtering & Rendering Pipeline

1. **Phaser Game Configuration**:
   ```typescript
   render: {
     pixelArt: true,
     antialias: false,
     roundPixels: true,
   }
   ```
2. **Runtime Texture Initialization**:
   `CharacterAssetManager.getInstance().initializeCharacters(scene)` iterates over all loaded textures and executes:
   ```typescript
   if (scene.textures.exists(char.defaultTexture)) {
     const tex = scene.textures.get(char.defaultTexture);
     tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
   }
   ```
3. **Independent Physics Hitbox Binding**:
   When instantiating a character sprite, call:
   ```typescript
   CharacterAssetManager.getInstance().setupPhysicsBody(sprite, "titibaccha");
   ```
   This reads `physics: { width, height, offsetX, offsetY }` directly from `manifest.json`, ensuring the physics bounding box remains strictly consistent regardless of visual sprite updates.

---

## 6. How to Supply Production Pixel Art

To replace procedural placeholders with production pixel art:
1. Export PNG sprite sheet to `public/assets/characters/<characterId>/spritesheet.png`.
2. Ensure frames follow a uniform horizontal grid or update `manifest.json` with frame indices.
3. Update `dimensions.frameWidth` and `frameHeight` in `manifest.json`.
4. Leave `physics` collision dimensions unchanged unless deliberate gameplay tuning is requested.
5. If using individual frame files, specify `sourceType: "frame_sequence"` and provide the array of filenames in `frameFiles`.
