"use client";

import React from "react";
import { GameHUDState } from "@/types/game";

interface GameHUDProps {
  hudState: GameHUDState;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPause: () => void;
  onOpenControls: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hudState,
  isMuted,
  onToggleMute,
  onOpenPause,
  onOpenControls,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (hudState.health / hudState.maxHealth) * 100));

  return (
    <header
      aria-label="Game HUD"
      className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4"
    >
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Vitality, Buffs & Weapon (Top Left) */}
        <div
          className="pointer-events-auto flex flex-col gap-2 rounded-2xl bg-black/60 backdrop-blur-md border border-stone-700/60 p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chapter & Title */}
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-amber-300 border-b border-stone-700/60 pb-1">
            <span>CHAPTER {hudState.chapter}</span>
            <span className="text-stone-300">{hudState.chapterTitle}</span>
          </div>

          {/* Health / Vitality Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xl animate-pulse">❤️</span>
            <div className="flex flex-col">
              <div className="flex justify-between text-[11px] font-bold tracking-wider text-stone-200">
                <span>VITALITY</span>
                <span>
                  {hudState.health} / {hudState.maxHealth}
                </span>
              </div>
              <div className="mt-1 h-3.5 w-44 overflow-hidden rounded-full bg-stone-800 border border-stone-600/50">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    healthPercent > 50
                      ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : healthPercent > 25
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-rose-600 to-red-500"
                  }`}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Buffs & Torch status */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
            {/* Torch indicator in Chapter 4 */}
            {hudState.torchAvailable && (
              <span
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold ${
                  hudState.torchActive
                    ? hudState.inSunlight
                      ? "bg-yellow-950/80 border-yellow-400 text-yellow-300"
                      : "bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse"
                    : "bg-stone-900 border-stone-700 text-stone-500"
                }`}
              >
                {hudState.torchActive ? "🔦 TORCH [F]: ON" : "🌑 TORCH [F]: OFF"}
                {hudState.inSunlight && " (☀️ SAFE)"}
              </span>
            )}

            {/* Speed Boost */}
            {hudState.speedBoostActive && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/60 px-2 py-0.5 font-bold text-amber-300 animate-pulse">
                ⚡ SPEED ({hudState.speedBoostSecondsRemaining}s)
              </span>
            )}

            {/* Checkpoint */}
            {hudState.checkpointLabel && (
              <span className="flex items-center gap-1 rounded-full bg-stone-800/80 border border-stone-600 px-2 py-0.5 text-stone-300">
                🏮 {hudState.checkpointLabel}
              </span>
            )}
          </div>
        </div>

        {/* Inventory & Puzzle Progress Badges (Top Center) */}
        <div
          className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md border border-stone-700/60 px-3 py-1.5 shadow-lg max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] font-semibold text-stone-400">Inventory:</span>

          {/* Letter Fragments */}
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-mono font-semibold border ${
              hudState.letterCount > 0
                ? "bg-amber-950 border-amber-500 text-amber-300"
                : "bg-stone-800/50 border-stone-700 text-stone-500"
            }`}
          >
            📜 Frags: {hudState.letterCount}/7
          </span>

          {/* Photo Puzzle Progress in Chapter 3 */}
          {hudState.chapter === 3 && (
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-mono font-semibold border ${
                hudState.isPhotoComplete
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-sky-950/80 border-sky-600 text-sky-300"
              }`}
            >
              🖼️ Photo: {hudState.photoPiecesCount}/9 {hudState.isPhotoComplete ? "✓" : ""}
            </span>
          )}

          {/* Train Ticket Progress in Chapter 4 & 5 */}
          {(hudState.chapter === 4 || hudState.chapter === 5) && (
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-mono font-semibold border ${
                hudState.isTicketComplete || hudState.hasTrainTicket
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-purple-950/80 border-purple-600 text-purple-300"
              }`}
            >
              🎫 Ticket: {hudState.ticketPiecesCount}/3 {hudState.isTicketComplete || hudState.hasTrainTicket ? "✓" : ""}
            </span>
          )}

          {/* Destination Map Progress in Chapter 6 */}
          {hudState.chapter === 6 && (
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-mono font-semibold border ${
                hudState.isMapComplete
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-teal-950/80 border-teal-600 text-teal-300"
              }`}
            >
              🗺️ Map: {hudState.mapPiecesCount}/4 {hudState.isMapComplete ? "✓" : ""}
            </span>
          )}

          {/* Clifftop Roses & Bouquet in Chapter 7 */}
          {hudState.chapter === 7 && (
            <>
              <span
                className={`rounded-lg px-2 py-0.5 text-xs font-mono font-semibold border ${
                  hudState.hasBouquet
                    ? "bg-rose-950 border-rose-500 text-rose-300"
                    : "bg-pink-950/80 border-pink-600 text-pink-300"
                }`}
              >
                {hudState.hasBouquet ? "💐 Bouquet: Assembled ✓" : `🌹 Roses: ${hudState.rosesCount}/5`}
              </span>

              {hudState.necklaceGlowActive && (
                <span className="rounded-lg px-2 py-0.5 text-xs font-mono font-bold border bg-emerald-950/90 border-emerald-400 text-emerald-300 animate-pulse">
                  ✨ Pendant: Radiant
                </span>
              )}
            </>
          )}
        </div>

        {/* Controls & Quick Actions (Top Right) */}
        <div
          className="pointer-events-auto flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onOpenControls}
            title="Controls & Mechanics Help"
            className="flex items-center gap-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-stone-700/80 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition-all shadow"
          >
            <span>❓</span>
            <span className="hidden sm:inline">Controls</span>
          </button>
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            className="flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md border border-stone-700/80 p-2 text-stone-200 hover:bg-stone-800 hover:text-white transition-all shadow"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={onOpenPause}
            title="Pause Game (Esc / P)"
            className="flex items-center gap-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-500 backdrop-blur-md border border-amber-400 px-3 py-2 text-xs font-bold text-stone-950 transition-all shadow"
          >
            <span>⏸</span>
            <span className="hidden sm:inline">Pause</span>
          </button>
        </div>
      </div>

      {/* Notification Toast (Bottom Center) */}
      {hudState.notificationMessage && (
        <div className="pointer-events-none mx-auto mb-6 flex items-center gap-2 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/50 px-5 py-2.5 shadow-2xl animate-bounce">
          <span className="text-amber-400">✨</span>
          <span className="text-sm font-semibold text-amber-200">
            {hudState.notificationMessage}
          </span>
        </div>
      )}
    </header>
  );
};
