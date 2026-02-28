"use client";

import { useState, useEffect, useCallback } from "react";
import type { Stats } from "@/types";

const COOKIE_NAME = "semantickle-stats";

const DEFAULT_STATS: Stats = {
  wins: 0,
  totalGames: 0,
  totalGuesses: 0,
  lastPlayedDate: "",
  currentStreak: 0,
  maxStreak: 0,
};

function readStats(): Stats {
  if (typeof document === "undefined") return DEFAULT_STATS;

  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(COOKIE_NAME + "="));

  if (!match) return DEFAULT_STATS;

  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return DEFAULT_STATS;
  }
}

function writeStats(stats: Stats): void {
  if (typeof document === "undefined") return;

  const maxAge = 365 * 24 * 60 * 60;
  const value = encodeURIComponent(JSON.stringify(stats));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getDateString(offset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  useEffect(() => {
    setStats(readStats());
  }, []);

  const recordWin = useCallback((guessCount: number) => {
    const current = readStats();
    const today = getDateString();
    const yesterday = getDateString(-1);

    const newStreak =
      current.lastPlayedDate === yesterday
        ? current.currentStreak + 1
        : current.lastPlayedDate === today
          ? current.currentStreak
          : 1;

    const updated: Stats = {
      wins: current.wins + 1,
      totalGames: current.totalGames + 1,
      totalGuesses: current.totalGuesses + guessCount,
      lastPlayedDate: today,
      currentStreak: newStreak,
      maxStreak: Math.max(current.maxStreak, newStreak),
    };

    writeStats(updated);
    setStats(updated);
  }, []);

  const avgGuesses =
    stats.wins > 0 ? (stats.totalGuesses / stats.wins).toFixed(1) : "\u2014";

  return { stats, recordWin, avgGuesses };
}
