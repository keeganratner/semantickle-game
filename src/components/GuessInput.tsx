"use client";

import { useState, useRef, useEffect } from "react";

interface GuessInputProps {
  onGuess: (word: string) => void;
  disabled: boolean;
  guessCount: number;
  error: string | null;
  onHint?: () => void;
  hintWord?: string | null;
  hintLoading?: boolean;
  hintsUsed?: number;
  showHint?: boolean;
}

export function GuessInput({
  onGuess,
  disabled,
  guessCount,
  error,
  onHint,
  hintWord,
  hintLoading,
  hintsUsed = 0,
  showHint,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [shaking, setShaking] = useState(false);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      setValue("");
      setShaking(true);
      setShowError(true);
      const shakeTimer = setTimeout(() => setShaking(false), 400);
      const clearTimer = setTimeout(() => setShowError(false), 2000);
      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || disabled) return;
    onGuess(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className={`flex gap-2 ${shaking ? "animate-shake-long" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (showError) setShowError(false);
          }}
          disabled={disabled}
          placeholder={showError && error ? error : "type a word..."}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`flex-1 px-3 py-2.5 bg-white border rounded-lg text-stone-800 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm ${
            showError
              ? "border-red-300 placeholder:text-red-300"
              : "border-stone-200 placeholder:text-stone-300 focus:border-stone-400"
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-5 py-2.5 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          guess
        </button>
      </div>
      <div className="flex justify-between items-center h-5 px-1">
        <span className="text-xs text-stone-400 font-mono">
          {guessCount > 0 ? `guess #${guessCount}` : ""}
        </span>
        <div className="flex items-center gap-2">
          {showHint && (
            <button
              type="button"
              onClick={onHint}
              disabled={hintLoading}
              className="text-xs font-bold transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: "#aa7faa" }}
            >
              {hintLoading ? "..." : "hint"}
            </button>
          )}
        </div>
      </div>
      {showHint && (
        <div className={`px-1 min-h-5 transition-opacity duration-200 ${hintWord ? "opacity-100" : "opacity-0"}`}>
          <span className="text-xs text-stone-500 font-mono">
            try something close to <span className="font-semibold" style={{ color: "#aa7faa" }}>{hintWord || "\u00A0"}</span>
          </span>
          {hintsUsed > 1 && (
            <span className="text-xs text-stone-300 font-mono ml-2">
              ({hintsUsed} hints used)
            </span>
          )}
        </div>
      )}
    </form>
  );
}
