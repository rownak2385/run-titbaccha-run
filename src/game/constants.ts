export const GAME_CONSTANTS = {
  // Screen and viewport
  LOGICAL_WIDTH: 1280,
  LOGICAL_HEIGHT: 720,
  LEVEL_WIDTH: 6800, // Standard traversable level width for chapters
  LEVEL_HEIGHT: 720,

  // Player physics
  PLAYER: {
    GRAVITY_Y: 1100,
    BASE_SPEED: 250,
    BOOSTED_SPEED: 375, // 1.5x speed boost
    JUMP_IMPULSE: -560,
    ACCELERATION: 1600,
    DRAG_X: 1100,
    BOUNCE_Y: 0.05,
    COLLIDER_WIDTH: 32,
    COLLIDER_HEIGHT: 36,
    COLLIDER_OFFSET_X: 6,
    COLLIDER_OFFSET_Y: 10,
  },

  // Vitality & Health system
  RESOURCE: {
    MAX_HEALTH: 100,
    INITIAL_HEALTH: 100,
    MIN_RESPAWN_HEALTH: 60, // Restores at least 50% vitality on respawn (60%)
    HAZARD_DAMAGE: 25,
    INVULNERABILITY_DURATION_MS: 1200,
    KNOCKBACK_FORCE_X: 220,
    KNOCKBACK_FORCE_Y: -280,
  },

  // Heart pickup
  HEART_PICKUP: {
    HEAL_AMOUNT: 30,
    BOOST_DURATION_MS: 5000, // 5.0 seconds configurable speed boost
    SPEED_MULTIPLIER: 1.5,
  },

  // Bow & Arrow Combat System
  COMBAT: {
    ARROW_SPEED: 700,
    ARROW_GRAVITY_Y: 250,
    ARROW_DAMAGE: 50,
    INITIAL_QUIVER: 10,
    MAX_ARROWS: 25,
    BUNDLE_REFILL: 5,
    FIRE_COOLDOWN_MS: 400,
    ENEMY_KNOCKBACK_X: 180,
    ENEMY_KNOCKBACK_Y: -120,
  },

  // Torch & Cave Darkness System (Chapter 4)
  TORCH: {
    VITALITY_DRAIN_INTERVAL_MS: 1500,
    VITALITY_DRAIN_AMOUNT: 1,
    LIGHT_RADIUS: 160,
    SUNLIGHT_LIGHT_RADIUS: 300,
  },

  // Chapters Metadata
  CHAPTERS: {
    CHAPTER_1: {
      id: 1,
      title: "The Betrayal",
      sceneKey: "Chapter1GardenScene",
      levelWidth: 6800,
    },
    CHAPTER_2: {
      id: 2,
      title: "The Search",
      sceneKey: "Chapter2SearchScene",
      levelWidth: 6800,
      requiredKeyId: "chapter_2_key",
    },
    CHAPTER_3: {
      id: 3,
      title: "The Rescue",
      sceneKey: "Chapter3RescueScene",
      levelWidth: 7200,
      requiredKeyId: "chapter_3_key",
    },
    CHAPTER_4: {
      id: 4,
      title: "The Darkness",
      sceneKey: "Chapter4DarknessScene",
      levelWidth: 6800,
      requiredKeyId: "chapter_4_key",
    },
    CHAPTER_5: {
      id: 5,
      title: "The Station",
      sceneKey: "Chapter5StationScene",
      levelWidth: 6800,
      requiredKeyId: "chapter_5_key",
    },
    CHAPTER_6: {
      id: 6,
      title: "The Destination",
      sceneKey: "Chapter6DestinationScene",
      levelWidth: 6800,
      requiredKeyId: "chapter_6_key",
    },
    CHAPTER_7: {
      id: 7,
      title: "The Heaven",
      sceneKey: "Chapter7HeavenScene",
      levelWidth: 6800,
      requiredKeyId: "chapter_7_key",
    },
  },

  // Checkpoints across Chapters
  CHECKPOINTS: {
    // Chapter 1
    DEFAULT_SPAWN: {
      x: 120,
      y: 580,
      id: "ch1_spawn_default",
      label: "Destroyed Garden Entrance",
    },
    CHECKPOINT_1: {
      x: 1950,
      y: 570,
      id: "ch1_checkpoint_sundial",
      label: "Overgrown Sun-Dial Plaza",
    },
    CHECKPOINT_2: {
      x: 4250,
      y: 570,
      id: "ch1_checkpoint_lantern",
      label: "Weathered Stone Lantern",
    },

    // Chapter 2
    CH2_SPAWN: {
      x: 140,
      y: 580,
      id: "ch2_spawn",
      label: "Ruined Garden Perimeter",
    },
    CH2_CP1: {
      x: 1950,
      y: 570,
      id: "ch2_checkpoint_trellis",
      label: "Collapsed Trellis Waypoint",
    },
    CH2_CP2: {
      x: 3900,
      y: 570,
      id: "ch2_checkpoint_statue",
      label: "Fallen Angel Fountain",
    },
    CH2_CP3: {
      x: 5500,
      y: 570,
      id: "ch2_checkpoint_overlook",
      label: "Wilderness Overlook Trail",
    },

    // Chapter 3
    CH3_SPAWN: {
      x: 140,
      y: 580,
      id: "ch3_spawn",
      label: "Forest Verge Entryway",
    },
    CH3_CP1: {
      x: 2150,
      y: 570,
      id: "ch3_checkpoint_ancient_oak",
      label: "Ancient Hollow Oak",
    },
    CH3_CP2: {
      x: 4350,
      y: 570,
      id: "ch3_checkpoint_ravine",
      label: "Misty Timber Ravine",
    },
    CH3_CP3: {
      x: 6250,
      y: 570,
      id: "ch3_checkpoint_cavern_mouth",
      label: "Dark Cavern Threshold",
    },

    // Chapter 4
    CH4_SPAWN: {
      x: 140,
      y: 580,
      id: "ch4_spawn",
      label: "Underground Cavern Shaft",
    },
    CH4_CP1: {
      x: 1950,
      y: 570,
      id: "ch4_checkpoint_sunlight_1",
      label: "First Sunlit Chasm",
    },
    CH4_CP2: {
      x: 3950,
      y: 570,
      id: "ch4_checkpoint_sunlight_2",
      label: "Crystalline Grotto Basin",
    },
    CH4_CP3: {
      x: 5650,
      y: 570,
      id: "ch4_checkpoint_sunlight_3",
      label: "Deep Daylight Fracture",
    },

    // Chapter 5: The Station
    CH5_SPAWN: {
      x: 140,
      y: 580,
      id: "ch5_spawn",
      label: "Highland Station Platform",
    },
    CH5_CP1: {
      x: 1200,
      y: 580,
      id: "ch5_checkpoint_gate",
      label: "Ticket Inspection Platform",
    },
    CH5_CP2: {
      x: 3400,
      y: 490,
      id: "ch5_checkpoint_car_mid",
      label: "Mid-Train Passenger Roof",
    },
    CH5_CP3: {
      x: 5400,
      y: 490,
      id: "ch5_checkpoint_tender",
      label: "Locomotive Tender Overlook",
    },

    // Chapter 6: The Destination
    CH6_SPAWN: {
      x: 140,
      y: 580,
      id: "ch6_spawn",
      label: "Coastal Terminus Dock",
    },
    CH6_CP1: {
      x: 950,
      y: 580,
      id: "ch6_checkpoint_blast",
      label: "Exploded Engine Wreckage",
    },
    CH6_CP2: {
      x: 3200,
      y: 570,
      id: "ch6_checkpoint_bridge",
      label: "Broken Coastal Aqueduct",
    },
    CH6_CP3: {
      x: 5200,
      y: 570,
      id: "ch6_checkpoint_cliffs",
      label: "High Crag Overlook",
    },

    // Chapter 7: The Heaven
    CH7_SPAWN: {
      x: 140,
      y: 580,
      id: "ch7_spawn",
      label: "Sunset Ocean Path",
    },
    CH7_CP1: {
      x: 1500,
      y: 570,
      id: "ch7_checkpoint_sunset_ridge",
      label: "Sunset Meadow Ridge",
    },
    CH7_CP2: {
      x: 3600,
      y: 570,
      id: "ch7_checkpoint_pine_terrace",
      label: "Whispering Pine Terrace",
    },
    CH7_CP3: {
      x: 5700,
      y: 570,
      id: "ch7_checkpoint_summit_plateau",
      label: "Clifftop Sanctuary Plateau",
    },
  },

  // Collectibles, Items, Chests, Keys & Puzzles
  IDENTIFIERS: {
    // Keys
    CHAPTER_2_KEY_ID: "chapter_2_key",
    CHAPTER_3_KEY_ID: "chapter_3_key",
    CHAPTER_4_KEY_ID: "chapter_4_key",
    CHAPTER_5_KEY_ID: "chapter_5_key",
    CHAPTER_6_KEY_ID: "chapter_6_key",
    CHAPTER_7_KEY_ID: "chapter_7_key",
    DEMO_KEY_LEGACY_ID: "demo_key_garden_01",

    // Secret Letter Fragments
    LETTER_FRAGMENT_1_ID: "letter_fragment_01",
    LETTER_FRAGMENT_2_ID: "letter_fragment_02",
    LETTER_FRAGMENT_3_ID: "letter_fragment_03",
    LETTER_FRAGMENT_4_ID: "letter_fragment_04",
    LETTER_FRAGMENT_5_ID: "letter_fragment_05",
    LETTER_FRAGMENT_6_ID: "letter_fragment_06",
    LETTER_FRAGMENT_7_ID: "letter_fragment_07",

    // Weapon & Ammunition
    BOW_ITEM_ID: "ronnys_hunting_bow",

    // Chapter 4 Special Items
    CAVE_NOTE_ID: "mysterious_cave_note",
    TRAIN_TICKET_ID: "train_ticket",

    // Chapter 6 Special Items
    RONNY_BAG_ID: "ronny_travel_bag",

    // Chapter 7 Special Items
    BOUQUET_ITEM_ID: "five_rose_bouquet",

    // Chests
    CHEST_CHAPTER_1_ID: "chest_chapter_1_betrayal",
    CHEST_CHAPTER_2_ID: "chest_chapter_2_search",
    CHEST_CHAPTER_3_ID: "chest_chapter_3_rescue",
    CHEST_CHAPTER_4_ID: "chest_chapter_4_darkness",
    CHEST_CHAPTER_5_ID: "chest_chapter_5_station",
    CHEST_CHAPTER_6_ID: "chest_chapter_6_destination",
    CHEST_LEGACY_ID: "chest_garden_demo_01",

    // Photo Puzzle Pieces (Chapter 3 - 9 pieces)
    PHOTO_PIECES: [
      "photo_piece_01",
      "photo_piece_02",
      "photo_piece_03",
      "photo_piece_04",
      "photo_piece_05",
      "photo_piece_06",
      "photo_piece_07",
      "photo_piece_08",
      "photo_piece_09",
    ],

    // Train Ticket Puzzle Pieces (Chapter 4 - 3 pieces)
    TICKET_PIECES: [
      "ticket_piece_01",
      "ticket_piece_02",
      "ticket_piece_03",
    ],

    // Destination Map Puzzle Pieces (Chapter 6 - 4 pieces)
    MAP_PIECES: [
      "map_piece_01",
      "map_piece_02",
      "map_piece_03",
      "map_piece_04",
    ],

    // Clifftop Roses (Chapter 7 - 5 roses)
    ROSES: [
      "rose_01",
      "rose_02",
      "rose_03",
      "rose_04",
      "rose_05",
    ],
  },

  // Save system
  SAVE: {
    STORAGE_KEY: "RUN_TITIBACCHA_SAVE_V4",
    V3_STORAGE_KEY: "RUN_TITIBACCHA_SAVE_V3",
    V2_STORAGE_KEY: "RUN_TITIBACCHA_SAVE_V2",
    LEGACY_STORAGE_KEY: "RUN_TITIBACCHA_SAVE_V1",
    SCHEMA_VERSION: 4,
  },

  // Narrative Positions Chapter 1
  NARRATIVE: {
    RONNY_CAMP_X: 6120,
    RONNY_CAMP_Y: 620,
    FOX_ENCOUNTER_X: 6380,
    FOX_ENCOUNTER_Y: 630,
    CHEST_X: 6650,
    CHEST_Y: 638,
  },
} as const;
