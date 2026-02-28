"use client";

interface WinBannerProps {
  word: string;
  guessCount: number;
  avgGuesses: string;
  totalWins: number;
}

export function WinBanner({ word, guessCount, avgGuesses, totalWins }: WinBannerProps) {
  const handleShare = () => {
    const text = `semantickle \u2014 found "${word}" in ${guessCount} guess${guessCount === 1 ? "" : "es"}`;
    navigator.clipboard.writeText(text);
  };

  const letterDelay = 80;
  const cascadeEnd = word.length * letterDelay;
  const subtitleDelay = cascadeEnd + 200;
  const statsDelay = subtitleDelay + 300;
  const buttonDelay = statsDelay + 200;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Letter cascade */}
      <div className="flex gap-1">
        {word.split("").map((letter, i) => (
          <span
            key={i}
            className="font-mono text-2xl font-bold text-emerald-600"
            style={{
              opacity: 0,
              animation: `cascade-drop 350ms ease-out ${i * letterDelay}ms forwards`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Subtitle */}
      <p
        className="text-sm text-stone-500"
        style={{
          opacity: 0,
          animation: `cascade-fade-in 400ms ease-out ${subtitleDelay}ms forwards`,
        }}
      >
        found in {guessCount} guess{guessCount === 1 ? "" : "es"}
      </p>

      {/* Stats */}
      <div
        className="flex gap-4 text-xs text-stone-400 font-mono"
        style={{
          opacity: 0,
          animation: `cascade-fade-in 400ms ease-out ${statsDelay}ms forwards`,
        }}
      >
        <span>{totalWins} win{totalWins === 1 ? "" : "s"}</span>
        <span>avg {avgGuesses}</span>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="px-3 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-md hover:bg-stone-50 transition-colors"
        style={{
          opacity: 0,
          animation: `cascade-fade-in 400ms ease-out ${buttonDelay}ms forwards`,
        }}
      >
        copy result
      </button>
    </div>
  );
}
