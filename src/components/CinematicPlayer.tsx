"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CinematicData, CinematicCue } from "@/types/game";

interface CinematicPlayerProps {
  cinematic: CinematicData;
  isMuted: boolean;
  onComplete: () => void;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  cinematic,
  isMuted,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hasVideoError, setHasVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fallbackProgress, setFallbackProgress] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [localMuted, setLocalMuted] = useState(isMuted);

  const totalDuration = cinematic.durationSeconds || 12;

  // Keep localMuted synced if parent changes
  useEffect(() => {
    setLocalMuted(isMuted);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Attempt browser video play with autoplay rejection recovery
  const attemptPlay = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      // Autoplay blocked by browser policy; retry muted or prompt user
      if (videoRef.current) {
        videoRef.current.muted = true;
        setLocalMuted(true);
        try {
          await videoRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch {
          setAutoplayBlocked(true);
          setIsPlaying(false);
        }
      }
    }
  }, []);

  // Initialize playback on mount or when cinematic changes
  useEffect(() => {
    setHasVideoError(false);
    setCurrentTime(0);
    setFallbackProgress(0);
    setAutoplayBlocked(false);

    // If video elements are supported and sources exist, attempt playback
    if (cinematic.videoSrcMp4 || cinematic.videoSrcWebm) {
      // Allow video element ref to bind before play attempt
      const timer = setTimeout(() => {
        attemptPlay();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setHasVideoError(true);
    }
  }, [cinematic, attemptPlay]);

  // Fallback timer if video cannot load or file is missing
  useEffect(() => {
    if (!hasVideoError) return;

    const intervalMs = 100;
    const stepSeconds = 0.1;
    const timer = setInterval(() => {
      setFallbackProgress((prev) => {
        const next = prev + stepSeconds;
        setCurrentTime(next);
        if (next >= totalDuration) {
          clearInterval(timer);
          onComplete();
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [hasVideoError, totalDuration, onComplete]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoError = () => {
    setHasVideoError(true);
  };

  // Replay functionality
  const handleReplay = useCallback(() => {
    if (!hasVideoError && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().catch(() => setAutoplayBlocked(true));
      setIsPlaying(true);
    } else {
      setFallbackProgress(0);
      setCurrentTime(0);
    }
  }, [hasVideoError]);

  // Keyboard shortcut isolation and bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Strictly prevent game or page events from bubbling
      e.stopPropagation();

      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        onComplete();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReplay();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setLocalMuted((prev) => {
          const next = !prev;
          if (videoRef.current) videoRef.current.muted = next;
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.stopPropagation();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [onComplete, handleReplay]);

  // Active Subtitle lookup
  const activeSubtitle: CinematicCue | undefined = cinematic.subtitles.find(
    (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white select-none overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Top Overlay Bar */}
      <div className="z-20 flex w-full max-w-6xl items-center justify-between p-6">
        <div>
          <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-mono font-bold tracking-wider uppercase text-amber-300">
            {cinematic.chapterLabel}
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-wide text-stone-200">
            {cinematic.title}
          </h2>
        </div>

        {/* Action Controls: Replay + Skip */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplay}
            className="flex items-center gap-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700 px-3.5 py-2 text-xs font-bold text-stone-300 hover:text-white backdrop-blur-md shadow-lg active:scale-95 transition-all"
            title="Replay sequence (R)"
          >
            <span>🔄 Replay</span>
            <kbd className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] text-stone-400 font-mono">
              R
            </kbd>
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 border border-amber-400/50 px-4 py-2 text-xs font-bold text-stone-950 backdrop-blur-md shadow-lg active:scale-95 transition-all"
            title="Skip sequence (ESC or Space)"
          >
            <span>⏩ Skip</span>
            <kbd className="rounded bg-amber-700/60 text-amber-100 px-1.5 py-0.5 text-[10px] font-mono">
              ESC
            </kbd>
          </button>
        </div>
      </div>

      {/* Main 16:9 Presentation Stage */}
      <div className="relative flex flex-1 w-full max-w-5xl items-center justify-center p-4">
        {!hasVideoError && (cinematic.videoSrcMp4 || cinematic.videoSrcWebm) ? (
          <div className="relative aspect-video max-h-[75vh] w-full overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              preload="auto"
              playsInline
              muted={localMuted}
              onTimeUpdate={handleTimeUpdate}
              onError={handleVideoError}
              onEnded={onComplete}
              className="h-full w-full object-contain"
            >
              {cinematic.videoSrcWebm && (
                <source src={cinematic.videoSrcWebm} type="video/webm" />
              )}
              {cinematic.videoSrcMp4 && (
                <source src={cinematic.videoSrcMp4} type="video/mp4" />
              )}
            </video>

            {/* Browser Autoplay Blocked Interactivity Prompt */}
            {autoplayBlocked && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play().then(() => {
                        setIsPlaying(true);
                        setAutoplayBlocked(false);
                      });
                    }
                  }}
                  className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3.5 shadow-xl transition-all scale-100 hover:scale-105 active:scale-95 flex items-center gap-3 text-sm md:text-base"
                >
                  <span className="text-xl">▶</span> Click to Play Cinematic
                </button>
                <span className="mt-3 text-xs text-stone-400 font-mono">
                  Browser requires user gesture for media playback
                </span>
              </div>
            )}
          </div>
        ) : (
          /* High-Fidelity Typographic & Illustrated Fallback Presentation */
          <div className="w-full max-w-2xl rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-stone-900 via-stone-950 to-black p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-4xl shadow-inner">
              {cinematic.id.includes("betrayal")
                ? "🦊"
                : cinematic.id.includes("reunion")
                ? "💛"
                : cinematic.id.includes("disaster")
                ? "☄️"
                : "🐤"}
            </div>

            <div className="mt-4 inline-block rounded-full bg-stone-800/80 border border-stone-700 px-3 py-1 text-[11px] font-mono text-stone-300">
              [Cinematic Video Pipeline Slot • Google Flow Integration]
            </div>

            <p className="mt-5 text-sm md:text-base leading-relaxed text-stone-200 italic">
              &ldquo;{cinematic.fallbackDescription}&rdquo;
            </p>

            {/* Fallback Progress Countdown Bar */}
            <div className="mt-6 w-full overflow-hidden rounded-full bg-stone-800 h-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
                style={{
                  width: `${Math.min(
                    100,
                    (fallbackProgress / totalDuration) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Subtitle Display Bar */}
      <div className="z-20 flex min-h-[5.5rem] w-full max-w-4xl flex-col items-center justify-center p-6 text-center">
        {activeSubtitle ? (
          <div className="rounded-2xl bg-black/85 border border-stone-700/80 px-6 py-3.5 backdrop-blur-md shadow-2xl transition-all">
            {activeSubtitle.speaker && (
              <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-0.5 font-mono">
                {activeSubtitle.speaker}
              </span>
            )}
            <p className="text-sm md:text-base font-semibold text-stone-100">
              {activeSubtitle.text}
            </p>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </div>
  );
};
