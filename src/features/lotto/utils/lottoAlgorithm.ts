import { LOTTO } from './lottoConstants';
import { getColorGroup } from './lottoColors';
import type { AlgorithmMode, LottoHistoryEntry } from '../types/lotto.types';
import historyData from '../data/lottoHistory.json';

const history = historyData as LottoHistoryEntry[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRandomNumbers(): number[] {
  const pool = Array.from({ length: LOTTO.MAX_NUMBER }, (_, i) => i + 1);
  return shuffle(pool).slice(0, LOTTO.TOTAL_PICK).sort((a, b) => a - b);
}

function getFrequencyMap(): Map<number, number> {
  const freq = new Map<number, number>();
  for (let i = 1; i <= LOTTO.MAX_NUMBER; i++) freq.set(i, 0);
  for (const entry of history) {
    for (const n of entry.numbers) {
      freq.set(n, (freq.get(n) || 0) + 1);
    }
  }
  return freq;
}

function classifyNumbers(freq: Map<number, number>): {
  hot: number[];
  balanced: number[];
  cold: number[];
} {
  const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  const hotCount = Math.round(LOTTO.MAX_NUMBER * 0.33);
  const coldCount = Math.round(LOTTO.MAX_NUMBER * 0.33);

  return {
    hot: entries.slice(0, hotCount).map(([n]) => n),
    balanced: entries.slice(hotCount, LOTTO.MAX_NUMBER - coldCount).map(([n]) => n),
    cold: entries.slice(LOTTO.MAX_NUMBER - coldCount).map(([n]) => n),
  };
}

function scoreCandidate(numbers: number[], freq: Map<number, number>, classes: ReturnType<typeof classifyNumbers>): number {
  const main = numbers.slice(0, 6);
  let score = 100;

  // Sum range check (100-175)
  const sum = main.reduce((a, b) => a + b, 0);
  if (sum < LOTTO.SCORE.SUM_MIN || sum > LOTTO.SCORE.SUM_MAX) {
    score -= 30;
  } else {
    const center = (LOTTO.SCORE.SUM_MIN + LOTTO.SCORE.SUM_MAX) / 2;
    const dist = Math.abs(sum - center) / (LOTTO.SCORE.SUM_MAX - LOTTO.SCORE.SUM_MIN);
    score += (1 - dist) * 10;
  }

  // Odd/even balance (3:3 best, 4:2 ok)
  const oddCount = main.filter(n => n % 2 === 1).length;
  if (oddCount === 3) score += 15;
  else if (oddCount === 2 || oddCount === 4) score += 8;
  else score -= 10;

  // High/low balance (1-22 vs 23-45)
  const lowCount = main.filter(n => n <= 22).length;
  if (lowCount === 3) score += 15;
  else if (lowCount === 2 || lowCount === 4) score += 8;
  else score -= 10;

  // Consecutive number check (max 1 pair)
  const sorted = [...main].sort((a, b) => a - b);
  let consecutivePairs = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) consecutivePairs++;
  }
  if (consecutivePairs <= LOTTO.SCORE.MAX_CONSECUTIVE_PAIRS) score += 10;
  else score -= 15 * (consecutivePairs - 1);

  // Color group distribution (at least 3 out of 5 groups)
  const groups = new Set(main.map(getColorGroup));
  if (groups.size >= 4) score += 15;
  else if (groups.size >= 3) score += 8;
  else score -= 10;

  // Hot/cold distribution
  const hotCount = main.filter(n => classes.hot.includes(n)).length;
  const coldCount = main.filter(n => classes.cold.includes(n)).length;
  if (hotCount >= 3 && hotCount <= 4 && coldCount >= 1 && coldCount <= 2) {
    score += 15;
  }

  return score;
}

function generateSmartNumbers(): number[] {
  const freq = getFrequencyMap();
  const classes = classifyNumbers(freq);

  let bestNumbers: number[] = [];
  let bestScore = -Infinity;

  for (let i = 0; i < LOTTO.CANDIDATE_COUNT; i++) {
    // Weighted random selection
    const pool: number[] = [];

    // Hot numbers (60%)
    const hotPicks = shuffle(classes.hot).slice(0, Math.round(LOTTO.MAIN_COUNT * LOTTO.SCORE.HOT_RATIO));
    pool.push(...hotPicks);

    // Balanced numbers (25%)
    const balPicks = shuffle(classes.balanced).slice(0, Math.round(LOTTO.MAIN_COUNT * LOTTO.SCORE.BALANCED_RATIO));
    pool.push(...balPicks);

    // Cold numbers (15%)
    const coldPicks = shuffle(classes.cold).slice(0, Math.max(1, Math.round(LOTTO.MAIN_COUNT * LOTTO.SCORE.COLD_RATIO)));
    pool.push(...coldPicks);

    // Deduplicate and fill to 7
    const unique = [...new Set(pool)];
    const remaining = shuffle(
      Array.from({ length: LOTTO.MAX_NUMBER }, (_, i) => i + 1).filter(n => !unique.includes(n))
    );

    while (unique.length < LOTTO.TOTAL_PICK) {
      unique.push(remaining.shift()!);
    }

    const candidate = unique.slice(0, LOTTO.TOTAL_PICK).sort((a, b) => a - b);
    const score = scoreCandidate(candidate, freq, classes);

    if (score > bestScore) {
      bestScore = score;
      bestNumbers = candidate;
    }
  }

  return bestNumbers;
}

export function generateNumbers(mode: AlgorithmMode): number[] {
  if (mode === 'random') return generateRandomNumbers();
  return generateSmartNumbers();
}
