import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkCategory, BenchmarkResult } from "@/lib/types";

const DATA_URL =
  "https://raw.githubusercontent.com/swe-bench/swe-bench.github.io/master/data/leaderboards.json";

interface SWEBenchEntry {
  name: string;
  resolved: number;
  date: string;
  tags?: string[];
  os_model?: boolean;
  os_system?: boolean;
}

interface SWEBenchPayload {
  leaderboards: Array<{
    name: string;
    results: SWEBenchEntry[];
  }>;
}

export class SWEBenchAdapter extends BaseAdapter {
  key = "swe_bench_verified" as const;
  displayName = "SWE-bench Verified";
  sourceUrl = "https://www.swebench.com/";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_SWE_BENCH !== "true";
  }

  protected async fetchLive(limit: number): Promise<BenchmarkResult[]> {
    const res = await fetch(DATA_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`SWE-bench data fetch failed: ${res.status}`);
    }

    const payload: SWEBenchPayload = await res.json();
    const verified = payload.leaderboards.find((lb) => lb.name === "Verified");

    if (!verified) {
      throw new Error("SWE-bench Verified leaderboard not found in payload");
    }

    const sorted = verified.results
      .filter((r) => r.resolved != null)
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, limit);

    if (sorted.length < 10) {
      throw new Error(
        `SWE-bench Verified returned only ${sorted.length} rows; expected at least 10`
      );
    }

    const fetchedAt = new Date().toISOString();

    return this.normalizeLiveRows(
      sorted.map((entry, idx) => ({
        id: `${this.key}:${entry.name}:${idx + 1}`,
        benchmarkKey: this.key,
        fetchedAt,
        modelName: entry.name,
        provider: extractOrg(entry.tags),
        rank: idx + 1,
        rawScore: entry.resolved,
        rawScoreText: `${entry.resolved}%`,
        normalizedScore: null,
        confidenceText: null,
        category: "coding" as BenchmarkCategory,
        sourceUrl: this.sourceUrl,
        includedInOverall: this.includedInOverall
      }))
    );
  }
}

function extractOrg(tags?: string[]): string | undefined {
  if (!tags) return undefined;
  const orgTag = tags.find((t) => t.startsWith("Org:"));
  return orgTag ? orgTag.slice(4).trim() : undefined;
}
