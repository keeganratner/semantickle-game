"use client";

import type { Stats } from "@/types";

interface StatsDisplayProps {
  stats: Stats;
  avgGuesses: string;
}

export function StatsDisplay({ stats, avgGuesses }: StatsDisplayProps) {
  if (stats.wins === 0) return null;

  return (
    <div className="flex gap-4 text-xs text-stone-400 font-mono px-1">
      <span>
        {stats.wins} win{stats.wins === 1 ? "" : "s"}
      </span>
      <span>avg {avgGuesses} guesses</span>
      {stats.currentStreak > 1 && (
        <span>{stats.currentStreak} day streak</span>
      )}
    </div>
  );
}
