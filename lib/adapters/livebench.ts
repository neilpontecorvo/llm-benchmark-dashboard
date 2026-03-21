import { BaseAdapter } from "@/lib/adapters/_base";
import type { BenchmarkResult } from "@/lib/types";

/**
 * LiveBench — contamination-free benchmark with monthly question rotation.
 * Source: https://livebench.ai/
 * JS-rendered SPA with no public JSON API.
 * Seeded from latest available aggregated data.
 * TODO: integrate live scraping via headless browser or when API becomes available.
 */

const SEED_DATA = [
  { model: "o3-mini", provider: "OpenAI", score: 84.6 },
  { model: "Qwen3 235B A22B", provider: "Alibaba", score: 77.1 },
  { model: "Kimi K2 Instruct 0905", provider: "Moonshot AI", score: 76.4 },
  { model: "Kimi K2 Instruct", provider: "Moonshot AI", score: 76.4 },
  { model: "Qwen3 32B", provider: "Alibaba", score: 74.9 },
  { model: "Qwen3 30B A3B", provider: "Alibaba", score: 74.3 },
  { model: "QwQ-32B", provider: "Alibaba", score: 73.1 },
  { model: "o1", provider: "OpenAI", score: 67.0 },
  { model: "Qwen2.5 72B Instruct", provider: "Alibaba", score: 52.3 },
  { model: "o1-preview", provider: "OpenAI", score: 52.3 }
];

export class LiveBenchAdapter extends BaseAdapter {
  key = "livebench" as const;
  displayName = "LiveBench";
  sourceUrl = "https://livebench.ai/";
  includedInOverall = true;

  protected shouldUseMock(): boolean {
    if (process.env.USE_MOCK_DATA !== "false") return true;
    return process.env.USE_LIVE_LIVEBENCH !== "true";
  }

  protected async fetchLive(_limit: number): Promise<BenchmarkResult[]> {
    // No structured API available — return seed data
    return this.buildFromSeed(_limit);
  }

  private buildFromSeed(limit: number): BenchmarkResult[] {
    const fetchedAt = new Date().toISOString();
    const rows = SEED_DATA.slice(0, limit).map((entry, idx) => ({
      id: `${this.key}:${entry.model}:${idx + 1}`,
      benchmarkKey: this.key,
      fetchedAt,
      modelName: entry.model,
      provider: entry.provider,
      rank: idx + 1,
      rawScore: entry.score,
      rawScoreText: `${entry.score}%`,
      normalizedScore: null as number | null,
      confidenceText: null as string | null,
      category: "general" as const,
      sourceUrl: this.sourceUrl,
      includedInOverall: this.includedInOverall
    }));
    return this.normalizeLiveRows(rows);
  }
}
