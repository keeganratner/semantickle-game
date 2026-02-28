"use client";

import { useState } from "react";
import type { CalculatorResult } from "@/types";
import { CalculatorResults } from "./CalculatorResults";

export function Calculator() {
  const [expression, setExpression] = useState("");
  const [results, setResults] = useState<CalculatorResult[] | null>(null);
  const [computedExpression, setComputedExpression] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = expression.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: trimmed }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setResults(null);
        return;
      }

      setResults(data.results);
      setComputedExpression(trimmed);
    } catch {
      setError("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-stone-500">
        perform arithmetic on word vectors and find the nearest words to the
        result.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="king - man + woman"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors font-mono text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !expression.trim()}
            className="px-5 py-2.5 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "calculate"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 px-1 animate-fade-in-up">
            {error}
          </p>
        )}
      </form>

      <div className="text-xs text-stone-400 px-1 flex flex-col gap-1">
        <p>examples:</p>
        <div className="flex flex-wrap gap-2">
          {["king - man + woman", "paris - france + germany", "good - bad + evil"].map(
            (ex) => (
              <button
                key={ex}
                onClick={() => setExpression(ex)}
                className="font-mono px-2 py-1 rounded border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                {ex}
              </button>
            )
          )}
        </div>
      </div>

      {results && (
        <CalculatorResults results={results} expression={computedExpression} />
      )}
    </div>
  );
}
