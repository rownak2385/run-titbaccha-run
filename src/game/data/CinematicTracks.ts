import { CinematicData } from "@/types/game";

export const CINEMATIC_TRACKS: Record<string, CinematicData> = {
  opening_garden: {
    id: "opening_garden",
    title: "Peace in the Garden",
    chapterLabel: "Prologue: Days of Sunshine",
    videoSrcMp4: "/assets/videos/opening_garden.mp4",
    videoSrcWebm: "/assets/videos/opening_garden.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "Before the shadows fell, the family garden bloomed with warmth, laughter, and fragrant sunflowers.",
      },
      {
        startTime: 4.5,
        endTime: 8.5,
        speaker: "Narrator",
        text: "Little Titibaccha hopped safely beside Ronny every morning, learning to forage and explore.",
      },
      {
        startTime: 9.0,
        endTime: 12.0,
        speaker: "Narrator",
        text: "They were inseparable companions, bound by trust and simple affection.",
      },
    ],
    fallbackDescription:
      "Golden sunlight bathes the lush garden grove. A tiny yellow chick pecks playfully at sunflower seeds beside Ronny's boots under a clear summer sky.",
  },

  meteor_disaster: {
    id: "meteor_disaster",
    title: "The Shattered Sky",
    chapterLabel: "The Disaster: Garden in Ruins",
    videoSrcMp4: "/assets/videos/meteor_disaster.mp4",
    videoSrcWebm: "/assets/videos/meteor_disaster.webm",
    durationSeconds: 14,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.5,
        speaker: "Narrator",
        text: "Without warning, a streak of blinding violet fire tore across the heavens and struck the valley grove.",
      },
      {
        startTime: 5.0,
        endTime: 9.0,
        speaker: "Narrator",
        text: "Ancient stone walls shattered into brambles and smoke, separating the companions across an impassable ruin.",
      },
      {
        startTime: 9.5,
        endTime: 13.5,
        speaker: "Narrator",
        text: "Ronny waited at the far clearing with food supplies, praying the tiny chick would find its way through the danger.",
      },
    ],
    fallbackDescription:
      "A blazing celestial streak crashes beyond the orchard wall. Stone arches crack, brambles catch fire, and billowing purple smoke divides the peaceful garden.",
  },

  // Backward-compatibility alias for initial prologue
  chapter1_intro: {
    id: "chapter1_intro",
    title: "The Disaster & The Separation",
    chapterLabel: "Chapter 1: The Betrayal — Prologue",
    videoSrcMp4: "/assets/videos/chapter1_intro.mp4",
    videoSrcWebm: "/assets/videos/chapter1_intro.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "The morning skies shattered without warning. When the dust settled, the peaceful family garden lay in ruins.",
      },
      {
        startTime: 4.5,
        endTime: 8.5,
        speaker: "Narrator",
        text: "Across the scorched brambles, Ronny watches anxiously by the far clearing, keeping food warm for Titibaccha.",
      },
      {
        startTime: 9.0,
        endTime: 12.0,
        speaker: "Narrator",
        text: "Run, Titibaccha! Brave the garden ruins and reunite with Ronny!",
      },
    ],
    fallbackDescription:
      "A golden sun breaks through smoke clouds over the destroyed garden gate. In the distance, Ronny sets down his camp pack and scoops grain into a small bowl, looking back toward the garden gate with hope.",
  },

  chapter1_betrayal: {
    id: "chapter1_betrayal",
    title: "The Cunning Deception",
    chapterLabel: "Chapter 1: The Betrayal — Climax",
    videoSrcMp4: "/assets/videos/chapter1_betrayal.mp4",
    videoSrcWebm: "/assets/videos/chapter1_betrayal.webm",
    durationSeconds: 18,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.5,
        speaker: "Narrator",
        text: "Exhausted and trembling, Titibaccha finally reaches the edge of the sunlit clearing. Ronny is right there.",
      },
      {
        startTime: 5.0,
        endTime: 9.0,
        speaker: "Narrator",
        text: "A rustle in the hedge. An amber-eyed fox slides forward, nudging sweet golden berries right in front of the hungry chick.",
      },
      {
        startTime: 9.5,
        endTime: 13.5,
        speaker: "Narrator",
        text: "Innocent and starving, Titi takes a hesitant step toward the fox's bait. Ronny looks up... and freezes.",
      },
      {
        startTime: 14.0,
        endTime: 18.0,
        speaker: "Narrator",
        text: "Heartbroken and believing he has been abandoned, Ronny drops his scoop, turns away, and vanishes into the dark forest path.",
      },
    ],
    fallbackDescription:
      "The fox's manipulative bait succeeds. Innocent little Titibaccha was only hungry, yet Ronny misinterprets the sight. Overcome with grief, Ronny packs his bag and departs alone into the wilderness.",
  },

  future_chapter_intro: {
    id: "future_chapter_intro",
    title: "Into the Unknown",
    chapterLabel: "Chapter 2: The Search — Teaser",
    videoSrcMp4: "/assets/videos/future_chapter_intro.mp4",
    videoSrcWebm: "/assets/videos/future_chapter_intro.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "With Ronny gone, the garden ruins fall silent once more under the darkening sky.",
      },
      {
        startTime: 4.5,
        endTime: 8.0,
        speaker: "Narrator",
        text: "Clutching the ancient garden key and the first torn fragment of Ronny's letter, Titibaccha makes a solemn choice.",
      },
      {
        startTime: 8.5,
        endTime: 12.0,
        speaker: "Narrator",
        text: "No matter how long or perilous the road ahead, Titi will search the entire world to make things right.",
      },
    ],
    fallbackDescription:
      "Titi stands alone at the garden threshold, holding a weathered bronze key. Footprints lead off into the misty woods of Chapter 2: The Search.",
  },

  // Alias for Chapter 2 introduction
  chapter2_intro: {
    id: "chapter2_intro",
    title: "Into the Unknown",
    chapterLabel: "Chapter 2: The Search — Teaser",
    videoSrcMp4: "/assets/videos/future_chapter_intro.mp4",
    videoSrcWebm: "/assets/videos/future_chapter_intro.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "With Ronny gone, the garden ruins fall silent once more under the darkening sky.",
      },
      {
        startTime: 4.5,
        endTime: 8.0,
        speaker: "Narrator",
        text: "Clutching the ancient garden key and the first torn fragment of Ronny's letter, Titibaccha makes a solemn choice.",
      },
      {
        startTime: 8.5,
        endTime: 12.0,
        speaker: "Narrator",
        text: "No matter how long or perilous the road ahead, Titi will search the entire world to make things right.",
      },
    ],
    fallbackDescription:
      "Titi stands alone at the garden threshold, holding a weathered bronze key. Footprints lead off into the misty woods of Chapter 2: The Search.",
  },

  chapter2_search: {
    id: "chapter2_search",
    title: "The Trail Beyond the Wall",
    chapterLabel: "Chapter 2: The Search — Complete",
    videoSrcMp4: "/assets/videos/chapter2_search.mp4",
    videoSrcWebm: "/assets/videos/chapter2_search.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "Following the dropped hearts, Titibaccha safely traverses the shattered garden perimeter.",
      },
      {
        startTime: 4.5,
        endTime: 8.0,
        speaker: "Narrator",
        text: "At the high overlook, an ancient traveler chest reveals the Chapter 3 Key and Letter Fragment 2.",
      },
      {
        startTime: 8.5,
        endTime: 12.0,
        speaker: "Narrator",
        text: "Ahead lies the dense predator forest. Ronny's hunting bow rests waiting in the shadows.",
      },
    ],
    fallbackDescription:
      "Titibaccha looks out from the garden edge toward the whispering timber woods. Two pieces of Ronny's letter now rest safely in the chick's keeping.",
  },

  chapter3_rescue: {
    id: "chapter3_rescue",
    title: "Restored Memories & The Cavern Maw",
    chapterLabel: "Chapter 3: The Rescue — Complete",
    videoSrcMp4: "/assets/videos/chapter3_rescue.mp4",
    videoSrcWebm: "/assets/videos/chapter3_rescue.webm",
    durationSeconds: 14,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.5,
        speaker: "Narrator",
        text: "With precision and courage, Titibaccha defeats the forest wolves and foxes with Ronny's bow.",
      },
      {
        startTime: 5.0,
        endTime: 9.0,
        speaker: "Narrator",
        text: "All nine torn fragments unite to recreate the cherished photograph of Ronny holding his beloved chick.",
      },
      {
        startTime: 9.5,
        endTime: 14.0,
        speaker: "Narrator",
        text: "With the Chapter 4 key in hand, Titi stands before the yawning darkness of the subterranean caves.",
      },
    ],
    fallbackDescription:
      "The completed photograph glows warmly against the dark forest backdrop. Beside a massive stone arch, Titibaccha prepares a torch to venture into Chapter 4: The Darkness.",
  },

  chapter4_darkness: {
    id: "chapter4_darkness",
    title: "Light in the Abyss",
    chapterLabel: "Chapter 4: The Darkness — Complete",
    videoSrcMp4: "/assets/videos/chapter4_darkness.mp4",
    videoSrcWebm: "/assets/videos/chapter4_darkness.webm",
    durationSeconds: 14,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.5,
        speaker: "Narrator",
        text: "Through the subterranean gloom, Titibaccha conserved torch flame and vanquished the three shadow beasts.",
      },
      {
        startTime: 5.0,
        endTime: 9.0,
        speaker: "Narrator",
        text: "The three golden ticket pieces assemble into a ticket for the Autumn Highland Express!",
      },
      {
        startTime: 9.5,
        endTime: 14.0,
        speaker: "Narrator",
        text: "The cavern vault opens! With four letter fragments and the train pass, Chapter 5 is unlocked!",
      },
    ],
    fallbackDescription:
      "Sunlight pours into the cavern exit as Titibaccha emerges with the completed train ticket and four letter fragments. In the distance, the autumn whistle of the Highland Express echoes through the mountains.",
  },

  chapter5_station: {
    id: "chapter5_station",
    title: "The Highland Express",
    chapterLabel: "Chapter 5: The Station — Complete",
    videoSrcMp4: "/assets/videos/chapter5_station.mp4",
    videoSrcWebm: "/assets/videos/chapter5_station.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "Braving the roofs of the speeding train, Titibaccha defended against the swooping dinosaurs.",
      },
      {
        startTime: 4.5,
        endTime: 8.0,
        speaker: "Narrator",
        text: "The locomotive thunders through alpine tunnels toward the sea, carrying Secret Letter Fragment 5 of 7.",
      },
      {
        startTime: 8.5,
        endTime: 12.0,
        speaker: "Narrator",
        text: "Ahead lies the coastal terminus! Chapter 6: The Destination is unlocked!",
      },
    ],
    fallbackDescription:
      "The heavy locomotive emerges from mountain mist onto a scenic coastal viaduct. Salt air rushes past as Titibaccha recovers Letter Fragment 5 and prepares to reach the sea.",
  },

  chapter6_destination: {
    id: "chapter6_destination",
    title: "The Coastal Trail",
    chapterLabel: "Chapter 6: The Destination — Complete",
    videoSrcMp4: "/assets/videos/chapter6_destination.mp4",
    videoSrcWebm: "/assets/videos/chapter6_destination.webm",
    durationSeconds: 12,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 4.0,
        speaker: "Narrator",
        text: "Escaping the burning wreckage of the train, Titibaccha traversed the broken coastal cliffs.",
      },
      {
        startTime: 4.5,
        endTime: 8.0,
        speaker: "Narrator",
        text: "All 4 map pieces unite, revealing the final route leading up to the clifftop sanctuary.",
      },
      {
        startTime: 8.5,
        endTime: 12.0,
        speaker: "Narrator",
        text: "With 6 letter fragments gathered, Chapter 7: The Heaven is unlocked! Ronny is waiting!",
      },
    ],
    fallbackDescription:
      "Standing atop a wind-swept coastal crag with six letter fragments in hand, Titibaccha looks upward toward the peaceful grassy summit where Ronny sits watching the sea.",
  },

  final_reunion: {
    id: "final_reunion",
    title: "Together Once More",
    chapterLabel: "Chapter 7: Reunion — Epilogue",
    videoSrcMp4: "/assets/videos/final_reunion.mp4",
    videoSrcWebm: "/assets/videos/final_reunion.webm",
    durationSeconds: 15,
    subtitles: [
      {
        startTime: 0.5,
        endTime: 5.0,
        speaker: "Narrator",
        text: "Seven long chapters, across scorched fields, snowy peaks, and the ancient citadel of stars.",
      },
      {
        startTime: 5.5,
        endTime: 10.0,
        speaker: "Narrator",
        text: "The seven pieces of the letter reunite at last, revealing the words of devotion Ronny wrote so long ago.",
      },
      {
        startTime: 10.5,
        endTime: 15.0,
        speaker: "Narrator",
        text: "Titi leaps forward into Ronny's arms. The misunderstanding dissolves into tears of joy. Together forever.",
      },
    ],
    fallbackDescription:
      "Sunlight breaks through storm clouds over the high sanctuary. Ronny kneels with tears in his eyes as Titibaccha leaps into his hands for the ultimate reunion embrace.",
  },
};
