"use client";

import type { CalculatorResult } from "@/types";

interface CalculatorResultsProps {
  results: CalculatorResult[];
  expression: string;
}

export function CalculatorResults({ results, expression }: CalculatorResultsProps) {
  return (
    <div className="animate-fade-in-up flex flex-col gap-1">
      <div className="flex items-center gap-3 px-3 py-1 text-xs text-stone-400">
        <span className="w-6 shrink-0"></span>
        <span className="flex-1">word</span>
        <span className="w-16 text-right shrink-0">similarity</span>
      </div>

      <p className="text-xs text-stone-400 px-3 mb-1">
        nearest words to:{" "}
        <span className="font-mono text-stone-500">
          {expression}
        </span>
      </p>

      {results.map((result, i) => (
        <div
          key={result.word}
          className="flex items-center gap-3 px-3 py-2 rounded-lg border border-stone-100 bg-white animate-slide-in"
          style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
        >
          <span className="text-xs text-stone-300 font-mono w-6 text-right shrink-0">
            {i + 1}.
          </span>

          <span className="text-sm font-mono text-stone-700 flex-1">
            {result.word}
          </span>

          <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-stone-400"
              style={{ width: `${Math.max(5, result.similarity * 100)}%` }}
            />
          </div>

          <span className="text-xs font-mono text-stone-500 w-16 text-right shrink-0">
            {result.similarity.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  );
}
