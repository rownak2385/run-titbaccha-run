# Run Titibaccha, Run! — Chapter 1: The Betrayal

> **Stage**: Milestone 2 Full Playable Level  
> **Status**: Complete 3–4 minute playable level with scripted narrative ending  
> **Engine**: Phaser 3.88 (Arcade Physics) + Next.js 14 (App Router) + TypeScript (Strict Mode)  
> **Logical Viewport**: 16:9 Responsive Container (1280x720) with dynamic letterboxing

---

## 🐤 Chapter 1 Overview: The Betrayal

*Run Titibaccha, Run!* is an original narrative 2D platforming adventure. In **Chapter 1: The Betrayal**, players guide **Titibaccha**—a courageous baby chick with bright orange feet and an orange beak—through a destroyed post-meteor garden. 

Players traverse 7 distinct segments across 6,800 pixels of ruined garden terrain, overcoming moving platforms, fractured flowerbed terraces, and dense thorn brambles to reach Ronny at his clearing camp. As Titibaccha draws near, a cunning Fox places golden bait, creating a tragic misunderstanding where Ronny believes himself abandoned and departs heartbroken into the wilderness.

---

## 🗺️ Seven Meaningful Level Segments

1. **Destroyed Garden Entrance ($x = 0 - 1000$)**: Ruined iron garden gate, rubble jumps, initial tutorial and first Heart Vitality pickup.
2. **Broken Flowerbed Platform Section ($x = 1000 - 2000$)**: Multi-tiered planter terraces suspended over thorny briar pits. Features **Checkpoint 1: Overgrown Sun-Dial Plaza ($x = 1950$)**.
3. **Fallen Trees and Damaged Fences ($x = 2000 - 3100$)**: Charred tree trunk ramps, splintered fence hurdles, and canopy route holding Speed Surge Heart #2.
4. **Cracked Stone Bridge & Moving Platforms ($x = 3100 - 4300$)**: Collapsed stone bridge spanning a deep chasm. Features a horizontal moving trellis slab ($x = 3420 \to 3720$) and a vertical stone elevator lift ($y = 350 \to 530$). Features **Checkpoint 2: Weathered Stone Lantern ($x = 4250$)**.
5. **Hazardous Garden Ruins ($x = 4300 - 5400$)**: Dense bramble clusters and crumbling pillars requiring precision jumps. Contains Heart Vitality #3.
6. **Final Approach to Ronny ($x = 5400 - 6200$)**: The sunlit clearing. Ronny is waiting with a warm bowl of chick feed and camp provisions.
7. **The Fox Betrayal & Ancient Chest ($x = 6200 - 6800$)**: Scripted encounter where the Fox lures Titi with golden berries; Ronny departs in visible sorrow. Unlocking the Ancient Chest awards the **Chapter 2 Key** and **Secret Letter Fragment 1 of 7**, triggering the Chapter 1 Outro Cinematic.

---

## 🎮 Controls

| Action | Primary Key | Secondary Key | Description |
| :--- | :--- | :--- | :--- |
| **Move Left** | `A` | `← Arrow` | Run left with smooth acceleration |
| **Move Right** | `D` | `→ Arrow` | Run right with smooth acceleration |
| **Jump** | `W` | `Space` / `↑ Arrow` | Leap onto platforms and moving lifts |
| **Interact** | `E` | — | Open Ancient Chest at level ending |
| **Pause / Resume** | `Esc` | `P` | Open in-game pause menu |
| **Skip Cinematic** | `Esc` | `Space` | Skip narrative video / dialogue |
| **Mute / Unmute** | HUD Button | Title Button | Toggle Web Audio sound effects |

---

## 💾 Save System & Data Migration

- **Current Save Schema**: `RUN_TITIBACCHA_SAVE_V2`
- **Automatic Migration**: Automatically detects and migrates legacy `RUN_TITIBACCHA_SAVE_V1` saves without loss of keys, fragments, or audio settings.
- **Respawn Health Guarantee**: Respawns at the active checkpoint with at least 60% vitality (fulfilling the $\ge 50\%$ mandate).
- **Persistent Collectibles**: Awarded keys and letter fragments are saved immediately and never duplicate across reloads or deaths.

---

## 🎨 Character Asset Pipeline & Manifest

All character sprite sheets adhere to the standardized manifest in [`public/assets/characters/manifest.json`](file:///C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/public/assets/characters/manifest.json):
- **Titibaccha**: 48x48 px frames (`idle`, `run`, `jump`, `fall`, `hurt`)
- **Ronny**: 64x80 px frames (`idle`, `feeding_waiting`, `sad`, `walking_away`)
- **Fox**: 80x56 px frames (`idle`, `attracting`, `eating`)

*Fallback Guarantee*: If external PNG files are not on disk, the system automatically uses procedural vector canvas geometry, ensuring 100% playable uptime.

---

## 🎬 Google Flow Video Integration

The reusable **Cinematic Player** (`CinematicPlayer.tsx`) handles MP4/WebM video playback with WebVTT subtitle synchronization, progressive loading, skip capability, and mute syncing. Full encoding and integration requirements are documented in [`docs/GOOGLE_FLOW_INTEGRATION.md`](file:///C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/docs/GOOGLE_FLOW_INTEGRATION.md).

---

## 🚀 Development & Verification Commands

```bash
# Navigate to project directory
cd C:\Users\nightfury\.gemini\antigravity\scratch\run-titibaccha-run

# Run TypeScript typecheck
npm run typecheck

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start local server
npm start
```
