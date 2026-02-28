"use client";

interface AdvanceDayButtonProps {
  dayOffset: number;
  setDayOffset: (offset: number) => void;
  onAdvance: () => void;
}

export function AdvanceDayButton({
  dayOffset,
  setDayOffset,
}: AdvanceDayButtonProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-stone-400 border border-dashed border-stone-300 rounded-md px-3 py-2">
      <span className="font-mono">day offset: {dayOffset}</span>
      <button
        onClick={() => setDayOffset(dayOffset + 1)}
        className="text-stone-500 hover:text-stone-700 underline underline-offset-2"
      >
        +1 day
      </button>
      <button
        onClick={() => setDayOffset(dayOffset - 1)}
        className="text-stone-500 hover:text-stone-700 underline underline-offset-2"
      >
        -1 day
      </button>
      {dayOffset !== 0 && (
        <button
          onClick={() => setDayOffset(0)}
          className="text-stone-500 hover:text-stone-700 underline underline-offset-2"
        >
          reset
        </button>
      )}
    </div>
  );
}
