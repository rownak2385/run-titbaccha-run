"use client";

import React from "react";

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-amber-300/40 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 p-6 text-stone-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐤</span>
            <h2 className="text-xl font-bold tracking-wide text-amber-400">Controls & Chapter 1 Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-800 px-3 py-1 text-sm font-semibold text-stone-400 hover:bg-stone-700 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-amber-300">🎮 Keyboard Movement</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700">
                <span className="font-mono font-bold text-amber-400">A / D</span> or <span className="font-mono font-bold text-amber-400">← / →</span>
                <p className="text-stone-300 mt-1">Run Left / Right</p>
              </div>
              <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700">
                <span className="font-mono font-bold text-amber-400">W / Space</span> or <span className="font-mono font-bold text-amber-400">↑</span>
                <p className="text-stone-300 mt-1">Jump onto platforms</p>
              </div>
              <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700">
                <span className="font-mono font-bold text-amber-400">[E]</span>
                <p className="text-stone-300 mt-1">Interact with Chests</p>
              </div>
              <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700">
                <span className="font-mono font-bold text-amber-400">Mouse Left-Click</span>
                <p className="text-stone-300 mt-1">Aim & Shoot Bow (Ch 3-4)</p>
              </div>
              <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700">
                <span className="font-mono font-bold text-amber-400">[F] / [T]</span>
                <p className="text-stone-300 mt-1">Toggle Cave Torch (Ch 4)</p>
              </div>
              <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700">
                <span className="font-mono font-bold text-amber-400">Esc / P</span>
                <p className="text-stone-300 mt-1">Pause / Resume / Skip</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
            <h3 className="font-semibold text-amber-300">🌱 Chapters 1 to 4 Mechanics</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400">❤️</span>
                <span><strong>Heart Pickups:</strong> Restores +30 Vitality and grants 5-second 1.5x speed boost.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">🏹</span>
                <span><strong>Bow Combat (Ch 3-4):</strong> Defeat wolves, foxes and cave beasts to collect puzzle pieces.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">🔦</span>
                <span><strong>Cave Torch (Ch 4):</strong> Press [F] to illuminate dark tunnels. Stay in sunlight safe zones to conserve vitality!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">🏮</span>
                <span><strong>Checkpoints:</strong> Automatically save progress, puzzle pieces, and restore vitality to at least 60%.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">📦</span>
                <span><strong>Chests & Secret Letters:</strong> Collect 4 secret letter fragments, unlock keys, memory photo, and the train ticket to Chapter 5!</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 font-semibold text-stone-950 shadow-md hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
