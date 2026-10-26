# GAME BIBLE: Run Titibaccha, Run!

> **Version**: 3.0.0-combat-free  
> **Status**: Full 7-Chapter Adventure – Combat-Free Platforming, Progression Repair & Illustrated Storytelling  
> **Target Platform**: Desktop Browser (16:9 responsive logical container: 1280x720)  
> **Core Technology**: Next.js 14 (App Router), TypeScript, Phaser 3.88 (Arcade Physics), Tailwind CSS

---

## 1. Executive Summary & Vision

**Run Titibaccha, Run!** is an original narrative 2D running and platforming adventure. Players step into the tiny orange feet of **Titibaccha**—a spirited, vulnerable, yet fiercely determined baby chick—navigating a disaster-struck world, unraveling mysteries, and seeking reunion with Ronny.

### Canonical Game Design Mandate (Combat-Free)
- **Zero Combat**: No bow weapons, no arrow projectiles, no mouse-aimed shooting, and no enemy combat encounters.
- **Pure Platforming & Exploration**: Traversal is driven purely by running, precision jumping, moving platforms, environmental hazards (briars, crumbling masonry, mud chasms, steam pipes), puzzle piece gathering, and vitality management.
- **Illustrated Storytelling**: Narrative progression is conveyed via interactive, readable `IllustratedStoryPanel` modals that pause gameplay and advance story beats without requiring external video streams.
- **Narrative Invariants**: Chapter 1 fox deception; Chapters 3–6 puzzle assembly (Photo, Ticket, Map); Chapter 7 peaceful rose gathering, radiant leaf pendants, emotional reunion embrace occurring **before** secret letter assembly, and clifftop sunset ending.

---

## 2. World & Narrative Arc (Seven Canonical Chapters)

1. **Chapter 1: The Betrayal (Ruined Garden & Campsite)**  
   *Setting*: Scorched garden terraces and flowerbeds ravaged by celestial disaster.  
   *Objective*: Run through ruined garden terraces, leap over briar pits, reach Ronny's campsite, witness the fox's deceptive bait encounter, and collect the Chapter 2 Key and Letter Fragment 1.

2. **Chapter 2: The Search (Wilderness Trails)**  
   *Setting*: Desolate trails and crumbling colonnades beyond the garden gate.  
   *Objective*: Follow the golden heart trail dropped from Ronny's bag, navigate broken chasms and moving platforms, and recover the Chapter 3 Key and Letter Fragment 2.

3. **Chapter 3: The Rescue (Whispering Forest)**  
   *Setting*: Deep ancient forest canopy and suspended wooden log bridges.  
   *Objective*: Explore branches and hidden routes to collect all **9 Photo Memory Fragments** of Ronny and Titi. Assembling the photo unlocks the entrance to the ancient cave vault and awards Letter Fragment 3.

4. **Chapter 4: The Darkness (Subterranean Cavern & Sunlit Glades)**  
   *Setting*: Dark crystal cavern with limited torch radius and sunlight zones.  
   *Objective*: Balance torch vitality, discover hidden supplies, collect all **3 Train Ticket Fragments**, assemble the Highland Express Ticket, and obtain Letter Fragment 4.

5. **Chapter 5: The Station (Highland Express Rooftops)**  
   *Setting*: High-speed train rushing through misty mountain passes.  
   *Objective*: Board the train with the valid ticket, leap across moving carriage roofs, dodge steam vents, avoid falling off tracks, and secure the engine safe for Letter Fragment 5.

6. **Chapter 6: The Destination (Coastal Bluffs & Locomotive Wreck)**  
   *Setting*: Ocean cliffs, terminus dock, and mountain climb.  
   *Objective*: Discover Ronny's lost traveling pack, survive the engine boiler explosion, collect all **4 Destination Map Fragments**, assemble the coastal map, and ascend to the sanctuary summit for Letter Fragment 6.

7. **Chapter 7: The Heaven (Clifftop Sanctuary & Sunset Reunion)**  
   *Setting*: Serene clifftop meadow bathed in sunset glow above the sea.  
   *Objective*: Peaceful exploration. Gather **5 wild clifftop roses** to create the Five-Rose Bouquet. Reach Ronny, witness the synchronized emerald glow of matching leaf pendants, share the long-awaited warm reunion hug, assemble the complete 7-piece letter, and sit together watching the sunset.

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
