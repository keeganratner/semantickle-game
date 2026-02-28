import { NextRequest, NextResponse } from "next/server";
import { getDailyWord } from "@/lib/daily-word";
import { hasWord, getGuessInfo, getWordCount } from "@/lib/vectors";

export async function POST(request: NextRequest) {
  try {
    const { word, dayOffset = 0 } = await request.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "Missing word", valid: false },
        { status: 400 }
      );
    }

    const normalized = word.trim().toLowerCase();

    if (!hasWord(normalized)) {
      return NextResponse.json(
        { error: "word not recognized", valid: false },
        { status: 200 }
      );
    }

    const targetWord = getDailyWord(dayOffset);
    const isCorrect = normalized === targetWord;

    const info = getGuessInfo(targetWord, normalized);
    if (!info) {
      return NextResponse.json(
        { error: "Could not compute similarity", valid: false },
        { status: 500 }
      );
    }

    // Map raw cosine similarity to 0-100 display scale
    // Raw cosine sim for GloVe typically ranges from -0.5 to 1.0
    // We clamp to [0, 1] for display
    const displaySimilarity = Math.max(0, Math.min(1, (info.similarity + 1) / 2));

    return NextResponse.json({
      valid: true,
      word: normalized,
      similarity: Math.round(displaySimilarity * 10000) / 10000,
      rank: info.rank,
      totalWords: getWordCount(),
      percentile: Math.round(info.percentile * 100) / 100,
      isCorrect,
    });
  } catch (err) {
    console.error("Guess error:", err);
    return NextResponse.json(
      { error: "Server error", valid: false },
      { status: 500 }
    );
  }
}
