/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StoryPanelData, StoryTheme } from "@/game/data/StoryData";

interface IllustratedStoryPanelProps {
  story: StoryPanelData;
  onComplete: () => void;
}

export const IllustratedStoryPanel: React.FC<IllustratedStoryPanelProps> = ({
  story,
  onComplete,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const totalPages = story.pages.length;
  const isLastPage = currentPage === totalPages - 1;
  const page = story.pages[currentPage];
  const currentIllustration = page?.illustrationSrc || story.illustrationSrc;

  // Reset image error state when navigating to a new page or story
  useEffect(() => {
    setImageFailed(false);
  }, [currentPage, story]);

  const handleNext = useCallback(() => {
    if (isLastPage) {
      onComplete();
    } else {
      setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
    }
  }, [isLastPage, onComplete, totalPages]);

  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Keyboard navigation & stop propagation to prevent Phaser movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleNext, handlePrev, handleSkip]);

  // Render Theme SVG illustration
  const renderThemeIllustration = (theme: StoryTheme) => {
    switch (theme) {
      case "garden":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
              <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            <rect width="600" height="320" fill="url(#skyGrad)" />
            {/* Sun */}
            <circle cx="500" cy="70" r="45" fill="#fef08a" opacity="0.9" />
            <circle cx="500" cy="70" r="55" fill="#fde047" opacity="0.4" />
            {/* Distant Hills */}
            <path d="M0 220 Q 150 160 300 210 T 600 190 L 600 320 L 0 320 Z" fill="#86efac" />
            {/* Foreground Grass */}
            <path d="M0 240 Q 200 210 400 235 T 600 230 L 600 320 L 0 320 Z" fill="url(#grassGrad)" />
            {/* Ronny standing happily */}
            <circle cx="260" cy="180" r="16" fill="#fed7aa" />
            <rect x="250" y="196" width="20" height="36" rx="4" fill="#3b82f6" />
            <circle cx="260" cy="204" r="5" fill="#22c55e" /> {/* Leaf Pendant */}
            {/* Titi baby chick */}
            <ellipse cx="310" cy="245" rx="14" ry="12" fill="#facc15" />
            <circle cx="318" cy="240" r="7" fill="#fef08a" />
            <polygon points="325,240 332,242 325,244" fill="#f97316" />
            <circle cx="314" cy="246" r="3" fill="#22c55e" /> {/* Mini Pendant */}
            {/* Sunflowers */}
            <g transform="translate(80, 210)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#166534" strokeWidth="4" />
              <circle cx="0" cy="0" r="16" fill="#facc15" />
              <circle cx="0" cy="0" r="8" fill="#78350f" />
            </g>
            <g transform="translate(130, 225)">
              <line x1="0" y1="0" x2="0" y2="35" stroke="#166534" strokeWidth="4" />
              <circle cx="0" cy="0" r="14" fill="#facc15" />
              <circle cx="0" cy="0" r="7" fill="#78350f" />
            </g>
          </svg>
        );

      case "meteor":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <defs>
              <linearGradient id="meteorSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="50%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
            </defs>
            <rect width="600" height="320" fill="url(#meteorSky)" />
            {/* Meteor Trail */}
            <line x1="550" y1="20" x2="160" y2="240" stroke="#c084fc" strokeWidth="16" strokeLinecap="round" opacity="0.6" />
            <line x1="550" y1="20" x2="160" y2="240" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
            <line x1="550" y1="20" x2="160" y2="240" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
            {/* Explosion flash */}
            <circle cx="160" cy="240" r="50" fill="#fef08a" opacity="0.8" />
            <circle cx="160" cy="240" r="80" fill="#f97316" opacity="0.4" />
            {/* Shattered ground */}
            <polygon points="0,260 140,245 160,285 240,250 400,270 600,260 600,320 0,320" fill="#292524" />
          </svg>
        );

      case "betrayal":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <rect width="600" height="320" fill="#1c1917" />
            <path d="M0 240 Q 300 220 600 240 L 600 320 L 0 320 Z" fill="#292524" />
            {/* Fox */}
            <g transform="translate(340, 210)">
              <polygon points="0,20 40,-10 60,20" fill="#ea580c" />
              <polygon points="10,-2 20,-20 30,-2" fill="#ea580c" /> {/* Ear */}
              <circle cx="45" cy="5" r="2.5" fill="#facc15" /> {/* Fox eye */}
              <path d="M-30 20 Q -50 -10 -20 -20" stroke="#ea580c" strokeWidth="12" fill="none" strokeLinecap="round" /> {/* Tail */}
            </g>
            {/* Golden Berries Bait */}
            <circle cx="300" cy="240" r="6" fill="#facc15" filter="drop-shadow(0 0 8px #fde047)" />
            {/* Titi */}
            <g transform="translate(240, 225)">
              <ellipse cx="14" cy="12" rx="14" ry="12" fill="#facc15" />
              <polygon points="25,12 32,14 25,16" fill="#f97316" />
            </g>
            {/* Distant Ronny Walking Away */}
            <g transform="translate(100, 200) scale(0.75)" opacity="0.6">
              <circle cx="20" cy="10" r="14" fill="#fed7aa" />
              <rect x="10" y="24" width="20" height="34" rx="4" fill="#1e3a8a" />
              <rect x="22" y="28" width="14" height="20" rx="3" fill="#78350f" /> {/* Pack */}
            </g>
          </svg>
        );

      case "search":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <defs>
              <linearGradient id="twilightSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
            </defs>
            <rect width="600" height="320" fill="url(#twilightSky)" />
            <path d="M0 250 L 150 240 L 300 255 L 450 245 L 600 250 L 600 320 L 0 320 Z" fill="#334155" />
            {/* Golden Heart Seeds Trail */}
            <circle cx="160" cy="242" r="5" fill="#facc15" />
            <circle cx="240" cy="248" r="5" fill="#facc15" />
            <circle cx="330" cy="245" r="5" fill="#facc15" />
            <circle cx="430" cy="243" r="5" fill="#facc15" />
            <circle cx="520" cy="246" r="5" fill="#facc15" />
            {/* Titi following trail */}
            <g transform="translate(100, 225)">
              <ellipse cx="14" cy="12" rx="14" ry="12" fill="#facc15" />
              <polygon points="25,12 32,14 25,16" fill="#f97316" />
            </g>
          </svg>
        );

      case "photo":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <rect width="600" height="320" fill="#064e3b" />
            {/* Restored Memory Photo */}
            <g transform="translate(180, 50)">
              <rect width="240" height="190" rx="8" fill="#f8fafc" stroke="#facc15" strokeWidth="4" />
              <rect x="15" y="15" width="210" height="130" fill="#38bdf8" />
              {/* Picture inside */}
              <circle cx="85" cy="80" r="14" fill="#fed7aa" />
              <rect x="75" y="94" width="20" height="30" fill="#2563eb" />
              <circle cx="130" cy="100" r="10" fill="#facc15" />
              <text x="120" y="170" fill="#475569" fontSize="12" fontFamily="sans-serif" textAnchor="middle">
                Ronny &amp; Titibaccha
              </text>
            </g>
          </svg>
        );

      case "cave":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <rect width="600" height="320" fill="#09090b" />
            {/* Glowing Torch Radius */}
            <circle cx="220" cy="180" r="100" fill="#f59e0b" opacity="0.3" filter="blur(20px)" />
            <circle cx="220" cy="180" r="50" fill="#fef08a" opacity="0.5" filter="blur(10px)" />
            {/* Ticket Scrap */}
            <g transform="translate(380, 160)">
              <rect width="60" height="35" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
              <text x="30" y="22" fill="#713f12" fontSize="10" fontWeight="bold" textAnchor="middle">
                TICKET
              </text>
            </g>
          </svg>
        );

      case "train":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <rect width="600" height="320" fill="#0c4a6e" />
            {/* Train Carriages */}
            <rect x="60" y="170" width="160" height="70" rx="4" fill="#047857" />
            <rect x="240" y="170" width="160" height="70" rx="4" fill="#047857" />
            <rect x="420" y="150" width="160" height="90" rx="6" fill="#1e293b" /> {/* Engine */}
            {/* Steam plume */}
            <circle cx="480" cy="110" r="30" fill="#f1f5f9" opacity="0.7" />
            <circle cx="440" cy="90" r="40" fill="#f1f5f9" opacity="0.5" />
            {/* Titi leaping on roof */}
            <g transform="translate(200, 140)">
              <ellipse cx="14" cy="12" rx="14" ry="12" fill="#facc15" />
            </g>
          </svg>
        );

      case "explosion":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <rect width="600" height="320" fill="#0f172a" />
            {/* Ocean */}
            <rect x="0" y="220" width="600" height="100" fill="#0369a1" />
            {/* Engine Explosion */}
            <circle cx="160" cy="180" r="70" fill="#f97316" opacity="0.8" />
            <circle cx="160" cy="180" r="45" fill="#fef08a" />
            {/* Mountain Trail Clifftop */}
            <path d="M300 320 L 450 160 L 600 120 L 600 320 Z" fill="#334155" />
            {/* Ronny's Pack */}
            <rect x="190" y="235" width="24" height="20" rx="3" fill="#78350f" />
          </svg>
        );

      case "necklace":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <rect width="600" height="320" fill="#022c22" />
            {/* Radiant Glowing Necklaces */}
            <g transform="translate(220, 160)">
              <circle cx="0" cy="0" r="40" fill="#10b981" opacity="0.4" filter="blur(15px)" />
              <path d="M0 -25 C 20 -25 25 15 0 25 C -25 15 -20 -25 0 -25 Z" fill="#34d399" />
            </g>
            <g transform="translate(380, 160)">
              <circle cx="0" cy="0" r="40" fill="#10b981" opacity="0.4" filter="blur(15px)" />
              <path d="M0 -25 C 20 -25 25 15 0 25 C -25 15 -20 -25 0 -25 Z" fill="#34d399" />
            </g>
            <line x1="220" y1="160" x2="380" y2="160" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="6 6" />
          </svg>
        );

      case "hug":
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <defs>
              <linearGradient id="hugSunset" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <rect width="600" height="320" fill="url(#hugSunset)" />
            {/* Clifftop Meadow */}
            <path d="M0 240 Q 300 220 600 240 L 600 320 L 0 320 Z" fill="#065f46" />
            {/* Ronny kneeling holding Titi */}
            <circle cx="300" cy="170" r="18" fill="#fed7aa" />
            <rect x="286" y="188" width="28" height="42" rx="6" fill="#1d4ed8" />
            {/* Arms cradling */}
            <ellipse cx="300" cy="205" rx="16" ry="12" fill="#fed7aa" />
            {/* Titi nestled in Ronny's hands */}
            <ellipse cx="300" cy="200" rx="12" ry="10" fill="#facc15" />
            {/* Five Roses Bouquet */}
            <circle cx="280" cy="210" r="5" fill="#e11d48" />
            <circle cx="285" cy="204" r="5" fill="#e11d48" />
            <circle cx="275" cy="205" r="5" fill="#e11d48" />
          </svg>
        );

      case "sunset":
      default:
        return (
          <svg viewBox="0 0 600 320" className="w-full h-full">
            <defs>
              <linearGradient id="finalSunset" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="40%" stopColor="#ea580c" />
                <stop offset="75%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="600" height="320" fill="url(#finalSunset)" />
            {/* Golden Sun on Horizon */}
            <circle cx="300" cy="210" r="45" fill="#fef08a" />
            {/* Sea reflection */}
            <rect x="0" y="210" width="600" height="110" fill="#0369a1" opacity="0.6" />
            {/* Clifftop silhouette */}
            <path d="M0 250 Q 200 225 380 235 L 600 250 L 600 320 L 0 320 Z" fill="#0f172a" />
            {/* Ronny and Titi sitting side by side */}
            <g transform="translate(320, 218)">
              <circle cx="0" cy="0" r="10" fill="#fed7aa" />
              <rect x="-6" y="10" width="14" height="20" fill="#1e3a8a" />
              <circle cx="16" cy="18" r="6" fill="#facc15" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-stone-900 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950/60 px-5 py-3">
          <div>
            <h2 className="text-base font-bold text-amber-300 tracking-wide">
              {story.chapterTitle}
            </h2>
            <p className="text-xs text-stone-400">{story.subtitle}</p>
          </div>

          <button
            onClick={handleSkip}
            className="rounded-full bg-stone-800/80 px-3 py-1 text-xs font-semibold text-stone-400 hover:bg-stone-700 hover:text-stone-200 transition"
          >
            Skip Story (Esc)
          </button>
        </div>

        {/* Visual Illustration Area */}
        <div className="relative aspect-video w-full max-h-80 overflow-hidden bg-stone-950 flex items-center justify-center">
          {!imageFailed && currentIllustration ? (
            <img
              key={currentIllustration}
              src={currentIllustration}
              alt={`${story.chapterTitle} - Page ${currentPage + 1}`}
              className="w-full h-full object-contain bg-stone-950"
              onError={() => setImageFailed(true)}
            />
          ) : (
            renderThemeIllustration(story.illustrationTheme)
          )}
        </div>

        {/* Narrative Text Container */}
        <div className="flex flex-col gap-3 p-5 sm:p-6 bg-gradient-to-b from-stone-900 to-stone-950">
          {page.speaker && (
            <span className="inline-block w-fit rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400">
              {page.speaker}
            </span>
          )}

          <p className="min-h-[4rem] text-sm sm:text-base leading-relaxed text-stone-200 font-serif">
            {page.text}
          </p>

          {/* Controls Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-stone-800/80 pt-3">
            {/* Page indicator */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              {story.pages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentPage
                      ? "w-4 bg-amber-400"
                      : "w-1.5 bg-stone-700"
                  }`}
                />
              ))}
              <span className="ml-2 font-mono">
                {currentPage + 1} / {totalPages}
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentPage > 0 && (
                <button
                  onClick={handlePrev}
                  className="rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:bg-stone-700 transition active:scale-95"
                >
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                autoFocus
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs font-bold text-stone-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition active:scale-95"
              >
                <span>{isLastPage ? "Continue Journey" : "Next"}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
