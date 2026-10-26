"use client";

import React from "react";

interface CutsceneModalProps {
  isOpen: boolean;
  chapter?: number;
  onContinueNextChapter?: () => void;
  onRestartSlice: () => void;
  onExitToMenu: () => void;
}

export const CutsceneModal: React.FC<CutsceneModalProps> = ({
  isOpen,
  chapter = 1,
  onContinueNextChapter,
  onRestartSlice,
  onExitToMenu,
}) => {
  if (!isOpen) return null;

  const getChapterData = (ch: number) => {
    switch (ch) {
      case 2:
        return {
          icon: "🐾",
          badge: "Chapter 2 Complete",
          title: "Chapter 2: The Search",
          chestTitle: "Traveler's Overlook Chest Unlocked!",
          chestDesc: "You followed Ronny's heart trail to the edge of the ruined perimeter. Two persistent rewards have been saved:",
          rewards: [
            { icon: "🔑", name: "Chapter 3 Unlock Key" },
            { icon: "📜", name: "Secret Letter Fragment 2 of 7" },
          ],
          climaxTitle: "The Trail to the Deep Timber",
          climaxBody:
            "Following the dropped food hearts, Titibaccha persevered through collapsed garden platforms and hazardous brambles. Ahead lies the whispering predator forest, where Ronny's hunting bow awaits in the shadows.",
          nextLabel: "Continue to Chapter 3: The Rescue",
          hasNext: true,
        };
      case 3:
        return {
          icon: "🏹",
          badge: "Chapter 3 Complete",
          title: "Chapter 3: The Rescue",
          chestTitle: "Ancient Forest Chest Unlocked!",
          chestDesc: "You defeated all 9 forest predators and assembled the Memory Photo. Persistent rewards awarded:",
          rewards: [
            { icon: "🔑", name: "Chapter 4 Unlock Key" },
            { icon: "📜", name: "Secret Letter Fragment 3 of 7" },
            { icon: "🖼️", name: "Memory Photo of Ronny & Titi (9/9)" },
          ],
          climaxTitle: "Restored Memories Before the Abyss",
          climaxBody:
            "Armed with Ronny's hunting bow, Titibaccha vanquished the hostile wolves and foxes. The nine torn photograph fragments united to reveal Ronny lovingly holding Titi. Ahead yawns the pitch-black maw of the subterranean cavern.",
          nextLabel: "Continue to Chapter 4: The Darkness",
          hasNext: true,
        };
      case 4:
        return {
          icon: "🔦",
          badge: "Chapter 4 Complete",
          title: "Chapter 4: The Darkness",
          chestTitle: "Cavern Vault Unlocked!",
          chestDesc: "You navigated the dark cave, vanquished 3 monsters, and assembled the train ticket:",
          rewards: [
            { icon: "🔑", name: "Chapter 5 Highland Pass Key" },
            { icon: "📜", name: "Secret Letter Fragment 4 of 7" },
            { icon: "🎫", name: "Autumn Highland Express Train Ticket" },
          ],
          climaxTitle: "Daylight at Last & The Mountain Express",
          climaxBody:
            "Conserving torch vitality in natural sunlight safe zones and defeating the subterranean shadow beasts, Titibaccha assembled the three train ticket scraps. Sunlight floods the cavern exit—the whistle of the Autumn Highland Express echoes in the mountain breeze!",
          nextLabel: "Continue to Chapter 5: The Station",
          hasNext: true,
        };
      case 5:
        return {
          icon: "🚂",
          badge: "Chapter 5 Complete",
          title: "Chapter 5: The Station",
          chestTitle: "Locomotive Observation Safe Unlocked!",
          chestDesc: "You validated your ticket, boarded the moving express, and defended against aerial dinosaurs:",
          rewards: [
            { icon: "🔑", name: "Chapter 6 Coastal Key" },
            { icon: "📜", name: "Secret Letter Fragment 5 of 7" },
          ],
          climaxTitle: "Thunder Along the Mountain Viaduct",
          climaxBody:
            "Leaping across the roofs of speeding railway carriages and aiming true with the hunting bow, Titibaccha overcame the soaring dinosaurs. The train emerges from high mountain tunnels, rushing toward the seaside terminus where Ronny's scent lingers in the salt air.",
          nextLabel: "Continue to Chapter 6: The Destination",
          hasNext: true,
        };
      case 6:
        return {
          icon: "🗺️",
          badge: "Chapter 6 Complete",
          title: "Chapter 6: The Destination",
          chestTitle: "Coastal Summit Chest Unlocked!",
          chestDesc: "You escaped the boiler explosion, recovered Ronny's pack, and assembled the destination map:",
          rewards: [
            { icon: "🔑", name: "Chapter 7 Sanctuary Key" },
            { icon: "📜", name: "Secret Letter Fragment 6 of 7" },
            { icon: "🗺️", name: "Assembled Coastal Route Map (4/4)" },
          ],
          climaxTitle: "The Burning Shore to the Emerald Summit",
          climaxBody:
            "Shattered by the engine explosion, Titibaccha scrambled up the treacherous coastal crags, vanquishing wolves and monsters to piece together the destination map. The golden waypoints point directly to the serene clifftop sanctuary ahead.",
          nextLabel: "Continue to Chapter 7: The Heaven",
          hasNext: true,
        };
      case 7:
        return {
          icon: "💐",
          badge: "Chapter 7 Complete",
          title: "Chapter 7: The Heaven",
          chestTitle: "Clifftop Sanctuary Reached!",
          chestDesc: "You traversed the serene sunset path, gathered all 5 roses, and found the final letter fragment:",
          rewards: [
            { icon: "💐", name: "Five-Rose Clifftop Bouquet" },
            { icon: "📜", name: "Secret Letter Fragment 7 of 7" },
            { icon: "✨", name: "Synchronized Glowing Pendants" },
          ],
          climaxTitle: "Together at the Edge of the World",
          climaxBody:
            "With matching necklaces radiant in emerald light, Titibaccha reached Ronny on the sunset cliff. The journey across seven chapters culminates in love, loyalty, and tears of joy.",
          nextLabel: "View Final Ending & Assemble Letter",
          hasNext: false,
        };
      case 1:
      default:
        return {
          icon: "🦊",
          badge: "Chapter 1 Complete",
          title: "Chapter 1: The Betrayal",
          chestTitle: "Ancient Garden Chest Unlocked!",
          chestDesc: "You unlatched the ancient chest at the edge of the ruined garden clearing. Two persistent artifacts have been awarded:",
          rewards: [
            { icon: "🔑", name: "Chapter 2 Unlock Key" },
            { icon: "📜", name: "Secret Letter Fragment 1 of 7" },
          ],
          climaxTitle: "The Misunderstood Departure",
          climaxBody:
            "Titibaccha was only hungry and innocent, drawn toward the glowing berries left by the cunning Fox. Believing he was abandoned, Ronny dropped his feed scoop, turned his back, and vanished into the unfamiliar wilderness.",
          nextLabel: "Continue to Chapter 2: The Search",
          hasNext: true,
        };
    }
  };

  const chData = getChapterData(chapter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-2xl rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-stone-900 via-stone-950 to-black p-6 md:p-8 text-stone-100 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-amber-500/30 pb-4">
          <span className="text-3xl">{chData.icon}</span>
          <div>
            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase text-rose-400 border border-rose-500/40">
              {chData.badge}
            </span>
            <h2 className="text-xl font-bold tracking-wide text-amber-300 mt-1">
              {chData.title}
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-300">
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
              <span>📦</span> {chData.chestTitle}
            </h3>
            <p className="mt-2 text-xs text-stone-300">
              {chData.chestDesc}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
              {chData.rewards.map((r, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-emerald-950 border border-emerald-600/50 px-3 py-1.5 text-emerald-300"
                >
                  {r.icon} {r.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-950/60 bg-stone-950/80 p-4 text-xs space-y-2">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              📖 {chData.climaxTitle}
            </h4>
            <p className="text-stone-300 italic">
              &quot;{chData.climaxBody}&quot;
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 pt-4">
          <span className="text-xs text-stone-400">Chapter Progress Saved</span>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onRestartSlice}
              className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-200 border border-stone-700 hover:bg-stone-700 active:scale-95 transition-all"
            >
              🔄 Replay Chapter {chapter}
            </button>

            {chData.hasNext && onContinueNextChapter && (
              <button
                onClick={onContinueNextChapter}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 px-5 py-2 text-xs font-bold text-stone-950 shadow active:scale-95 transition-all"
              >
                ⏩ {chData.nextLabel}
              </button>
            )}

            <button
              onClick={onExitToMenu}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-stone-950 shadow hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
            >
              🏠 Return to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
