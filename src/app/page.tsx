"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TitleMenu } from "@/components/TitleMenu";
import { ControlsModal } from "@/components/ControlsModal";
import { SaveSystem } from "@/game/systems/SaveSystem";
import { SoundEffects } from "@/game/systems/SoundEffects";

// Dynamically import GameContainer with SSR disabled to guarantee Phaser only runs in browser
const GameContainer = dynamic(
  () => import("@/components/GameContainer").then((mod) => mod.GameContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-stone-950 text-amber-400 font-bold">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🐤</span>
          <span>Loading Run Titibaccha, Run!...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const [view, setView] = useState<"menu" | "game">("menu");
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Load initial settings
  useEffect(() => {
    const save = SaveSystem.load();
    if (save?.settings) {
      setIsMuted(Boolean(save.settings.muted));
      SoundEffects.setMuted(Boolean(save.settings.muted));
    }
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    SoundEffects.setMuted(nextMuted);
    SaveSystem.updateSettings({ muted: nextMuted });
  };

  const handleStartGame = (isNew: boolean) => {
    if (isNew) {
      SaveSystem.createNewSave();
    }
    setView("game");
  };

  const handleExitToMenu = () => {
    setView("menu");
  };

  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-stone-950">
      {view === "menu" ? (
        <TitleMenu
          onStartGame={handleStartGame}
          onOpenControls={() => setIsControlsOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      ) : (
        <GameContainer
          onExitToMenu={handleExitToMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Global Controls Modal accessible from title menu */}
      {view === "menu" && (
        <ControlsModal
          isOpen={isControlsOpen}
          onClose={() => setIsControlsOpen(false)}
        />
      )}
    </main>
  );
}
