/**
 * Centralized Narrative and Story Data for "Run Titibaccha, Run!"
 *
 * NOTE ON CANONICAL SCRIPT / LETTER:
 * The final canonical letter text is pending final story approval from the game author.
 * DO NOT hardcode scattered speculative dialogue across scenes.
 * All letter content and narrative lines are defined centrally here for easy replacement.
 */

export interface LetterFragmentStory {
  id: number;
  chapter: number;
  title: string;
  source: string;
  excerpt: string;
}

export interface StoryPage {
  speaker?: string;
  text: string;
  description?: string;
  illustrationSrc?: string;
}

export type StoryTheme =
  | "garden"
  | "meteor"
  | "betrayal"
  | "search"
  | "photo"
  | "cave"
  | "train"
  | "explosion"
  | "necklace"
  | "hug"
  | "sunset";

export interface StoryPanelData {
  id: string;
  chapterTitle: string;
  subtitle: string;
  illustrationSrc?: string;
  illustrationTheme: StoryTheme;
  pages: StoryPage[];
}

/**
 * Approved 15 Story Illustrations
 * Located in public/assets/story/
 */
export const STORY_IMAGES = {
  PEACEFUL_GARDEN: "/assets/story/01_peaceful_garden_20261026210119.jpg",
  METEOR_DISASTER: "/assets/story/02_meteor_disaster_20261026210119.jpg",
  RONNY_WAITING: "/assets/story/03_ronny_waiting_20261026210119.jpg",
  FOX_BETRAYAL: "/assets/story/04_fox_betrayal_20261026210119.jpg",
  RONNY_LEAVING: "/assets/story/05_ronny_leaving_20261026210119.jpg",
  SEARCH_HEARTS: "/assets/story/06_search_hearts_20261026210119.jpg",
  FOREST_MEMORY: "/assets/story/07_forest_memory_20261026210119.jpg",
  MEMORY_PHOTO: "/assets/story/08_memory_photo_20261026210119.jpg",
  DARK_CAVE: "/assets/story/09_dark_cave_20261026210119.jpg",
  MOVING_TRAIN: "/assets/story/10_moving_train_20261026210119.jpg",
  SEASIDE_ARRIVAL: "/assets/story/11_seaside_arrival_20261026210119.jpg",
  EXPLOSION_MAP: "/assets/story/12_explosion_map_20261026210119.jpg",
  NECKLACE_GLOW: "/assets/story/13_necklace_glow_20261026210119.jpg",
  ROSE_REUNION: "/assets/story/14_rose_reunion_20261026210119.jpg",
  SUNSET_ENDING: "/assets/story/15_sunset_ending_20261026210119.jpg",
} as const;

export const STORY_DATA = {
  // --------------------------------------------------------------------------
  // Story Panels for Illustrated Storytelling
  // --------------------------------------------------------------------------
  STORY_PANELS: {
    prologue_friendship: {
      id: "prologue_friendship",
      chapterTitle: "Prologue: Days of Sunshine",
      subtitle: "The Peaceful Family Garden",
      illustrationSrc: STORY_IMAGES.PEACEFUL_GARDEN,
      illustrationTheme: "garden",
      pages: [
        {
          speaker: "Narrator",
          text: "Long before the shadows fell, the family garden bloomed with warmth, laughter, and fragrant golden sunflowers.",
          description: "Golden sunlight washes over the terrace. Titi pecks happily beside Ronny.",
          illustrationSrc: STORY_IMAGES.PEACEFUL_GARDEN,
        },
        {
          speaker: "Narrator",
          text: "Little Titibaccha hopped safely beside Ronny every morning, learning to explore the soft grass while Ronny tended the seeds.",
          description: "Ronny gently guides Titi along the garden paver path.",
          illustrationSrc: STORY_IMAGES.PEACEFUL_GARDEN,
        },
        {
          speaker: "Narrator",
          text: "They were inseparable companions bound by simple affection, each wearing a matching carved green leaf pendant.",
          description: "Both wear radiant carved leaf necklaces symbolizing their unbreakable bond.",
          illustrationSrc: STORY_IMAGES.PEACEFUL_GARDEN,
        },
      ],
    },

    meteor_disaster: {
      id: "meteor_disaster",
      chapterTitle: "The Shattered Sky",
      subtitle: "A Sudden Celestial Cataclysm",
      illustrationSrc: STORY_IMAGES.METEOR_DISASTER,
      illustrationTheme: "meteor",
      pages: [
        {
          speaker: "Narrator",
          text: "Without warning, a streak of blinding violet fire tore across the heavens and struck the valley grove with a deafening roar.",
          description: "A brilliant streak of violet fire shatters the peaceful sky.",
          illustrationSrc: STORY_IMAGES.METEOR_DISASTER,
        },
        {
          speaker: "Narrator",
          text: "Ancient stone walls crumbled into brambles and smoke, violently separating the companions across an impassable ruin.",
          description: "Dense smoke and scorched chasms divide the garden into dangerous segments.",
          illustrationSrc: STORY_IMAGES.METEOR_DISASTER,
        },
        {
          speaker: "Narrator",
          text: "Heartbroken and alone, Ronny rushed to his camp with provisions, praying his tiny friend would find a way through the wreckage.",
          description: "Ronny waits at the far clearing, hoping Titi will safely cross the ruins.",
          illustrationSrc: STORY_IMAGES.METEOR_DISASTER,
        },
      ],
    },

    ch1_betrayal: {
      id: "ch1_betrayal",
      chapterTitle: "Chapter 1: The Betrayal",
      subtitle: "The Garden Campsite",
      illustrationSrc: STORY_IMAGES.FOX_BETRAYAL,
      illustrationTheme: "betrayal",
      pages: [
        {
          speaker: "Narrator",
          text: "After a perilous trek across the ruined flowerbeds, hungry and exhausted Titibaccha reached Ronny's campsite.",
          description: "Titi hops into the clearing where Ronny waits with a warm bowl of grain.",
          illustrationSrc: STORY_IMAGES.RONNY_WAITING,
        },
        {
          speaker: "Narrator",
          text: "From the hedge shadows, a sleek red fox stepped forward, nudging glowing golden berries toward the innocent chick.",
          description: "The cunning fox places glowing bait between Titi and Ronny.",
          illustrationSrc: STORY_IMAGES.FOX_BETRAYAL,
        },
        {
          speaker: "Narrator",
          text: "Ronny turned and saw Titi feasting beside the predator. Misunderstanding the scene as willing abandonment, Ronny dropped his feed bowl and walked into the wilderness in sorrow.",
          description: "Ronny drops his scoop in heartbreak and disappears down the trail alone.",
          illustrationSrc: STORY_IMAGES.RONNY_LEAVING,
        },
      ],
    },

    ch2_search: {
      id: "ch2_search",
      chapterTitle: "Chapter 2: The Search",
      subtitle: "Following the Fallen Trail",
      illustrationSrc: STORY_IMAGES.SEARCH_HEARTS,
      illustrationTheme: "search",
      pages: [
        {
          speaker: "Narrator",
          text: "Left alone at the empty campsite, Titibaccha refused to give up. In the scorched grass, a trail of glowing yellow heart seeds led beyond the perimeter gate.",
          description: "Titi spots golden seeds scattered along the wilderness path.",
          illustrationSrc: STORY_IMAGES.SEARCH_HEARTS,
        },
        {
          speaker: "Narrator",
          text: "Ronny had dropped them from his traveling pack. Trusting the trail, Titibaccha set out into the wild perimeter to find him.",
          description: "Determined, Titi follows the trail through crumbling masonry and moving platforms.",
          illustrationSrc: STORY_IMAGES.SEARCH_HEARTS,
        },
      ],
    },

    ch3_memory_photo: {
      id: "ch3_memory_photo",
      chapterTitle: "Chapter 3: The Rescue",
      subtitle: "The Whispering Forest",
      illustrationSrc: STORY_IMAGES.MEMORY_PHOTO,
      illustrationTheme: "photo",
      pages: [
        {
          speaker: "Narrator",
          text: "The trail plunged into an ancient forest canopy. Scattered high across the mossy branches and roots lay nine torn pieces of a cherished keepsake.",
          description: "Golden fragments flutter among the ancient oak branches.",
          illustrationSrc: STORY_IMAGES.FOREST_MEMORY,
        },
        {
          speaker: "Narrator",
          text: "It was the beloved photograph of Ronny holding tiny Titi on the day they first met in the garden.",
          description: "Gathering all 9 pieces restores the memory photo of Ronny and Titi.",
          illustrationSrc: STORY_IMAGES.MEMORY_PHOTO,
        },
        {
          speaker: "Narrator",
          text: "With the cherished memory restored, the seal upon the ancient cavern threshold gave way, opening the path forward.",
          description: "The dark cavern entrance unlocks in response to the completed photo.",
          illustrationSrc: STORY_IMAGES.MEMORY_PHOTO,
        },
      ],
    },

    ch4_dark_cave: {
      id: "ch4_dark_cave",
      chapterTitle: "Chapter 4: The Darkness",
      subtitle: "Subterranean Cavern",
      illustrationSrc: STORY_IMAGES.DARK_CAVE,
      illustrationTheme: "cave",
      pages: [
        {
          speaker: "Narrator",
          text: "Plunging beneath the earth, Titibaccha entered a vast cavern illuminated only by crystalline sparks and daylight fractures.",
          description: "Faint torchlight cuts through the deep underground cavern.",
          illustrationSrc: STORY_IMAGES.DARK_CAVE,
        },
        {
          speaker: "Narrator",
          text: "Balancing torch vitality and following the distant echo of an engine whistle, Titi discovered three pieces of a ticket.",
          description: "Three ticket scraps glow upon isolated stone ledges.",
          illustrationSrc: STORY_IMAGES.DARK_CAVE,
        },
        {
          speaker: "Narrator",
          text: "Joining the fragments assembled a valid passenger pass for the Highland Express train departing for the sea.",
          description: "The assembled Train Ticket unlocks the cavern exit vault.",
          illustrationSrc: STORY_IMAGES.DARK_CAVE,
        },
      ],
    },

    ch5_moving_train: {
      id: "ch5_moving_train",
      chapterTitle: "Chapter 5: The Station",
      subtitle: "Highland Express Rooftops",
      illustrationSrc: STORY_IMAGES.MOVING_TRAIN,
      illustrationTheme: "train",
      pages: [
        {
          speaker: "Narrator",
          text: "Reaching the mountain station, Titibaccha presented the ticket and boarded the rushing Highland Express.",
          description: "The heavy locomotive speeds westward across high mountain bridges.",
          illustrationSrc: STORY_IMAGES.MOVING_TRAIN,
        },
        {
          speaker: "Narrator",
          text: "Leaping between speeding carriage roofs and dodging billowing steam vents, Titi navigated toward the heavy front locomotive.",
          description: "Wind whips across the rooftops as Titi bounds from car to car.",
          illustrationSrc: STORY_IMAGES.MOVING_TRAIN,
        },
      ],
    },

    ch6_seaside_explosion: {
      id: "ch6_seaside_explosion",
      chapterTitle: "Chapter 6: The Destination",
      subtitle: "Coastal Terminus & Engine Wreck",
      illustrationSrc: STORY_IMAGES.EXPLOSION_MAP,
      illustrationTheme: "explosion",
      pages: [
        {
          speaker: "Narrator",
          text: "The train arrived near the sea at breakneck speed. Near the terminus dock, Titi discovered Ronny's brown traveling pack.",
          description: "Ronny's pack rests near the edge of the coastal rail dock.",
          illustrationSrc: STORY_IMAGES.SEASIDE_ARRIVAL,
        },
        {
          speaker: "Narrator",
          text: "Suddenly, the overloaded steam boiler erupted in a massive explosion! Titi leapt to safety just as the wreckage crashed into the pebbles.",
          description: "A huge plume of steam and fire erupts from the locomotive boiler.",
          illustrationSrc: STORY_IMAGES.EXPLOSION_MAP,
        },
        {
          speaker: "Narrator",
          text: "Scattered across the coastal bluffs were four destination map fragments. Assembled together, they revealed the trail up to the sanctuary summit.",
          description: "The assembled Coastal Route Map reveals the trail to Ronny.",
          illustrationSrc: STORY_IMAGES.EXPLOSION_MAP,
        },
      ],
    },

    ch7_necklace_glow: {
      id: "ch7_necklace_glow",
      chapterTitle: "Chapter 7: The Heaven",
      subtitle: "Sanctuary Clifftop",
      illustrationSrc: STORY_IMAGES.NECKLACE_GLOW,
      illustrationTheme: "necklace",
      pages: [
        {
          speaker: "Narrator",
          text: "The rumble of the train explosion echoed up the mountain crags. Far above, Ronny turned toward the sea.",
          description: "Ronny looks down from the high emerald cliff toward the rising smoke.",
          illustrationSrc: STORY_IMAGES.NECKLACE_GLOW,
        },
        {
          speaker: "Narrator",
          text: "At that exact moment, their carved leaf pendants began to pulse with a warm, radiant emerald light.",
          description: "Both leaf pendants emit a brilliant synchronized green aura.",
          illustrationSrc: STORY_IMAGES.NECKLACE_GLOW,
        },
        {
          speaker: "Narrator",
          text: "Guided by the shining pendant and gathering fresh wild clifftop roses, Titibaccha hopped toward the final summit.",
          description: "Titi ascends the meadow, picking five fragrant wild roses for Ronny.",
          illustrationSrc: STORY_IMAGES.NECKLACE_GLOW,
        },
      ],
    },

    ch7_reunion_hug: {
      id: "ch7_reunion_hug",
      chapterTitle: "The Long-Awaited Reunion",
      subtitle: "The Clifftop Sanctuary",
      illustrationSrc: STORY_IMAGES.ROSE_REUNION,
      illustrationTheme: "hug",
      pages: [
        {
          speaker: "Titibaccha",
          text: "Cheep! Pip pip! (Offers the beautiful Five-Rose Bouquet lovingly in tiny wings)",
          description: "Titi hops forward, presenting the bouquet of five fresh clifftop roses.",
          illustrationSrc: STORY_IMAGES.ROSE_REUNION,
        },
        {
          speaker: "Ronny",
          text: "Titi?! It's really you! You survived the wild... you came all this way for me!",
          description: "Ronny turns in disbelief, tears welling in his eyes.",
          illustrationSrc: STORY_IMAGES.ROSE_REUNION,
        },
        {
          speaker: "Narrator",
          text: "Ronny kneels and scoops Titibaccha into a gentle, tearful embrace. The sorrow of their journey dissolves completely in the warmth of their reunion.",
          description: "Ronny cradles Titi in a warm, protective, tearful hug.",
          illustrationSrc: STORY_IMAGES.ROSE_REUNION,
        },
      ],
    },

    sunset_ending: {
      id: "sunset_ending",
      chapterTitle: "Watching the Sunset",
      subtitle: "A New Beginning",
      illustrationSrc: STORY_IMAGES.SUNSET_ENDING,
      illustrationTheme: "sunset",
      pages: [
        {
          speaker: "Narrator",
          text: "With the complete seven-piece letter resting safely between them, Ronny and Titibaccha sat together upon the emerald cliff.",
          description: "Ronny and Titi sit side by side on the cliff edge.",
          illustrationSrc: STORY_IMAGES.SUNSET_ENDING,
        },
        {
          speaker: "Narrator",
          text: "The ocean breeze carried away the shadows of the past as the golden sun dipped gently into the western horizon.",
          description: "Golden and violet light washes over the sea and the peaceful meadow.",
          illustrationSrc: STORY_IMAGES.SUNSET_ENDING,
        },
        {
          speaker: "Narrator",
          text: "Together at last, they knew that wherever life took them next, they would never be separated again.",
          description: "Their leaf pendants glow softly in the evening twilight. The journey is complete.",
          illustrationSrc: STORY_IMAGES.SUNSET_ENDING,
        },
      ],
    },
  } as Record<string, StoryPanelData>,

  // --------------------------------------------------------------------------
  // The 7 Secret Letter Fragments
  // --------------------------------------------------------------------------
  LETTER_FRAGMENTS: [
    {
      id: 1,
      chapter: 1,
      title: "Fragment I: The Broken Gate",
      source: "Found in Ancient Garden Chest",
      excerpt: "When the sky cracked and the violet fire fell, I searched the smoke for you...",
    },
    {
      id: 2,
      chapter: 2,
      title: "Fragment II: The Dropped Seeds",
      source: "Found at Traveler's Overlook",
      excerpt: "I left a trail of yellow heart seeds along the stone terraces, praying you would follow...",
    },
    {
      id: 3,
      chapter: 3,
      title: "Fragment III: The Forest Timber",
      source: "Found at Ancient Forest Maw",
      excerpt: "The shadows grow tall and wild beasts prowl, but I kept our photograph safe against my chest...",
    },
    {
      id: 4,
      chapter: 4,
      title: "Fragment IV: The Subterranean Maw",
      source: "Found at Cavern Exit Vault",
      excerpt: "Through the darkness, the train whistle calls toward the sea. Do not fear the deep dark, little one...",
    },
    {
      id: 5,
      chapter: 5,
      title: "Fragment V: The Autumn Rail",
      source: "Found on Locomotive Observation Roof",
      excerpt: "The Highland Express carries me westward toward the salt air and the high coastal cliffs...",
    },
    {
      id: 6,
      chapter: 6,
      title: "Fragment VI: The Ocean Winds",
      source: "Found at Coastal Summit Overlook",
      excerpt: "The engine shattered upon the shore, but I see the emerald summit where the sunset meets the tide...",
    },
    {
      id: 7,
      chapter: 7,
      title: "Fragment VII: The Final Promise",
      source: "Found at Sanctuary Clifftop",
      excerpt: "If our leaf pendants still shine with warmth, then our bond was never truly broken...",
    },
  ] as LetterFragmentStory[],

  // --------------------------------------------------------------------------
  // Assembled Seven-Piece Letter Content
  // TEMPORARY STORY PLACEHOLDER - REPLACE WITH CANONICAL LETTER TEXT WHEN AUTHOR CONFIRMS
  // --------------------------------------------------------------------------
  ASSEMBLED_LETTER_TITLE: "Ronny's Unsent Letter to Titibaccha",
  ASSEMBLED_LETTER_BODY: [
    "To my dearest Titibaccha,",
    "If you are holding these seven joined fragments, it means you never gave up on me—just as I could never truly leave you behind.",
    "When the sky tore open and celestial fire scorched our peaceful home, panic clouded my eyes. When I saw the fox beside you in the ruined garden, my broken heart believed you had chosen another path. How foolish and blind I was to doubt your pure loyalty.",
    "Across the shattered stone terraces, through the whispering predator forest, beneath the sunless cavern, and atop the rushing highland train, you braved every danger in this vast world to find me.",
    "You are my truest friend, my brave little chick. As the ocean sunset washes away the sorrow of our journey, we will build a new home together upon this peaceful shore. Nothing will ever separate us again.",
    "Forever your companion and guardian,",
    "— Ronny",
  ],

  // --------------------------------------------------------------------------
  // Chapter 7 Reunion Sequence Script
  // --------------------------------------------------------------------------
  REUNION_DIALOGUE: [
    {
      speaker: "Ronny",
      text: "(Looking at his glowing leaf pendant in astonishment) ...The necklace? It's glowing with emerald light!",
    },
    {
      speaker: "Ronny",
      text: "(Turns around and sees Titi hopping toward him with glowing pendant) Titi?! It's really you! You survived the wild... you came all this way!",
    },
    {
      speaker: "Titibaccha",
      text: "Pip! Cheep cheep! (Offers the beautiful Five-Rose Bouquet lovingly in tiny wings)",
    },
    {
      speaker: "Ronny",
      text: "Fresh wild clifftop roses... for me? Oh, Titi, forgive me for running away in sorrow. I will never doubt you again!",
    },
    {
      speaker: "Narrator",
      text: "Ronny kneels and scoops Titibaccha into a gentle, tearful embrace. The warmth of their reunion dissolves all fear and distance.",
    },
  ],

  // --------------------------------------------------------------------------
  // Destination Map Waypoint Descriptions (Chapter 6)
  // --------------------------------------------------------------------------
  MAP_OVERLAY_TITLE: "Assembled Coastal Route Map",
  MAP_OVERLAY_DESCRIPTION:
    "The 4 recovered map fragments reveal the hidden mountain trail leading from the burning train wreck up to the seaside cliff sanctuary where Ronny watches the ocean.",
};
