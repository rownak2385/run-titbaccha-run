"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Game } from "phaser";
import { EventBus, GAME_EVENTS } from "@/game/EventBus";
import { GameHUD } from "./GameHUD";
import { PauseModal } from "./PauseModal";
import { ControlsModal } from "./ControlsModal";
import { CutsceneModal } from "./CutsceneModal";
import { CinematicPlayer } from "./CinematicPlayer";
import { LetterAssemblyModal } from "./LetterAssemblyModal";
import { SunsetEndingModal } from "./SunsetEndingModal";
import { CINEMATIC_TRACKS } from "@/game/data/CinematicTracks";
import { SaveSystem } from "@/game/systems/SaveSystem";
import { SoundEffects } from "@/game/systems/SoundEffects";
import { ChapterManager } from "@/game/systems/ChapterManager";
import { PuzzleManager } from "@/game/systems/PuzzleManager";
import { GAME_CONSTANTS } from "@/game/constants";
import { GameHUDState, CheckpointData, CinematicData } from "@/types/game";

interface GameContainerProps {
  onExitToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  onExitToMenu,
  isMuted,
  onToggleMute,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  // UI modal states
  const [isPaused, setIsPaused] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isCutsceneOpen, setIsCutsceneOpen] = useState(false);
  const [activeCinematic, setActiveCinematic] = useState<CinematicData | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isSunsetEndingOpen, setIsSunsetEndingOpen] = useState(false);

  // HUD state
  const [hudState, setHudState] = useState<GameHUDState>(() => {
    const save = SaveSystem.load();
    const chapterNum = save?.chapter || 1;
    const chInfo = ChapterManager.getInstance().getChapterInfo(chapterNum);

    return {
      chapter: chapterNum,
      chapterTitle: chInfo?.title || "The Betrayal",
      health: save?.health ?? GAME_CONSTANTS.RESOURCE.INITIAL_HEALTH,
      maxHealth: GAME_CONSTANTS.RESOURCE.MAX_HEALTH,
      speedBoostActive: false,
      speedBoostSecondsRemaining: 0,
      hasKey: Boolean(
        save?.hasChapter2Key ||
        save?.hasChapter3Key ||
        save?.hasChapter4Key ||
        save?.hasChapter5Key ||
        save?.hasChapter6Key ||
        save?.hasChapter7Key
      ),
      hasLetterFragment: Boolean(save?.hasLetterFragment1),
      letterCount: save?.letterFragments?.length || 0,
      hasBow: Boolean(save?.hasBow),
      arrowCount: save?.arrowCount || 0,
      maxArrows: save?.maxArrows || GAME_CONSTANTS.COMBAT.MAX_ARROWS,
      torchAvailable: chapterNum === 4,
      torchActive: chapterNum === 4,
      inSunlight: false,
      photoPiecesCount: save?.puzzles?.photoPieces?.length || 0,
      isPhotoComplete: Boolean(save?.puzzles?.isPhotoComplete),
      ticketPiecesCount: save?.puzzles?.ticketPieces?.length || 0,
      isTicketComplete: Boolean(save?.puzzles?.isTicketComplete),
      hasTrainTicket: Boolean(save?.hasTrainTicket),
      mapPiecesCount: save?.puzzles?.mapPieces?.length || 0,
      isMapComplete: Boolean(save?.puzzles?.isMapComplete),
      rosesCount: save?.roses?.length || 0,
      hasBouquet: Boolean(save?.hasBouquet),
      necklaceGlowActive: Boolean(save?.necklaceActivated || chapterNum === 7),
      checkpointLabel: save?.activeCheckpoint?.label ?? "Garden Gate",
      notificationMessage: null,
    };
  });

  // Phaser Initialization (Client-side Only)
  useEffect(() => {
    let isMounted = true;

    const startPhaser = async () => {
      if (!containerRef.current || gameRef.current) return;

      const Phaser = await import("phaser");
      const { createPhaserConfig } = await import("@/game/phaserConfig");

      if (!isMounted || !containerRef.current) return;

      const config = createPhaserConfig(containerRef.current);
      const game = new Phaser.Game(config);
      gameRef.current = game;

      if (typeof window !== "undefined") {
        const win = window as unknown as Record<string, unknown>;
        win.__PHASER_GAME__ = game;
        win.__EVENT_BUS__ = EventBus;
        win.__GAME_EVENTS__ = GAME_EVENTS;
        win.__SAVE_SYSTEM__ = SaveSystem;
        win.__PUZZLE_MANAGER__ = PuzzleManager.getInstance();
        win.__CHAPTER_MANAGER__ = ChapterManager.getInstance();
      }

      SoundEffects.setMuted(isMuted);
    };

    startPhaser();

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        const win = window as unknown as Record<string, unknown>;
        delete win.__PHASER_GAME__;
        delete win.__EVENT_BUS__;
        delete win.__GAME_EVENTS__;
        delete win.__SAVE_SYSTEM__;
        delete win.__PUZZLE_MANAGER__;
        delete win.__CHAPTER_MANAGER__;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [isMuted]);

  // Handle EventBus Subscriptions
  useEffect(() => {
    let notificationTimeout: NodeJS.Timeout | null = null;

    const triggerNotification = (message: string) => {
      setHudState((prev) => ({ ...prev, notificationMessage: message }));
      if (notificationTimeout) clearTimeout(notificationTimeout);
      notificationTimeout = setTimeout(() => {
        setHudState((prev) => ({ ...prev, notificationMessage: null }));
      }, 3500);
    };

    const cleanups = [
      EventBus.on(GAME_EVENTS.HEALTH_UPDATED, (health: number, maxHealth: number) => {
        setHudState((prev) => ({ ...prev, health, maxHealth }));
      }),

      EventBus.on(GAME_EVENTS.SPEED_BOOST_UPDATED, (active: boolean, remainingSeconds: number) => {
        setHudState((prev) => ({
          ...prev,
          speedBoostActive: active,
          speedBoostSecondsRemaining: remainingSeconds,
        }));
      }),

      EventBus.on(GAME_EVENTS.CHECKPOINT_ACTIVATED, (checkpoint: CheckpointData) => {
        setHudState((prev) => ({
          ...prev,
          checkpointLabel: checkpoint.label,
        }));
      }),

      EventBus.on(GAME_EVENTS.ITEM_COLLECTED, (itemId: string, name: string) => {
        const save = SaveSystem.load();
        setHudState((prev) => ({
          ...prev,
          letterCount: save?.letterFragments?.length || prev.letterCount,
          hasBow: Boolean(save?.hasBow),
          arrowCount: save?.arrowCount || prev.arrowCount,
          hasKey: Boolean(
            save?.hasChapter2Key ||
            save?.hasChapter3Key ||
            save?.hasChapter4Key ||
            save?.hasChapter5Key ||
            save?.hasChapter6Key ||
            save?.hasChapter7Key
          ),
          hasTrainTicket: Boolean(save?.hasTrainTicket),
          hasBouquet: Boolean(save?.hasBouquet),
          rosesCount: save?.roses?.length || prev.rosesCount,
        }));
        triggerNotification(`Acquired: ${name}`);
      }),

      EventBus.on(GAME_EVENTS.BOW_ACQUIRED, () => {
        const save = SaveSystem.load();
        setHudState((prev) => ({
          ...prev,
          hasBow: true,
          arrowCount: save?.arrowCount || GAME_CONSTANTS.COMBAT.INITIAL_QUIVER,
        }));
      }),

      EventBus.on(GAME_EVENTS.AMMO_UPDATED, (ammo: number) => {
        setHudState((prev) => ({
          ...prev,
          arrowCount: ammo,
        }));
      }),

      EventBus.on(GAME_EVENTS.TORCH_TOGGLED, (lit?: boolean) => {
        setHudState((prev) => ({
          ...prev,
          torchActive: lit !== undefined ? lit : !prev.torchActive,
        }));
      }),

      EventBus.on(GAME_EVENTS.SUNLIGHT_ENTERED, () => {
        setHudState((prev) => ({ ...prev, inSunlight: true }));
      }),

      EventBus.on(GAME_EVENTS.SUNLIGHT_EXITED, () => {
        setHudState((prev) => ({ ...prev, inSunlight: false }));
      }),

      EventBus.on(GAME_EVENTS.PUZZLE_UPDATED, (type: string, count: number) => {
        setHudState((prev) => {
          if (type === "photo") {
            return { ...prev, photoPiecesCount: count };
          } else if (type === "ticket") {
            return { ...prev, ticketPiecesCount: count, hasTrainTicket: count >= 3 };
          } else if (type === "map") {
            return { ...prev, mapPiecesCount: count };
          }
          return prev;
        });
      }),

      EventBus.on(GAME_EVENTS.PHOTO_COMPLETED, () => {
        setHudState((prev) => ({ ...prev, isPhotoComplete: true, photoPiecesCount: 9 }));
      }),

      EventBus.on(GAME_EVENTS.TICKET_COMPLETED, () => {
        setHudState((prev) => ({ ...prev, isTicketComplete: true, ticketPiecesCount: 3, hasTrainTicket: true }));
      }),

      EventBus.on(GAME_EVENTS.MAP_COMPLETED, () => {
        setHudState((prev) => ({ ...prev, isMapComplete: true, mapPiecesCount: 4 }));
        triggerNotification("🗺️ Destination Map Completed! Coastal Path Revealed!");
      }),

      EventBus.on(GAME_EVENTS.ROSE_COLLECTED, (count: number) => {
        setHudState((prev) => ({ ...prev, rosesCount: count }));
        triggerNotification(`🌹 Gathered Clifftop Rose (${count}/5)!`);
      }),

      EventBus.on(GAME_EVENTS.BOUQUET_ASSEMBLED, () => {
        setHudState((prev) => ({ ...prev, hasBouquet: true, rosesCount: 5 }));
        triggerNotification("💐 Assembled the Five-Rose Bouquet!");
      }),

      EventBus.on(GAME_EVENTS.NECKLACE_GLOW_TOGGLED, (active: boolean) => {
        setHudState((prev) => ({ ...prev, necklaceGlowActive: active }));
      }),

      EventBus.on(GAME_EVENTS.LETTER_REVEAL_TRIGGERED, () => {
        setIsLetterModalOpen(true);
      }),

      EventBus.on(GAME_EVENTS.REUNION_TRIGGERED, () => {
        setIsLetterModalOpen(true);
      }),

      EventBus.on(GAME_EVENTS.GAME_COMPLETED, () => {
        setIsSunsetEndingOpen(true);
      }),

      EventBus.on(GAME_EVENTS.CHEST_OPENED, (chestId: string) => {
        triggerNotification(`Unlocked: ${chestId.replace(/_/g, " ")}`);
      }),

      EventBus.on(GAME_EVENTS.CUTSCENE_TRIGGER, (sceneId?: string) => {
        const trackKey = sceneId || "chapter1_betrayal";
        const track = CINEMATIC_TRACKS[trackKey] || CINEMATIC_TRACKS.chapter1_betrayal;
        setActiveCinematic(track);
      }),

      EventBus.on(GAME_EVENTS.CHANGE_CHAPTER, (targetChapter: number) => {
        if (gameRef.current) {
          const activeScenes = gameRef.current.scene.getScenes(true);
          const activeScene = activeScenes[0];
          if (activeScene) {
            ChapterManager.getInstance().transitionToChapter(activeScene, targetChapter);
            const nextInfo = ChapterManager.getInstance().getChapterInfo(targetChapter);
            setHudState((prev) => ({
              ...prev,
              chapter: targetChapter,
              chapterTitle: nextInfo?.title || `Chapter ${targetChapter}`,
              torchAvailable: targetChapter === 4,
              torchActive: targetChapter === 4,
              necklaceGlowActive: targetChapter === 7,
              checkpointLabel: nextInfo?.spawnCheckpoint.label || "Entrance",
            }));
          }
        }
      }),

      EventBus.on(GAME_EVENTS.NOTIFICATION, (msg: string) => {
        triggerNotification(msg);
      }),

      EventBus.on(GAME_EVENTS.PAUSE_GAME, () => {
        setIsPaused(true);
      }),

      EventBus.on(GAME_EVENTS.RESUME_GAME, () => {
        setIsPaused(false);
      }),
    ];

    return () => {
      if (notificationTimeout) clearTimeout(notificationTimeout);
      cleanups.forEach((c) => c());
    };
  }, []);

  // Keyboard focus & input isolation
  useEffect(() => {
    const isAnyModalOpen =
      isPaused ||
      isControlsOpen ||
      isCutsceneOpen ||
      activeCinematic !== null ||
      isLetterModalOpen ||
      isSunsetEndingOpen;
    if (gameRef.current?.input?.keyboard) {
      gameRef.current.input.keyboard.enabled = !isAnyModalOpen;
    }
  }, [isPaused, isControlsOpen, isCutsceneOpen, activeCinematic, isLetterModalOpen, isSunsetEndingOpen]);

  // Actions
  const handleResume = useCallback(() => {
    setIsPaused(false);
    EventBus.emit(GAME_EVENTS.RESUME_GAME);
  }, []);

  const handleRestartCheckpoint = useCallback(() => {
    setIsPaused(false);
    EventBus.emit(GAME_EVENTS.RESTART_CHECKPOINT);
  }, []);

  const handleReplaySlice = useCallback(() => {
    setIsCutsceneOpen(false);
    setActiveCinematic(null);
    EventBus.emit(GAME_EVENTS.RELOAD_SAVE);
  }, []);

  const handleOpenControls = useCallback(() => {
    setIsControlsOpen(true);
    setIsPaused(true);
    EventBus.emit(GAME_EVENTS.PAUSE_GAME);
  }, []);

  const handleCloseControls = useCallback(() => {
    setIsControlsOpen(false);
    setIsPaused(false);
    EventBus.emit(GAME_EVENTS.RESUME_GAME);
  }, []);

  const handleCinematicComplete = useCallback(() => {
    setActiveCinematic(null);
    setIsCutsceneOpen(true);
  }, []);

  const handleContinueNextChapter = useCallback(() => {
    setIsCutsceneOpen(false);
    setActiveCinematic(null);

    const save = SaveSystem.load();
    const currentCh = save?.chapter || 1;
    const nextCh = currentCh + 1;

    if (nextCh <= 7 && gameRef.current) {
      const activeScenes = gameRef.current.scene.getScenes(true);
      const activeScene = activeScenes[0];
      if (activeScene) {
        ChapterManager.getInstance().transitionToChapter(activeScene, nextCh);
        const nextInfo = ChapterManager.getInstance().getChapterInfo(nextCh);
        setHudState((prev) => ({
          ...prev,
          chapter: nextCh,
          chapterTitle: nextInfo?.title || `Chapter ${nextCh}`,
          torchAvailable: nextCh === 4,
          torchActive: nextCh === 4,
          necklaceGlowActive: nextCh === 7,
          checkpointLabel: nextInfo?.spawnCheckpoint.label || "Entrance",
        }));
      }
    } else if (nextCh > 7) {
      setIsLetterModalOpen(true);
    }
  }, []);

  const handleContinueToSunset = useCallback(() => {
    setIsLetterModalOpen(false);
    setIsSunsetEndingOpen(true);
    SoundEffects.playFanfare();
    SaveSystem.setGameCompleted(true);
    EventBus.emit(GAME_EVENTS.GAME_COMPLETED);
  }, []);

  const handleReplayEnding = useCallback(() => {
    setIsSunsetEndingOpen(false);
    setIsLetterModalOpen(false);
    if (gameRef.current) {
      const activeScenes = gameRef.current.scene.getScenes(true);
      const activeScene = activeScenes[0];
      if (activeScene) {
        ChapterManager.getInstance().transitionToChapter(activeScene, 7);
      }
    }
  }, []);

  const handleSelectChapter = useCallback((chapterNum: number) => {
    setIsSunsetEndingOpen(false);
    setIsLetterModalOpen(false);
    if (gameRef.current) {
      const activeScenes = gameRef.current.scene.getScenes(true);
      const activeScene = activeScenes[0];
      if (activeScene) {
        ChapterManager.getInstance().transitionToChapter(activeScene, chapterNum);
        const nextInfo = ChapterManager.getInstance().getChapterInfo(chapterNum);
        setHudState((prev) => ({
          ...prev,
          chapter: chapterNum,
          chapterTitle: nextInfo?.title || `Chapter ${chapterNum}`,
          torchAvailable: chapterNum === 4,
          torchActive: chapterNum === 4,
          necklaceGlowActive: chapterNum === 7,
          checkpointLabel: nextInfo?.spawnCheckpoint.label || "Entrance",
        }));
      }
    }
  }, []);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center bg-stone-950 p-2 md:p-4 select-none"
      tabIndex={0}
    >
      {/* 16:9 Letterboxed Game Viewport Frame */}
      <div className="relative aspect-video max-h-full max-w-[1280px] w-full overflow-hidden rounded-2xl shadow-2xl border-2 border-stone-800 bg-stone-900">
        {/* Phaser Canvas Container */}
        <div ref={containerRef} className="h-full w-full" />

        {/* HUD Overlay */}
        <GameHUD
          hudState={hudState}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onOpenPause={() => {
            setIsPaused(true);
            EventBus.emit(GAME_EVENTS.PAUSE_GAME);
          }}
          onOpenControls={handleOpenControls}
        />

        {/* Modals */}
        <PauseModal
          isOpen={isPaused && !isControlsOpen && activeCinematic === null}
          onResume={handleResume}
          onRestartCheckpoint={handleRestartCheckpoint}
          onExitToMenu={onExitToMenu}
        />

        <ControlsModal
          isOpen={isControlsOpen}
          onClose={handleCloseControls}
        />

        {/* Reusable Cinematic Player Overlay */}
        {activeCinematic && (
          <CinematicPlayer
            cinematic={activeCinematic}
            isMuted={isMuted}
            onComplete={handleCinematicComplete}
          />
        )}

        {/* Chapter Completion & Narrative Summary Modal */}
        <CutsceneModal
          isOpen={isCutsceneOpen && activeCinematic === null}
          chapter={hudState.chapter}
          onContinueNextChapter={handleContinueNextChapter}
          onRestartSlice={handleReplaySlice}
          onExitToMenu={onExitToMenu}
        />

        {/* Seven-Piece Secret Letter Assembly Modal */}
        <LetterAssemblyModal
          isOpen={isLetterModalOpen}
          onContinueToSunset={handleContinueToSunset}
        />

        {/* Sunset Clifftop Reunion Ending Modal */}
        <SunsetEndingModal
          isOpen={isSunsetEndingOpen}
          onReplayEnding={handleReplayEnding}
          onSelectChapter={handleSelectChapter}
          onExitToMenu={onExitToMenu}
        />
      </div>
    </div>
  );
};
