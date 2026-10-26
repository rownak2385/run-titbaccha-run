# Character Animation File Production Checklist

> **Project**: *Run Titibaccha, Run!*  
> **Document**: Comprehensive Production Asset Checklist  
> **Target Directory**: `public/assets/characters/`  
> **Validation Command**: `npm run validate:assets`

---

## 1. Quick Summary of Required Files

You can provide either **Option A (Master Sprite Sheets)** or **Option B (Individual Frame Sequences)**.

| Character | Target Dimensions | Master Sprite Sheet (Option A) | Total Individual Frames (Option B) | Current Engine Status |
| :--- | :--- | :--- | :--- | :--- |
| **Titibaccha** | 48 × 48 px / frame | `public/assets/characters/titibaccha.png` (864 × 48 px) | 18 PNG files | 🟡 Procedural Vector Fallback Active |
| **Ronny** | 64 × 80 px / frame | `public/assets/characters/ronny.png` (1280 × 80 px) | 20 PNG files | 🟡 Procedural Vector Fallback Active |
| **The Fox** | 80 × 56 px / frame | `public/assets/characters/fox.png` (960 × 56 px) | 12 PNG files | 🟡 Procedural Vector Fallback Active |

---

## 2. Titibaccha (`titibaccha`) — 18 Frames Total

**Canvas Frame Size**: `48 × 48 px` | **Anchor**: `(0.5, 0.5)` | **Ground Baseline**: `y = 44 px` | **Facing**: Right  
**Master Sprite Sheet Path**: `/public/assets/characters/titibaccha.png`  
**Frame Sequence Directory**: `/public/assets/characters/titibaccha/`

| Animation Key | Animation Key Alias | Required Frames | FPS | Repeat | Individual Filename(s) | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `titi_idle` | `titibaccha_idle` | 2 | 2 | Loop (-1) | `idle_0.png`<br>`idle_1.png` | Subtle upright breathing, small beak, orange feet, eye blink. | ⏳ Pending Art (Fallback Active) |
| `titi_running` | `titibaccha_run` | 4 | 10 | Loop (-1) | `run_0.png`<br>`run_1.png`<br>`run_2.png`<br>`run_3.png` | Energetic running stride with alternating feet and wing flap. | ⏳ Pending Art (Fallback Active) |
| `titi_jumping` | `titibaccha_jump` | 1 | 1 | Once (0) | `jump_0.png` | Upward trajectory with tucked orange feet and lifted wings. | ⏳ Pending Art (Fallback Active) |
| `titi_falling` | `titibaccha_fall` | 1 | 1 | Once (0) | `fall_0.png` | Flapping descent posture with downward glance. | ⏳ Pending Art (Fallback Active) |
| `titi_hurt` | `titibaccha_hurt` | 2 | 8 | 2 loops | `hurt_0.png`<br>`hurt_1.png` | Recoil stagger with ruffled feathers upon hazard damage. | ⏳ Pending Art (Fallback Active) |
| `titi_eating` | `titibaccha_eating` | 2 | 4 | Loop (-1) | `eating_0.png`<br>`eating_1.png` | Head dipped down pecking at grain or fox bait. | ⏳ Pending Art (Fallback Active) |
| `titi_shooting`| `titibaccha_shooting`| 2 | 6 | Once (0) | `shooting_0.png`<br>`shooting_1.png` | Bow draw and release posture (*reserved for future chapters*). | ⏳ Pending Art (Fallback Active) |
| `titi_happy` | `titibaccha_happy` | 2 | 4 | Loop (-1) | `happy_0.png`<br>`happy_1.png` | Joyful hop with curved cheerful eyes and wing flutter. | ⏳ Pending Art (Fallback Active) |
| `titi_sad` | `titibaccha_sad` | 2 | 2 | Loop (-1) | `sad_0.png`<br>`sad_1.png` | Drooped crest and sorrowful expression. | ⏳ Pending Art (Fallback Active) |

---

## 3. Ronny (`ronny`) — 20 Frames Total

**Canvas Frame Size**: `64 × 80 px` | **Anchor**: `(0.5, 0.5)` | **Ground Baseline**: `y = 76 px` | **Facing**: Left  
**Master Sprite Sheet Path**: `/public/assets/characters/ronny.png`  
**Frame Sequence Directory**: `/public/assets/characters/ronny/`

| Animation Key | Animation Key Alias | Required Frames | FPS | Repeat | Individual Filename(s) | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ronny_idle` | — | 2 | 2 | Loop (-1) | `idle_0.png`<br>`idle_1.png` | Standing watchfully at camp looking toward garden gate. | ⏳ Pending Art (Fallback Active) |
| `ronny_waiting_food`| `ronny_waiting`| 2 | 3 | Loop (-1) | `waiting_0.png`<br>`waiting_1.png` | Kneeling beside travel pack holding a warm bowl of chick feed. | ⏳ Pending Art (Fallback Active) |
| `ronny_feeding` | — | 2 | 4 | Loop (-1) | `feeding_0.png`<br>`feeding_1.png` | Scooping motion scattering seeds onto the ground. | ⏳ Pending Art (Fallback Active) |
| `ronny_surprised`| — | 2 | 4 | Once (0) | `surprised_0.png`<br>`surprised_1.png` | Shocked recoil as the Fox steps into the clearing. | ⏳ Pending Art (Fallback Active) |
| `ronny_sad` | — | 2 | 2 | Loop (-1) | `sad_0.png`<br>`sad_1.png` | Drops bowl, head hung in disbelief and heartbreak. | ⏳ Pending Art (Fallback Active) |
| `ronny_walking_away`| `ronny_walk` | 4 | 4 | Loop (-1) | `walk_away_0.png`<br>`walk_away_1.png`<br>`walk_away_2.png`<br>`walk_away_3.png` | Turning back and walking into the wilderness mist. | ⏳ Pending Art (Fallback Active) |
| `ronny_running`| — | 4 | 8 | Loop (-1) | `run_0.png`<br>`run_1.png`<br>`run_2.png`<br>`run_3.png` | Urgent running stride (*reserved for meteor disaster / future*). | ⏳ Pending Art (Fallback Active) |
| `ronny_hugging`| — | 2 | 2 | Loop (-1) | `hug_0.png`<br>`hug_1.png` | Warm reunion embrace kneeling (*reserved for Chapter 7*). | ⏳ Pending Art (Fallback Active) |

---

## 4. The Fox (`fox`) — 12 Frames Total

**Canvas Frame Size**: `80 × 56 px` | **Anchor**: `(0.5, 0.5)` | **Ground Baseline**: `y = 52 px` | **Facing**: Left  
**Master Sprite Sheet Path**: `/public/assets/characters/fox.png`  
**Frame Sequence Directory**: `/public/assets/characters/fox/`

| Animation Key | Animation Key Alias | Required Frames | FPS | Repeat | Individual Filename(s) | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `fox_idle` | — | 2 | 2 | Loop (-1) | `idle_0.png`<br>`idle_1.png` | Low stalk crouch with swaying bushy tail and amber eyes. | ⏳ Pending Art (Fallback Active) |
| `fox_walking` | `fox_walk` | 4 | 6 | Loop (-1) | `walk_0.png`<br>`walk_1.png`<br>`walk_2.png`<br>`walk_3.png` | Sleek silent prowl across the garden grass. | ⏳ Pending Art (Fallback Active) |
| `fox_attracting`| `fox_attract` | 2 | 4 | Loop (-1) | `attract_0.png`<br>`attract_1.png` | Nudging glowing berries forward to bait Titibaccha. | ⏳ Pending Art (Fallback Active) |
| `fox_eating` | — | 2 | 4 | Loop (-1) | `eating_0.png`<br>`eating_1.png` | Feasting on remaining berries with sharp teeth. | ⏳ Pending Art (Fallback Active) |
| `fox_deceptive` | — | 2 | 3 | Loop (-1) | `deceptive_0.png`<br>`deceptive_1.png` | Crooked sly smirk as Ronny departs into the forest. | ⏳ Pending Art (Fallback Active) |

---

## 5. Import Steps for the Artist

1. **Draw and Slice**: Export each animation frame as transparent 32-bit PNG according to the dimensions above.
2. **Directory Placement**:
   - For individual frames, place them directly into `public/assets/characters/<characterId>/`.
   - For master sprite sheets, place the single horizontal image at `public/assets/characters/<characterId>.png`.
3. **Run Verification**:
   ```bash
   npm run validate:assets
   ```
4. **Instant In-Game Testing**:
   Start the game with `npm run dev` or `npm run build && npm run start`.
   Phaser will automatically detect the production files, apply `NEAREST` filtering, and swap from the procedural vector fallback to your production artwork.
