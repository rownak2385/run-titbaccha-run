"use client";

import React, { useState } from "react";
import { STORY_DATA } from "@/game/data/StoryData";

interface LetterAssemblyModalProps {
  isOpen: boolean;
  onContinueToSunset: () => void;
}

export const LetterAssemblyModal: React.FC<LetterAssemblyModalProps> = ({
  isOpen,
  onContinueToSunset,
}) => {
  const [isAssembled, setIsAssembled] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col items-center rounded-3xl border border-amber-400/50 bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/40 p-6 md:p-8 text-stone-100 shadow-2xl overflow-y-auto">
        {/* Header Badge */}
        <div className="flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
          <span>📜</span>
          <span>THE SEVEN-PIECE SECRET LETTER ASSEMBLY</span>
        </div>

        <h2 className="mt-3 text-2xl md:text-3xl font-black text-amber-400 text-center tracking-wide drop-shadow">
          {isAssembled ? STORY_DATA.ASSEMBLED_LETTER_TITLE : "Seven Fragments United at Last"}
        </h2>

        {/* Assembly Stage Toggle */}
        {!isAssembled ? (
          <div className="w-full mt-4 flex flex-col items-center">
            <p className="text-xs md:text-sm text-stone-300 text-center max-w-lg mb-4">
              Across seven arduous chapters, Titibaccha collected each scattered piece of Ronny&apos;s unsent letter.
              Watch them join together:
            </p>

            {/* 7 Fragment Pieces Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-lg mb-6">
              {STORY_DATA.LETTER_FRAGMENTS.map((frag) => (
                <div
                  key={frag.id}
                  className="flex flex-col items-center p-3 rounded-xl border border-amber-500/30 bg-amber-900/30 shadow-inner transform hover:scale-105 transition-all"
                >
                  <span className="text-xs font-black text-amber-300">Piece {frag.id}/7</span>
                  <span className="text-[10px] text-stone-400 text-center mt-1">Ch {frag.chapter}</span>
                  <p className="text-[10px] text-stone-300 italic text-center mt-2 line-clamp-2">
                    &quot;{frag.excerpt}&quot;
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAssembled(true)}
              className="rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-8 py-3.5 text-sm md:text-base font-extrabold text-stone-950 shadow-xl hover:from-amber-400 hover:to-yellow-500 active:scale-95 transition-all border border-amber-300"
            >
              ✨ Assemble All 7 Pieces Into The Complete Letter
            </button>
          </div>
        ) : (
          <div className="w-full mt-4 flex flex-col items-center animate-fadeIn">
            {/* Parchment Styled Letter Container */}
            <div className="w-full max-w-xl rounded-2xl border-2 border-amber-600/60 bg-[#fef9c3]/95 p-6 md:p-8 text-stone-900 shadow-2xl space-y-3.5 my-2">
              {STORY_DATA.ASSEMBLED_LETTER_BODY.map((paragraph, idx) => (
                <p
                  key={idx}
                  className={`text-xs md:text-sm leading-relaxed ${
                    idx === 0
                      ? "font-bold text-stone-950 text-base"
                      : idx >= STORY_DATA.ASSEMBLED_LETTER_BODY.length - 2
                      ? "text-right font-serif italic text-amber-950"
                      : "text-stone-800 font-serif"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setIsAssembled(false)}
                className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-300 hover:bg-stone-700 active:scale-95 transition-all"
              >
                Inspect Individual Pieces
              </button>

              <button
                onClick={onContinueToSunset}
                className="rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 px-8 py-3 text-sm md:text-base font-extrabold text-white shadow-xl hover:from-emerald-500 hover:to-green-600 active:scale-95 transition-all border border-emerald-400/40"
              >
                🌅 Proceed to Sunset Ending
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
