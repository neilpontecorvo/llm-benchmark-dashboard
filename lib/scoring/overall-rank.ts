import { BENCHMARK_WEIGHTS } from "@/lib/weights";
import { BenchmarkKey, BenchmarkResult, OverallResult } from "@/lib/types";

interface Aggregate {
  modelName: string;
  provider?: string;
  includedBenchmarks: Set<BenchmarkKey>;
  weightedScore: number;
  appearanceCount: number;
}

export function buildOverallTop3(allResults: BenchmarkResult[]): OverallResult[] {
  const eligible = allResults.filter((r) => r.includedInOverall && typeof r.normalizedScore === "number");
  const map = new Map<string, Aggregate>();

  for (const result of eligible) {
    const key = `${result.provider ?? "unknown"}::${result.modelName}`;
    const weight = BENCHMARK_WEIGHTS[result.benchmarkKey] ?? 0;
    if (!map.has(key)) {
      map.set(key, {
        modelName: result.modelName,
        provider: result.provider,
        includedBenchmarks: new Set<BenchmarkKey>(),
        weightedScore: 0,
        appearanceCount: 0
      });
    }

    const current = map.get(key)!;
    current.includedBenchmarks.add(result.benchmarkKey);
    current.weightedScore += (result.normalizedScore ?? 0) * weight;
    current.appearanceCount += 1;
  }

  return [...map.values()]
    .sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore;
      if (b.appearanceCount !== a.appearanceCount) return b.appearanceCount - a.appearanceCount;
      return a.modelName.localeCompare(b.modelName);
    })
    .slice(0, 3)
    .map((item, index) => ({
      id: `overall-${index + 1}-${item.modelName}`,
      fetchedAt: new Date().toISOString(),
      modelName: item.modelName,
      provider: item.provider,
      includedBenchmarks: [...item.includedBenchmarks],
      weightedScore: Number(item.weightedScore.toFixed(2)),
      appearanceCount: item.appearanceCount,
      overallRank: index + 1
    }));
}
