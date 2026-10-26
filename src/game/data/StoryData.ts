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

export const STORY_DATA = {
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
