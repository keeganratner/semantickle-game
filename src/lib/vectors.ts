import * as fs from "fs";
import * as path from "path";

const DIMENSIONS = 100;

let words: string[] | null = null;
let vectors: Float32Array | null = null;
let wordIndex: Map<string, number> | null = null;
let norms: Float32Array | null = null;

// Cache for precomputed rankings keyed by target word
const rankingsCache = new Map<string, Map<string, { rank: number; similarity: number }>>();
// Sorted word list by rank (index 0 = rank 1) for O(1) rank→word lookups
const rankedWordsCache = new Map<string, { word: string; similarity: number }[]>();

function ensureLoaded(): void {
  if (words && vectors && wordIndex && norms) return;

  const dataDir = path.join(process.cwd(), "data");
  const wordsPath = path.join(dataDir, "words.json");
  const vectorsPath = path.join(dataDir, "vectors.bin");

  if (!fs.existsSync(wordsPath) || !fs.existsSync(vectorsPath)) {
    throw new Error("Embeddings not found. Run: npm run setup");
  }

  words = JSON.parse(fs.readFileSync(wordsPath, "utf-8"));
  const buffer = fs.readFileSync(vectorsPath);
  vectors = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / 4
  );

  wordIndex = new Map();
  for (let i = 0; i < words!.length; i++) {
    wordIndex.set(words![i], i);
  }

  // Precompute norms
  norms = new Float32Array(words!.length);
  for (let i = 0; i < words!.length; i++) {
    let sum = 0;
    const offset = i * DIMENSIONS;
    for (let j = 0; j < DIMENSIONS; j++) {
      sum += vectors![offset + j] * vectors![offset + j];
    }
    norms![i] = Math.sqrt(sum);
  }
}

export function hasWord(word: string): boolean {
  ensureLoaded();
  return wordIndex!.has(word.toLowerCase());
}

export function getVector(word: string): Float32Array | null {
  ensureLoaded();
  const idx = wordIndex!.get(word.toLowerCase());
  if (idx === undefined) return null;
  return vectors!.subarray(idx * DIMENSIONS, (idx + 1) * DIMENSIONS);
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

function cosineSimilarityWithIndex(vec: Float32Array, wordIdx: number): number {
  ensureLoaded();
  let dot = 0;
  const offset = wordIdx * DIMENSIONS;
  for (let j = 0; j < DIMENSIONS; j++) {
    dot += vec[j] * vectors![offset + j];
  }
  let normVec = 0;
  for (let j = 0; j < DIMENSIONS; j++) {
    normVec += vec[j] * vec[j];
  }
  const denom = Math.sqrt(normVec) * norms![wordIdx];
  if (denom === 0) return 0;
  return dot / denom;
}

export function vectorArithmetic(
  operations: { word: string; sign: 1 | -1 }[]
): Float32Array | null {
  ensureLoaded();
  const result = new Float32Array(DIMENSIONS);

  for (const op of operations) {
    const vec = getVector(op.word);
    if (!vec) return null;
    for (let i = 0; i < DIMENSIONS; i++) {
      result[i] += op.sign * vec[i];
    }
  }

  return result;
}

export function findNearest(
  vec: Float32Array,
  topK: number,
  excludeWords?: Set<string>
): { word: string; similarity: number }[] {
  ensureLoaded();

  const results: { word: string; similarity: number }[] = [];

  for (let i = 0; i < words!.length; i++) {
    if (excludeWords && excludeWords.has(words![i])) continue;

    const sim = cosineSimilarityWithIndex(vec, i);
    results.push({ word: words![i], similarity: sim });
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

export function getGuessInfo(
  targetWord: string,
  guessWord: string
): { similarity: number; rank: number; percentile: number } | null {
  ensureLoaded();

  const targetVec = getVector(targetWord);
  const guessVec = getVector(guessWord);
  if (!targetVec || !guessVec) return null;

  // Check cache
  if (!rankingsCache.has(targetWord)) {
    // Compute all similarities for this target word
    const sims: { word: string; similarity: number }[] = [];
    for (let i = 0; i < words!.length; i++) {
      const sim = cosineSimilarityWithIndex(targetVec, i);
      sims.push({ word: words![i], similarity: sim });
    }
    sims.sort((a, b) => b.similarity - a.similarity);

    const rankMap = new Map<string, { rank: number; similarity: number }>();
    for (let i = 0; i < sims.length; i++) {
      rankMap.set(sims[i].word, { rank: i + 1, similarity: sims[i].similarity });
    }
    rankingsCache.set(targetWord, rankMap);
    rankedWordsCache.set(targetWord, sims);
  }

  const rankings = rankingsCache.get(targetWord)!;
  const info = rankings.get(guessWord);
  if (!info) return null;

  const percentile = ((words!.length - info.rank) / words!.length) * 100;

  return {
    similarity: info.similarity,
    rank: info.rank,
    percentile,
  };
}

export function getWordAtRank(targetWord: string, rank: number): { word: string; similarity: number } | null {
  ensureLoaded();

  // Ensure rankings are cached for this target
  if (!rankedWordsCache.has(targetWord)) {
    getGuessInfo(targetWord, targetWord);
  }

  const ranked = rankedWordsCache.get(targetWord);
  if (!ranked || rank < 1 || rank > ranked.length) return null;

  return ranked[rank - 1]; // O(1) array index lookup
}

export function getWordCount(): number {
  ensureLoaded();
  return words!.length;
}
