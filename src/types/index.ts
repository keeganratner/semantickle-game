export type GuessResult = {
  word: string;
  similarity: number;
  rank: number;
  percentile: number;
  isCorrect: boolean;
};

export type Stats = {
  wins: number;
  totalGames: number;
  totalGuesses: number;
  lastPlayedDate: string;
  currentStreak: number;
  maxStreak: number;
};

export type CalculatorResult = {
  word: string;
  similarity: number;
};
