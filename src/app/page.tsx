import { GameBoard } from "@/components/GameBoard";
import { getPuzzleNumber } from "@/lib/daily-word";

export default function Home() {
  const puzzleNumber = getPuzzleNumber();

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <GameBoard puzzleNumber={puzzleNumber} />
    </main>
  );
}
