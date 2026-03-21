import { mockResultsForBenchmark } from "@/lib/mock-data";
import { normalizeScores } from "@/lib/scoring/normalize";
import type { BenchmarkAdapter, BenchmarkResult } from "@/lib/types";

export abstract class BaseAdapter implements BenchmarkAdapter {
  abstract key: BenchmarkAdapter["key"];
  abstract displayName: string;
  abstract sourceUrl: string;
  abstract includedInOverall: boolean;

  async fetchTopResults(limit = 10): Promise<BenchmarkResult[]> {
    const useMock = process.env.USE_MOCK_DATA !== "false";
    if (useMock) {
      return normalizeScores(mockResultsForBenchmark(this, limit));
    }
    return this.fetchLive(limit);
  }

  protected normalizeLiveRows(rows: BenchmarkResult[]): BenchmarkResult[] {
    return normalizeScores(rows);
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    return normalizeScores(mockResultsForBenchmark(this, limit));
  }
}
