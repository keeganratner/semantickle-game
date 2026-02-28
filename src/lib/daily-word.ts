import * as fs from "fs";
import * as path from "path";
import { hashString, mulberry32 } from "./seeded-random";

const SALT = "semantickle-v1";
const EPOCH = "2026-02-27"; // epoch aligns so launch day (Feb 28) = puzzle #1
const RESET_HOUR_UTC = 16; // 4pm UTC
const MS_PER_DAY = 1000 * 60 * 60 * 24;

let dailyWords: string[] | null = null;

function loadDailyWords(): string[] {
  if (!dailyWords) {
    const filePath = path.join(process.cwd(), "data", "daily-words.json");
    dailyWords = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return dailyWords!;
}

/** Get the "game day" date string — rolls over at 4pm UTC */
function getGameDay(dayOffset: number = 0): string {
  const now = new Date();
  const shifted = new Date(now.getTime() - RESET_HOUR_UTC * 60 * 60 * 1000);
  shifted.setDate(shifted.getDate() + dayOffset);
  return shifted.toISOString().split("T")[0];
}

export function getDailyWord(dayOffset: number = 0): string {
  const words = loadDailyWords();
  const dateStr = getGameDay(dayOffset);
  const seed = hashString(dateStr + SALT);
  const rng = mulberry32(seed);
  const index = Math.floor(rng() * words.length);
  return words[index];
}

export function getPuzzleNumber(dayOffset: number = 0): number {
  const gameDay = getGameDay(dayOffset);
  const diff = new Date(gameDay).getTime() - new Date(EPOCH).getTime();
  return Math.floor(diff / MS_PER_DAY) + 1;
}
