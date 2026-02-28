"use client";

import type { GuessResult } from "@/types";
import { GuessRow } from "./GuessRow";

interface GuessListProps {
  guesses: GuessResult[];
  latestWord: string | null;
}

export function GuessList({ guesses, latestWord }: GuessListProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3 px-3 py-1 text-xs text-stone-400">
        <span className="w-6 text-right shrink-0"></span>
        <span className="w-24 shrink-0">word</span>
        <span className="flex-1">similarity</span>
        <span className="w-12 text-right shrink-0">score</span>
        <span className="w-16 text-right shrink-0">rank</span>
      </div>
      {guesses.map((guess, i) => (
        <GuessRow
          key={guess.word}
          guess={guess}
          rank={i + 1}
          isNew={guess.word === latestWord}
        />
      ))}
    </div>
  );
}
