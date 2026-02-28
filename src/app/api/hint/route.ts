import { NextRequest, NextResponse } from "next/server";
import { getDailyWord } from "@/lib/daily-word";
import { getWordAtRank } from "@/lib/vectors";

export async function POST(request: NextRequest) {
  try {
    const { closestRank, dayOffset = 0, hintsUsed = 0 } = await request.json();

    if (typeof closestRank !== "number" || closestRank < 1) {
      return NextResponse.json(
        { error: "Invalid rank" },
        { status: 400 }
      );
    }

    const targetWord = getDailyWord(dayOffset);

    // If the player already has #2, give them the answer
    if (closestRank <= 2) {
      return NextResponse.json({
        word: targetWord,
        rank: 1,
      });
    }

    // Hint word is at 2/3 of the closest rank (closer to the answer)
    let hintRank = Math.max(2, Math.round(closestRank * (2 / 3)));

    // First hint: cap at ~1500 so the hint isn't too far from the answer
    if (hintsUsed === 0) {
      const jitter = Math.floor(Math.random() * 101) - 50; // -50 to +50
      const capRank = 1500 + jitter;
      hintRank = Math.min(hintRank, capRank);
    }

    const result = getWordAtRank(targetWord, hintRank);
    if (!result) {
      return NextResponse.json(
        { error: "Could not find hint" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      word: result.word,
      rank: hintRank,
    });
  } catch (err) {
    console.error("Hint error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
