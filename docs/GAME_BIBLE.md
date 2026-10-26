# GAME BIBLE: Run Titibaccha, Run!

> **Version**: 2.0.0-production  
> **Status**: Active Development – Chapter 1: The Betrayal (Full Playable Level)  
> **Target Platform**: Desktop Browser (16:9 responsive logical container: 1280x720)  
> **Core Technology**: Next.js 14 (App Router), TypeScript, Phaser 3.88 (Arcade Physics), Tailwind CSS

---

## 1. Executive Summary & Vision

**Run Titibaccha, Run!** is an original narrative 2D platforming adventure. Players step into the tiny orange feet of **Titibaccha**—a spirited, vulnerable, yet fiercely determined baby chick—navigating a disaster-struck world, unraveling mysteries, and seeking reunion with Ronny.

The game blends responsive 2D platforming feel with emotional environmental storytelling, collectible letter fragments, and atmospheric audiovisual pacing.

---

## 2. World & Narrative Arc (Seven Chapters Canonical Specification)

The overarching story is structured into seven distinct chapters:

1. **Chapter 1: The Betrayal (Current Level)**  
   *Setting*: A destroyed, melancholic domestic garden ravaged by an earlier celestial meteor disaster. Scorched earth and shattered flowerbeds contrast with resilient green blooms.  
   *Level Objective*: Traverse 7 dangerous ruined garden segments, master moving platforms and hazardous ruins, reach Ronny who is waiting with food and supplies, witness the tragic fox deception, and recover the Chapter 2 Key and Letter Fragment 1.  
   *Narrative Climax*: Ronny waits with food and provisions. A cunning fox deliberately lures innocent, hungry Titibaccha with golden bait. Ronny witnesses this, misinterprets the interaction as abandonment, becomes heartbroken, and departs alone. Titibaccha is left alone in the clearing.

2. **Chapter 2: The Search** *(Future Milestone)*  
   *Setting*: Beyond the garden perimeter, following Ronny's distant trail through unfamiliar terrain.  
   *Focus*: Tracking clues, vertical leaps, and the emotional burden of separation.

3. **Chapter 3: The Murky Stream & Reedbeds** *(Future Milestone)*  
   *Setting*: Water-logged channels and flooded irrigation ditches.  
   *Focus*: Buoyancy, floating debris timing, leaping hazards.

4. **Chapter 4: The Briar Maze** *(Future Milestone)*  
   *Setting*: Dense thorny undergrowth and bramble tunnels.  
   *Focus*: Complex maze navigation and puzzle routing.

5. **Chapter 5: The Autumn Forest & Fox's Trail** *(Future Milestone)*  
   *Setting*: Deciduous woodlands where the fox's motives begin to unravel.  
   *Focus*: Stealth, misdirection, and environmental challenges.

6. **Chapter 6: The Stormy Mills** *(Future Milestone)*  
   *Setting*: Abandoned wind-swept agricultural mills and rotating mechanisms.  
   *Focus*: Wind physics, rotating wheel traversal, rain visibility.

7. **Chapter 7: Reunion & The Complete Letter** *(Future Milestone)*  
   *Setting*: The final summit and homestead.  
   *Focus*: Resolution, emotional reunion, and piecing together Ronny's complete 7-fragment letter.

> **CRITICAL PRODUCTION RULE**: Do NOT fabricate full letter contents, speculative Ronny conversations, fox motive reveals, or chapter counts beyond the technical roadmap. All cutscene sequences must remain clearly marked architectural hooks until final Google Flow media assets are integrated.

---

## 3. Characters

### Titibaccha ("Titi" - The Protagonist)
- **Visual Identity**: A small fluffy yellow baby chick with alert eyes, an expressive orange beak, and energetic orange feet.
- **Personality**: Innocent, hungry, curious, loyal, brave beyond its tiny size.
- **Role in Chapter 1**: Navigating the destroyed garden to reunite with Ronny; tricked by the fox's bait without malicious intent.

### Ronny (The Human Companion / Caretaker)
- **Visual Identity**: A young boy in a blue weather jacket and boots with a traveling pack.
- **Personality**: Caring, protective, but emotionally wounded by disaster and isolation.
- **Role in Chapter 1**: Waits patiently at the clearing with a bowl of food and supplies; leaves in visible sorrow upon seeing Titi with the fox.

### The Fox (The Cunning Deceiver)
- **Visual Identity**: A sleek rust-red fox with piercing amber eyes, a white chest, and a bushy tail.
- **Personality**: Enigmatic, opportunistic, manipulative.
- **Role in Chapter 1**: Intentionally places bait to draw Titi away from Ronny at the critical moment, driving a wedge between them.

---

## 4. Chapter 1: The Betrayal — Level Design Segments

The level spans a continuous 6,800-pixel traversable horizontal garden (~3 to 4 minutes active traversal):

1. **Segment 1: Destroyed Garden Entrance ($x = 0 - 1000$)**:
   - Ruined stone gate, fractured pavers, shattered terracotta pots.
   - Initial traversal tutorial and first small Heart Vitality pickup.
2. **Segment 2: Broken Flowerbed Platform Section ($x = 1000 - 2000$)**:
   - Stepped planter terraces suspended over thorny briar pits.
   - **Checkpoint 1 ($x = 1950$)**: Overgrown Sun-Dial Checkpoint.
3. **Segment 3: Fallen Trees and Damaged Fences ($x = 2000 - 3100$)**:
   - Charred tree trunk ramps and broken white picket fence hurdles.
   - High canopy route with Speed Surge Heart pickup.
4. **Segment 4: Cracked Stone Bridge & Moving Platforms ($x = 3100 - 4300$)**:
   - Collapsed stone aqueduct bridge.
   - Horizontal moving trellis platform and vertical stone elevator slab.
   - **Checkpoint 2 ($x = 4250$)**: Weathered Stone Lantern Checkpoint.
5. **Segment 5: Hazardous Garden Ruins ($x = 4300 - 5400$)**:
   - Dense bramble fields, crumbling pillars, precision jumping.
   - Restorative Heart pickup before final leg.
6. **Segment 6: Final Approach to Ronny ($x = 5400 - 6200$)**:
   - Sunlit forest-edge clearing; Ronny is visible at his campsite with food bowl and pack.
7. **Segment 7: The Fox Temptation, Betrayal & Ancient Chest ($x = 6200 - 6800$)**:
   - Scripted deterministic betrayal encounter.
   - Ancient Chest containing **Chapter 2 Key** (`chapter_2_key`) and **Letter Fragment 1 of 7** (`letter_fragment_01`).
   - Chapter 1 Outro Cinematic hook.

---

## 5. Persistence & Local Save Architecture

- **Save Key**: `RUN_TITIBACCHA_SAVE_V2`
- **Migration**: Automatic backward-compatible migration from `RUN_TITIBACCHA_SAVE_V1`.
- **Tracked State**:
  - `version`: 2
  - `chapter`: 1 ("The Betrayal")
  - `activeCheckpoint`: `{ id: string, x: number, y: number, label: string }`
  - `health`: number (clamped to 100, restored to at least 50% on respawn)
  - `collectedItems`: string[] (non-duplicating)
  - `unlockedChests`: string[] (awarded exactly once)
  - `hasChapter2Key`: boolean
  - `hasLetterFragment1`: boolean
  - `settings`: `{ muted: boolean, masterVolume: number }`
  - `timestamp`: number
