import { NextRequest, NextResponse } from "next/server";
import { hasWord, vectorArithmetic, findNearest } from "@/lib/vectors";

function parseExpression(
  expr: string
): { word: string; sign: 1 | -1 }[] | null {
  const tokens = expr.trim().split(/\s+/);
  if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === "")) {
    return null;
  }

  const operations: { word: string; sign: 1 | -1 }[] = [];
  let currentSign: 1 | -1 = 1;

  for (const token of tokens) {
    if (token === "+") {
      currentSign = 1;
    } else if (token === "-") {
      currentSign = -1;
    } else {
      const word = token.toLowerCase().replace(/[^a-z]/g, "");
      if (word.length === 0) continue;
      operations.push({ word, sign: currentSign });
      currentSign = 1;
    }
  }

  return operations.length > 0 ? operations : null;
}

export async function POST(request: NextRequest) {
  try {
    const { expression, topN = 10 } = await request.json();

    if (!expression || typeof expression !== "string") {
      return NextResponse.json(
        { error: "Missing expression" },
        { status: 400 }
      );
    }

    const operations = parseExpression(expression);
    if (!operations) {
      return NextResponse.json(
        { error: "Could not parse expression" },
        { status: 400 }
      );
    }

    // Validate all words exist
    const unknownWords = operations
      .filter((op) => !hasWord(op.word))
      .map((op) => op.word);

    if (unknownWords.length > 0) {
      return NextResponse.json(
        { error: `Unknown word(s): ${unknownWords.join(", ")}` },
        { status: 200 }
      );
    }

    const resultVec = vectorArithmetic(operations);
    if (!resultVec) {
      return NextResponse.json(
        { error: "Could not compute vector" },
        { status: 500 }
      );
    }

    const inputWords = new Set(operations.map((op) => op.word));
    const results = findNearest(resultVec, topN, inputWords);

    return NextResponse.json({
      results: results.map((r) => ({
        word: r.word,
        similarity: Math.round(r.similarity * 10000) / 10000,
      })),
      inputWords: Array.from(inputWords),
    });
  } catch (err) {
    console.error("Calculate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
