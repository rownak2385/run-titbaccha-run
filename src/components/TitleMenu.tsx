/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { SaveSystem } from "@/game/systems/SaveSystem";
import { ChapterManager } from "@/game/systems/ChapterManager";
import { STORY_DATA, STORY_IMAGES, StoryPanelData } from "@/game/data/StoryData";
import { IllustratedStoryPanel } from "./IllustratedStoryPanel";
import { SaveData } from "@/types/game";

const STORY_GALLERY_ITEMS = [
  { id: "prologue_friendship", number: 1, title: "1. Days of Sunshine", subtitle: "The Peaceful Family Garden", src: STORY_IMAGES.PEACEFUL_GARDEN },
  { id: "meteor_disaster", number: 2, title: "2. The Shattered Sky", subtitle: "Celestial Cataclysm", src: STORY_IMAGES.METEOR_DISASTER },
  { id: "ch1_betrayal", number: 3, title: "3. Waiting with Feed", subtitle: "Chapter 1 Campsite", src: STORY_IMAGES.RONNY_WAITING },
  { id: "ch1_betrayal", number: 4, title: "4. The Fox's Deceit", subtitle: "Golden Berry Bait", src: STORY_IMAGES.FOX_BETRAYAL },
  { id: "ch1_betrayal", number: 5, title: "5. Ronny's Departure", subtitle: "Heartbreak in the Wild", src: STORY_IMAGES.RONNY_LEAVING },
  { id: "ch2_search", number: 6, title: "6. The Search Begins", subtitle: "Trail of Heart Seeds", src: STORY_IMAGES.SEARCH_HEARTS },
  { id: "ch3_memory_photo", number: 7, title: "7. Whispering Canopy", subtitle: "Ancient Oak Branches", src: STORY_IMAGES.FOREST_MEMORY },
  { id: "ch3_memory_photo", number: 8, title: "8. The Restored Keepsake", subtitle: "First Day Together", src: STORY_IMAGES.MEMORY_PHOTO },
  { id: "ch4_dark_cave", number: 9, title: "9. Subterranean Cavern", subtitle: "Torchlight & Ticket Fragments", src: STORY_IMAGES.DARK_CAVE },
  { id: "ch5_moving_train", number: 10, title: "10. Highland Express", subtitle: "Rooftop Platforming", src: STORY_IMAGES.MOVING_TRAIN },
  { id: "ch6_seaside_explosion", number: 11, title: "11. The Coastal Terminus", subtitle: "Finding Ronny's Pack", src: STORY_IMAGES.SEASIDE_ARRIVAL },
  { id: "ch6_seaside_explosion", number: 12, title: "12. Engine Boiler Eruption", subtitle: "The Coastal Route Map", src: STORY_IMAGES.EXPLOSION_MAP },
  { id: "ch7_necklace_glow", number: 13, title: "13. The Radiant Necklaces", subtitle: "Pulsing Emerald Auras", src: STORY_IMAGES.NECKLACE_GLOW },
  { id: "ch7_reunion_hug", number: 14, title: "14. The Five-Rose Offering", subtitle: "A Long-Awaited Embrace", src: STORY_IMAGES.ROSE_REUNION },
  { id: "sunset_ending", number: 15, title: "15. Eternal Sunset", subtitle: "Sitting Together Forever", src: STORY_IMAGES.SUNSET_ENDING },
];

interface TitleMenuProps {
  onStartGame: (isNew: boolean) => void;
  onOpenControls: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onStartGame,
  onOpenControls,
  isMuted,
  onToggleMute,
}) => {
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showStoryGallery, setShowStoryGallery] = useState(false);
  const [activeStory, setActiveStory] = useState<StoryPanelData | null>(null);

  useEffect(() => {
    const loaded = SaveSystem.load();
    setSaveData(loaded);
  }, []);

  const hasSave = saveData !== null;
  const currentChapter = saveData?.chapter || 1;
  const chapterTitles: Record<number, string> = {
    1: "Chapter 1: The Betrayal",
    2: "Chapter 2: The Search",
    3: "Chapter 3: The Rescue",
    4: "Chapter 4: The Darkness",
    5: "Chapter 5: The Station",
    6: "Chapter 6: The Destination",
    7: "Chapter 7: The Heaven",
  };
  const activeTitle = chapterTitles[currentChapter] || "Chapter 1: The Betrayal";

  const allChapters = [
    { id: 1, title: "Chapter 1: The Betrayal", icon: "🦊" },
    { id: 2, title: "Chapter 2: The Search", icon: "🐾" },
    { id: 3, title: "Chapter 3: The Rescue", icon: "🏹" },
    { id: 4, title: "Chapter 4: The Darkness", icon: "🔦" },
    { id: 5, title: "Chapter 5: The Station", icon: "🚂" },
    { id: 6, title: "Chapter 6: The Destination", icon: "🗺️" },
    { id: 7, title: "Chapter 7: The Heaven", icon: "💐" },
  ];

  const handleNewGameClick = () => {
    if (hasSave) {
      setShowConfirmNew(true);
    } else {
      onStartGame(true);
    }
  };

  const confirmNewGame = () => {
    SaveSystem.clearSave();
    setShowConfirmNew(false);
    onStartGame(true);
  };

  const handleSelectChapter = (chId: number) => {
    const chInfo = ChapterManager.getInstance().getChapterInfo(chId);
    if (chInfo) {
      SaveSystem.setChapter(chId, chInfo.spawnCheckpoint);
      setShowChapterSelect(false);
      onStartGame(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200">
      {/* Decorative Cloud Accents */}
      <div className="pointer-events-none absolute top-10 left-12 h-16 w-48 rounded-full bg-white/40 blur-md" />
      <div className="pointer-events-none absolute top-20 right-16 h-20 w-64 rounded-full bg-white/50 blur-lg" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-emerald-800 via-emerald-600/70 to-transparent" />

      {/* Top Header & Settings */}
      <header className="z-10 flex w-full max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-950 border border-white/60 shadow-sm">
          <span>🐤</span>
          <span>
            v4.0.0 •{" "}
            {saveData?.gameCompleted
              ? "Full 7-Chapter Adventure • Completed 🏆"
              : hasSave
              ? activeTitle
              : "Full 7-Chapter Playable Adventure"}
          </span>
        </div>

        <button
          onClick={onToggleMute}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          className="flex items-center gap-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-stone-800 shadow transition-all active:scale-95 border border-white/80"
        >
          <span>{isMuted ? "🔇" : "🔊"}</span>
          <span>{isMuted ? "Muted" : "Sound On"}</span>
        </button>
      </header>

      {/* Hero Title & Chick Avatar */}
      <div className="z-10 flex flex-col items-center text-center my-auto">
        {/* Chick Placeholder Emblem */}
        <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-400 p-2 shadow-2xl ring-4 ring-white/80 transform hover:scale-105 transition-all">
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-amber-300">
            {/* Geometric Chick Face */}
            <div className="relative h-14 w-14 rounded-full bg-amber-400 flex items-center justify-center shadow-inner">
              {/* Eye */}
              <div className="absolute right-3 top-4 h-3 w-3 rounded-full bg-stone-900">
                <div className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-white" />
              </div>
              {/* Beak */}
              <div className="absolute right-[-8px] top-6 h-0 w-0 border-y-[6px] border-y-transparent border-l-[12px] border-l-orange-600" />
              {/* Wing */}
              <div className="absolute left-2 top-5 h-5 w-6 rounded-full bg-amber-200/90" />
            </div>
          </div>
          {/* Feet */}
          <div className="absolute -bottom-2 flex gap-3">
            <div className="h-3 w-3 rounded-full bg-orange-600 shadow" />
            <div className="h-3 w-3 rounded-full bg-orange-600 shadow" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-amber-950 drop-shadow-md">
          Run Titibaccha, Run!
        </h1>
        <p className="mt-2 text-sm md:text-base font-bold text-emerald-950 max-w-md drop-shadow-sm">
          Chapters 1 to 7: The Betrayal • The Search • The Rescue • The Darkness • The Station • The Destination • The Heaven
        </p>

        {/* Menu Actions */}
        <div className="mt-8 flex flex-col w-64 gap-3">
          {/* New Game */}
          <button
            onClick={handleNewGameClick}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 py-3.5 px-6 font-extrabold text-white text-base shadow-xl hover:from-emerald-500 hover:to-green-600 active:scale-95 transition-all border border-emerald-400/40"
          >
            🌱 New Game
          </button>

          {/* Continue (Disabled if no save) */}
          <button
            onClick={() => hasSave && onStartGame(false)}
            disabled={!hasSave}
            title={hasSave ? `Resume from ${saveData?.activeCheckpoint?.label || "Checkpoint"}` : "No previous save found"}
            className={`w-full rounded-2xl py-3 px-6 font-bold text-sm shadow-md transition-all border ${
              hasSave
                ? "bg-amber-500 hover:bg-amber-400 text-amber-950 border-amber-300 active:scale-95 cursor-pointer"
                : "bg-stone-800/40 text-stone-500 border-stone-700/40 cursor-not-allowed opacity-60"
            }`}
          >
            🏮 Continue {hasSave && `(Ch ${currentChapter} • ${saveData?.activeCheckpoint?.label || "Saved"})`}
          </button>

          {/* Chapter Select (Enabled if save exists) */}
          {hasSave && (
            <button
              onClick={() => setShowChapterSelect(true)}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-6 font-bold text-sm text-white shadow transition-all active:scale-95 border border-indigo-400/50"
            >
              🗺️ Chapter Select
            </button>
          )}

          {/* Storybook Gallery */}
          <button
            onClick={() => setShowStoryGallery(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-2.5 px-6 font-bold text-sm text-stone-950 shadow transition-all active:scale-95 border border-amber-300"
          >
            📖 Story Gallery (15 Scenes)
          </button>

          {/* Controls */}
          <button
            onClick={onOpenControls}
            className="w-full rounded-2xl bg-white/80 hover:bg-white py-2.5 px-6 font-bold text-sm text-stone-800 shadow transition-all active:scale-95 border border-white"
          >
            🎮 Controls & Help
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="z-10 flex w-full max-w-4xl items-center justify-between text-[11px] text-emerald-950 font-medium">
        <span>Desktop Browser • 1280x720 16:9 Logical Canvas</span>
        <span>Phaser 3.88 + Next.js App Router • 7 Chapters Complete</span>
      </footer>

      {/* Chapter Select Modal */}
      {showChapterSelect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowChapterSelect(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-indigo-400/50 bg-stone-900 p-6 text-stone-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-indigo-400 text-center">
              🗺️ Select Chapter
            </h3>
            <p className="mt-1 text-xs text-stone-400 text-center mb-4">
              Select any unlocked chapter to replay your journey:
            </p>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {allChapters.map((ch) => {
                const isUnlocked =
                  Boolean(saveData?.gameCompleted) ||
                  Boolean(saveData?.unlockedChapters?.includes(ch.id)) ||
                  Boolean(saveData?.completedChapters?.includes(ch.id)) ||
                  ch.id === 1;

                return (
                  <button
                    key={ch.id}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && handleSelectChapter(ch.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isUnlocked
                        ? "bg-stone-800 hover:bg-indigo-900/60 border-stone-700 hover:border-indigo-500/60 active:scale-98 cursor-pointer"
                        : "bg-stone-950/60 border-stone-800/40 text-stone-600 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{ch.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-stone-200 block">
                          {ch.title}
                        </span>
                        {saveData?.completedChapters?.includes(ch.id) && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Completed ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isUnlocked ? "text-indigo-400" : "text-stone-600"
                      }`}
                    >
                      {isUnlocked ? "Play ▶" : "Locked 🔒"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowChapterSelect(false)}
                className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Overwrite Save Modal */}
      {showConfirmNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowConfirmNew(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-amber-500/40 bg-stone-900 p-6 text-stone-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-amber-400">Overwrite Existing Save?</h3>
            <p className="mt-2 text-xs text-stone-300">
              Starting a new game will reset your saved checkpoint and garden artifacts.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmNew(false)}
                className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewGame}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                Reset & Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storybook Gallery Modal (15 Scenes) */}
      {showStoryGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setShowStoryGallery(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-500/40 bg-stone-900 p-6 text-stone-100 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                  <span>📖</span>
                  <span>The 15 Storybook Illustrations</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Click any moment to view its full illustrated story card:
                </p>
              </div>
              <button
                onClick={() => setShowStoryGallery(false)}
                className="rounded-full bg-stone-800 px-3 py-1 text-xs font-bold text-stone-400 hover:bg-stone-700 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
              {STORY_GALLERY_ITEMS.map((item) => (
                <button
                  key={item.number}
                  onClick={() => {
                    const panel = STORY_DATA.STORY_PANELS[item.id] || STORY_DATA.STORY_PANELS.ch1_betrayal;
                    setActiveStory({
                      ...panel,
                      illustrationSrc: item.src,
                    });
                  }}
                  className="flex flex-col overflow-hidden rounded-xl border border-stone-700/80 bg-stone-800/80 hover:border-amber-400/80 hover:bg-stone-800 transition active:scale-95 group text-left"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-950 flex items-center justify-center">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-2.5">
                    <span className="text-[11px] font-bold text-amber-300 block line-clamp-1">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-stone-400 block line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-stone-800 pt-3 flex justify-end">
              <button
                onClick={() => setShowStoryGallery(false)}
                className="rounded-xl bg-stone-800 px-5 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Story Reader Overlay */}
      {activeStory && (
        <IllustratedStoryPanel
          story={activeStory}
          onComplete={() => setActiveStory(null)}
        />
      )}
    </div>
  );
};
