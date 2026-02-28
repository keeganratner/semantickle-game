"use client";

import type { GuessResult } from "@/types";

interface GuessRowProps {
  guess: GuessResult;
  rank: number;
  isNew: boolean;
}

function getBarColor(similarity: number): string {
  if (similarity >= 0.90) return "bg-emerald-500";
  if (similarity >= 0.75) return "bg-emerald-400";
  if (similarity >= 0.60) return "bg-amber-400";
  if (similarity >= 0.45) return "bg-stone-400";
  return "bg-stone-300";
}

function getTextColor(similarity: number): string {
  if (similarity >= 0.75) return "text-emerald-700";
  if (similarity >= 0.60) return "text-amber-700";
  return "text-stone-500";
}

export function GuessRow({ guess, rank, isNew }: GuessRowProps) {
  const barWidth = Math.max(2, guess.similarity * 100);
  const barColor = getBarColor(guess.similarity);
  const scoreColor = getTextColor(guess.similarity);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-stone-100 bg-white ${
        isNew ? "animate-slide-in" : ""
      } ${guess.isCorrect ? "border-emerald-300 bg-emerald-50" : ""}`}
    >
      <span className="text-xs text-stone-300 font-mono w-6 text-right shrink-0">
        {rank}.
      </span>

      <span
        className={`text-sm font-mono w-24 shrink-0 truncate ${
          guess.isCorrect ? "text-emerald-700 font-semibold" : "text-stone-700"
        }`}
      >
        {guess.word}
      </span>

      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} ${isNew ? "animate-bar-fill" : ""}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <span className={`text-xs font-mono w-12 text-right shrink-0 ${scoreColor}`}>
        {guess.similarity.toFixed(2)}
      </span>

      <span className="text-xs text-stone-300 font-mono w-16 text-right shrink-0">
        #{guess.rank.toLocaleString()}
      </span>
    </div>
  );
}
