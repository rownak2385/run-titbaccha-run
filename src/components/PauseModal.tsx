"use client";

import React from "react";

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onExitToMenu: () => void;
  onOpenStory?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestartCheckpoint,
  onExitToMenu,
  onOpenStory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-900/95 p-6 text-center text-stone-100 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-3xl">
          ⏸️
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-wide text-amber-400">GAME PAUSED</h2>
        <p className="mt-1 text-xs text-stone-400">Run Titibaccha, Run! — Chapter 1</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 font-bold text-white shadow hover:from-emerald-500 hover:to-emerald-400 active:scale-98 transition-all"
          >
            ▶ Resume Game
          </button>
          {onOpenStory && (
            <button
              onClick={onOpenStory}
              className="w-full rounded-xl bg-stone-800 py-2.5 font-semibold text-amber-300 border border-amber-500/30 hover:bg-stone-700 active:scale-98 transition-all"
            >
              📖 View Illustrated Story
            </button>
          )}
          <button
            onClick={onRestartCheckpoint}
            className="w-full rounded-xl bg-stone-800 py-2.5 font-semibold text-amber-300 border border-amber-500/30 hover:bg-stone-700 active:scale-98 transition-all"
          >
            🏮 Respawn at Checkpoint
          </button>
          <button
            onClick={onExitToMenu}
            className="w-full rounded-xl bg-stone-800 py-2.5 font-semibold text-stone-300 hover:bg-rose-950/60 hover:text-rose-200 hover:border-rose-700/50 border border-stone-700 active:scale-98 transition-all"
          >
            🏠 Return to Title Menu
          </button>
        </div>
      </div>
    </div>
  );
};
