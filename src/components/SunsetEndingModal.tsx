"use client";

import React, { useState } from "react";

interface SunsetEndingModalProps {
  isOpen: boolean;
  onReplayEnding: () => void;
  onSelectChapter: (chapter: number) => void;
  onExitToMenu: () => void;
}

export const SunsetEndingModal: React.FC<SunsetEndingModalProps> = ({
  isOpen,
  onReplayEnding,
  onSelectChapter,
  onExitToMenu,
}) => {
  const [showChapterSelect, setShowChapterSelect] = useState(false);

  if (!isOpen) return null;

  const chapters = [
    { id: 1, title: "Chapter 1: The Betrayal", icon: "🦊" },
    { id: 2, title: "Chapter 2: The Search", icon: "🐾" },
    { id: 3, title: "Chapter 3: The Rescue", icon: "🏹" },
    { id: 4, title: "Chapter 4: The Darkness", icon: "🔦" },
    { id: 5, title: "Chapter 5: The Station", icon: "🚂" },
    { id: 6, title: "Chapter 6: The Destination", icon: "🗺️" },
    { id: 7, title: "Chapter 7: The Heaven", icon: "💐" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col items-center rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-amber-950 via-stone-950 to-stone-900 p-6 md:p-10 text-stone-100 shadow-2xl overflow-y-auto">
        {/* Sunset Silhouette Art Representation */}
        <div className="relative flex h-48 w-full max-w-xl flex-col items-center justify-between rounded-2xl overflow-hidden bg-gradient-to-t from-amber-600 via-rose-600 to-indigo-950 p-4 shadow-inner border border-amber-300/40">
          {/* Glowing Golden Sun */}
          <div className="absolute top-10 h-24 w-24 rounded-full bg-amber-200/90 blur-sm shadow-2xl" />
          <div className="absolute top-12 h-20 w-20 rounded-full bg-yellow-100 shadow-inner" />

          {/* Shimmering Ocean Horizon */}
          <div className="absolute bottom-10 left-0 right-0 h-10 bg-gradient-to-b from-amber-400/60 to-indigo-950/80" />

          {/* Grassy Cliff Silhouette with Ronny & Titi Sitting Together */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-stone-950 rounded-t-3xl flex items-center justify-center gap-6">
            {/* Ronny Silhouette with glowing leaf pendant */}
            <div className="relative flex flex-col items-center">
              <div className="h-6 w-5 rounded-full bg-stone-800" />
              <div className="h-7 w-8 rounded-t-lg bg-stone-900" />
              {/* Glowing necklace */}
              <div className="absolute top-5 h-2 w-2 rounded-full bg-emerald-400 blur-[1px] animate-pulse" />
            </div>

            {/* Five-Rose Bouquet between them */}
            <div className="text-sm">💐</div>

            {/* Titi Chick Silhouette with glowing leaf pendant */}
            <div className="relative flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-stone-800" />
              <div className="h-4 w-5 rounded-t-md bg-stone-900" />
              {/* Glowing necklace */}
              <div className="absolute top-4 h-2 w-2 rounded-full bg-emerald-400 blur-[1px] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Epic Title & The End */}
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            A Journey of Loyalty Across Seven Chapters
          </span>
          <h1 className="mt-1 text-4xl md:text-5xl font-black text-amber-200 drop-shadow-md">
            Run Titibaccha, Run!
          </h1>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-rose-400 tracking-wider">
            THE END
          </h2>
          <p className="mt-2 max-w-md text-xs md:text-sm text-stone-300">
            Sitting peacefully upon the ocean cliff, Ronny and Titibaccha watch the sunset together.
            The broken past is mended, and their bond is eternal.
          </p>
        </div>

        {/* Achievement Badges */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-center">
            <span className="text-sm">🌟</span>
            <span className="text-[11px] font-bold text-amber-300">Chapters 7/7</span>
            <span className="text-[9px] text-stone-400">All Levels Cleared</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-center">
            <span className="text-sm">📜</span>
            <span className="text-[11px] font-bold text-amber-300">Fragments 7/7</span>
            <span className="text-[9px] text-stone-400">Secret Letter United</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-center">
            <span className="text-sm">🧩</span>
            <span className="text-[11px] font-bold text-amber-300">All Puzzles</span>
            <span className="text-[9px] text-stone-400">Photo, Ticket & Map</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-center">
            <span className="text-sm">✨</span>
            <span className="text-[11px] font-bold text-emerald-300">Leaf Necklaces</span>
            <span className="text-[9px] text-stone-400">Matching & Radiant</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 w-full max-w-md">
          <button
            onClick={onReplayEnding}
            className="flex-1 min-w-[130px] rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 py-3 px-4 text-xs font-bold text-amber-300 active:scale-95 transition-all text-center"
          >
            🔄 Replay Ending
          </button>

          <button
            onClick={() => setShowChapterSelect(true)}
            className="flex-1 min-w-[130px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all border border-indigo-400/40 text-center"
          >
            🗺️ Chapter Select
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 px-6 text-sm font-extrabold text-white shadow-xl active:scale-95 transition-all border border-emerald-400/40 text-center"
          >
            🏠 Return to Main Menu
          </button>
        </div>

        {/* Chapter Select Modal */}
        {showChapterSelect && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowChapterSelect(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl border border-indigo-400/40 bg-stone-900 p-6 text-stone-100 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-indigo-400 text-center">
                🗺️ Select Chapter to Replay
              </h3>
              <p className="mt-1 text-xs text-stone-400 text-center mb-4">
                All 7 chapters are unlocked and fully completed.
              </p>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setShowChapterSelect(false);
                      onSelectChapter(ch.id);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-800 hover:bg-indigo-900/60 border border-stone-700 hover:border-indigo-500/60 transition-all text-left active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{ch.icon}</span>
                      <span className="text-xs font-bold text-stone-200">{ch.title}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Play ▶</span>
                  </button>
                ))}
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
      </div>
    </div>
  );
};
