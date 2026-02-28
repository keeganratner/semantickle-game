"use client";

import { useState, useEffect, useCallback } from "react";
import type { GuessResult } from "@/types";

const COOKIE_NAME = "semantickle-progress";

interface GameProgress {
  puzzleId: number;
  guesses: GuessResult[];
  isCorrect: boolean;
  hintsUsed: number;
}

function readProgress(): GameProgress | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(COOKIE_NAME + "="));

  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return null;
  }
}

function writeProgress(progress: GameProgress | null): void {
  if (typeof document === "undefined") return;

  if (!progress) {
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
    return;
  }

  const maxAge = 24 * 60 * 60; // 1 day
  const value = encodeURIComponent(JSON.stringify(progress));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function useGameProgress(puzzleId: number) {
  const [loaded, setLoaded] = useState(false);

  const loadProgress = useCallback((): {
    guesses: GuessResult[];
    isCorrect: boolean;
    hintsUsed: number;
  } | null => {
    const progress = readProgress();
    if (!progress || progress.puzzleId !== puzzleId) return null;
    return {
      guesses: progress.guesses,
      isCorrect: progress.isCorrect,
      hintsUsed: progress.hintsUsed,
    };
  }, [puzzleId]);

  const saveProgress = useCallback(
    (guesses: GuessResult[], isCorrect: boolean, hintsUsed: number) => {
      writeProgress({ puzzleId, guesses, isCorrect, hintsUsed });
    },
    [puzzleId]
  );

  const clearProgress = useCallback(() => {
    writeProgress(null);
  }, []);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return { loadProgress, saveProgress, clearProgress, loaded };
}
