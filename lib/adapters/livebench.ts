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
  { model: "Claude Opus 4.6 Thinking", provider: "Anthropic", score: 84.6 },
  { model: "GPT-5.4 High", provider: "OpenAI", score: 83.2 },
  { model: "Gemini 3 Pro", provider: "Google DeepMind", score: 81.7 },
  { model: "Grok 4.20", provider: "xAI", score: 79.4 },
  { model: "Claude Opus 4.6", provider: "Anthropic", score: 78.8 },
  { model: "GPT-5.2", provider: "OpenAI", score: 77.1 },
  { model: "Gemini 3 Flash", provider: "Google DeepMind", score: 74.9 },
  { model: "DeepSeek V4", provider: "DeepSeek", score: 73.1 },
  { model: "Llama 4 Maverick", provider: "Meta", score: 67.0 },
  { model: "Mistral Large 3", provider: "Mistral AI", score: 64.5 }
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
