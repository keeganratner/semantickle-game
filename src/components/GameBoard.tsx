"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GuessResult } from "@/types";
import { GuessInput } from "./GuessInput";
import { GuessList } from "./GuessList";
import { WinBanner } from "./WinBanner";
import { StatsDisplay } from "./StatsDisplay";
import { useStats } from "@/hooks/useStats";
import { useGameProgress } from "@/hooks/useGameProgress";

export function GameBoard({ puzzleNumber }: { puzzleNumber: number }) {
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestWord, setLatestWord] = useState<string | null>(null);
  const [hintWord, setHintWord] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const { stats, recordWin, avgGuesses } = useStats();

  const { loadProgress, saveProgress, loaded } =
    useGameProgress(puzzleNumber);

  // Track whether we've restored from cookie for this puzzle
  const restoredRef = useRef<number | null>(null);

  // Restore progress from cookie on mount / puzzle change
  useEffect(() => {
    if (!loaded || restoredRef.current === puzzleNumber) return;
    restoredRef.current = puzzleNumber;

    const saved = loadProgress();
    if (saved) {
      setGuesses(saved.guesses);
      setIsCorrect(saved.isCorrect);
      setHintsUsed(saved.hintsUsed);
      setLatestWord(null);
      setHintWord(null);
      setError(null);
    }
  }, [loaded, puzzleNumber, loadProgress]);

  // Save progress whenever guesses/isCorrect/hintsUsed change
  useEffect(() => {
    if (!loaded || restoredRef.current !== puzzleNumber) return;
    if (guesses.length === 0 && !isCorrect) return; // Don't save empty state
    saveProgress(guesses, isCorrect, hintsUsed);
  }, [guesses, isCorrect, hintsUsed, loaded, puzzleNumber, saveProgress]);

  const handleGuess = useCallback(
    async (word: string) => {
      if (isCorrect) return;
      if (guesses.some((g) => g.word === word)) {
        setError("already guessed");
        return;
      }

      setError(null);

      try {
        const res = await fetch("/api/guess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word }),
        });

        const data = await res.json();

        if (!data.valid) {
          setError(data.error || "not in word list");
          return;
        }

        const result: GuessResult = {
          word: data.word,
          similarity: data.similarity,
          rank: data.rank,
          percentile: data.percentile,
          isCorrect: data.isCorrect,
        };

        setLatestWord(data.word);
        setGuesses((prev) => {
          const next = [...prev, result];
          next.sort((a, b) => b.similarity - a.similarity);
          return next;
        });

        if (data.isCorrect) {
          setIsCorrect(true);
          recordWin(guesses.length + 1);
        }
      } catch {
        setError("something went wrong");
      }
    },
    [isCorrect, guesses, recordWin]
  );

  const handleHint = useCallback(async () => {
    if (isCorrect || hintLoading || guesses.length === 0) return;

    const bestRank = Math.min(...guesses.map((g) => g.rank));

    setHintLoading(true);

    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closestRank: bestRank, hintsUsed }),
      });

      const data = await res.json();
      if (data.word) {
        if (data.rank === 1) {
          // The answer — auto-guess it
          setHintsUsed((h) => h + 1);
          handleGuess(data.word);
        } else {
          setHintWord(data.word);
          setHintsUsed((h) => h + 1);
        }
      }
    } catch {
      // silently fail
    } finally {
      setHintLoading(false);
    }
  }, [isCorrect, hintLoading, guesses, hintsUsed, handleGuess]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400 font-mono">
          puzzle #{puzzleNumber}{" "}
          <span className="text-stone-300">(resets 4pm utc)</span>
        </p>
        <StatsDisplay stats={stats} avgGuesses={avgGuesses} />
      </div>

      {isCorrect && (
        <WinBanner
          word={guesses.find((g) => g.isCorrect)!.word}
          guessCount={guesses.length}
          avgGuesses={avgGuesses}
          totalWins={stats.wins}
        />
      )}

      <GuessInput
        onGuess={handleGuess}
        disabled={isCorrect}
        guessCount={guesses.length}
        error={error}
        onHint={handleHint}
        hintWord={hintWord}
        hintLoading={hintLoading}
        hintsUsed={hintsUsed}
        showHint={!isCorrect && guesses.length > 0}
      />

      <GuessList guesses={guesses} latestWord={latestWord} />
    </div>
  );
}
