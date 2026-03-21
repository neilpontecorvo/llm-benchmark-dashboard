import { BenchmarkResult } from "@/lib/types";

export function normalizeScores(results: BenchmarkResult[]): BenchmarkResult[] {
  const numeric = results.map((r) => r.rawScore).filter((v): v is number => typeof v === "number");

  if (numeric.length === 0) {
    const maxRank = Math.max(...results.map((r) => r.rank ?? 999));
    return results.map((r) => ({
      ...r,
      normalizedScore: r.rank ? Number((((maxRank - r.rank + 1) / maxRank) * 100).toFixed(2)) : null
    }));
  }

  const min = Math.min(...numeric);
  const max = Math.max(...numeric);

  if (min === max) {
    return results.map((r) => ({ ...r, normalizedScore: 100 }));
  }

  return results.map((r) => ({
    ...r,
    normalizedScore:
      typeof r.rawScore === "number"
        ? Number((((r.rawScore - min) / (max - min)) * 100).toFixed(2))
        : null
  }));
}
